from fastapi import APIRouter, Depends, HTTPException
from pymongo.database import Database

from mam_pivko.api.auth import require_auth
from mam_pivko.db import get_db
from mam_pivko.models.wishlist import WishlistItem, WishlistItemCreate, WishlistItemUpdate
from mam_pivko.services import wishlist_service

router = APIRouter(prefix="/api/v1/wishlist", tags=["wishlist"])


@router.get("", response_model=list[WishlistItem])
def list_items(db: Database = Depends(get_db)) -> list[WishlistItem]:  # type: ignore[type-arg]
    return wishlist_service.list_items(db)


@router.post("", response_model=WishlistItem, status_code=201)
def create_item(
    data: WishlistItemCreate,
    db: Database = Depends(get_db),  # type: ignore[type-arg]
    _: str = Depends(require_auth),
) -> WishlistItem:
    return wishlist_service.create_item(db, data)


@router.get("/{item_id}", response_model=WishlistItem)
def get_item(item_id: str, db: Database = Depends(get_db)) -> WishlistItem:  # type: ignore[type-arg]
    item = wishlist_service.get_item(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.put("/{item_id}", response_model=WishlistItem)
def update_item(
    item_id: str,
    data: WishlistItemUpdate,
    db: Database = Depends(get_db),  # type: ignore[type-arg]
    _: str = Depends(require_auth),
) -> WishlistItem:
    item = wishlist_service.update_item(db, item_id, data)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/{item_id}", status_code=204)
def delete_item(
    item_id: str,
    db: Database = Depends(get_db),  # type: ignore[type-arg]
    _: str = Depends(require_auth),
) -> None:
    deleted = wishlist_service.delete_item(db, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
