'use strict';
// memory/test-resume-wiring.js
// Step 5A smoke test — verifies:
//   - last_completed_stage gets persisted in run.meta when a stage completes
//   - resumeRun rejects in 4 invalid states (no run, bad status, no plan, all done)
//   - resumeRun on a valid resumable run flips status, advances meta, fires the
//     resume phase episode, and invokes runMode3Stage at the next stage index
//
// runMode3Stage is monkey-patched (resumeRun calls it via module.exports.*)
// so we never actually spin up headless Claude or touch the portal repo.

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

const baseTag = `resume-test-${Date.now()}`;
const featureFor = (suffix) => `${baseTag}-${suffix}`;

const mem = new MemoryRouter();
const results = [];
let firstFailure = null;

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok && !firstFailure) firstFailure = { name, detail };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

// Monkey-patch runMode3Stage so resumeRun's terminal call is a no-op stub.
const realRunMode3Stage = eagle.runMode3Stage;
const capturedCalls = [];
eagle.runMode3Stage = async (runId, startIdx) => {
  capturedCalls.push({ runId, startIdx });
  return { stub: true, runId, startIdx };
};

// Helper: create a run record with the requested status + meta in one go.
function createRun(feature, { status, meta }) {
  const run = logger.startRun('eagle-harness', { feature });
  logger.updateRun('eagle-harness', run.run_id, { status, meta });
  return run;
}

async function run() {
  // T1 — resumeRun rejects when no prior run exists
  try {
    let threw = false;
    try {
      await eagle.resumeRun(featureFor('T1-no-prior'));
    } catch { threw = true; }
    assert(threw, 'expected resumeRun to throw on missing feature');
    record('T1 rejects when no prior run', true);
  } catch (e) { record('T1 rejects when no prior run', false, e.message); }

  // T2 — rejects when status is not resumable (status=complete)
  try {
    const feature = featureFor('T2-not-resumable');
    createRun(feature, { status: 'complete', meta: { total_stages: 5, last_completed_stage: 4 } });
    let threw = false;
    let errMsg = '';
    try {
      await eagle.resumeRun(feature);
    } catch (e) { threw = true; errMsg = e.message; }
    assert(threw, 'expected resumeRun to throw on status=complete');
    assert(/status=complete/.test(errMsg), `expected status=complete in error, got: ${errMsg}`);
    record('T2 rejects when status not resumable', true);
  } catch (e) { record('T2 rejects when status not resumable', false, e.message); }

  // T3 — rejects when no stage plan (no total_stages)
  try {
    const feature = featureFor('T3-no-plan');
    createRun(feature, { status: 'failed', meta: {} });
    let threw = false;
    let errMsg = '';
    try {
      await eagle.resumeRun(feature);
    } catch (e) { threw = true; errMsg = e.message; }
    assert(threw, 'expected resumeRun to throw without stage plan');
    assert(/no stage plan/.test(errMsg), `expected "no stage plan" in error, got: ${errMsg}`);
    record('T3 rejects when no stage plan', true);
  } catch (e) { record('T3 rejects when no stage plan', false, e.message); }

  // T4 — rejects when all stages done
  try {
    const feature = featureFor('T4-all-done');
    createRun(feature, { status: 'failed', meta: { total_stages: 5, last_completed_stage: 4 } });
    let threw = false;
    let errMsg = '';
    try {
      await eagle.resumeRun(feature);
    } catch (e) { threw = true; errMsg = e.message; }
    assert(threw, 'expected resumeRun to throw when all stages done');
    assert(/all stages already complete/.test(errMsg), `expected "all stages already complete", got: ${errMsg}`);
    record('T4 rejects when all stages done', true);
  } catch (e) { record('T4 rejects when all stages done', false, e.message); }

  // T5 — succeeds + advances state correctly
  try {
    const feature = featureFor('T5-resume');
    const run = createRun(feature, {
      status: 'failed',
      meta: { total_stages: 5, last_completed_stage: 2 },
    });
    const callsBefore = capturedCalls.length;

    const result = await eagle.resumeRun(feature);

    // run record advanced
    const reread = logger.getRun('eagle-harness', run.run_id);
    assert(reread.status === 'executing', `expected status=executing, got ${reread.status}`);
    assert(reread.meta.resumed_from_stage === 2,
      `expected resumed_from_stage=2, got ${reread.meta.resumed_from_stage}`);
    assert(typeof reread.meta.resumed_at === 'string' && reread.meta.resumed_at.length > 0,
      `expected resumed_at timestamp, got ${reread.meta.resumed_at}`);
    assert(reread.meta.awaiting === null, `expected awaiting=null, got ${reread.meta.awaiting}`);

    // stub runMode3Stage was called with next stage index
    const newCalls = capturedCalls.slice(callsBefore);
    assert(newCalls.length === 1, `expected 1 stub call, got ${newCalls.length}`);
    assert(newCalls[0].startIdx === 3, `expected startIdx=3, got ${newCalls[0].startIdx}`);
    assert(newCalls[0].runId === run.run_id, `runId mismatch`);

    // resume phase episode landed
    const phases = mem.query({ kind: 'eagle.phase.complete', feature, limit: 50 });
    const resumePhases = phases.filter((p) => p.payload && p.payload.phase === 'resume');
    assert(resumePhases.length >= 1, `expected >=1 resume phase episode, got ${resumePhases.length}`);
    assert(resumePhases[0].payload.detail.includes('Resumed at stage 3'),
      `expected "Resumed at stage 3" in detail, got: ${resumePhases[0].payload.detail}`);
    record('T5 resumeRun succeeds + advances state', true);
  } catch (e) { record('T5 resumeRun succeeds + advances state', false, e.message); }

  // T6 — last_completed_stage persists when written via updateRun
  try {
    const feature = featureFor('T6-persist');
    const run = createRun(feature, { status: 'awaiting-approval', meta: {} });
    logger.updateRun('eagle-harness', run.run_id, {
      meta: {
        current_stage_index: 1,
        total_stages: 3,
        last_completed_stage: 1,
        last_completed_stage_name: 's2-something',
        last_completed_at: new Date().toISOString(),
      },
    });
    const reread = logger.getRun('eagle-harness', run.run_id);
    assert(reread.meta.last_completed_stage === 1, `expected 1, got ${reread.meta.last_completed_stage}`);
    assert(reread.meta.last_completed_stage_name === 's2-something',
      `expected s2-something, got ${reread.meta.last_completed_stage_name}`);
    assert(typeof reread.meta.last_completed_at === 'string' && reread.meta.last_completed_at.length > 0,
      'expected last_completed_at timestamp');
    record('T6 last_completed_stage persists', true);
  } catch (e) { record('T6 last_completed_stage persists', false, e.message); }
}

