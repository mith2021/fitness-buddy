import json
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        self._respond(410, {
            "ok": False,
            "error": "Server-side MFP cron sync is no longer supported. "
                     "Sync now happens via the Verdict Chrome extension.",
        })

    def _respond(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())
