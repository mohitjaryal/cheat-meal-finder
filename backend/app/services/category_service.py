# Category service

from fastapi import HTTPException

# GET all categories
async def get_all_categories(pool):
    all_categories = await pool.fetch("SELECT * FROM categories;")
    return all_categories

# GET category by id
async def get_category_by_id(pool, category_id):
    category_by_id = await pool.fetchrow("SELECT * FROM categories where category_id = $1;",category_id)
    if category_by_id == None:
        raise HTTPException(status_code=404,detail="Category does not exist")
    return category_by_id

# POST - Create category  
# async def create_new_category(pool,name):
#     create_category = await pool.execute("INSERT INTO categories(name) VALUES($1);",name)
#     return create_category
async def create_new_category(pool, name):
    created_category = await pool.fetchrow(
        "INSERT INTO categories(name) VALUES($1) RETURNING category_id, name;",
        name
    )
    return dict(created_category)

# PUT - Update category
async def update_existing_category(pool,category_id,name):
    updated_category = await pool.execute("UPDATE categories SET name = $1 where category_id = $2;",name, category_id)
    if updated_category == "UPDATE 0":
            raise HTTPException(status_code=404,detail="Category does not exist")
    return updated_category

# DELETE - DELETE existing category
async def delete_existing_category(category_id,pool):
    deleted_category = await pool.execute('DELETE FROM categories where category_id = $1;',category_id)
    if deleted_category == "DELETE 0":
        raise HTTPException(status_code=404,detail="Category does not exist")
    return deleted_category 