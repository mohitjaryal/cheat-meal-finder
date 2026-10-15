from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional

from app.api.deps import get_db
from app.services.dish_service import (
    get_all_dishes,
    get_dishes_by_id,
    get_dishes_by_vendor_id,
    create_dish,
    update_dish,
    delete_dish,
)

router = APIRouter(prefix="/dishes", tags=["Dishes"])


# GET - All Dishes
@router.get("/")
async def read_all_dishes(pool=Depends(get_db)):
    return await get_all_dishes(pool)


# GET - Dish by ID
@router.get("/{dish_id}")
async def read_dish_by_id(
    dish_id: int,
    pool=Depends(get_db),
):
    dish = await get_dishes_by_id(pool, dish_id)

    if dish is None:
        raise HTTPException(status_code=404, detail="Dish not found")

    return dish


# GET - Dishes by Vendor ID
# Keep this route before /{dish_id}
@router.get("/vendor/{vendor_id}")
async def read_dishes_by_vendor(
    vendor_id: int,
    pool=Depends(get_db),
):
    return await get_dishes_by_vendor_id(pool, vendor_id)


# POST - Create Dish
@router.post("/", status_code=201)
async def add_dish(
    data: DishCreate,
    pool=Depends(get_db),
):
    return await create_dish(
        pool,
        data.vendor_id,
        data.category_id,
        data.name,
        data.price,
        data.spice_level,
        data.description,
        data.image_url,
    )


# PUT - Update Dish
@router.put("/{dish_id}")
async def edit_dish(
    dish_id: int,
    data: DishUpdate,
    pool=Depends(get_db),
):
    dish = await update_dish(
        pool,
        dish_id,
        data.vendor_id,
        data.category_id,
        data.name,
        data.price,
        data.spice_level,
        data.description,
        data.image_url,
    )

    if dish is None:
        raise HTTPException(status_code=404, detail="Dish not found")

    return dish


# DELETE - Dish by ID
@router.delete("/{dish_id}")
async def remove_dish(
    dish_id: int,
    pool=Depends(get_db),
):
    result = await delete_dish(pool, dish_id)

    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Dish not found")

    return {"message": "Dish deleted successfully"}