const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000];

let _token = null;

export function setToken(token) {
  _token = token;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(method, path, body) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await wait(RETRY_DELAYS_MS[attempt - 1]);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
      }
      if (res.status === 204) return null;
      return res.json();
    } catch (e) {
      lastError = e;
      const isRetryable =
        e.name === "AbortError" ||
        e.name === "TypeError" ||
        (e.message && /^(5\d\d|Failed to fetch)/.test(e.message));
      if (!isRetryable || attempt === MAX_RETRIES) throw e;
    }
  }
  throw lastError;
}

export const api = {
  setToken,

  listEvents: () => request("GET", "/api/v1/events"),
  getEvent: (id) => request("GET", `/api/v1/events/${id}`),
  createEvent: (data) => request("POST", "/api/v1/events", data),
  updateEvent: (id, data) => request("PUT", `/api/v1/events/${id}`, data),
  deleteEvent: (id) => request("DELETE", `/api/v1/events/${id}`),

  listWishlist: () => request("GET", "/api/v1/wishlist"),
  createWishlistItem: (data) => request("POST", "/api/v1/wishlist", data),
  updateWishlistItem: (id, data) => request("PUT", `/api/v1/wishlist/${id}`, data),
  deleteWishlistItem: (id) => request("DELETE", `/api/v1/wishlist/${id}`),

  listMembers: () => request("GET", "/api/v1/members"),
};
