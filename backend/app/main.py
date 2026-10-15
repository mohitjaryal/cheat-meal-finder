# main.py 

from fastapi import FastAPI
from app.api.routes.vendors import vendors_routes
from app.api.routes.categories import categories
from app.api.routes.dishes import router as dishes_router

app = FastAPI()

# Vendors
app.include_router(vendors_routes)

# Categories
app.include_router(categories)

# Dishes
app.include_router(dishes_router)