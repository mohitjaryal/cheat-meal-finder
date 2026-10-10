# /api/routes/vendors.py
# Vendor routes/endpoints

from fastapi import APIRouter, Depends, status
from app.services.vendor_service import get_all_vendors
from app.api.deps import get_db
from app.services.vendor_service import get_vendor_by_id, create_new_vendor
from app.schemas.vendor import CreateVendor, UpdateVendor
from app.services.vendor_service import UpdateVendor as update_vendor_service
from app.services.vendor_service import DeleteVendor

vendors_routes = APIRouter(prefix="/vendors")



# GET all vendors
@vendors_routes.get("")
async def all_vendors(pool=Depends(get_db)):
    return await get_all_vendors(pool)


# GET Vendor by id
@vendors_routes.get("/{vendor_id}", status_code=status.HTTP_200_OK)
async def vendor_id(vendor_id: int, pool=Depends(get_db)):
    return await get_vendor_by_id(pool, vendor_id)



# POST route
@vendors_routes.post("", status_code=status.HTTP_201_CREATED)
async def create_vendor(request: CreateVendor, pool=Depends(get_db)):
    return await create_new_vendor(
        pool, request.name, request.location, request.opening_hours, request.vendor_type
    )


# PUT Route (Update Route - Vendor)
@vendors_routes.put("/{vendor_id}", status_code=status.HTTP_200_OK)
async def update_existing_vendor(
    vendor_id: int, request: UpdateVendor, pool=Depends(get_db)
):
    return await update_vendor_service(
        pool,
        request.name,
        request.location,
        request.opening_hours,
        request.vendor_type,
        vendor_id,
    )


