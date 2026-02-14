# TigerPop — Princeton community marketplace

TigerPop is a full-stack marketplace web application built for the Princeton community. It lets students buy and sell items (furniture, clothing, textbooks and more), manage listings, favorite items, and communicate interest — all with secure authentication and image uploads.

This repository contains a React + TypeScript frontend (in `frontend/`) and a Flask backend API (in `backend/`). The frontend is deployed as a static site and the backend runs as Python serverless functions (configured for Vercel in `vercel.json`).

## Notable features
- User authentication with CAS integration and JWT session tokens.
- Create, edit, search and filter listings with categories, price and condition.
- Image upload support via Cloudinary (secure image hosting and CDN).
- Listing “hearting” (favorites) and buyer/seller flows including email notifications.
- Responsive modern UI built with React, TypeScript and Tailwind CSS.
- RESTful API built with Flask, SQLAlchemy and PostgreSQL.

## Technology stack
- Frontend: React, TypeScript, Tailwind CSS, react-router.
- Backend: Flask, SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, Flask-Mail.
- Database: PostgreSQL (production), SQLite for local dev.
- Uploads: Cloudinary for image storage and delivery.
- Auth: Princeton CAS integration + JWT for API auth.
- Deployment: Vercel for frontend + serverless Python API; Heroku (historical) examples remain in config.

## Quick start (development)
Prerequisites: Node.js (v18+ recommended), Python 3.10+, and a Postgres DB (or use SQLite locally).

1) Frontend

```bash
cd frontend
npm install
# start dev server
npm run dev
```

2) Backend (local)

```bash
# from repo root
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='sqlite:///local.db'   # or your Postgres DATABASE_URL
export JWT_SECRET_KEY='your-secret'
export SECRET_KEY='your-secret'
python backend/run.py
```

Visit http://localhost:3000 for the frontend and http://localhost:8000 (or configured port) for backend routes.


