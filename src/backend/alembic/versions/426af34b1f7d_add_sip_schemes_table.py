"""add sip schemes table

Revision ID: 426af34b1f7d
Revises:
Create Date: 2026-01-25 19:46:13.798077
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = "426af34b1f7d"
down_revision = None
branch_labels = None
depends_on = None


# 🔑 DEFINE ENUMS (but DO NOT auto-create on table creation)
profiletype_enum = postgresql.ENUM(
    "STUDENT",
    "EMPLOYEE",
    name="profiletype",
    create_type=False
)

risklevel_enum = postgresql.ENUM(
    "LOW",
    "MODERATE",
    "HIGH",
    name="risklevel",
    create_type=False
)


def upgrade() -> None:
    bind = op.get_bind()

    # ✅ CREATE ENUMS EXPLICITLY (only once)
    postgresql.ENUM(
        "STUDENT",
        "EMPLOYEE",
        name="profiletype"
    ).create(bind, checkfirst=True)

    postgresql.ENUM(
        "LOW",
        "MODERATE",
        "HIGH",
        name="risklevel"
    ).create(bind, checkfirst=True)

    # ✅ CREATE TABLE (won’t try to recreate enums)
    op.create_table(
        "sip_schemes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("min_amount", sa.Float(), nullable=False),
        sa.Column("max_amount", sa.Float(), nullable=False),
        sa.Column("suitable_for", profiletype_enum, nullable=False),
        sa.Column("risk_level", risklevel_enum, nullable=False),
        sa.Column("description", sa.String()),
    )


def downgrade() -> None:
    op.drop_table("sip_schemes")
