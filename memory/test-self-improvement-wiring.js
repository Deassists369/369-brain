'use strict';
// memory/test-self-improvement-wiring.js
// Step 4C smoke test — verifies:
//   - logger dual-writes for harnessName='self-improvement-harness' work
//     (kind prefix becomes "self-improvement.*", agent='self-improvement')
//   - inputs.readEpisodesSince returns events past a watermark and filters
//     out self-improvement's OWN events (no recursive learning)
//   - Watermark advance + subsequent read returns only newer events
//   - getWorking/setWorking watermark roundtrip
//
// We do NOT run the real Self-Improvement harness — too heavy and would
// produce production output (LEARNING-MIND.md, proposed-fixes/*).

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const BRAIN = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const logger = require(path.join(BRAIN, 'harness', 'core', 'logger.js'));
const inputs = require(path.join(BRAIN, 'harness', 'self-improvement', 'inputs.js'));
const { MemoryRouter } = require(path.join(BRAIN, 'memory', 'router.js'));

const epDbPath = path.join(BRAIN, 'memory', 'db', 'episodes.db');
const evDbPath = path.join(BRAIN, 'memory', 'db', 'events.db');
const wkDbPath = path.join(BRAIN, 'memory', 'db', 'working.db');
const siJsonl = path.join(BRAIN, 'intelligence', 'harness-runs', 'self-improvement-harness.jsonl');

const testTag = `si-wire-test-${Date.now()}`;
const fakeEagleRunIds = [];
const results = [];
let firstFailure = null;

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok && !firstFailure) firstFailure = { name, detail };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

const mem = new MemoryRouter();
let siRunId = null;

// T1 — logger.startRun for self-improvement-harness writes self-improvement.run.started
try {
  const run = logger.startRun('self-improvement-harness', { feature: testTag });
  siRunId = run.run_id;
  const rows = mem.query({ agent: 'self-improvement', kind: 'self-improvement.run.started', limit: 50 });
  const match = rows.find((r) => r.run_id === siRunId);
  assert(match, `expected episode for runId=${siRunId}`);
  assert(match.agent === 'self-improvement', `expected agent=self-improvement, got ${match.agent}`);
  assert(match.kind === 'self-improvement.run.started', `expected kind=self-improvement.run.started, got ${match.kind}`);
  record('T1 logger writes self-improvement.run.started', true);
} catch (e) { record('T1 logger writes self-improvement.run.started', false, e.message); }

// T2 — logPhase writes self-improvement.phase.<status>
try {
  logger.logPhase('self-improvement-harness', siRunId, { phase: 'read-sops', status: 'complete', detail: 'smoke ok' });
  const rows = mem.query({ agent: 'self-improvement', kind: 'self-improvement.phase.complete', limit: 50 });
  const match = rows.find((r) => r.run_id === siRunId);
  assert(match, `expected phase episode for runId=${siRunId}`);
  record('T2 logPhase writes self-improvement.phase.complete', true);
} catch (e) { record('T2 logPhase writes self-improvement.phase.complete', false, e.message); }

// T3 — updateRun writes self-improvement.run.<newStatus>
try {
  logger.updateRun('self-improvement-harness', siRunId, { status: 'complete' });
  const rows = mem.query({ agent: 'self-improvement', kind: 'self-improvement.run.complete', limit: 50 });
  const match = rows.find((r) => r.run_id === siRunId);
  assert(match, `expected complete episode for runId=${siRunId}`);
  record('T3 updateRun writes self-improvement.run.complete', true);
} catch (e) { record('T3 updateRun writes self-improvement.run.complete', false, e.message); }

// Pre-populate 5 fake eagle events tagged with testTag
for (let i = 0; i < 5; i++) {
  const fakeId = `fake-eagle-${testTag}-${i}`;
  fakeEagleRunIds.push(fakeId);
  mem.emit({
    kind: 'eagle.run.started',
    agent: 'eagle',
    feature: testTag,
    run_id: fakeId,
    status: 'running',
    summary: 'fake for SI smoke',
  });
}

// T4 — readEpisodesSince(0) returns the 5 fake eagle events for testTag
let fromZero = [];
try {
  fromZero = inputs.readEpisodesSince(mem, 0);
  const eagleOnly = fromZero.filter((ep) => ep.agent === 'eagle' && ep.feature === testTag);
  assert(eagleOnly.length === 5, `expected 5 eagle events under testTag, got ${eagleOnly.length}`);
  record('T4 readEpisodesSince returns eagle events', true);
} catch (e) { record('T4 readEpisodesSince returns eagle events', false, e.message); }

