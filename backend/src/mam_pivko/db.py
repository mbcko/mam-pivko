from pymongo import MongoClient
from pymongo.database import Database

from mam_pivko.config import settings

_client: MongoClient | None = None  # type: ignore[type-arg]


def get_client() -> MongoClient:  # type: ignore[type-arg]
    global _client
    if _client is None:
        _client = MongoClient(settings.mongodb_uri)
    return _client


def get_db() -> Database:  # type: ignore[type-arg]
    return get_client()[settings.mongodb_db]


def close_client() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
