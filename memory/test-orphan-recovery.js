'use strict';
// memory/test-orphan-recovery.js
// Step 5C smoke test — verifies recoverOrphanedRuns():
//   - Marks executing runs as failed
//   - Sets recoverable=true when at least one stage completed
//   - Sets recoverable=false when no stage completed yet
//   - Emits an orphan-detected phase episode per orphan
//   - Leaves runs in other statuses (complete, awaiting-approval) untouched
//   - Handles multiple orphans in one call

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const BRAIN = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const eagle = require(path.join(BRAIN, 'harness/eagle/eagle-harness.js'));
const logger = require(path.join(BRAIN, 'harness/core/logger.js'));
const { MemoryRouter } = require(path.join(BRAIN, 'memory/router.js'));

const epDbPath = path.join(BRAIN, 'memory', 'db', 'episodes.db');
const evDbPath = path.join(BRAIN, 'memory', 'db', 'events.db');
const eagleJsonl = path.join(BRAIN, 'intelligence', 'harness-runs', 'eagle-harness.jsonl');

const baseTag = `orphan-test-${Date.now()}`;
const featureFor = (suffix) => `${baseTag}-${suffix}`;

const mem = new MemoryRouter();
const results = [];
let firstFailure = null;
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok && !firstFailure) firstFailure = { name, detail };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

const createdRunIds = [];
function createRun(feature, { status, meta }) {
  const run = logger.startRun('eagle-harness', { feature });
  logger.updateRun('eagle-harness', run.run_id, { status, meta });
  createdRunIds.push(run.run_id);
  return run;
}
const isOurs = (r) => createdRunIds.includes(r.run_id);

async function run() {
  // T1 — recoverOrphanedRuns returns no test-tagged runs when there are none
  try {
    const result = eagle.recoverOrphanedRuns();
    const ours = result.filter((r) => createdRunIds.includes(r.run_id));
    assert(ours.length === 0, `expected 0 test-tagged orphans, got ${ours.length}`);
    record('T1 returns no test-tagged orphans before any are created', true);
  } catch (e) { record('T1 returns no test-tagged orphans before any are created', false, e.message); }

  // T2 — executing run with last_completed_stage=2 → recoverable=true
  try {
    const feature = featureFor('T2-recoverable');
    const run = createRun(feature, {
      status: 'executing',
      meta: { last_completed_stage: 2, total_stages: 5 },
    });
    const result = eagle.recoverOrphanedRuns();
    const orphan = result.find((r) => r.run_id === run.run_id);
    assert(orphan, `expected orphan for run_id=${run.run_id}`);
    assert(orphan.recoverable === true, `expected recoverable=true, got ${orphan.recoverable}`);
    assert(orphan.last_completed_stage === 2, `expected last_completed_stage=2, got ${orphan.last_completed_stage}`);
    assert(orphan.total_stages === 5, `expected total_stages=5, got ${orphan.total_stages}`);

    // Re-read the persisted run record
    const reread = logger.getRun('eagle-harness', run.run_id);
    assert(reread.status === 'failed', `expected status=failed, got ${reread.status}`);
    assert(reread.error === 'worker-crashed-mid-stage', `expected error tag, got ${reread.error}`);
    assert(typeof reread.meta.orphaned_at === 'string' && reread.meta.orphaned_at.length > 0,
      'expected orphaned_at timestamp');
    assert(reread.meta.recoverable === true, `expected meta.recoverable=true, got ${reread.meta.recoverable}`);
    assert(reread.meta.awaiting === null, `expected awaiting=null, got ${reread.meta.awaiting}`);

    // Verify orphan-detected episode emitted
    const phases = mem.query({ kind: 'eagle.phase.complete', feature, limit: 50 });
    const orphanPhases = phases.filter((p) => p.payload && p.payload.phase === 'orphan-detected');
    assert(orphanPhases.length >= 1, `expected >=1 orphan-detected episode, got ${orphanPhases.length}`);
    record('T2 executing run → failed + recoverable=true', true);
  } catch (e) { record('T2 executing run → failed + recoverable=true', false, e.message); }

  // T3 — executing run with NO completed stage → recoverable=false
  try {
    const feature = featureFor('T3-no-stage');
    const run = createRun(feature, {
      status: 'executing',
      meta: { total_stages: 5 },  // no last_completed_stage
    });
    const result = eagle.recoverOrphanedRuns();
    const orphan = result.find((r) => r.run_id === run.run_id);
    assert(orphan, 'expected orphan');
    assert(orphan.recoverable === false, `expected recoverable=false, got ${orphan.recoverable}`);
    assert(orphan.last_completed_stage === -1, `expected last_completed_stage=-1, got ${orphan.last_completed_stage}`);

    const reread = logger.getRun('eagle-harness', run.run_id);
    assert(reread.status === 'failed', `expected status=failed, got ${reread.status}`);
    assert(reread.meta.recoverable === false, `expected meta.recoverable=false, got ${reread.meta.recoverable}`);
    record('T3 no completed stages → recoverable=false', true);
  } catch (e) { record('T3 no completed stages → recoverable=false', false, e.message); }

  // T4 — completed run is not touched
  try {
    const feature = featureFor('T4-complete');
    const run = createRun(feature, {
      status: 'complete',
      meta: { total_stages: 5, last_completed_stage: 4 },
    });
    const beforeStatus = logger.getRun('eagle-harness', run.run_id).status;
    eagle.recoverOrphanedRuns();
    const reread = logger.getRun('eagle-harness', run.run_id);
    assert(reread.status === 'complete', `complete run mutated to ${reread.status}`);
    assert(beforeStatus === 'complete', 'sanity check before-state was complete');
    record('T4 complete run not touched', true);
  } catch (e) { record('T4 complete run not touched', false, e.message); }

  // T5 — awaiting-approval run is not touched
  try {
    const feature = featureFor('T5-awaiting');
    const run = createRun(feature, {
      status: 'awaiting-approval',
      meta: { total_stages: 5, last_completed_stage: 1, awaiting: 'stage-3-approval' },
    });
    eagle.recoverOrphanedRuns();
    const reread = logger.getRun('eagle-harness', run.run_id);
    assert(reread.status === 'awaiting-approval',
      `awaiting-approval run mutated to ${reread.status}`);
    assert(reread.meta.awaiting === 'stage-3-approval',
      `meta.awaiting overwritten: got ${reread.meta.awaiting}`);
    record('T5 awaiting-approval run not touched', true);
  } catch (e) { record('T5 awaiting-approval run not touched', false, e.message); }

  // T6 — three orphans in one call
  try {
    const features = ['T6a', 'T6b', 'T6c'].map(featureFor);
    const runs = features.map((feature) => createRun(feature, {
      status: 'executing',
      meta: { last_completed_stage: 1, total_stages: 4 },
    }));
    const result = eagle.recoverOrphanedRuns();
    const oursInResult = result.filter((r) => runs.some((run) => run.run_id === r.run_id));
    assert(oursInResult.length === 3, `expected 3 test-tagged orphans, got ${oursInResult.length}`);
    for (const run of runs) {
      const reread = logger.getRun('eagle-harness', run.run_id);
      assert(reread.status === 'failed', `${run.feature} should be failed, got ${reread.status}`);
      assert(reread.meta.recoverable === true, `${run.feature} should be recoverable`);
    }
    record('T6 multiple orphans recovered in one call', true);
  } catch (e) { record('T6 multiple orphans recovered in one call', false, e.message); }
}

