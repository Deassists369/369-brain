'use strict';
// memory/test-crash-resume-integration.js
// Step 5D — full crash-resume chain end-to-end:
//   1. EAGLE run gets to stage 1 of 5, then "crashes" (left as executing)
//   2. Worker boots → recoverOrphanedRuns marks it failed + recoverable
//   3. Operator writes "resume <feature>" signal
//   4. Bridge dispatches to eagle.resumeRun
//   5. resumeRun re-flips status to executing and invokes runMode3Stage
//      at the next stage index (lastStage + 1)
//
// We never spin up real headless Claude — eagle.runMode3Stage is stubbed.
// The bridge's processSignalFile is invoked directly via the test-mode
// export from harness-worker.js (deterministic vs. waiting on fs.watch).

process.env.HARNESS_WORKER_TEST_MODE = '1';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const BRAIN = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const eagle = require(path.join(BRAIN, 'harness/eagle/eagle-harness.js'));
const worker = require(path.join(BRAIN, 'harness-worker.js'));
const logger = require(path.join(BRAIN, 'harness/core/logger.js'));
const { MemoryRouter } = require(path.join(BRAIN, 'memory/router.js'));

const epDbPath = path.join(BRAIN, 'memory', 'db', 'episodes.db');
const evDbPath = path.join(BRAIN, 'memory', 'db', 'events.db');
const eagleJsonl = path.join(BRAIN, 'intelligence', 'harness-runs', 'eagle-harness.jsonl');

const tag = `crash-test-${Date.now()}`;
const featureName = `${tag}-feature`;

const mem = new MemoryRouter();
const results = [];
let firstFailure = null;
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok && !firstFailure) firstFailure = { name, detail };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

// Stub runMode3Stage — captures invocations, returns a stub result so
// resumeRun's `await module.exports.runMode3Stage(...)` resolves cleanly.
const capturedStageCalls = [];
const realRunMode3Stage = eagle.runMode3Stage;
eagle.runMode3Stage = async (runId, startStageIndex) => {
  capturedStageCalls.push({ runId, startStageIndex });
  return { stub: true, runId, startStageIndex };
};

// Track the auto-generated run_id we get back from logger.startRun.
let runId = null;
let signalName = null;
let signalPath = null;

