const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
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
  listEvents: () => request("GET", "/api/v1/events"),
  getEvent: (id) => request("GET", `/api/v1/events/${id}`),
  createEvent: (data) => request("POST", "/api/v1/events", data),
  updateEvent: (id, data) => request("PUT", `/api/v1/events/${id}`, data),
  deleteEvent: (id) => request("DELETE", `/api/v1/events/${id}`),

  listWishlist: () => request("GET", "/api/v1/wishlist"),
  createWishlistItem: (data) => request("POST", "/api/v1/wishlist", data),
  updateWishlistItem: (id, data) => request("PUT", `/api/v1/wishlist/${id}`, data),
  deleteWishlistItem: (id) => request("DELETE", `/api/v1/wishlist/${id}`),
};
