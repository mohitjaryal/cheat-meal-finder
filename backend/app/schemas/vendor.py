from pydantic import BaseModel

# Create vendor 

class CreateVendor(BaseModel):
    name:str
    location:str
    opening_hours:str
    vendor_type:str 

# Update Vendor
class UpdateVendor(BaseModel):
    name:str
    location:str
    opening_hours:str
    vendor_type:str
    