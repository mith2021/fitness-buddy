import json
import os
from datetime import date, datetime
from http.server import BaseHTTPRequestHandler

import myfitnesspal
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
CRON_SECRET = os.environ.get("CRON_SECRET")


def sync_user(supabase, user_id: str, mfp_username: str, mfp_password: str) -> dict:
    client = myfitnesspal.Client(mfp_username, password=mfp_password)
    today = date.today()
    day = client.get_date(today.year, today.month, today.day)

    synced = 0
    for meal in day.meals:
        for entry in meal.entries:
            data = {
                "user_id": user_id,
                "meal_name": entry.name,
                "calories": int(entry.nutrition_information.get("calories", 0)),
                "protein": int(entry.nutrition_information.get("protein", 0)),
                "carbs": int(entry.nutrition_information.get("carbohydrates", 0)),
                "fat": int(entry.nutrition_information.get("fat", 0)),
                "mfp_meal_category": meal.name,
                "logged_at": datetime.combine(today, datetime.min.time()).isoformat(),
                "mfp_synced": True,
            }
            # Upsert: match on user_id + meal_name + date
            supabase.table("food_logs").upsert(
                data,
                on_conflict="user_id,meal_name,logged_at"
            ).execute()
            synced += 1

    return {"user_id": user_id, "synced": synced, "date": str(today)}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Verify cron secret
        auth = self.headers.get("authorization", "")
        if CRON_SECRET and auth != f"Bearer {CRON_SECRET}":
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b"Unauthorized")
            return

        try:
            supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

            # Get all users with MFP credentials
            result = supabase.table("user_preferences").select(
                "user_id, mfp_username, mfp_password"
            ).not_.is_("mfp_username", "null").execute()

            results = []
            for row in result.data:
                if not row.get("mfp_username") or not row.get("mfp_password"):
                    continue
                try:
                    r = sync_user(
                        supabase,
                        row["user_id"],
                        row["mfp_username"],
                        row["mfp_password"]
                    )
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
