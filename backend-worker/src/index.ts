import { createRemoteJWKSet, jwtVerify } from "jose";
import { MongoClient, ObjectId, type Collection, type Db, type Document } from "mongodb";

interface Env {
  MAM_MONGODB_URI?: string;
  MAM_MONGODB_DB?: string;
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

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
let clientPromise: Promise<MongoClient> | undefined;

async function db(env: Env): Promise<Db> {
  if (!env.MAM_MONGODB_URI) {
    throw new Error("MAM_MONGODB_URI is not configured");
  }
  if (!clientPromise) {
    clientPromise = new MongoClient(env.MAM_MONGODB_URI).connect();
  }
  const client = await clientPromise;
  return client.db(env.MAM_MONGODB_DB || "mam_pivko");
}

function collection<T extends Document>(database: Db, name: string): Collection<T> {
  return database.collection<T>(name);
}

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

function serialize(value: unknown): unknown {
  if (value instanceof ObjectId) return value.toHexString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serialize(entry)]));
  }
  return value;
}

function objectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return await request.json<T>();
  } catch {
    throw new Response("Invalid JSON", { status: 400 });
  }
}

function eventPayload(input: EventInput, timestamps: Partial<Record<"created_at" | "updated_at", Date>>) {
  return {
    name: input.name || "",
    date: new Date(input.date),
    organizer: input.organizer,
    pubs: input.pubs || [],
    notes: input.notes || "",
    ...timestamps
  };
}

function wishlistPayload(input: WishlistInput, timestamps: Partial<Record<"created_at", Date>>) {
  return {
    name: input.name,
    address: input.address || "",
    notes: input.notes || "",
    url: input.url || "",
    mapy_lon: input.mapy_lon ?? null,
    mapy_lat: input.mapy_lat ?? null,
    mapy_label: input.mapy_label || "",
    ...timestamps
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

async function handleEvents(request: Request, env: Env, parts: string[]): Promise<Response> {
  const database = await db(env);
  const events = collection(database, "events");

  if (request.method === "GET" && parts.length === 0) {
    const docs = await events.find().sort({ date: -1 }).toArray();
    return json(request, env, serialize(docs));
  }

  if (request.method === "POST" && parts.length === 0) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const now = new Date();
    const payload = eventPayload(await readJson<EventInput>(request), { created_at: now, updated_at: now });
    const result = await events.insertOne(payload);
    const doc = await events.findOne({ _id: result.insertedId });
    return json(request, env, serialize(doc), { status: 201 });
  }

  const id = parts[0] ? objectId(parts[0]) : null;
  if (!id) return json(request, env, { detail: "Event not found" }, { status: 404 });

  if (request.method === "GET" && parts.length === 1) {
    const doc = await events.findOne({ _id: id });
    if (!doc) return json(request, env, { detail: "Event not found" }, { status: 404 });
    return json(request, env, serialize(doc));
  }

  if (request.method === "PUT" && parts.length === 1) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const payload = eventPayload(await readJson<EventInput>(request), { updated_at: new Date() });
    const result = await events.findOneAndUpdate(
      { _id: id },
      { $set: payload },
      { returnDocument: "after" }
    );
    if (!result) return json(request, env, { detail: "Event not found" }, { status: 404 });
    return json(request, env, serialize(result));
  }

  if (request.method === "DELETE" && parts.length === 1) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const result = await events.deleteOne({ _id: id });
    if (result.deletedCount !== 1) return json(request, env, { detail: "Event not found" }, { status: 404 });
    return empty(request, env, { status: 204 });
  }

  return json(request, env, { detail: "Not found" }, { status: 404 });
}

async function handleWishlist(request: Request, env: Env, parts: string[]): Promise<Response> {
  const database = await db(env);
  const wishlist = collection(database, "wishlist");

  if (request.method === "GET" && parts.length === 0) {
    const docs = await wishlist.find().sort({ created_at: -1 }).toArray();
    return json(request, env, serialize(docs));
  }

  if (request.method === "POST" && parts.length === 0) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const payload = wishlistPayload(await readJson<WishlistInput>(request), { created_at: new Date() });
    const result = await wishlist.insertOne(payload);
    const doc = await wishlist.findOne({ _id: result.insertedId });
    return json(request, env, serialize(doc), { status: 201 });
  }

  const id = parts[0] ? objectId(parts[0]) : null;
  if (!id) return json(request, env, { detail: "Item not found" }, { status: 404 });

  if (request.method === "GET" && parts.length === 1) {
    const doc = await wishlist.findOne({ _id: id });
    if (!doc) return json(request, env, { detail: "Item not found" }, { status: 404 });
    return json(request, env, serialize(doc));
  }

  if (request.method === "PUT" && parts.length === 1) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const payload = wishlistPayload(await readJson<WishlistInput>(request), {});
    const result = await wishlist.findOneAndUpdate(
      { _id: id },
      { $set: payload },
      { returnDocument: "after" }
    );
    if (!result) return json(request, env, { detail: "Item not found" }, { status: 404 });
    return json(request, env, serialize(result));
  }

  if (request.method === "DELETE" && parts.length === 1) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const result = await wishlist.deleteOne({ _id: id });
    if (result.deletedCount !== 1) return json(request, env, { detail: "Item not found" }, { status: 404 });
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
