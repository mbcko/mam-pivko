import pytest
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient

from mam_pivko.api.app import create_app
from mam_pivko.db import get_db
import mam_pivko.db as db_module

TEST_DB_NAME = "mam_pivko_test"


@pytest.fixture(autouse=True)
async def test_db():
    """Use a separate test database and clean it up after each test."""
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client[TEST_DB_NAME]

    original_get_db = db_module.get_db

    def _override_get_db():
        return db

    db_module.get_db = _override_get_db  # type: ignore[assignment]

    yield db

    await db["events"].drop()
    await db["wishlist"].drop()
    client.close()
    db_module.get_db = original_get_db  # type: ignore[assignment]


@pytest.fixture
async def client(test_db):
    app = create_app()
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
