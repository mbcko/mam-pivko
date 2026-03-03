import mongomock
import pytest
from httpx import ASGITransport, AsyncClient

from mam_pivko.api.app import create_app
from mam_pivko.api.auth import require_auth
from mam_pivko.db import get_db


@pytest.fixture(scope="session")
def mongo_client():
    client = mongomock.MongoClient()
    yield client
    client.close()


@pytest.fixture(autouse=True)
def cleanup(mongo_client):
    yield
    db = mongo_client["mam_pivko_test"]
    db["events"].drop()
    db["wishlist"].drop()


@pytest.fixture
async def client(mongo_client):
    app = create_app()
    test_db = mongo_client["mam_pivko_test"]
    app.dependency_overrides[get_db] = lambda: test_db
    app.dependency_overrides[require_auth] = lambda: "test@example.com"
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()
