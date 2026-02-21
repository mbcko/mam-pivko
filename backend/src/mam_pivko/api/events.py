from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from mam_pivko.db import get_db
from mam_pivko.models.event import Event, EventCreate, EventUpdate
from mam_pivko.services import event_service

router = APIRouter(prefix="/api/v1/events", tags=["events"])


def _db() -> AsyncIOMotorDatabase:  # type: ignore[type-arg]
    return get_db()


@router.get("", response_model=list[Event])
async def list_events(db: AsyncIOMotorDatabase = Depends(_db)) -> list[Event]:  # type: ignore[type-arg]
    return await event_service.list_events(db)


@router.post("", response_model=Event, status_code=201)
async def create_event(
    data: EventCreate,
    db: AsyncIOMotorDatabase = Depends(_db),  # type: ignore[type-arg]
) -> Event:
    return await event_service.create_event(db, data)


@router.get("/{event_id}", response_model=Event)
async def get_event(
    event_id: str,
    db: AsyncIOMotorDatabase = Depends(_db),  # type: ignore[type-arg]
) -> Event:
    event = await event_service.get_event(db, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    data: EventUpdate,
    db: AsyncIOMotorDatabase = Depends(_db),  # type: ignore[type-arg]
) -> Event:
    event = await event_service.update_event(db, event_id, data)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.delete("/{event_id}", status_code=204)
async def delete_event(
    event_id: str,
    db: AsyncIOMotorDatabase = Depends(_db),  # type: ignore[type-arg]
) -> None:
    deleted = await event_service.delete_event(db, event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found")
