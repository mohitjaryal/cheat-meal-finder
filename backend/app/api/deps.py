from app.db.session import create_pool


async def get_db():
    return await create_pool()