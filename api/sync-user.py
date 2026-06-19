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
    """Validate Supabase JWT and return user_id using service client."""
    try:
        sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        resp = sb.auth.get_user(token)
        return resp.user.id if resp.user else None
    except Exception:
        return None


def mfp_login(username: str, password: str) -> httpx.Client:
    client = httpx.Client(follow_redirects=True, timeout=30)
    r = client.get(f"{MFP_BASE}/user/login")
    soup = BeautifulSoup(r.text, "html.parser")
    token = soup.find("input", {"name": "authenticity_token"})
    if not token:
        raise Exception("Could not find MFP CSRF token")
    r = client.post(f"{MFP_BASE}/user/login", data={
        "user[email]": username,
        "user[password]": password,
        "authenticity_token": token["value"],
    })
    if "Invalid" in r.text or r.url.path == "/user/login":
        raise Exception("MFP login failed — check username/password")
    return client


def parse_diary(client: httpx.Client, username: str, today: date) -> list:
    url = f"{MFP_BASE}/food/diary/{username}?date={today.isoformat()}"
    r = client.get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    entries = []
    meal_sections = soup.select("table.main-title-2")

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
