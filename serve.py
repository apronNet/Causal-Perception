#!/usr/bin/env python3

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import os


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the causal-launching studio locally.")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to.")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    os.chdir(root)
    handler = SimpleHTTPRequestHandler
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)

    print(f"Serving {root} at http://127.0.0.1:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
