"""Add netid column to users

Revision ID: 20260214_add_netid_to_users
Revises: 66b831172381
Create Date: 2026-02-14 06:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260214_add_netid_to_users'
down_revision = '66b831172381'
branch_labels = None
depends_on = None


def upgrade():
    # Add nullable netid column to users
    op.add_column('users', sa.Column('netid', sa.String(length=80), nullable=True))


def downgrade():
    # Drop netid column
    op.drop_column('users', 'netid')
