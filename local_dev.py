"""
Local development helper to serve the React `frontend/build` static files
and the Flask backend together on a single local port (5000).

This simulates the combined Vercel deployment (static + /api/* routed to Flask)
so you can test routing and behavior before pushing to Vercel.

Run:
    python local_dev.py

Requirements: Flask and the backend dependencies installed in your Python env.
"""

import os
from flask import send_from_directory, Flask

# Ensure the backend package is importable
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend import wsgi as backend_wsgi

# Use the existing Flask app
app = backend_wsgi.app

# Path to the built frontend
FRONTEND_BUILD_DIR = os.path.join(os.path.dirname(__file__), 'frontend', 'build')


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve static frontend files and fallback to index.html for SPA routes."""
    if path != '' and os.path.exists(os.path.join(FRONTEND_BUILD_DIR, path)):
        return send_from_directory(FRONTEND_BUILD_DIR, path)
    # fallback to index.html
    return send_from_directory(FRONTEND_BUILD_DIR, 'index.html')


if __name__ == '__main__':
    # show a helpful message if build folder doesn't exist
    if not os.path.isdir(FRONTEND_BUILD_DIR):
        print('frontend/build not found — run `npm run build` in the frontend folder first')
    # Run local dev server
    app.run(host='127.0.0.1', port=5000, debug=True)
