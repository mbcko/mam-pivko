import { createRemoteJWKSet, jwtVerify } from "jose";

interface Env {
  DB: D1Database;
  MAM_CORS_ORIGINS?: string;
  MAM_GOOGLE_CLIENT_ID?: string;
  MAM_ALLOWED_EMAILS?: string;
}

interface GoogleLoginInput {
  credential?: string;
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

interface SessionRow {
  id_hash: string;
  email: string;
  name: string;
  picture: string;
  expires_at: string;
}

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const EVENT_COLUMNS = "id, name, date, organizer, pubs_json, notes, created_at, updated_at";
const WISHLIST_COLUMNS = "id, name, address, notes, url, mapy_lon, mapy_lat, mapy_label, created_at";
const SESSION_COOKIE = "mam_session";
const SESSION_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;
const DEFAULT_CORS_ORIGINS = ["http://localhost:5173", "https://mbcko.github.io"];

function allowedOrigins(env: Env): string[] {
  const configured = (env.MAM_CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);
  return configured.length > 0 ? configured : DEFAULT_CORS_ORIGINS;
}

function allowedEmails(env: Env): string[] {
  return (env.MAM_ALLOWED_EMAILS || "").split(",").map((email) => email.trim()).filter(Boolean);
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("Origin") || "";
  const origins = allowedOrigins(env);
  const allowOrigin = origins.includes(origin) ? origin : origins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
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

function isAllowedOrigin(request: Request, env: Env): boolean {
  const origin = request.headers.get("Origin");
  return !origin || allowedOrigins(env).includes(origin);
}

function requireAllowedOrigin(request: Request, env: Env): Response | null {
  if (isAllowedOrigin(request, env)) return null;
  return json(request, env, { detail: "Origin not allowed" }, { status: 403 });
}

function parseCookies(request: Request): Record<string, string> {
  const header = request.headers.get("Cookie") || "";
  const cookies: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (!name) continue;
    cookies[name] = valueParts.join("=");
  }
  return cookies;
}

function base64Url(bytes: Uint8Array): string {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sessionCookie(request: Request, token: string, maxAgeSeconds: number): string {
  const url = new URL(request.url);
  const secureCrossSite = url.protocol === "https:";
  const attributes = [
    `${SESSION_COOKIE}=${token}`,
    "HttpOnly",
    secureCrossSite ? "Secure" : null,
    secureCrossSite ? "SameSite=None" : "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAgeSeconds}`
  ].filter(Boolean);
  return attributes.join("; ");
}

function clearSessionCookie(request: Request): string {
  return sessionCookie(request, "", 0);
}

function serializeUser(session: Pick<SessionRow, "email" | "name" | "picture">) {
  return {
    email: session.email,
    name: session.name,
    picture: session.picture
  };
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

async function verifyGoogleCredential(request: Request, env: Env, credential: string): Promise<SessionRow | Response> {
  if (!env.MAM_GOOGLE_CLIENT_ID) {
    return json(request, env, { detail: "Google client ID is not configured" }, { status: 500 });
  }
  try {
    const result = await jwtVerify(credential, googleJwks, {
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
    return {
      id_hash: "",
      email,
      name: String(result.payload.name || ""),
      picture: String(result.payload.picture || ""),
      expires_at: ""
    };
  } catch {
    return json(request, env, { detail: "Invalid token" }, { status: 401 });
  }
}

async function getSession(request: Request, env: Env): Promise<SessionRow | null> {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return null;

  const idHash = await sha256Hex(token);
  const now = nowIso();
  const session = await env.DB.prepare(
    "SELECT id_hash, email, name, picture, expires_at FROM sessions WHERE id_hash = ? AND expires_at > ?"
  ).bind(idHash, now).first<SessionRow>();

  if (!session) return null;
  await env.DB.prepare("UPDATE sessions SET last_seen_at = ? WHERE id_hash = ?").bind(now, idHash).run();
  return session;
}

async function requireAuth(request: Request, env: Env): Promise<SessionRow | Response> {
  const session = await getSession(request, env);
  if (!session) return json(request, env, { detail: "Not authenticated" }, { status: 403 });
  return session;
}

async function handleAuth(request: Request, env: Env, parts: string[]): Promise<Response> {
  if (request.method === "POST" && parts[0] === "google" && parts.length === 1) {
    const originError = requireAllowedOrigin(request, env);
    if (originError) return originError;

    const payload = await readJson<GoogleLoginInput>(request);
    if (!payload.credential) {
      return json(request, env, { detail: "Missing credential" }, { status: 400 });
    }

    const verified = await verifyGoogleCredential(request, env, payload.credential);
    if (verified instanceof Response) return verified;

    const token = randomSessionToken();
    const idHash = await sha256Hex(token);
    const timestamp = nowIso();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
    await env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(timestamp).run();
    await env.DB.prepare(
      `INSERT INTO sessions (id_hash, email, name, picture, created_at, last_seen_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(idHash, verified.email, verified.name, verified.picture, timestamp, timestamp, expiresAt).run();

    return json(
      request,
      env,
      { user: serializeUser(verified), members: allowedEmails(env) },
      { headers: { "Set-Cookie": sessionCookie(request, token, SESSION_MAX_AGE_SECONDS) } }
    );
  }

  if (request.method === "GET" && parts[0] === "me" && parts.length === 1) {
    const session = await requireAuth(request, env);
    if (session instanceof Response) return session;
    return json(request, env, { user: serializeUser(session), members: allowedEmails(env) });
  }

  if (request.method === "POST" && parts[0] === "logout" && parts.length === 1) {
    const originError = requireAllowedOrigin(request, env);
    if (originError) return originError;

    const token = parseCookies(request)[SESSION_COOKIE];
    if (token) {
      await env.DB.prepare("DELETE FROM sessions WHERE id_hash = ?").bind(await sha256Hex(token)).run();
    }
    return empty(request, env, { status: 204, headers: { "Set-Cookie": clearSessionCookie(request) } });
  }

  return json(request, env, { detail: "Not found" }, { status: 404 });
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
    const originError = requireAllowedOrigin(request, env);
    if (originError) return originError;
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
    const originError = requireAllowedOrigin(request, env);
    if (originError) return originError;
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
    const originError = requireAllowedOrigin(request, env);
    if (originError) return originError;
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
    const originError = requireAllowedOrigin(request, env);
    if (originError) return originError;
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
    const originError = requireAllowedOrigin(request, env);
    if (originError) return originError;
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
    const originError = requireAllowedOrigin(request, env);
    if (originError) return originError;
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
      if (parts[0] === "api" && parts[1] === "v1" && parts[2] === "auth") {
        return await handleAuth(request, env, parts.slice(3));
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
