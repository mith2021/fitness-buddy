import json
import os
from http.server import BaseHTTPRequestHandler

from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

# Columns the extension is allowed to write to user_preferences from the
# scraped MFP profile. Anything outside this set is ignored.
ALLOWED_FIELDS = (
    "daily_goal_calories",
    "weight_kg",
    "height_cm",
    "age",
    "gender",
)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("content-length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
        except Exception:
            self._respond(400, {"ok": False, "error": "Invalid JSON"})
            return

        # Token travels in the body so the request stays a CORS "simple
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

            # Only update keys that are present and non-null in the payload.
            profile = body.get("profile", {}) or {}
            updates = {}
            for key in ALLOWED_FIELDS:
                value = profile.get(key)
                if value is not None:
                    updates[key] = value

            if not updates:
                self._respond(200, {"ok": True, "updated": []})
                return

            sb.table("user_preferences").update(updates).eq(
                "user_id", user_id
            ).execute()

            self._respond(200, {"ok": True, "updated": list(updates.keys())})

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
