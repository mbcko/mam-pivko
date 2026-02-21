from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from mam_pivko.db import get_db
from mam_pivko.models.wishlist import WishlistItem, WishlistItemCreate, WishlistItemUpdate
from mam_pivko.services import wishlist_service

router = APIRouter(prefix="/api/v1/wishlist", tags=["wishlist"])


def _db() -> AsyncIOMotorDatabase:  # type: ignore[type-arg]
    return get_db()


@router.get("", response_model=list[WishlistItem])
async def list_items(db: AsyncIOMotorDatabase = Depends(_db)) -> list[WishlistItem]:  # type: ignore[type-arg]
    return await wishlist_service.list_items(db)


@router.post("", response_model=WishlistItem, status_code=201)
async def create_item(
    data: WishlistItemCreate,
    db: AsyncIOMotorDatabase = Depends(_db),  # type: ignore[type-arg]
) -> WishlistItem:
    return await wishlist_service.create_item(db, data)


@router.get("/{item_id}", response_model=WishlistItem)
async def get_item(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(_db),  # type: ignore[type-arg]
) -> WishlistItem:
    item = await wishlist_service.get_item(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.put("/{item_id}", response_model=WishlistItem)
async def update_item(
    item_id: str,
    data: WishlistItemUpdate,
    db: AsyncIOMotorDatabase = Depends(_db),  # type: ignore[type-arg]
) -> WishlistItem:
    item = await wishlist_service.update_item(db, item_id, data)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_item(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(_db),  # type: ignore[type-arg]
) -> None:
    deleted = await wishlist_service.delete_item(db, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
