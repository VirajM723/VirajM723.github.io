import http.server
import socketserver
import os
import sys
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class RobustHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path

        # If serving a PDF, set proper Content-Disposition and Content-Type headers
        # so browsers (like Microsoft Edge and Chrome) save with the correct filename
        # instead of an internal download session UUID.
        if clean_path.lower().endswith('.pdf'):
            filename = os.path.basename(clean_path)
            # Send Content-Disposition with filename
            self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
            self.send_header('Content-Type', 'application/pdf')

        super().end_headers()

    def finish(self, *args, **kwargs):
        try:
            if not self.wfile.closed:
                self.wfile.flush()
            super().finish(*args, **kwargs)
        except (ConnectionResetError, BrokenPipeError):
            pass

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (ConnectionResetError, BrokenPipeError):
            pass

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == "__main__":
    with ReusableTCPServer(("", PORT), RobustHandler) as httpd:
        print(f"Serving at http://localhost:{PORT} from {DIRECTORY}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
