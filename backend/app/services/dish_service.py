# Dish Services

# GET - All Dishes
async def get_all_dishes(pool):
    return await pool.fetch("SELECT * FROM dishes;")


# GET - Dish by ID
async def get_dishes_by_id(pool, dish_id):
    return await pool.fetchrow(
        "SELECT * FROM dishes WHERE dish_id = $1;",
        dish_id
    )


# GET - All Dishes by Vendor ID
async def get_dishes_by_vendor_id(pool, vendor_id):
    return await pool.fetch(
        "SELECT * FROM dishes WHERE vendor_id = $1;",
        vendor_id
    )


# POST - Create Dish
async def create_dish(
    pool, vendor_id, category_id, name, price,
    spice_level, description, image_url
):
    return await pool.fetchrow(
        """
        INSERT INTO dishes (
            vendor_id, category_id, name, price,
            spice_level, description, image_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
        """,
        vendor_id, category_id, name, price,
        spice_level, description, image_url
    )


# PUT - Update Dish
async def update_dish(
    pool, dish_id, vendor_id, category_id, name,
    price, spice_level, description, image_url
):
    return await pool.fetchrow(
        """
        UPDATE dishes
        SET vendor_id = $2,
            category_id = $3,
            name = $4,
            price = $5,
            spice_level = $6,
            description = $7,
            image_url = $8
        WHERE dish_id = $1
        RETURNING *;
        """,
        dish_id, vendor_id, category_id, name,
        price, spice_level, description, image_url
    )


# DELETE - Dish by ID
async def delete_dish(pool, dish_id):
    return await pool.execute(
        "DELETE FROM dishes WHERE dish_id = $1;",
        dish_id
    )