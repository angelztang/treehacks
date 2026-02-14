"""Run Alembic migrations programmatically against the configured DATABASE_URL.

Usage:
  # from project root, with venv activated
  export DATABASE_URL="<your supabase connection string>"
  python backend/run_migrations.py

This avoids relying on the `flask db` CLI in environments where the command is not available.
"""
import os
import sys

from app import create_app

def main():
    # Ensure DATABASE_URL is set
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print('Error: DATABASE_URL environment variable is not set.')
        print('Set it to your Supabase Postgres connection string (replace postgres:// with postgresql://).')
        sys.exit(1)

    app = create_app()

    # Run migrations programmatically
    try:
        from flask_migrate import upgrade
    except Exception as e:
        print('Error importing flask_migrate.upgrade:', e)
        print('Make sure backend dependencies are installed: pip install -r backend/requirements.txt')
        sys.exit(1)

    with app.app_context():
        print('Running alembic upgrade head...')
        upgrade()
        print('Migrations applied.')

if __name__ == '__main__':
    main()
