import os
from typing import AsyncGenerator

from dotenv import load_dotenv
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def init_db():
    """Creates tables directly from models — fine for now while we're learning.
    Later we'll switch to Alembic migrations for production-safe schema changes."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)