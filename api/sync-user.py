import json
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        self._respond(410, {
            "ok": False,
            "error": "Server-side MFP sync is no longer supported. "
                     "Install the Verdict Chrome extension and pair it via Settings.",
        })

    def _respond(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())
