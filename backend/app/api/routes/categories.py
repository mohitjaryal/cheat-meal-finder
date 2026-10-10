# Categories Route
from fastapi import APIRouter, Depends, status, HTTPException
from app.api.deps import get_db
from app.services.category_service import get_all_categories, get_category_by_id, create_new_category, update_existing_category, delete_existing_category
from app.schemas.category import CreateCategory, UpdateCategory


categories = APIRouter(prefix='/categories')


# GET - All vendors
@categories.get("")
async def all_categories(pool=Depends(get_db)):
    return await get_all_categories(pool)

# GET - Category by id
@categories.get("/{category_id}",status_code=status.HTTP_200_OK)
async def category_by_id(category_id:int,pool=Depends(get_db)):
    return await get_category_by_id(pool,category_id)

# POST - Create Category
@categories.post("",status_code=status.HTTP_201_CREATED)
async def create_category(request:CreateCategory,pool=Depends(get_db)):
    return await create_new_category(pool,request.name)

# PUT - Update Categrory
@categories.put('/{category_id}')
async def update_category(request:UpdateCategory,category_id:int,pool=Depends(get_db)):
    return await update_existing_category(pool,category_id,request.name)

# DELETE - Delete category
@categories.delete('/{category_id}',status_code=status.HTTP_200_OK)
async def delete_category(category_id:int,pool=Depends(get_db)):
    return await delete_existing_category(category_id,pool)