function cleanJsonl() {
  if (!fs.existsSync(eagleJsonl)) return 0;
  const lines = fs.readFileSync(eagleJsonl, 'utf8').split('\n').filter(Boolean);
  const kept = lines.filter((line) => {
    try {
      const r = JSON.parse(line);
      return !createdRunIds.includes(r.run_id);
    } catch { return true; }
  });
  const body = kept.join('\n') + (kept.length ? '\n' : '');
  fs.writeFileSync(eagleJsonl, body, 'utf8');
  return lines.length - kept.length;
}

function cleanup() {
  try { mem.close(); } catch { /* */ }
  try {
    const epDb = new Database(epDbPath);
    const evDb = new Database(evDbPath);

    const epDel = epDb.prepare(
      "DELETE FROM episodes WHERE feature LIKE ? || '%'"
    ).run(baseTag);
    const elDel = evDb.prepare(
      "DELETE FROM event_log WHERE topic LIKE 'eagle.%' AND payload LIKE '%' || ? || '%'"
    ).run(baseTag);
    const cuDel = evDb.prepare(
      "DELETE FROM cursors WHERE topic LIKE 'eagle.%'"
    ).run();

    epDb.close();
    evDb.close();

    const jsonlRemoved = cleanJsonl();
    console.log(
      `[cleanup] jsonl_removed=${jsonlRemoved} episodes=${epDel.changes} ` +
      `event_log=${elDel.changes} cursors=${cuDel.changes}`
    );
  } catch (e) {
    console.error('[cleanup] failed:', e.message);
  }
}

run()
  .catch((e) => { console.error('test crashed:', e); })
  .finally(() => {
    cleanup();
    console.log('\n=== ORPHAN RECOVERY SMOKE ===');
    for (const r of results) {
      console.log(`${r.name.padEnd(56)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
    }
    const allPass = results.length > 0 && results.every((r) => r.ok);
    if (allPass) {
      console.log('\nALL ORPHAN RECOVERY TESTS PASSED');
      process.exit(0);
    } else if (results.length === 0) {
      console.log('\nFAILED — no tests executed');
      process.exit(1);
    } else {
      console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
      process.exit(1);
    }
  });
