'use strict';
// memory/test-resume-dispatch.js
// Step 5B smoke test — verifies the bridge's signal-content dispatcher
// routes "resume <feature>" to eagle.resumeRun, preserves the existing
// approve/reject routing, ignores garbage, and survives a resumeRun throw.
//
// We invoke processSignalFile directly (test-mode export from
// harness-worker.js) instead of driving the fs.watch — gives us
// deterministic ordering without sleeping for filesystem events.

process.env.HARNESS_WORKER_TEST_MODE = '1';

const fs = require('fs');
const path = require('path');

const BRAIN = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const eagle = require(path.join(BRAIN, 'harness/eagle/eagle-harness.js'));
const harnessWorker = require(path.join(BRAIN, 'harness-worker.js'));

const APPROVALS_DIR = harnessWorker.APPROVALS_DIR;
const PROCESSED_DIR = harnessWorker.PROCESSED_DIR;

const baseTag = `dispatch-test-${Date.now()}`;

const captured = {
  resume: [],
  approveMode1: [],
  approveMode2: [],
  reject: [],
  consoleErrors: [],
};

const realEagle = {
  resumeRun: eagle.resumeRun,
  approveMode1: eagle.approveMode1,
  approveMode2: eagle.approveMode2,
  reject: eagle.reject,
  findWaitingRun: eagle.findWaitingRun,
};

function installStubs({ resumeShouldThrow = false } = {}) {
  eagle.resumeRun = (feature) => {
    captured.resume.push(feature);
    return resumeShouldThrow
      ? Promise.reject(new Error('not resumable'))
      : Promise.resolve({ stub: true, feature });
  };
  // findWaitingRun must return a truthy run so handleReject calls
  // eagle.reject (otherwise the regression check in T3 would not
  // observe a captured reject call).
  eagle.findWaitingRun = (ticket, gate) => ({
    run_id: `fake-${ticket}`,
    feature: ticket,
    meta: { awaiting: gate },
  });
  eagle.reject = (runId, gate) => {
    captured.reject.push({ runId, gate });
    return { runId, gate };
  };
  eagle.approveMode1 = async (runId) => {
    captured.approveMode1.push(runId);
    return { runId };
  };
  eagle.approveMode2 = async (runId) => {
    captured.approveMode2.push(runId);
    return { runId };
  };
}

function restoreEagle() {
  Object.assign(eagle, realEagle);
}

// Spy on console.error to verify the resume failure branch logged.
const realConsoleError = console.error;
console.error = (...args) => {
  captured.consoleErrors.push(args.map(String).join(' '));
  // Suppress noisy expected errors from test stubs; real stderr would clutter output.
};

function writeSignal(filename, content) {
  if (!fs.existsSync(APPROVALS_DIR)) fs.mkdirSync(APPROVALS_DIR, { recursive: true });
  const p = path.join(APPROVALS_DIR, filename);
  fs.writeFileSync(p, content);
  return p;
}

function isArchived(filename) {
  return fs.existsSync(path.join(PROCESSED_DIR, filename));
}
function isStillInApprovals(filename) {
  return fs.existsSync(path.join(APPROVALS_DIR, filename));
}

