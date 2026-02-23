from datetime import datetime

from pydantic import BaseModel, Field

from mam_pivko.models.common import PyObjectId


class Pub(BaseModel):
    name: str
    address: str = ""
    notes: str = ""
    url: str = ""
    mapy_lon: float | None = None
    mapy_lat: float | None = None
    mapy_label: str = ""


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
