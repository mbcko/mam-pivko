from datetime import datetime
from typing import Annotated, Any

from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, Field


def _validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str) and ObjectId.is_valid(v):
        return v
    raise ValueError(f"Invalid ObjectId: {v}")


PyObjectId = Annotated[str, BeforeValidator(_validate_object_id)]


class WishlistItemBase(BaseModel):
    name: str
    address: str = ""
    notes: str = ""
    url: str = ""
    mapy_lon: float | None = None
    mapy_lat: float | None = None
    mapy_label: str = ""


class WishlistItemCreate(WishlistItemBase):
    pass


class WishlistItemUpdate(WishlistItemBase):
    pass


class WishlistItem(WishlistItemBase):
    id: PyObjectId = Field(alias="_id")
    created_at: datetime

    model_config = {"populate_by_name": True}
