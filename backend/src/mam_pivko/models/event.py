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


class Pub(BaseModel):
    name: str
    address: str = ""
    notes: str = ""
    url: str = ""


class EventBase(BaseModel):
    name: str = ""
    date: datetime
    organizer: str
    pubs: list[Pub] = Field(default_factory=list)
    notes: str = ""


class EventCreate(EventBase):
    pass


class EventUpdate(EventBase):
    pass


class Event(EventBase):
    id: PyObjectId = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    model_config = {"populate_by_name": True}
