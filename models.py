import os
from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime, func
from sqlalchemy.orm import declarative_base, sessionmaker

# Resolve database URL with required transformations
raw_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or "sqlite:///./app.db"
if raw_url.startswith("postgresql+asyncpg://"):
    raw_url = raw_url.replace("postgresql+asyncpg://", "postgresql+psycopg://")
elif raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql+psycopg://")

connect_args = {}
# Apply SSL for non‑local PostgreSQL connections
if not raw_url.startswith("sqlite") and "localhost" not in raw_url and "127.0.0.1" not in raw_url:
    connect_args["sslmode"] = "require"

engine = create_engine(raw_url, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

class Plan(Base):
    __tablename__ = "rp_plan"
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, nullable=False)
    preferences = Column(JSON, nullable=False)
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

# Create tables if they don't exist (useful for demo environments)
Base.metadata.create_all(bind=engine)
