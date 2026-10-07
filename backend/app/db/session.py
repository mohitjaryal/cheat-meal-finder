import asyncpg

from app.core.config import Settings


async def create_pool():
    pool = await asyncpg.create_pool(
        host=Settings.DB_HOST,
        port=Settings.DB_PORT,
        database=Settings.DB_NAME,
        user=Settings.DB_USER,
        password=Settings.DB_PASSWORD
    )

    return pool