const results = [];
let firstFailure = null;
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok && !firstFailure) firstFailure = { name, detail };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function run() {
  installStubs();

  // T1 — resume signal triggers eagle.resumeRun
  try {
    const filename = `${baseTag}-T1.signal`;
    const feature = `${baseTag}-T1-feature`;
    writeSignal(filename, `resume ${feature}`);
    const before = captured.resume.length;
    harnessWorker._resetProcessedSignals();
    await harnessWorker.processSignalFile(filename);
    // resume is fire-and-forget but the stub pushes synchronously inside
    // the call, so captured.resume[before] is set by now.
    assert(captured.resume.length === before + 1,
      `expected 1 resume call, got ${captured.resume.length - before}`);
    assert(captured.resume[before] === feature,
      `expected feature=${feature}, got ${captured.resume[before]}`);
    assert(isArchived(filename), `expected ${filename} archived`);
    assert(!isStillInApprovals(filename), `expected ${filename} not in approvals/`);
    record('T1 resume signal triggers eagle.resumeRun', true);
  } catch (e) { record('T1 resume signal triggers eagle.resumeRun', false, e.message); }

  // T2 — approved signal still works (regression — does NOT call resume)
  try {
    const filename = `${baseTag}-T2.signal`;
    const ticket = `${baseTag}-T2-ticket`;
    writeSignal(filename, `approved ${ticket}`);
    const beforeResume = captured.resume.length;
    const beforeApprove2 = captured.approveMode2.length;
    harnessWorker._resetProcessedSignals();
    await harnessWorker.processSignalFile(filename);
    assert(captured.resume.length === beforeResume,
      `resume should NOT have been called; got ${captured.resume.length - beforeResume}`);
    // The approve path goes through handleApprovedMode2 → eagle.approveMode2
    // (since lastPhase is empty for our fake ticket — falls to mode2 default)
    assert(captured.approveMode2.length === beforeApprove2 + 1,
      `expected 1 approveMode2 call, got ${captured.approveMode2.length - beforeApprove2}`);
    assert(isArchived(filename), `expected ${filename} archived`);
    record('T2 approved signal still works', true);
  } catch (e) { record('T2 approved signal still works', false, e.message); }

  // T3 — not approved signal still works (regression)
  try {
    const filename = `${baseTag}-T3.signal`;
    const ticket = `${baseTag}-T3-ticket`;
    writeSignal(filename, `not approved ${ticket}`);
    const beforeResume = captured.resume.length;
    const beforeReject = captured.reject.length;
    harnessWorker._resetProcessedSignals();
    await harnessWorker.processSignalFile(filename);
    assert(captured.resume.length === beforeResume,
      `resume should NOT have been called; got ${captured.resume.length - beforeResume}`);
    assert(captured.reject.length === beforeReject + 1,
      `expected 1 reject call, got ${captured.reject.length - beforeReject}`);
    assert(isArchived(filename), `expected ${filename} archived`);
    record('T3 not approved signal still works', true);
  } catch (e) { record('T3 not approved signal still works', false, e.message); }

  // T4 — unknown content does NOT call any dispatcher (file still archived)
  try {
    const filename = `${baseTag}-T4.signal`;
    writeSignal(filename, 'garbage zzz nothing matches');
    const before = {
      resume: captured.resume.length,
      a1: captured.approveMode1.length,
      a2: captured.approveMode2.length,
      reject: captured.reject.length,
    };
    harnessWorker._resetProcessedSignals();
    await harnessWorker.processSignalFile(filename);
    assert(captured.resume.length === before.resume, 'resume should not have fired');
    assert(captured.approveMode1.length === before.a1, 'approveMode1 should not have fired');
    assert(captured.approveMode2.length === before.a2, 'approveMode2 should not have fired');
    assert(captured.reject.length === before.reject, 'reject should not have fired');
    assert(isArchived(filename),
      `unknown content should still archive (existing behavior); ${filename} not in processed/`);
    record('T4 unknown content does not dispatch', true);
  } catch (e) { record('T4 unknown content does not dispatch', false, e.message); }

  // T5 — resumeRun throws — bridge logs error and does NOT crash
  try {
    installStubs({ resumeShouldThrow: true });
    const filename = `${baseTag}-T5.signal`;
    const feature = `${baseTag}-T5-feature`;
    writeSignal(filename, `resume ${feature}`);
    const beforeResume = captured.resume.length;
    const beforeErrors = captured.consoleErrors.length;
    harnessWorker._resetProcessedSignals();
    await harnessWorker.processSignalFile(filename);
    // Allow microtask queue + .catch to run so the error log lands.
    await new Promise((r) => setTimeout(r, 50));
    assert(captured.resume.length === beforeResume + 1,
      `expected resume to have been attempted, got ${captured.resume.length - beforeResume}`);
    const newErrors = captured.consoleErrors.slice(beforeErrors);
    const sawResumeFailure = newErrors.some((e) =>
      /\[Bridge\] resume failed for/.test(e) && e.includes('not resumable'));
    assert(sawResumeFailure,
      `expected "[Bridge] resume failed" error log; got: ${JSON.stringify(newErrors).slice(0, 300)}`);
    assert(isArchived(filename), `${filename} should still be archived after throw`);
    record('T5 resumeRun throw does not crash bridge', true);
  } catch (e) { record('T5 resumeRun throw does not crash bridge', false, e.message); }
}

function cleanup() {
  // Restore eagle module + console.error.
  restoreEagle();
  console.error = realConsoleError;

  // Remove every signal file this test wrote (from approvals/ AND processed/).
  try {
    for (const dir of [APPROVALS_DIR, PROCESSED_DIR]) {
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir)) {
        if (f.startsWith(baseTag)) {
          fs.unlinkSync(path.join(dir, f));
        }
      }
    }
  } catch (e) {
    realConsoleError('[cleanup] failed:', e.message);
  }
}

run()
  .catch((e) => { realConsoleError('test crashed:', e); })
  .finally(() => {
    cleanup();
    console.log('\n=== RESUME DISPATCH SMOKE ===');
    for (const r of results) {
      console.log(`${r.name.padEnd(54)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
    }
    const allPass = results.length > 0 && results.every((r) => r.ok);
    if (allPass) {
      console.log('\nALL RESUME DISPATCH TESTS PASSED');
      process.exit(0);
    } else if (results.length === 0) {
      console.log('\nFAILED — no tests executed');
      process.exit(1);
    } else {
      console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
      process.exit(1);
    }
  });
