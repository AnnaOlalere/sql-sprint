from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

server = ThreadingHTTPServer(("127.0.0.1", 3000), SimpleHTTPRequestHandler)
print("SQL Sprint dev server running at http://127.0.0.1:3000", flush=True)
server.serve_forever()
