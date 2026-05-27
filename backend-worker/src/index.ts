import { createRemoteJWKSet, jwtVerify } from "jose";

interface Env {
  DB: D1Database;
  MAM_CORS_ORIGINS?: string;
  MAM_GOOGLE_CLIENT_ID?: string;
  MAM_ALLOWED_EMAILS?: string;
}

interface Pub {
  name: string;
  address?: string;
  notes?: string;
  url?: string;
  mapy_lon?: number | null;
  mapy_lat?: number | null;
  mapy_label?: string;
}

interface EventInput {
  name?: string;
  date: string;
  organizer: string;
  pubs?: Pub[];
  notes?: string;
}

interface WishlistInput {
  name: string;
  address?: string;
  notes?: string;
  url?: string;
  mapy_lon?: number | null;
  mapy_lat?: number | null;
  mapy_label?: string;
}

interface EventRow {
  id: string;
  name: string;
  date: string;
  organizer: string;
  pubs_json: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface WishlistRow {
  id: string;
  name: string;
  address: string;
  notes: string;
  url: string;
  mapy_lon: number | null;
  mapy_lat: number | null;
  mapy_label: string;
  created_at: string;
}

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const EVENT_COLUMNS = "id, name, date, organizer, pubs_json, notes, created_at, updated_at";
const WISHLIST_COLUMNS = "id, name, address, notes, url, mapy_lon, mapy_lat, mapy_label, created_at";

function allowedOrigins(env: Env): string[] {
  return (env.MAM_CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);
}

function allowedEmails(env: Env): string[] {
  return (env.MAM_ALLOWED_EMAILS || "").split(",").map((email) => email.trim()).filter(Boolean);
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("Origin") || "";
  const origins = allowedOrigins(env);
  const allowOrigin = origins.includes("*") ? "*" : origins.includes(origin) ? origin : origins[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function json(request: Request, env: Env, body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request, env),
      ...init.headers
    }
  });
}

function empty(request: Request, env: Env, init: ResponseInit = {}): Response {
  return new Response(null, {
    ...init,
    headers: {
      ...corsHeaders(request, env),
      ...init.headers
    }
  });
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return await request.json<T>();
  } catch {
    throw new Response("Invalid JSON", { status: 400 });
  }
}

function isoDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Response("Invalid date", { status: 400 });
  }
  return date.toISOString();
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalizePub(pub: Pub): Pub {
  return {
    name: pub.name,
    address: pub.address || "",
    notes: pub.notes || "",
    url: pub.url || "",
    mapy_lon: pub.mapy_lon ?? null,
    mapy_lat: pub.mapy_lat ?? null,
    mapy_label: pub.mapy_label || ""
  };
}

function parsePubs(value: string): Pub[] {
  try {
    const pubs = JSON.parse(value);
    return Array.isArray(pubs) ? pubs : [];
  } catch {
    return [];
  }
}

function serializeEvent(row: EventRow) {
  return {
    _id: row.id,
    name: row.name,
    date: row.date,
    organizer: row.organizer,
    pubs: parsePubs(row.pubs_json),
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function serializeWishlistItem(row: WishlistRow) {
  return {
    _id: row.id,
    name: row.name,
    address: row.address,
    notes: row.notes,
    url: row.url,
    mapy_lon: row.mapy_lon,
    mapy_lat: row.mapy_lat,
    mapy_label: row.mapy_label,
    created_at: row.created_at
  };
}

function eventValues(input: EventInput) {
  return {
    name: input.name || "",
    date: isoDate(input.date),
    organizer: input.organizer,
    pubs_json: JSON.stringify((input.pubs || []).map(normalizePub)),
    notes: input.notes || ""
  };
}

function wishlistValues(input: WishlistInput) {
  return {
    name: input.name,
    address: input.address || "",
    notes: input.notes || "",
    url: input.url || "",
    mapy_lon: input.mapy_lon ?? null,
    mapy_lat: input.mapy_lat ?? null,
    mapy_label: input.mapy_label || ""
  };
}

async function requireAuth(request: Request, env: Env): Promise<string | Response> {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer (.+)$/);
  if (!match) return json(request, env, { detail: "Not authenticated" }, { status: 403 });

  try {
    if (!env.MAM_GOOGLE_CLIENT_ID) {
      return json(request, env, { detail: "Google client ID is not configured" }, { status: 500 });
    }
    const result = await jwtVerify(match[1], googleJwks, {
      audience: env.MAM_GOOGLE_CLIENT_ID,
      issuer: ["https://accounts.google.com", "accounts.google.com"]
    });
    if (result.payload.email_verified !== true) {
      return json(request, env, { detail: "Email not verified" }, { status: 401 });
    }
    const email = String(result.payload.email || "");
    if (!allowedEmails(env).includes(email)) {
      return json(request, env, { detail: "Not authorized" }, { status: 403 });
    }
    return email;
  } catch {
    return json(request, env, { detail: "Invalid token" }, { status: 401 });
  }
}

async function getEvent(env: Env, id: string): Promise<EventRow | null> {
  return env.DB.prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`).bind(id).first<EventRow>();
}

async function getWishlistItem(env: Env, id: string): Promise<WishlistRow | null> {
  return env.DB.prepare(`SELECT ${WISHLIST_COLUMNS} FROM wishlist WHERE id = ?`).bind(id).first<WishlistRow>();
}

async function handleEvents(request: Request, env: Env, parts: string[]): Promise<Response> {
  if (request.method === "GET" && parts.length === 0) {
    const { results } = await env.DB.prepare(`SELECT ${EVENT_COLUMNS} FROM events ORDER BY date DESC`).all<EventRow>();
    return json(request, env, results.map(serializeEvent));
  }

  if (request.method === "POST" && parts.length === 0) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const id = crypto.randomUUID();
    const timestamp = nowIso();
    const payload = eventValues(await readJson<EventInput>(request));
    await env.DB.prepare(
      `INSERT INTO events (id, name, date, organizer, pubs_json, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      payload.name,
      payload.date,
      payload.organizer,
      payload.pubs_json,
      payload.notes,
      timestamp,
      timestamp
    ).run();
    const row = await getEvent(env, id);
    return json(request, env, row ? serializeEvent(row) : null, { status: 201 });
  }

  const id = parts[0] || "";

  if (request.method === "GET" && parts.length === 1) {
    const row = await getEvent(env, id);
    if (!row) return json(request, env, { detail: "Event not found" }, { status: 404 });
    return json(request, env, serializeEvent(row));
  }

  if (request.method === "PUT" && parts.length === 1) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const payload = eventValues(await readJson<EventInput>(request));
    await env.DB.prepare(
      `UPDATE events
       SET name = ?, date = ?, organizer = ?, pubs_json = ?, notes = ?, updated_at = ?
       WHERE id = ?`
    ).bind(
      payload.name,
      payload.date,
      payload.organizer,
      payload.pubs_json,
      payload.notes,
      nowIso(),
      id
    ).run();
    const row = await getEvent(env, id);
    if (!row) return json(request, env, { detail: "Event not found" }, { status: 404 });
    return json(request, env, serializeEvent(row));
  }

  if (request.method === "DELETE" && parts.length === 1) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const result = await env.DB.prepare("DELETE FROM events WHERE id = ?").bind(id).run();
    if (result.meta.changes !== 1) return json(request, env, { detail: "Event not found" }, { status: 404 });
    return empty(request, env, { status: 204 });
  }

  return json(request, env, { detail: "Not found" }, { status: 404 });
}

