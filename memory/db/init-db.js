#!/usr/bin/env node
// memory/db/init-db.js
// Initializes the three SQLite databases for Item 2 (Step 2A):
//   episodes.db  — append-only agent history
//   events.db    — pub/sub event log + per-subscriber cursors
//   working.db   — overwriteable per-agent current state
//
// Schema lives in ./schema.sql and is split by `-- BEGIN <section>` /
// `-- END <section>` markers so each db only gets its own tables.
// Each db is opened with WAL journaling so writers don't block readers.

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_DIR = __dirname;
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

function extractSection(schemaText, name) {
  const startTag = `-- BEGIN ${name}`;
  const endTag = `-- END ${name}`;
  const start = schemaText.indexOf(startTag);
  const end = schemaText.indexOf(endTag);
  if (start < 0 || end < 0 || end < start) {
    throw new Error(`schema.sql missing markers for section "${name}"`);
  }
  return schemaText.slice(start + startTag.length, end).trim();
}

function applySection(dbPath, sectionSql, label) {
  const db = new Database(dbPath);
  try {
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(sectionSql);
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      )
      .all()
      .map((r) => r.name);
    const indexes = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      )
      .all()
      .map((r) => r.name);
    console.log(`[init-db] ${label} → ${path.basename(dbPath)}`);
    console.log(`[init-db]   tables : ${tables.join(', ') || '(none)'}`);
    console.log(`[init-db]   indexes: ${indexes.join(', ') || '(none)'}`);
  } finally {
    db.close();
  }
}

try {
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`schema.sql not found at ${SCHEMA_PATH}`);
  }
  const schemaText = fs.readFileSync(SCHEMA_PATH, 'utf8');

  const sections = [
    { name: 'episodes', file: 'episodes.db' },
    { name: 'events',   file: 'events.db'   },
    { name: 'working',  file: 'working.db'  },
  ];

  for (const { name, file } of sections) {
    const sectionSql = extractSection(schemaText, name);
    if (!sectionSql) throw new Error(`section "${name}" is empty`);
    applySection(path.join(DB_DIR, file), sectionSql, name);
  }

  console.log('[init-db] OK — all three databases initialized');
  process.exit(0);
} catch (e) {
  console.error('[init-db] FAILED:', e && e.stack ? e.stack : e);
  process.exit(1);
}
