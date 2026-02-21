import pytest
from httpx import ASGITransport, AsyncClient
from pymongo import MongoClient

import mam_pivko.db as db_module
from mam_pivko.api.app import create_app

TEST_DB_NAME = "mam_pivko_test"
TEST_MONGODB_URI = "mongodb://localhost:27017"


@pytest.fixture(scope="session")
def mongo_client():
    client = MongoClient(TEST_MONGODB_URI)
    yield client
    client.close()


@pytest.fixture(scope="session", autouse=True)
def override_db(mongo_client):
    db = mongo_client[TEST_DB_NAME]
    original_get_db = db_module.get_db
    db_module.get_db = lambda: db  # type: ignore[assignment]
    yield
    db_module.get_db = original_get_db  # type: ignore[assignment]


@pytest.fixture(autouse=True)
def cleanup(mongo_client):
    yield
    db = mongo_client[TEST_DB_NAME]
    db["events"].drop()
    db["wishlist"].drop()


@pytest.fixture
async def client():
    app = create_app()
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
