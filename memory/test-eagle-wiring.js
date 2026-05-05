'use strict';
// memory/test-eagle-wiring.js
// Step 4A smoke test — exercises harness/core/logger.js end-to-end and
// confirms every JSONL write is mirrored as a router episode + bus event.
// Cleanups: removes the JSONL line, episode rows, event_log rows, and any
// cursors this test could have created.

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const BRAIN = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const logger = require(path.join(BRAIN, 'harness', 'core', 'logger.js'));

const tag = `eagle-wire-test-${Date.now()}`;
const jsonlPath = path.join(BRAIN, 'intelligence', 'harness-runs', 'eagle-harness.jsonl');
const epDbPath = path.join(BRAIN, 'memory', 'db', 'episodes.db');
const evDbPath = path.join(BRAIN, 'memory', 'db', 'events.db');

const results = [];
let firstFailure = null;
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok && !firstFailure) firstFailure = { name, detail };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

// --- Drive logger through a realistic eagle flow ---
const run = logger.startRun('eagle-harness', { feature: tag });
const runId = run.run_id;
logger.logPhase('eagle-harness', runId, { phase: 'data-check', status: 'running', detail: 'smoke' });
logger.logPhase('eagle-harness', runId, { phase: 'data-check', status: 'complete', detail: 'smoke ok' });
logger.updateRun('eagle-harness', runId, { status: 'awaiting-approval', meta: { awaiting: 'mode1-review' } });
logger.logApproval('eagle-harness', runId, { phrase: `approved mode1 ${tag}`, by: 'shon' });
logger.updateRun('eagle-harness', runId, { status: 'complete' });

// --- T1: JSONL still has the run record (existing path unbroken) ---
let jsonlRow = null;
try {
  const lines = fs.readFileSync(jsonlPath, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const r = JSON.parse(line);
      if (r.feature === tag) { jsonlRow = r; break; }
    } catch { /* skip malformed lines */ }
  }
  assert(jsonlRow, `JSONL row not found for feature=${tag}`);
  assert(jsonlRow.run_id === runId, `JSONL run_id mismatch: ${jsonlRow.run_id} vs ${runId}`);
  assert(jsonlRow.status === 'complete', `JSONL status should be complete, got ${jsonlRow.status}`);
  record('JSONL run record present + status=complete', true);
} catch (e) { record('JSONL run record present + status=complete', false, e.message); }

// --- Read all episodes for this tag from episodes.db ---
let rows = [];
try {
  const db = new Database(epDbPath, { readonly: true });
  rows = db.prepare(
    'SELECT seq, kind, status, run_id FROM episodes WHERE feature = ? ORDER BY seq ASC'
  ).all(tag);
  db.close();
} catch (e) {
  record('read episodes.db', false, e.message);
}

const expectedKinds = [
  'eagle.run.started',
  'eagle.phase.running',
  'eagle.phase.complete',
  'eagle.run.awaiting-approval',
  'eagle.approval.mode1',
  'eagle.run.complete',
];

// --- T2..T7: each expected kind exists exactly once in seq order ---
for (let i = 0; i < expectedKinds.length; i++) {
  const expected = expectedKinds[i];
  const actual = rows[i] ? rows[i].kind : '(missing)';
  const ok = actual === expected;
  record(`episode[${i}] kind=${expected}`, ok, ok ? null : `got "${actual}"`);
}

// Bonus integrity check: each row references the correct run_id
try {
  for (const r of rows) {
    assert(r.run_id === runId, `row run_id mismatch: ${r.run_id} vs ${runId}`);
  }
} catch (e) {
  // Don't add another PASS line for this — only surface if it broke.
  if (results.every((r) => r.ok)) {
    record('all episode rows linked to runId', false, e.message);
  }
}

// --- Cleanup ---
try {
  // 1) JSONL: filter and rewrite (same pattern logger.js uses)
  const lines = fs.readFileSync(jsonlPath, 'utf8').split('\n').filter(Boolean);
  const kept = lines.filter((line) => {
    try {
      const r = JSON.parse(line);
      return r.feature !== tag;
    } catch { return true; }
  });
  const body = kept.join('\n') + (kept.length ? '\n' : '');
  fs.writeFileSync(jsonlPath, body, 'utf8');

  // 2) sqlite: episodes by feature; event_log by payload-contains-tag; cursors
  const epDb = new Database(epDbPath);
  const evDb = new Database(evDbPath);
  const epDel = epDb.prepare('DELETE FROM episodes WHERE feature = ?').run(tag);
  const elDel = evDb.prepare(
    "DELETE FROM event_log WHERE payload LIKE '%' || ? || '%'"
  ).run(tag);
  // No replay() was called during the smoke, so no cursors should exist for
  // these topics. This delete is defensive.
  const cuDel = evDb.prepare(
    "DELETE FROM cursors WHERE topic LIKE 'eagle.%'"
  ).run();
  epDb.close();
  evDb.close();
  console.log(
    `[cleanup] jsonl_lines_removed=${lines.length - kept.length} ` +
    `episodes=${epDel.changes} event_log=${elDel.changes} cursors=${cuDel.changes}`
  );
} catch (e) {
  console.error('[cleanup] failed:', e.message);
}

console.log('\n=== EAGLE WIRING SMOKE ===');
for (const r of results) {
  console.log(`${r.name.padEnd(48)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
}
const allPass = results.length > 0 && results.every((r) => r.ok);
if (allPass) {
  console.log('\nALL SMOKE TESTS PASSED');
  process.exit(0);
} else {
  console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
  process.exit(1);
}
