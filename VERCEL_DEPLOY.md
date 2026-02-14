## Deploying to Vercel (single project for frontend + backend)

This repo contains a React frontend in `frontend/` (already built in `frontend/build/`) and a Flask backend in `backend/`.

What we did
- Added `vercel.json` so Vercel serves static files from `frontend/build` and routes `/api/*` to a WSGI entry that exposes the Flask app.
- Added `api/index.py` which imports `backend/wsgi.py`'s `app` and exposes it as the WSGI callable.
- Added `api/requirements.txt` so Vercel will install the Python dependencies for the Flask app.
- Updated `backend/app/config.py` so SQLAlchemy uses a NullPool in serverless environments (detects `VERCEL=1`), avoiding pool exhaustion.

Quick checklist before deploying
1. Build the frontend locally (or ensure `frontend/build` exists):

```bash
cd frontend
npm install
npm run build
cd ..
```

2. Push all changes to your Git remote (Vercel links to the repo).

3. In the Vercel dashboard for your project, set these Environment Variables (Production):
   - `DATABASE_URL` (your Postgres connection string)
   - `SECRET_KEY`, `JWT_SECRET_KEY`
   - `CLOUDINARY_*` values if you use image uploads
   - `VERCEL=1` (optional but recommended)

4. Migrations: run Alembic/Flask-Migrate against your managed DB before or after deploy. You can run migrations locally (pointing to the same DATABASE_URL) or use a one-off runner in your DB host.

Notes and caveats
- Serverless functions are short-lived; using a managed Postgres provider optimized for serverless (Neon, Supabase) is recommended.
- We set `NullPool` for SQLAlchemy under serverless env. If you use a connection pooler (PgBouncer) or Neon’s recommended settings you can revisit pooling.
- File uploads cannot be persisted to local disk on Vercel: keep Cloudinary or another external storage.

If you want, I can:
- Port individual Flask blueprints into separate serverless endpoints for finer-grained cold-start control.
- Add a GitHub Action to run migrations on deploy.

Local testing (quick MVP simulation)
-----------------------------------
You can run a small local server that serves the built React app from `frontend/build` and runs the Flask API under `/api/*` to simulate the combined Vercel setup.

1. Build frontend (if not built):

```bash
cd frontend
npm install
npm run build
cd ..
```

2. Create a virtualenv and install backend deps (or use your existing env):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

3. Run the local combined server (script provided as `local_dev.py`):

```bash
python local_dev.py
```

The server runs on http://127.0.0.1:5000 — API routes remain under `/api/*` and the SPA is served from `/`.

This simulates the single-host deployment and is sufficient for MVP verification. It does not emulate Vercel's serverless constraints (connection pooling, cold starts) but confirms routing and static serving work.
