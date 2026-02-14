"""
WSGI entry for Vercel serverless Python builder.

This file imports the existing Flask `app` (created in `backend/wsgi.py`) and
exposes it as the WSGI `app` variable. Vercel's Python builder will use this
callable to serve requests under `/api/*`.

Notes:
- Ensure environment variables are configured in the Vercel dashboard.
- The Flask app expects `DATABASE_URL` (Postgres) and other secrets.
"""

from backend.wsgi import app

# Expose the Flask WSGI app as the module-level name expected by many WSGI
# runners. Vercel will mount this and forward HTTP requests to it.
__all__ = ("app",)
