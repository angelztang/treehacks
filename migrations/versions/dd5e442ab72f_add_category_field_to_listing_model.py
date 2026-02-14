"""Add category field to Listing model

Revision ID: dd5e442ab72f
Revises: 
Create Date: 2024-03-26 03:07:04.123456

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dd5e442ab72f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add category column with default value
    op.add_column('listing', sa.Column('category', sa.String(length=50), nullable=True))
    op.execute("UPDATE listing SET category = 'other' WHERE category IS NULL")
    op.alter_column('listing', 'category', nullable=False)


def downgrade():
    op.drop_column('listing', 'category')
