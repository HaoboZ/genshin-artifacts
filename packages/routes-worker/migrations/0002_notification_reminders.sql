CREATE TABLE IF NOT EXISTS notification_reminders (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  notification_id TEXT NOT NULL,
  scheduled_at INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
