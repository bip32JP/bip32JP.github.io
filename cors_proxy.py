#!/usr/bin/env python3
"""Tiny local CORS proxy (stdlib only), a drop-in stand-in for corsproxy.io.

Usage:  python3 cors_proxy.py [port]     (default port 8080)
Then fetch:  http://localhost:8080/?url=<uri-encoded target url>
"""
import sys
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

USER_AGENT = """Mozilla/5.0 (X11; Linux x86_64) \
AppleWebKit/537.36 (KHTML, like Gecko) \
Chrome/153.0.0.0 Safari/537.36"""

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        target = parse_qs(urlparse(self.path).query).get('url', [None])[0]
        if not target or urlparse(target).scheme not in ('http', 'https'):
            self.send_error(400, 'missing or invalid ?url= parameter')
            return
        try:
            headers = {h: self.headers[h] for h in ('User-Agent', 'Accept', 'Accept-Language')
                       if self.headers.get(h)}
            if not headers.get('User-Agent'):
                headers['User-Agent'] = USER_AGENT
            req = urllib.request.Request(target, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as res:
                status, body = res.status, res.read()
                ctype = res.headers.get('Content-Type', 'application/octet-stream')
        except urllib.error.HTTPError as e:
            status, body = e.code, e.read()
            ctype = e.headers.get('Content-Type', 'application/octet-stream')
        except Exception as e:
            self.send_error(502, str(e))
            return
        self.send_response(status)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    print(f'CORS proxy listening on http://localhost:{port}/?url=...')
    # Bind to loopback only: this is an open proxy, don't expose it to the network.
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
