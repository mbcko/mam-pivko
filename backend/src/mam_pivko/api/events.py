from fastapi import APIRouter, Depends, HTTPException
from pymongo.database import Database

from mam_pivko.api.auth import require_auth
from mam_pivko.db import get_db
from mam_pivko.models.event import Event, EventCreate, EventUpdate
from mam_pivko.services import event_service

router = APIRouter(prefix="/api/v1/events", tags=["events"])


@router.get("", response_model=list[Event])
def list_events(db: Database = Depends(get_db)) -> list[Event]:  # type: ignore[type-arg]
    return event_service.list_events(db)


@router.post("", response_model=Event, status_code=201)
def create_event(
    data: EventCreate,
    db: Database = Depends(get_db),  # type: ignore[type-arg]
    _: str = Depends(require_auth),
) -> Event:
    return event_service.create_event(db, data)


@router.get("/{event_id}", response_model=Event)
def get_event(event_id: str, db: Database = Depends(get_db)) -> Event:  # type: ignore[type-arg]
    event = event_service.get_event(db, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=Event)
def update_event(
    event_id: str,
    data: EventUpdate,
    db: Database = Depends(get_db),  # type: ignore[type-arg]
    _: str = Depends(require_auth),
) -> Event:
    event = event_service.update_event(db, event_id, data)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(
    event_id: str,
    db: Database = Depends(get_db),  # type: ignore[type-arg]
    _: str = Depends(require_auth),
) -> None:
    deleted = event_service.delete_event(db, event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found")
