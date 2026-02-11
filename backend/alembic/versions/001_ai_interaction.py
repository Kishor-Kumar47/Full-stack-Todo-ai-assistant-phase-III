"""Add AI interaction table

Revision ID: 001_ai_interaction
Revises:
Create Date: 2026-02-10 20:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_ai_interaction'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ai_interaction table
    op.create_table(
        'ai_interaction',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('query_text', sa.String(length=1000), nullable=False),
        sa.Column('response_text', sa.String(length=10000), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('token_count', sa.Integer(), nullable=True),
        sa.Column('suggestions_json', sa.Text(), nullable=True),
        sa.Column('query_timestamp', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('response_timestamp', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for performance
    op.create_index('idx_ai_interaction_user_id', 'ai_interaction', ['user_id'])
    op.create_index('idx_ai_interaction_timestamp', 'ai_interaction', ['query_timestamp'])

    # Add check constraint for status enum
    op.create_check_constraint(
        'ck_ai_interaction_status',
        'ai_interaction',
        "status IN ('pending', 'completed', 'failed', 'timeout')"
    )

    # Add check constraint for token_count (non-negative)
    op.create_check_constraint(
        'ck_ai_interaction_token_count',
        'ai_interaction',
        'token_count >= 0'
    )


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_ai_interaction_timestamp', table_name='ai_interaction')
    op.drop_index('idx_ai_interaction_user_id', table_name='ai_interaction')

    # Drop table
    op.drop_table('ai_interaction')
