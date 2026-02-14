Supabase setup (local)

This repo now supports creating users in Supabase during signup. The backend reads the following environment variables from `.env` (project root) or the environment:

- SUPABASE_URL — your Supabase project URL (e.g. https://xyz.supabase.co)
- SUPABASE_SERVICE_ROLE_KEY — the Supabase service role (secret) key used for Admin API calls
- SUPABASE_PUBLISHABLE_KEY — (optional) the public publishable key

Important security notes
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret. Do not commit `.env` to version control. This repo's `.gitignore` already includes `.env`.
- Rotate the service role key if it is leaked.

How to run locally
1. Ensure `.env` exists at the repo root with the variables set (or export them in your shell):

```bash
# Example (do not paste secret keys into public places)
export SUPABASE_URL="https://<your-project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
export SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

2. Activate your Python virtualenv and start the backend:

```bash
source .venv311/bin/activate
python backend/run.py
```

3. Start the frontend (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

4. Test signup via the frontend at `http://localhost:3000/signup` or via curl:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"alice","email":"alice@example.com","password":"hunter2"}' http://127.0.0.1:8000/api/auth/signup
```

Troubleshooting
- If Supabase returns errors, check logs printed by the backend; the route returns 502 with the Supabase response body on failure.
- Ensure `requests` is installed in the backend environment (`pip install -r backend/requirements.txt`).

Next steps
- Optionally persist the Supabase user id in the local `User` model (adds a DB migration).
- Consider moving fully to Supabase Auth and removing local password storage if desired.
