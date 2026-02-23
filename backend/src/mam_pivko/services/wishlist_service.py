from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.database import Database

from mam_pivko.models.wishlist import WishlistItem, WishlistItemCreate, WishlistItemUpdate
from mam_pivko.services.utils import now, serialize

COLLECTION = "wishlist"


def list_items(db: Database) -> list[WishlistItem]:  # type: ignore[type-arg]
    return [WishlistItem(**serialize(doc)) for doc in db[COLLECTION].find().sort("created_at", -1)]


def get_item(db: Database, item_id: str) -> WishlistItem | None:  # type: ignore[type-arg]
    if not ObjectId.is_valid(item_id):
        return None
    doc = db[COLLECTION].find_one({"_id": ObjectId(item_id)})
    if doc is None:
        return None
    return WishlistItem(**serialize(doc))


def create_item(db: Database, data: WishlistItemCreate) -> WishlistItem:  # type: ignore[type-arg]
    payload = data.model_dump() | {"created_at": now()}
    result = db[COLLECTION].insert_one(payload)
    doc = db[COLLECTION].find_one({"_id": result.inserted_id})
    assert doc is not None
    return WishlistItem(**serialize(doc))


def update_item(db: Database, item_id: str, data: WishlistItemUpdate) -> WishlistItem | None:  # type: ignore[type-arg]
    if not ObjectId.is_valid(item_id):
        return None
    result = db[COLLECTION].find_one_and_update(
        {"_id": ObjectId(item_id)},
        {"$set": data.model_dump()},
        return_document=ReturnDocument.AFTER,
    )
    if result is None:
        return None
    return WishlistItem(**serialize(result))


def delete_item(db: Database, item_id: str) -> bool:  # type: ignore[type-arg]
    if not ObjectId.is_valid(item_id):
        return False
    result = db[COLLECTION].delete_one({"_id": ObjectId(item_id)})
    return result.deleted_count == 1
