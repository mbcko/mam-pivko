CREATE TABLE IF NOT EXISTS sessions (
  id_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  picture TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_email_idx ON sessions(email);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
