import http.server
import socketserver
import json
import os
import sys

PORT = 8000
DATA_FILE = "data.json"

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        data = f.read()
                        self.wfile.write(data.encode('utf-8'))
                except Exception as e:
                    print("Read error:", e)
                    self.wfile.write(b'{}')
            else:
                self.wfile.write(b'{}')
            return
        
        # Serve static files for frontend if needed (optional, but we mainly care about API here)
        # We can serve the 'dist' folder if built, but for now just API.
        return super().do_GET()

    def do_POST(self):
        if self.path == '/api/data':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # Validate JSON (optional, but good for safety)
                data = json.loads(post_data.decode('utf-8'))
                
                # Write to disk
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
                print("Data saved successfully.")
            except Exception as e:
                print("Save error:", e)
                self.send_response(500)
                self.end_headers()
                self.wfile.write(b'{"status": "error", "message": "Save failed"}')
            return

print(f"Server started at http://localhost:{PORT}")
print(f"API endpoint: http://localhost:{PORT}/api/data")
print("Press Ctrl+C to stop.")

# Ensure data.json exists
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        f.write('{}')

with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()
