# main.py 

from fastapi import FastAPI
from app.api.routes.vendors import vendors_routes

app = FastAPI()

app.include_router(vendors_routes)