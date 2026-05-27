CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  organizer TEXT NOT NULL,
  pubs_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS events_date_idx ON events(date DESC);

CREATE TABLE IF NOT EXISTS wishlist (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  mapy_lon REAL,
  mapy_lat REAL,
  mapy_label TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS wishlist_created_at_idx ON wishlist(created_at DESC);