// T5 — readEpisodesSince filters out self-improvement events
try {
  const ownEvents = fromZero.filter((ep) => ep.agent === 'self-improvement');
  assert(ownEvents.length === 0,
    `expected 0 self-improvement events in result, got ${ownEvents.length} (own events leak into the read)`);
  record('T5 readEpisodesSince excludes self-improvement events', true);
} catch (e) { record('T5 readEpisodesSince excludes self-improvement events', false, e.message); }

// T6 — Watermark advance + subsequent read returns only the newer events
let cursorAfterFirst = 0;
try {
  cursorAfterFirst = fromZero
    .filter((ep) => ep.feature === testTag)
    .reduce((m, ep) => Math.max(m, ep.seq), 0);
  assert(cursorAfterFirst > 0, 'expected cursorAfterFirst > 0');
  mem.setWorking('self-improvement', 'last_episode_seq', cursorAfterFirst);

  // Two more eagle events emitted after the watermark
  for (const lateId of [`fake-eagle-${testTag}-late-1`, `fake-eagle-${testTag}-late-2`]) {
    fakeEagleRunIds.push(lateId);
    mem.emit({
      kind: 'eagle.run.complete',
      agent: 'eagle',
      feature: testTag,
      run_id: lateId,
      status: 'complete',
    });
  }

  const afterCursor = inputs.readEpisodesSince(mem, cursorAfterFirst);
  const afterFiltered = afterCursor.filter((ep) => ep.feature === testTag);
  assert(afterFiltered.length === 2,
    `expected 2 new events past cursor=${cursorAfterFirst}, got ${afterFiltered.length}`);
  record('T6 watermark advance returns only newer events', true);
} catch (e) { record('T6 watermark advance returns only newer events', false, e.message); }

// T7 — getWorking watermark roundtrip
try {
  const got = mem.getWorking('self-improvement', 'last_episode_seq');
  assert(got === cursorAfterFirst, `expected ${cursorAfterFirst}, got ${got}`);
  record('T7 getWorking watermark roundtrip', true);
} catch (e) { record('T7 getWorking watermark roundtrip', false, e.message); }

// --- Cleanup: episodes, working_memory, event_log, cursors, JSONL ---
try {
  // 1) JSONL row removal — the logger.startRun in T1 wrote a real row to
  //    self-improvement-harness.jsonl. Filter and rewrite.
  if (fs.existsSync(siJsonl)) {
    const lines = fs.readFileSync(siJsonl, 'utf8').split('\n').filter(Boolean);
    const kept = lines.filter((line) => {
      try {
        const r = JSON.parse(line);
        return r.feature !== testTag;
      } catch { return true; }
    });
    const body = kept.join('\n') + (kept.length ? '\n' : '');
    fs.writeFileSync(siJsonl, body, 'utf8');
    var jsonlRemoved = lines.length - kept.length;
  }

  const epDb = new Database(epDbPath);
  const evDb = new Database(evDbPath);
  const wkDb = new Database(wkDbPath);

  const epDelByFeature = epDb.prepare('DELETE FROM episodes WHERE feature = ?').run(testTag);
  const epDelByRunId = epDb.prepare(
    "DELETE FROM episodes WHERE run_id LIKE ?"
  ).run(`fake-eagle-${testTag}-%`);
  const wkDel = wkDb.prepare(
    "DELETE FROM working_memory WHERE agent = 'self-improvement' AND key = 'last_episode_seq'"
  ).run();
  const elDel = evDb.prepare(
    "DELETE FROM event_log WHERE topic LIKE 'self-improvement.%' AND payload LIKE '%' || ? || '%'"
  ).run(testTag);
  const cuDel = evDb.prepare(
    "DELETE FROM cursors WHERE topic LIKE 'self-improvement.%'"
  ).run();

  epDb.close();
  evDb.close();
  wkDb.close();

  console.log(
    `[cleanup] jsonl_lines_removed=${typeof jsonlRemoved === 'number' ? jsonlRemoved : 0} ` +
    `episodes_by_feature=${epDelByFeature.changes} episodes_by_runid=${epDelByRunId.changes} ` +
    `working_memory=${wkDel.changes} event_log=${elDel.changes} cursors=${cuDel.changes}`
  );
} catch (e) {
  console.error('[cleanup] failed:', e.message);
}

console.log('\n=== SELF-IMPROVEMENT WIRING SMOKE ===');
for (const r of results) {
  console.log(`${r.name.padEnd(56)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
}
const allPass = results.length > 0 && results.every((r) => r.ok);
if (allPass) {
  console.log('\nALL SELF-IMPROVEMENT WIRING TESTS PASSED');
  process.exit(0);
} else {
  console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
  process.exit(1);
}
