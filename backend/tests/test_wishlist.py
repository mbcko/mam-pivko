from httpx import AsyncClient

ITEM_PAYLOAD = {
    "name": "U Fleků",
    "address": "Křemencova 11, Praha 1",
    "notes": "klasika",
    "url": "https://ufleku.cz",
}


async def test_create_item(client: AsyncClient):
    r = await client.post("/api/v1/wishlist", json=ITEM_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "U Fleků"
    assert data["address"] == "Křemencova 11, Praha 1"
    assert "_id" in data


async def test_list_items(client: AsyncClient):
    await client.post("/api/v1/wishlist", json=ITEM_PAYLOAD)
    r = await client.get("/api/v1/wishlist")
    assert r.status_code == 200
    assert len(r.json()) == 1


async def test_get_item(client: AsyncClient):
    create_r = await client.post("/api/v1/wishlist", json=ITEM_PAYLOAD)
    item_id = create_r.json()["_id"]

    r = await client.get(f"/api/v1/wishlist/{item_id}")
    assert r.status_code == 200
    assert r.json()["_id"] == item_id


async def test_get_item_not_found(client: AsyncClient):
    r = await client.get("/api/v1/wishlist/000000000000000000000000")
    assert r.status_code == 404


async def test_update_item(client: AsyncClient):
    create_r = await client.post("/api/v1/wishlist", json=ITEM_PAYLOAD)
    item_id = create_r.json()["_id"]

    updated = ITEM_PAYLOAD | {"name": "U Fleků (updated)"}
    r = await client.put(f"/api/v1/wishlist/{item_id}", json=updated)
    assert r.status_code == 200
    assert r.json()["name"] == "U Fleků (updated)"


async def test_delete_item(client: AsyncClient):
    create_r = await client.post("/api/v1/wishlist", json=ITEM_PAYLOAD)
    item_id = create_r.json()["_id"]

    r = await client.delete(f"/api/v1/wishlist/{item_id}")
    assert r.status_code == 204

    r2 = await client.get(f"/api/v1/wishlist/{item_id}")
    assert r2.status_code == 404
