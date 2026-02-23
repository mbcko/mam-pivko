from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.database import Database

from mam_pivko.models.event import Event, EventCreate, EventUpdate
from mam_pivko.services.utils import now, serialize

COLLECTION = "events"


def list_events(db: Database) -> list[Event]:  # type: ignore[type-arg]
    return [Event(**serialize(doc)) for doc in db[COLLECTION].find().sort("date", -1)]


def get_event(db: Database, event_id: str) -> Event | None:  # type: ignore[type-arg]
    if not ObjectId.is_valid(event_id):
        return None
    doc = db[COLLECTION].find_one({"_id": ObjectId(event_id)})
    if doc is None:
        return None
    return Event(**serialize(doc))


def create_event(db: Database, data: EventCreate) -> Event:  # type: ignore[type-arg]
    ts = now()
    payload = data.model_dump() | {"created_at": ts, "updated_at": ts}
    result = db[COLLECTION].insert_one(payload)
    doc = db[COLLECTION].find_one({"_id": result.inserted_id})
    assert doc is not None
    return Event(**serialize(doc))


def update_event(db: Database, event_id: str, data: EventUpdate) -> Event | None:  # type: ignore[type-arg]
    if not ObjectId.is_valid(event_id):
        return None
    payload = data.model_dump() | {"updated_at": now()}
    result = db[COLLECTION].find_one_and_update(
        {"_id": ObjectId(event_id)},
        {"$set": payload},
        return_document=ReturnDocument.AFTER,
    )
    if result is None:
        return None
    return Event(**serialize(result))


def delete_event(db: Database, event_id: str) -> bool:  # type: ignore[type-arg]
    if not ObjectId.is_valid(event_id):
        return False
    result = db[COLLECTION].delete_one({"_id": ObjectId(event_id)})
    return result.deleted_count == 1
