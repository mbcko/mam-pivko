from datetime import datetime

from pydantic import BaseModel, Field

from mam_pivko.models.common import PyObjectId


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
