from httpx import AsyncClient

EVENT_PAYLOAD = {
    "name": "MAM Pivko #1",
    "date": "2024-06-15T18:00:00Z",
    "organizer": "Martin",
    "pubs": [
        {"name": "U Fleků", "address": "Křemencova 11, Praha 1", "notes": "tady jíme"},
        {"name": "Pivovarský klub", "address": "Křižíkova 17, Praha 8"},
    ],
    "notes": "První ročník",
}


async def test_health(client: AsyncClient):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


async def test_create_event(client: AsyncClient):
    r = await client.post("/api/v1/events", json=EVENT_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "MAM Pivko #1"
    assert data["organizer"] == "Martin"
    assert len(data["pubs"]) == 2
    assert "_id" in data or "id" in data


async def test_list_events(client: AsyncClient):
    await client.post("/api/v1/events", json=EVENT_PAYLOAD)
    r = await client.get("/api/v1/events")
    assert r.status_code == 200
    assert len(r.json()) == 1


async def test_get_event(client: AsyncClient):
    create_r = await client.post("/api/v1/events", json=EVENT_PAYLOAD)
    event_id = create_r.json()["_id"]

    r = await client.get(f"/api/v1/events/{event_id}")
    assert r.status_code == 200
    assert r.json()["_id"] == event_id


async def test_get_event_not_found(client: AsyncClient):
    r = await client.get("/api/v1/events/000000000000000000000000")
    assert r.status_code == 404


async def test_update_event(client: AsyncClient):
    create_r = await client.post("/api/v1/events", json=EVENT_PAYLOAD)
    event_id = create_r.json()["_id"]

    updated = EVENT_PAYLOAD | {"name": "MAM Pivko #1 (updated)"}
    r = await client.put(f"/api/v1/events/{event_id}", json=updated)
    assert r.status_code == 200
    assert r.json()["name"] == "MAM Pivko #1 (updated)"


async def test_delete_event(client: AsyncClient):
    create_r = await client.post("/api/v1/events", json=EVENT_PAYLOAD)
    event_id = create_r.json()["_id"]

    r = await client.delete(f"/api/v1/events/{event_id}")
    assert r.status_code == 204

    r2 = await client.get(f"/api/v1/events/{event_id}")
    assert r2.status_code == 404
