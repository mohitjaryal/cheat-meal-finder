from pydantic import BaseModel

# Create category
class CreateCategory(BaseModel):
    name:str 