async function run() {
  // STAGE A — pre-crash: stages 0 and 1 completed, run still executing
  const startedRun = logger.startRun('eagle-harness', { feature: featureName });
  runId = startedRun.run_id;

  logger.updateRun('eagle-harness', runId, {
    status: 'executing',
    meta: {
      current_stage_index: 0,
      total_stages: 5,
      last_completed_stage: 0,
      last_completed_stage_name: 'edit-permission-helper',
      last_completed_at: new Date().toISOString(),
    },
  });

  logger.updateRun('eagle-harness', runId, {
    status: 'executing',
    meta: {
      current_stage_index: 1,
      total_stages: 5,
      last_completed_stage: 1,
      last_completed_stage_name: 'edit-feature-registry',
      last_completed_at: new Date().toISOString(),
    },
  });

  // T1 — pre-crash state verified
  try {
    const r = logger.getRun('eagle-harness', runId);
    assert(r.status === 'executing', `expected status=executing, got ${r.status}`);
    assert(r.meta.last_completed_stage === 1,
      `expected last_completed_stage=1, got ${r.meta.last_completed_stage}`);
    assert(r.meta.total_stages === 5, `expected total_stages=5, got ${r.meta.total_stages}`);
    record('T1 pre-crash state (executing, stage 1 of 5)', true);
  } catch (e) { record('T1 pre-crash state (executing, stage 1 of 5)', false, e.message); }

  // STAGE B — boot detects orphan
  const orphans = eagle.recoverOrphanedRuns();
  const ourOrphan = orphans.find((o) => o.run_id === runId);

  // T2 — orphan detected and recoverable
  try {
    assert(ourOrphan, `orphan not found for run_id=${runId}`);
    assert(ourOrphan.recoverable === true, `expected recoverable=true, got ${ourOrphan.recoverable}`);
    assert(ourOrphan.last_completed_stage === 1, `expected lastStage=1, got ${ourOrphan.last_completed_stage}`);
    assert(ourOrphan.total_stages === 5, `expected total_stages=5, got ${ourOrphan.total_stages}`);
    record('T2 orphan detected + recoverable=true', true);
  } catch (e) { record('T2 orphan detected + recoverable=true', false, e.message); }

  // T3 — run state correctly transitioned to failed (last_completed_stage preserved)
  try {
    const r = logger.getRun('eagle-harness', runId);
    assert(r.status === 'failed', `expected status=failed, got ${r.status}`);
    assert(r.error === 'worker-crashed-mid-stage', `expected error tag, got ${r.error}`);
    assert(r.meta.recoverable === true, `expected meta.recoverable=true, got ${r.meta.recoverable}`);
    assert(typeof r.meta.orphaned_at === 'string' && r.meta.orphaned_at.length > 0,
      'expected meta.orphaned_at timestamp');
    assert(r.meta.last_completed_stage === 1, `lastStage lost: ${r.meta.last_completed_stage}`);
    assert(r.meta.awaiting === null, `expected awaiting=null, got ${r.meta.awaiting}`);
    assert(typeof r.completed_at === 'string' && r.completed_at.length > 0,
      'expected completed_at timestamp on failed run');
    record('T3 run transitioned to failed + lastStage preserved', true);
  } catch (e) { record('T3 run transitioned to failed + lastStage preserved', false, e.message); }

  // STAGE C — operator writes resume signal; bridge dispatches
  signalName = `${tag}-resume.signal`;
  signalPath = path.join(worker.APPROVALS_DIR, signalName);
  if (!fs.existsSync(worker.APPROVALS_DIR)) fs.mkdirSync(worker.APPROVALS_DIR, { recursive: true });
  fs.writeFileSync(signalPath, `resume ${featureName}`);

  worker._resetProcessedSignals();
  await worker.processSignalFile(signalName);

  // The stub's body runs synchronously inside resumeRun's flow, so the call
  // is captured before processSignalFile returns. Defensive bounded wait
  // anyway in case of unexpected microtask ordering.
  const waitForCall = async () => {
    for (let i = 0; i < 20; i++) {
      if (capturedStageCalls.some((c) => c.runId === runId)) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    return false;
  };
  const resumed = await waitForCall();

  // T4 — resume dispatched + runMode3Stage called with correct stage index
  try {
    assert(resumed === true, 'runMode3Stage was never called within 2s');
    const ourCall = capturedStageCalls.find((c) => c.runId === runId);
    assert(ourCall, `no stub call captured for runId=${runId}`);
    assert(ourCall.startStageIndex === 2,
      `expected startStageIndex=2 (lastStage+1), got ${ourCall.startStageIndex}`);
    record('T4 resume dispatched + runMode3Stage at stage 2', true);
  } catch (e) { record('T4 resume dispatched + runMode3Stage at stage 2', false, e.message); }

  // T5 — run state flipped back to executing (lastStage stays at 1)
  try {
    const r = logger.getRun('eagle-harness', runId);
    assert(r.status === 'executing', `expected status=executing, got ${r.status}`);
    assert(r.meta.resumed_from_stage === 1, `expected resumed_from_stage=1, got ${r.meta.resumed_from_stage}`);
    assert(typeof r.meta.resumed_at === 'string' && r.meta.resumed_at.length > 0,
      'expected resumed_at timestamp');
    assert(r.meta.awaiting === null, `expected awaiting=null, got ${r.meta.awaiting}`);
    assert(r.meta.last_completed_stage === 1,
      `last_completed_stage should stay at 1 until stage 2 actually completes; got ${r.meta.last_completed_stage}`);
    record('T5 run flipped back to executing + lastStage preserved', true);
  } catch (e) { record('T5 run flipped back to executing + lastStage preserved', false, e.message); }

  // T6 — episodes auditable in brain (full state-transition trace)
  try {
    const ours = mem.query({ agent: 'eagle', limit: 200 })
      .filter((ep) => ep.run_id === runId)
      .sort((a, b) => a.seq - b.seq);

    const kinds = ours.map((ep) => ep.kind);
    const phases = ours.map((ep) => ep.payload && ep.payload.phase).filter(Boolean);

    // Each expected kind appears at least once.
    assert(kinds.includes('eagle.run.started'), 'missing eagle.run.started');
    assert(kinds.filter((k) => k === 'eagle.run.executing').length >= 2,
      'expected >=2 eagle.run.executing (stages 0,1 and resume)');
    assert(kinds.includes('eagle.run.failed'), 'missing eagle.run.failed');
    assert(kinds.filter((k) => k === 'eagle.phase.complete').length >= 2,
      'expected >=2 eagle.phase.complete (orphan-detected + resume)');

    // Exactly one orphan-detected phase, exactly one resume phase.
    const orphanDetected = ours.filter(
      (ep) => ep.kind === 'eagle.phase.complete' && ep.payload && ep.payload.phase === 'orphan-detected'
    );
    assert(orphanDetected.length === 1,
      `expected exactly 1 orphan-detected phase, got ${orphanDetected.length}`);

    const resumePhases = ours.filter(
      (ep) => ep.kind === 'eagle.phase.complete' && ep.payload && ep.payload.phase === 'resume'
    );
    assert(resumePhases.length === 1, `expected exactly 1 resume phase, got ${resumePhases.length}`);

    // Final eagle.run.executing comes AFTER eagle.run.failed (proves orphan→resume transition).
    const failedSeqs = ours.filter((ep) => ep.kind === 'eagle.run.failed').map((ep) => ep.seq);
    const executingSeqs = ours.filter((ep) => ep.kind === 'eagle.run.executing').map((ep) => ep.seq);
    assert(failedSeqs.length >= 1, 'expected >=1 eagle.run.failed');
    const maxFailed = Math.max(...failedSeqs);
    const maxExecuting = Math.max(...executingSeqs);
    assert(maxExecuting > maxFailed,
      `final executing(${maxExecuting}) must come after failed(${maxFailed}) — proves resume after recovery`);

    record('T6 episodes auditable across crash-resume', true);
  } catch (e) { record('T6 episodes auditable across crash-resume', false, e.message); }

  // T7 — signal archived
  try {
    assert(!fs.existsSync(signalPath), `signal still in approvals/: ${signalPath}`);
    const archivedPath = path.join(worker.PROCESSED_DIR, signalName);
    assert(fs.existsSync(archivedPath), `signal not archived: ${archivedPath}`);
    record('T7 resume signal archived', true);
  } catch (e) { record('T7 resume signal archived', false, e.message); }
}

function cleanJsonl() {
  if (!fs.existsSync(eagleJsonl)) return 0;
  const lines = fs.readFileSync(eagleJsonl, 'utf8').split('\n').filter(Boolean);
  const kept = lines.filter((line) => {
    try {
      const r = JSON.parse(line);
      return !(r.feature || '').startsWith(tag) && r.run_id !== runId;
    } catch { return true; }
  });
  const body = kept.join('\n') + (kept.length ? '\n' : '');
  fs.writeFileSync(eagleJsonl, body, 'utf8');
  return lines.length - kept.length;
}

function cleanup() {
  // Restore real runMode3Stage.
  eagle.runMode3Stage = realRunMode3Stage;

  try { mem.close(); } catch { /* */ }

  try {
    const epDb = new Database(epDbPath);
    const evDb = new Database(evDbPath);

    const epDel = epDb.prepare(
      "DELETE FROM episodes WHERE feature LIKE ? || '%' OR run_id = ?"
    ).run(tag, runId || '__never__');
    const elDel = evDb.prepare(
      "DELETE FROM event_log WHERE topic LIKE 'eagle.%' AND payload LIKE '%' || ? || '%'"
    ).run(tag);
    const cuDel = evDb.prepare(
      "DELETE FROM cursors WHERE topic LIKE 'eagle.%'"
    ).run();

    epDb.close();
    evDb.close();

    // Signal files in approvals/ and approvals/processed/.
    let signalsRemoved = 0;
    for (const dir of [worker.APPROVALS_DIR, worker.PROCESSED_DIR]) {
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir)) {
        if (f.startsWith(tag)) {
          fs.unlinkSync(path.join(dir, f));
          signalsRemoved++;
        }
      }
    }

    const jsonlRemoved = cleanJsonl();
    console.log(
      `[cleanup] jsonl=${jsonlRemoved} episodes=${epDel.changes} ` +
      `event_log=${elDel.changes} cursors=${cuDel.changes} signals=${signalsRemoved}`
    );
  } catch (e) {
    console.error('[cleanup] failed:', e.message);
  }
}

run()
  .catch((e) => { console.error('test crashed:', e); })
  .finally(() => {
    cleanup();
    console.log('\n=== CRASH-RESUME INTEGRATION ===');
    for (const r of results) {
      console.log(`${r.name.padEnd(60)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
    }
    const allPass = results.length > 0 && results.every((r) => r.ok);
    if (allPass) {
      console.log('\nALL CRASH-RESUME INTEGRATION TESTS PASSED');
      process.exit(0);
    } else if (results.length === 0) {
      console.log('\nFAILED — no tests executed');
      process.exit(1);
    } else {
      console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
      process.exit(1);
    }
  });
