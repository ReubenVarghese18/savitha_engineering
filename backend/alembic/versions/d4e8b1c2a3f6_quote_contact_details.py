"""quotes: add email and phone

Revision ID: d4e8b1c2a3f6
Revises: c7f1a2b3d4e5
Create Date: 2026-10-08 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd4e8b1c2a3f6'
down_revision: Union[str, Sequence[str], None] = 'c7f1a2b3d4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('quotes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('email', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('phone', sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('quotes', schema=None) as batch_op:
        batch_op.drop_column('phone')
        batch_op.drop_column('email')
