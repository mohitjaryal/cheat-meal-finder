from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.session import create_pool

from app.api.routes.vendors import vendors_routes
from app.api.routes.categories import categories
from app.api.routes.dishes import router as dishes_router
from app.api.routes.users import router as users_router
from app.api.routes.reviews import router as reviews_router
from app.api.routes.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_pool = await create_pool()

    try:
        yield
    finally:
        await app.state.db_pool.close()


app = FastAPI(lifespan=lifespan)

app.include_router(vendors_routes)
app.include_router(categories)
app.include_router(dishes_router)
app.include_router(users_router)
app.include_router(reviews_router)
app.include_router(admin_router)