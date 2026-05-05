-- ============================================================
-- 369 BRAIN — multi-database schema
-- Splits by markers so init-db.js can apply each section to its
-- own .db file (independent locks, independent WAL).
-- ============================================================

-- BEGIN episodes
-- episodes.db — append-only history of what each agent did
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,            -- unix timestamp ms
  kind TEXT NOT NULL,             -- e.g. 'eagle.build.complete'
  agent TEXT NOT NULL,            -- e.g. 'eagle' | 'guardian'
  run_id TEXT,
  feature TEXT,
  status TEXT,
  summary TEXT,
  payload TEXT                    -- JSON blob
);
CREATE INDEX IF NOT EXISTS idx_episodes_ts ON episodes(ts);
CREATE INDEX IF NOT EXISTS idx_episodes_agent ON episodes(agent);
CREATE INDEX IF NOT EXISTS idx_episodes_kind ON episodes(kind);
CREATE INDEX IF NOT EXISTS idx_episodes_feature ON episodes(feature);
-- END episodes

-- BEGIN events
-- events.db — agent-to-agent message log + per-subscriber cursors
CREATE TABLE IF NOT EXISTS event_log (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  topic TEXT NOT NULL,            -- e.g. 'approval.granted'
  publisher TEXT NOT NULL,
  payload TEXT,                   -- JSON blob
  consumed_by TEXT                -- comma-separated subscriber list
);
CREATE INDEX IF NOT EXISTS idx_events_ts ON event_log(ts);
CREATE INDEX IF NOT EXISTS idx_events_topic ON event_log(topic);

CREATE TABLE IF NOT EXISTS cursors (
  subscriber TEXT NOT NULL,
  topic TEXT NOT NULL,
  last_event_id TEXT,
  last_ts INTEGER,
  PRIMARY KEY (subscriber, topic)
);
-- END events

-- BEGIN working
-- working.db — current state per agent (overwriteable)
CREATE TABLE IF NOT EXISTS working_memory (
  agent TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,                     -- JSON blob
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (agent, key)
);
-- END working
