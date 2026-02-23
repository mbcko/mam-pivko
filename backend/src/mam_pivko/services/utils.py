from datetime import UTC, datetime
from typing import Any


def now() -> datetime:
    return datetime.now(UTC)


def serialize(doc: dict[str, Any]) -> dict[str, Any]:
    doc["_id"] = str(doc["_id"])
    return doc