async function handleWishlist(request: Request, env: Env, parts: string[]): Promise<Response> {
  if (request.method === "GET" && parts.length === 0) {
    const { results } = await env.DB.prepare(
      `SELECT ${WISHLIST_COLUMNS} FROM wishlist ORDER BY created_at DESC`
    ).all<WishlistRow>();
    return json(request, env, results.map(serializeWishlistItem));
  }

  if (request.method === "POST" && parts.length === 0) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const id = crypto.randomUUID();
    const payload = wishlistValues(await readJson<WishlistInput>(request));
    await env.DB.prepare(
      `INSERT INTO wishlist (id, name, address, notes, url, mapy_lon, mapy_lat, mapy_label, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      payload.name,
      payload.address,
      payload.notes,
      payload.url,
      payload.mapy_lon,
      payload.mapy_lat,
      payload.mapy_label,
      nowIso()
    ).run();
    const row = await getWishlistItem(env, id);
    return json(request, env, row ? serializeWishlistItem(row) : null, { status: 201 });
  }

  const id = parts[0] || "";

  if (request.method === "GET" && parts.length === 1) {
    const row = await getWishlistItem(env, id);
    if (!row) return json(request, env, { detail: "Item not found" }, { status: 404 });
    return json(request, env, serializeWishlistItem(row));
  }

  if (request.method === "PUT" && parts.length === 1) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const payload = wishlistValues(await readJson<WishlistInput>(request));
    await env.DB.prepare(
      `UPDATE wishlist
       SET name = ?, address = ?, notes = ?, url = ?, mapy_lon = ?, mapy_lat = ?, mapy_label = ?
       WHERE id = ?`
    ).bind(
      payload.name,
      payload.address,
      payload.notes,
      payload.url,
      payload.mapy_lon,
      payload.mapy_lat,
      payload.mapy_label,
      id
    ).run();
    const row = await getWishlistItem(env, id);
    if (!row) return json(request, env, { detail: "Item not found" }, { status: 404 });
    return json(request, env, serializeWishlistItem(row));
  }

  if (request.method === "DELETE" && parts.length === 1) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const result = await env.DB.prepare("DELETE FROM wishlist WHERE id = ?").bind(id).run();
    if (result.meta.changes !== 1) return json(request, env, { detail: "Item not found" }, { status: 404 });
    return empty(request, env, { status: 204 });
  }

  return json(request, env, { detail: "Not found" }, { status: 404 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return empty(request, env, { status: 204 });
    }

    const url = new URL(request.url);
    const parts = url.pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        return json(request, env, { status: "ok" });
      }
      if (parts[0] === "api" && parts[1] === "v1" && parts[2] === "events") {
        return await handleEvents(request, env, parts.slice(3));
      }
      if (parts[0] === "api" && parts[1] === "v1" && parts[2] === "wishlist") {
        return await handleWishlist(request, env, parts.slice(3));
      }
      if (request.method === "GET" && parts.join("/") === "api/v1/members") {
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) return auth;
        return json(request, env, allowedEmails(env));
      }
      return json(request, env, { detail: "Not found" }, { status: 404 });
    } catch (error) {
      if (error instanceof Response) return error;
      console.error(error);
      return json(request, env, { detail: "Internal server error" }, { status: 500 });
    }
  }
};
