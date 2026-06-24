import json
import os
from datetime import datetime
from http.server import BaseHTTPRequestHandler

from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("content-length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
        except Exception:
            self._respond(400, {"ok": False, "error": "Invalid JSON"})
            return

        # Token now travels in the body so the request stays a CORS "simple
        # request" (no Authorization header => no OPTIONS preflight).
        token = body.get("token", "")
        if not token:
            auth = self.headers.get("authorization", "")
            token = auth[len("Bearer "):] if auth.startswith("Bearer ") else ""
        if not token:
            self._respond(401, {"ok": False, "error": "Missing token"})
            return

        try:
            sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

            # Look up the token in extension_tokens
            row = sb.table("extension_tokens").select(
                "user_id"
            ).eq("token", token).single().execute()

            if not row.data:
                self._respond(401, {"ok": False, "error": "Invalid or expired token"})
                return

            user_id = row.data["user_id"]

            # Ping check — popup just validating the token
            if body.get("ping"):
                self._respond(200, {"ok": True, "ping": True})
                return

            entries = body.get("entries", [])
            date_str = body.get("date") or datetime.utcnow().date().isoformat()
            logged_at = f"{date_str}T00:00:00"

            synced = 0
            for entry in entries:
                if not entry.get("meal_name"):
                    continue
                sb.table("food_logs").upsert(
                    {
                        "user_id": user_id,
                        "meal_name": entry["meal_name"],
                        "mfp_meal_category": entry.get("mfp_meal_category", ""),
                        "calories": entry.get("calories", 0),
                        "protein": entry.get("protein", 0),
                        "carbs": entry.get("carbs", 0),
                        "fat": entry.get("fat", 0),
                        "logged_at": logged_at,
                        "mfp_synced": True,
                    },
                    on_conflict="user_id,meal_name,logged_at"
                ).execute()
                synced += 1

            self._respond(200, {"ok": True, "synced": synced, "date": date_str})

        except Exception as e:
            self._respond(500, {"ok": False, "error": str(e)})

    def _respond(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.end_headers()
