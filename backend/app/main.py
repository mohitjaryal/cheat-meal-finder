# main.py 

from fastapi import FastAPI
from app.api.routes.vendors import vendors_routes
from app.api.routes.categories import categories

app = FastAPI()

app.include_router(vendors_routes)

app.include_router(categories)