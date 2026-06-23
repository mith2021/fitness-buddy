import json
import os
from datetime import date, datetime
from http.server import BaseHTTPRequestHandler

import httpx
from bs4 import BeautifulSoup
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

MFP_BASE = "https://www.myfitnesspal.com"


def get_user_from_jwt(token: str):
    """Decode JWT payload to extract user_id (sub claim)."""
    try:
        import base64
        payload = token.split(".")[1]
        # Add padding
        payload += "=" * (4 - len(payload) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload))
        return data.get("sub")
    except Exception:
        return None


def mfp_login(username: str, password: str) -> httpx.Client:
    """Login via MFP's NextAuth flow."""
    ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    client = httpx.Client(
        follow_redirects=True,
        timeout=30,
        headers={
            "User-Agent": ua,
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
        }
    )
    # Step 1: get NextAuth CSRF token
    r = client.get(
        f"{MFP_BASE}/api/auth/csrf",
        headers={"Accept": "application/json"},
    )
    if r.status_code != 200:
        raise Exception(f"MFP CSRF fetch failed (status={r.status_code})")
    csrf_token = r.json().get("csrfToken")
    if not csrf_token:
        raise Exception("MFP CSRF token missing from response")

    # Step 2: submit credentials to NextAuth callback
    r = client.post(
        f"{MFP_BASE}/api/auth/callback/credentials",
        data={
            "csrfToken": csrf_token,
            "email": username,
            "password": password,
            "redirect": "false",
            "callbackUrl": f"{MFP_BASE}/",
            "json": "true",
        },
        headers={
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": f"{MFP_BASE}/account/login",
            "Origin": MFP_BASE,
        },
    )
    data = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
    if r.status_code not in (200, 302) or data.get("error"):
        raise Exception(f"MFP login failed — check credentials (error={data.get('error', r.status_code)})")
    return client


def parse_diary(client: httpx.Client, username: str, today: date) -> list:
    url = f"{MFP_BASE}/food/diary/{username}?date={today.isoformat()}"
    r = client.get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    entries = []
    meal_sections = soup.select("table.main-title-2")

    # Diagnostic: no meal tables found. Distinguish auth failure from empty diary
    # so the surfaced error is actionable instead of a silent "synced 0".
    if not meal_sections:
        page_text = r.text.lower()
        if "/account/login" in page_text or "challenge" in page_text or "log in" in page_text:
            raise Exception(
                f"Diary not accessible — session not authenticated "
                f"(status={r.status_code}, url={r.url}). Login may have silently failed."
            )
        # Logged in but no old-style tables: MFP likely changed diary markup.
        if "__next_data__" in page_text or "data-next-head" in page_text:
            raise Exception(
                f"Diary page is now Next.js-rendered — parser selectors are stale "
                f"(status={r.status_code}). Parser needs updating to new markup."
            )

    for section in meal_sections:
        heading = section.select_one("td.first.alt") or section.select_one("th")
        meal_name = heading.get_text(strip=True) if heading else "Unknown"
        rows = section.find_next_sibling("tbody")
        if not rows:
            continue
        for row in rows.select("tr.bottom-row"):
            name_el = row.select_one(".food-name")
            if not name_el:
                continue

            def get_col(cls):
                el = row.select_one(f".{cls} span")
                try:
                    return int(el.get_text(strip=True).replace(",", "")) if el else 0
                except ValueError:
                    return 0

            entries.append({
                "meal_name": name_el.get_text(strip=True),
                "mfp_meal_category": meal_name,
                "calories": get_col("calories"),
                "protein": get_col("protein"),
                "carbs": get_col("carbohydrates"),
                "fat": get_col("fat"),
            })

    return entries


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        auth = self.headers.get("authorization", "")
        if not auth.startswith("Bearer "):
            self._respond(401, {"ok": False, "error": "Missing auth token"})
            return

        token = auth[len("Bearer "):]
        user_id = get_user_from_jwt(token)
        if not user_id:
            self._respond(401, {"ok": False, "error": "Invalid session"})
            return

        try:
            sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            row = sb.table("user_preferences").select(
                "mfp_username, mfp_password"
            ).eq("user_id", user_id).single().execute()

            if not row.data or not row.data.get("mfp_username"):
                self._respond(400, {"ok": False, "error": "No MFP credentials saved"})
                return

            mfp_username = row.data["mfp_username"]
            mfp_password = row.data["mfp_password"]

            today = date.today()
            client = mfp_login(mfp_username, mfp_password)
            entries = parse_diary(client, mfp_username, today)

            logged_at = datetime.combine(today, datetime.min.time()).isoformat()
            for entry in entries:
                sb.table("food_logs").upsert(
                    {**entry, "user_id": user_id, "logged_at": logged_at, "mfp_synced": True},
                    on_conflict="user_id,meal_name,logged_at"
                ).execute()

            self._respond(200, {"ok": True, "synced": len(entries)})

        except Exception as e:
            self._respond(500, {"ok": False, "error": str(e)})

    def _respond(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())
