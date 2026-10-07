# app/services/vendor_service.py

from fastapi import HTTPException

# GET all vendors service
async def get_all_vendors(pool):
    rows = await pool.fetch("SELECT * FROM vendors;")
    return rows


# GET vendor by vendor_id
async def get_vendor_by_id(pool, vendor_id):
    vendor = await pool.fetchrow(
        "SELECT * FROM vendors where vendor_id = $1;", vendor_id
    )
    if vendor is None:
        raise HTTPException(status_code=404,detail='Vendor not found')
    return vendor


# POST - Create vendor
async def create_new_vendor(pool, name, location, opening_hours, vendor_type):
    create_vendor = await pool.execute(
        "INSERT INTO vendors(name,location,opening_hours,vendor_type) VALUES($1,$2,$3,$4);",
        name,
        location,
        opening_hours,
        vendor_type,
    )
    return create_vendor


# PUT - UPDATE Vendor
async def UpdateVendor(pool, name, location, opening_hours, vendor_type,vendor_id):
    update_vendor = await pool.execute(
        "UPDATE vendors SET name = $1,location = $2,opening_hours=$3,vendor_type=$4 where vendor_id = $5;",
        name,
        location,
        opening_hours,
        vendor_type,
        vendor_id
    )
    if update_vendor is None:
        raise HTTPException(status_code=404,detail='Vendor not found')
    return update_vendor

# DELETE Vendor
async def DeleteVendor(pool,vendor_id):
    delete_vendor = await pool.execute(
        "DELETE FROM vendors WHERE vendor_id = $1",
        vendor_id
    )
    if delete_vendor is None:
        raise HTTPException(status_code=404,detail='Vendor not found')
    return delete_vendor