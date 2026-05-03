#!/usr/bin/env node
// dropbox-sync.js
// Polls a Dropbox folder for new/modified files and appends them to
// ~/deassists-workspace/369-brain/intelligence/dropbox-sync.jsonl.
//
// No npm dependencies. Requires Node 18+ for global fetch.
// Talks to the Dropbox v2 HTTP API directly:
//   POST /2/files/list_folder            (first call)
//   POST /2/files/list_folder/continue   (subsequent polls, by cursor)
//
// Env:
//   DROPBOX_TOKEN     required. App access token.
//   DROPBOX_FOLDER    optional. Default: /DeAssists/Documents
//   DROPBOX_POLL_MS   optional. Default: 60000

'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const TOKEN = process.env.DROPBOX_TOKEN;
const FOLDER_RAW = process.env.DROPBOX_FOLDER || '/CORTEX-369';
const POLL_MS = Number(process.env.DROPBOX_POLL_MS) || 60_000;

const ROOT = path.resolve(__dirname, '..');
const LOG_PATH = path.join(ROOT, 'intelligence', 'dropbox-sync.jsonl');
const CURSOR_PATH = path.join(ROOT, 'integrations', '.dropbox-cursor');

// Dropbox treats the root as empty string, not "/"
const FOLDER = FOLDER_RAW === '/' ? '' : FOLDER_RAW.replace(/\/+$/, '');

if (!TOKEN) {
  console.error('[dropbox-sync] DROPBOX_TOKEN is not set.');
  console.error('[dropbox-sync] See integrations/DROPBOX-SETUP.md.');
  process.exit(1);
}

async function dbx(endpoint, body) {
  const res = await fetch('https://api.dropboxapi.com/2/' + endpoint, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Dropbox ${endpoint} ${res.status}: ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : {};
}

async function readCursor() {
  try {
    const c = (await fs.readFile(CURSOR_PATH, 'utf8')).trim();
    return c || null;
  } catch {
    return null;
  }
}

async function writeCursor(cursor) {
  await fs.mkdir(path.dirname(CURSOR_PATH), { recursive: true });
  await fs.writeFile(CURSOR_PATH, cursor, 'utf8');
}

async function clearCursor() {
  try { await fs.unlink(CURSOR_PATH); } catch {}
}

async function appendLog(record) {
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
  await fs.appendFile(LOG_PATH, JSON.stringify(record) + '\n', 'utf8');
}

async function fetchChanges() {
  const cursor = await readCursor();
  if (cursor) {
    return dbx('files/list_folder/continue', { cursor });
  }
  return dbx('files/list_folder', {
    path: FOLDER,
    recursive: false,
    include_deleted: false,
    include_media_info: false,
    include_has_explicit_shared_members: false,
  });
}

async function tick() {
  let result;
  try {
    result = await fetchChanges();
  } catch (err) {
    console.error('[dropbox-sync]', new Date().toISOString(), 'fetch failed:', err.message);
    // Cursor expired or path changed — start over next tick
    if (/reset/i.test(err.message) || /cursor/i.test(err.message) || /not_found/i.test(err.message)) {
      await clearCursor();
    }
    return;
  }

  for (const entry of result.entries || []) {
    if (entry['.tag'] !== 'file') continue;
    const ts = new Date().toISOString();
    const record = {
      synced_at: ts,
      name: entry.name,
      path: entry.path_display,
      size: entry.size,
      modified: entry.server_modified,
      content_hash: entry.content_hash,
    };
    try {
      await appendLog(record);
      console.log(`Synced: ${entry.name} at ${ts}`);
    } catch (err) {
      console.error('[dropbox-sync] log write failed:', err.message);
    }
  }

  if (result.cursor) {
    try { await writeCursor(result.cursor); }
    catch (err) { console.error('[dropbox-sync] cursor save failed:', err.message); }
  }

  // Drain pagination in the same tick — Dropbox can return has_more=true
  if (result.has_more) {
    return tick();
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`[dropbox-sync] watching ${FOLDER || '/'} every ${Math.round(POLL_MS / 1000)}s`);
  console.log(`[dropbox-sync] log: ${LOG_PATH}`);
  while (true) {
    await tick();
    await sleep(POLL_MS);
  }
}

main().catch(err => {
  console.error('[dropbox-sync] fatal:', err);
  process.exit(1);
});