function cleanJsonl() {
  if (!fs.existsSync(eagleJsonl)) return 0;
  const lines = fs.readFileSync(eagleJsonl, 'utf8').split('\n').filter(Boolean);
  const kept = lines.filter((line) => {
    try {
      const r = JSON.parse(line);
      return !(r.feature || '').startsWith(baseTag);
    } catch { return true; }
  });
  const body = kept.join('\n') + (kept.length ? '\n' : '');
  fs.writeFileSync(eagleJsonl, body, 'utf8');
  return lines.length - kept.length;
}

function cleanup() {
  // Restore the real runMode3Stage so the module is left clean.
  eagle.runMode3Stage = realRunMode3Stage;

  try { mem.close(); } catch { /* */ }

  try {
    const epDb = new Database(epDbPath);
    const evDb = new Database(evDbPath);

    // All test features start with baseTag — match by LIKE prefix.
    const epDel = epDb.prepare(
      "DELETE FROM episodes WHERE feature LIKE ? || '%'"
    ).run(baseTag);

    // Bus events from logger dispatcher carry feature in payload — match by substring.
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
    console.log('\n=== RESUME WIRING SMOKE ===');
    for (const r of results) {
      console.log(`${r.name.padEnd(48)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
    }
    const allPass = results.length > 0 && results.every((r) => r.ok);
    if (allPass) {
      console.log('\nALL RESUME WIRING TESTS PASSED');
      process.exit(0);
    } else if (results.length === 0) {
      console.log('\nFAILED — no tests executed');
      process.exit(1);
    } else {
      console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
      process.exit(1);
    }
  });
