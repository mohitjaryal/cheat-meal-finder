from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional


# Create Dish
class DishCreate(BaseModel):
    vendor_id: int
    category_id: int
    name: str
    price: Decimal = Field(gt=0)
    spice_level: Optional[str] = None
    description: Optional[str] = None


# Update Dish
class DishUpdate(BaseModel):
    vendor_id: Optional[int] = None
    category_id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, gt=0)
    spice_level: Optional[str] = None
    description: Optional[str] = None
