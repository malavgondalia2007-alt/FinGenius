"""initial tables

Revision ID: cec6af6765d5
Revises: 426af34b1f7d
Create Date: 2026-01-30 12:06:36.350272
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM


# revision identifiers, used by Alembic.
revision = 'cec6af6765d5'
down_revision = '426af34b1f7d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # USERS
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # EXPENSES
    op.create_table(
        'expenses',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('date', sa.String(), nullable=False),
        sa.Column(
            'type',
            ENUM(
                'ESSENTIAL',
                'NON_ESSENTIAL',
                name='expensetype',
                create_type=False
            ),
            nullable=False
        ),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # GOALS
    op.create_table(
        'goals',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('target_amount', sa.Float(), nullable=False),
        sa.Column('saved_amount', sa.Float(), nullable=False),
        sa.Column('deadline', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # INCOMES
    op.create_table(
        'incomes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('date', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # INVESTMENTS
    op.create_table(
        'investments',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('fund_name', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column(
            'type',
            ENUM(
                'STOCK',
                'SIP',
                name='investmenttype',
                create_type=False
            ),
            nullable=False
        ),
        sa.Column('date', sa.String(), nullable=False),
        sa.Column('current_value', sa.Float(), nullable=True),
        sa.Column('returns', sa.Float(), nullable=True),
        sa.Column(
            'risk',
            ENUM(
                'LOW',
                'MODERATE',
                'HIGH',
                name='risklevel',
                create_type=False
            ),
            nullable=True
        ),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # USER PROFILES
    op.create_table(
        'user_profiles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column(
            'type',
            ENUM(
                'STUDENT',
                'EMPLOYEE',
                name='profiletype',
                create_type=False
            ),
            nullable=False
        ),
        sa.Column('onboarding_complete', sa.Boolean(), nullable=False),
        sa.Column('weekly_pocket_money', sa.Float(), nullable=True),
        sa.Column('weekly_expenses', sa.Float(), nullable=True),
        sa.Column('monthly_income', sa.Float(), nullable=True),
        sa.Column('fixed_expenses', sa.JSON(), nullable=True),
        sa.Column('loans', sa.JSON(), nullable=True),
        sa.Column('sip_commitments', sa.Float(), nullable=True),
        sa.Column('savings_preference', sa.Float(), nullable=True),
        sa.Column('auto_split_enabled', sa.Boolean(), nullable=True),
        sa.Column('auto_split_percentage', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )


def downgrade() -> None:
    op.drop_table('user_profiles')
    op.drop_table('investments')
    op.drop_table('incomes')
    op.drop_table('goals')
    op.drop_table('expenses')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
