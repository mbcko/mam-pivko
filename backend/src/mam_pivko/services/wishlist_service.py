from datetime import UTC, datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from mam_pivko.models.wishlist import WishlistItem, WishlistItemCreate, WishlistItemUpdate

COLLECTION = "wishlist"


def _now() -> datetime:
    return datetime.now(UTC)


def _serialize(doc: dict) -> dict:  # type: ignore[type-arg]
    doc["_id"] = str(doc["_id"])
    return doc


async def list_items(db: AsyncIOMotorDatabase) -> list[WishlistItem]:  # type: ignore[type-arg]
    cursor = db[COLLECTION].find().sort("created_at", -1)
    return [WishlistItem(**_serialize(doc)) async for doc in cursor]


async def get_item(db: AsyncIOMotorDatabase, item_id: str) -> WishlistItem | None:  # type: ignore[type-arg]
    if not ObjectId.is_valid(item_id):
        return None
    doc = await db[COLLECTION].find_one({"_id": ObjectId(item_id)})
    if doc is None:
        return None
    return WishlistItem(**_serialize(doc))


async def create_item(db: AsyncIOMotorDatabase, data: WishlistItemCreate) -> WishlistItem:  # type: ignore[type-arg]
    payload = data.model_dump() | {"created_at": _now()}
    result = await db[COLLECTION].insert_one(payload)
    doc = await db[COLLECTION].find_one({"_id": result.inserted_id})
    assert doc is not None
    return WishlistItem(**_serialize(doc))


async def update_item(
    db: AsyncIOMotorDatabase,  # type: ignore[type-arg]
    item_id: str,
    data: WishlistItemUpdate,
) -> WishlistItem | None:
    if not ObjectId.is_valid(item_id):
        return None
    result = await db[COLLECTION].find_one_and_update(
        {"_id": ObjectId(item_id)},
        {"$set": data.model_dump()},
        return_document=True,
    )
    if result is None:
        return None
    return WishlistItem(**_serialize(result))


async def delete_item(db: AsyncIOMotorDatabase, item_id: str) -> bool:  # type: ignore[type-arg]
    if not ObjectId.is_valid(item_id):
        return False
    result = await db[COLLECTION].delete_one({"_id": ObjectId(item_id)})
    return result.deleted_count == 1
