CREATE TABLE routes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
, notes TEXT)

CREATE TABLE maps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT,
  type TEXT,
  text TEXT,
  background TEXT,
  spots INTEGER,
  time REAL,
  mora INTEGER,
  efficiency REAL,
  x REAL,
  y REAL,
  image TEXT,
  video TEXT,
  points TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
, notes TEXT)

CREATE TABLE route_maps (
  route_id TEXT NOT NULL,
  map_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  PRIMARY KEY (route_id, map_id),
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
)
