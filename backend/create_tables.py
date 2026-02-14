"""Create all database tables from SQLAlchemy models.

Usage:
  # Ensure DATABASE_URL is set (postgresql://... or postgres://...)
  export DATABASE_URL='postgresql://user:pass@host:5432/dbname?sslmode=require'
  source .venv311/bin/activate
  python backend/create_tables.py

This script will set the DATABASE_URL (fixing the scheme if needed), create the Flask app
and call SQLAlchemy's create_all() to create tables in the target database. This bypasses
Alembic migrations and is appropriate for creating an initial schema on a fresh database.
"""
import os
import sys

def main():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print('Error: DATABASE_URL is not set. Set it to your Postgres connection string.')
        sys.exit(1)

    # SQLAlchemy expects the scheme to be postgresql:// not postgres://
    if db_url.startswith('postgres://'):
        fixed = 'postgresql://' + db_url[len('postgres://'):]
        print('Converting DATABASE_URL scheme from postgres:// to postgresql://')
        os.environ['DATABASE_URL'] = fixed
    else:
        os.environ['DATABASE_URL'] = db_url

    # Import app and db after envvar is set
    try:
        from app import create_app
        from app.extensions import db
    except Exception as e:
        print('Error importing application:', e)
        sys.exit(1)

    app = create_app()

    with app.app_context():
        print('Creating database tables...')
        db.create_all()
        print('Tables created successfully.')

if __name__ == '__main__':
    main()
