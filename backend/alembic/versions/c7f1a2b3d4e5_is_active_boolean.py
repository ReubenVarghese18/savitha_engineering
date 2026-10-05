"""furnaces.is_active to Boolean

Revision ID: c7f1a2b3d4e5
Revises: 73496f29e74f
Create Date: 2026-10-05 23:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c7f1a2b3d4e5'
down_revision: Union[str, Sequence[str], None] = '73496f29e74f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('furnaces', schema=None) as batch_op:
        batch_op.alter_column(
            'is_active',
            existing_type=sa.Integer(),
            type_=sa.Boolean(),
            existing_nullable=True,
            postgresql_using='is_active::boolean',
        )


def downgrade() -> None:
    with op.batch_alter_table('furnaces', schema=None) as batch_op:
        batch_op.alter_column(
            'is_active',
            existing_type=sa.Boolean(),
            type_=sa.Integer(),
            existing_nullable=True,
            postgresql_using='is_active::integer',
        )
