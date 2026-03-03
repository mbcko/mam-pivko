const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

let _token = null;

export function setToken(token) {
  _token = token;
}

async function request(method, path, body) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (_token) headers["Authorization"] = `Bearer ${_token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
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
