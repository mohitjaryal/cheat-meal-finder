
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class DishCreate(BaseModel):
    vendor_id: int = Field(gt=0)
    category_id: int = Field(gt=0)
    name: str = Field(min_length=1, max_length=100)
    price: Decimal = Field(gt=0)
    spice_level: Optional[int] = Field(default=None, ge=0, le=5)
    description: Optional[str] = None
    image_url: Optional[str] = None


class DishUpdate(BaseModel):
    vendor_id: int = Field(gt=0)
    category_id: int = Field(gt=0)
    name: str = Field(min_length=1, max_length=100)
    price: Decimal = Field(gt=0)
    spice_level: Optional[int] = Field(default=None, ge=0, le=5)
    description: Optional[str] = None
    image_url: Optional[str] = None
