from datetime import UTC, datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from mam_pivko.models.event import Event, EventCreate, EventUpdate

COLLECTION = "events"


def _now() -> datetime:
    return datetime.now(UTC)


def _serialize(doc: dict) -> dict:  # type: ignore[type-arg]
    doc["_id"] = str(doc["_id"])
    return doc


async def list_events(db: AsyncIOMotorDatabase) -> list[Event]:  # type: ignore[type-arg]
    cursor = db[COLLECTION].find().sort("date", -1)
    return [Event(**_serialize(doc)) async for doc in cursor]


async def get_event(db: AsyncIOMotorDatabase, event_id: str) -> Event | None:  # type: ignore[type-arg]
    if not ObjectId.is_valid(event_id):
        return None
    doc = await db[COLLECTION].find_one({"_id": ObjectId(event_id)})
    if doc is None:
        return None
    return Event(**_serialize(doc))


async def create_event(db: AsyncIOMotorDatabase, data: EventCreate) -> Event:  # type: ignore[type-arg]
    now = _now()
    payload = data.model_dump() | {"created_at": now, "updated_at": now}
    result = await db[COLLECTION].insert_one(payload)
    doc = await db[COLLECTION].find_one({"_id": result.inserted_id})
    assert doc is not None
    return Event(**_serialize(doc))


async def update_event(
    db: AsyncIOMotorDatabase,  # type: ignore[type-arg]
    event_id: str,
    data: EventUpdate,
) -> Event | None:
    if not ObjectId.is_valid(event_id):
        return None
    payload = data.model_dump() | {"updated_at": _now()}
    result = await db[COLLECTION].find_one_and_update(
        {"_id": ObjectId(event_id)},
        {"$set": payload},
        return_document=True,
    )
    if result is None:
        return None
    return Event(**_serialize(result))


async def delete_event(db: AsyncIOMotorDatabase, event_id: str) -> bool:  # type: ignore[type-arg]
    if not ObjectId.is_valid(event_id):
        return False
    result = await db[COLLECTION].delete_one({"_id": ObjectId(event_id)})
    return result.deleted_count == 1
