import json
import os
from datetime import date, datetime
from http.server import BaseHTTPRequestHandler

import httpx
from bs4 import BeautifulSoup
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
CRON_SECRET = os.environ.get("CRON_SECRET")

MFP_BASE = "https://www.myfitnesspal.com"


def mfp_login(username: str, password: str) -> httpx.Client:
    client = httpx.Client(follow_redirects=True, timeout=30)

    # Get login page for CSRF token
    r = client.get(f"{MFP_BASE}/user/login")
    soup = BeautifulSoup(r.text, "html.parser")
    token = soup.find("input", {"name": "authenticity_token"})
    if not token:
        raise Exception("Could not find MFP CSRF token")

    # Login
    r = client.post(f"{MFP_BASE}/user/login", data={
        "user[email]": username,
        "user[password]": password,
        "authenticity_token": token["value"],
    })

    if "Invalid" in r.text or r.url.path == "/user/login":
        raise Exception("MFP login failed — check credentials")

    return client


def parse_diary(client: httpx.Client, username: str, today: date) -> list:
    url = f"{MFP_BASE}/food/diary/{username}?date={today.isoformat()}"
    r = client.get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    entries = []
    meal_sections = soup.select("table.main-title-2")

    for section in meal_sections:
        meal_name = section.select_one(".main-title-2").get_text(strip=True)
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


def sync_user(supabase, user_id: str, mfp_username: str, mfp_password: str) -> dict:
    today = date.today()
    client = mfp_login(mfp_username, mfp_password)
    entries = parse_diary(client, mfp_username, today)

    logged_at = datetime.combine(today, datetime.min.time()).isoformat()

    for entry in entries:
        data = {
            **entry,
            "user_id": user_id,
            "logged_at": logged_at,
            "mfp_synced": True,
        }
        supabase.table("food_logs").upsert(
            data,
            on_conflict="user_id,meal_name,logged_at"
        ).execute()

    return {"user_id": user_id, "synced": len(entries), "date": str(today)}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        auth = self.headers.get("authorization", "")
        if CRON_SECRET and auth != f"Bearer {CRON_SECRET}":
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b"Unauthorized")
            return

        try:
            supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            result = supabase.table("user_preferences").select(
                "user_id, mfp_username, mfp_password"
            ).not_.is_("mfp_username", "null").execute()

            results = []
            for row in result.data:
                if not row.get("mfp_username") or not row.get("mfp_password"):
                    continue
                try:
                    r = sync_user(supabase, row["user_id"], row["mfp_username"], row["mfp_password"])
                    results.append(r)
                except Exception as e:
                    results.append({"user_id": row["user_id"], "error": str(e)})

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True, "results": results}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode())
