'use strict';
// memory/test-guardian-wiring.js
// Step 4B smoke test — verifies guardian-bridge.js dual-writes test-start /
// test-complete to MemoryRouter + EventBus, and that subscribeToEagleBus()
// reacts to bus events. We stub _testsRunner so the bus-trigger path
// pushes to a received[] array instead of actually running playwright.

// MUST set BEFORE require so guardian-bridge.js skips its boot side effects
// and exposes test-mode hooks.
process.env.GUARDIAN_TEST_MODE = '1';

const path = require('path');
const Database = require('better-sqlite3');

const BRAIN = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const guardian = require(path.join(BRAIN, 'guardian-bridge.js'));

const epDbPath = path.join(BRAIN, 'memory', 'db', 'episodes.db');
const evDbPath = path.join(BRAIN, 'memory', 'db', 'events.db');

const mem = guardian._mem();
const bus = guardian._bus();

const results = [];
let firstFailure = null;
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok && !firstFailure) firstFailure = { name, detail };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

// Unique tag prefix so cleanup is safe to scope by run_id LIKE 'test-wire-%'.
const startRunId = `test-wire-start-${Date.now()}`;
const passRunId  = `test-wire-pass-${Date.now()}`;
const failRunId  = `test-wire-fail-${Date.now() + 1}`;
const fakeEagleRunId = `fake-eagle-${Date.now()}`;
const fakeEagleFeature = `fake-feature-${Date.now()}`;

async function run() {
  // T1 — guardian.test.start episode
  try {
    guardian._emitTestStart(startRunId, { source: 'unit-test' }, Date.now());
    const rows = mem.query({ agent: 'guardian', kind: 'guardian.test.start', limit: 50 });
    const match = rows.find((r) => r.run_id === startRunId);
    assert(match, `expected episode with run_id=${startRunId}`);
    assert(match.payload && match.payload.trigger && match.payload.trigger.source === 'unit-test',
      `expected payload.trigger.source==unit-test, got ${JSON.stringify(match.payload && match.payload.trigger)}`);
    record('T1 guardian.test.start episode written', true);
  } catch (e) { record('T1 guardian.test.start episode written', false, e.message); }

  // T2 — guardian.test.complete episode (passing)
  try {
    guardian._emitTestComplete(passRunId, {
      run_id: passRunId,
      summary: { total: 5, passed: 5, failed: 0, skipped: 0 },
      trigger: { source: 'unit-test' },
    });
    const rows = mem.query({ agent: 'guardian', kind: 'guardian.test.complete', limit: 50 });
    const match = rows.find((r) => r.run_id === passRunId);
    assert(match, `expected episode with run_id=${passRunId}`);
    assert(match.status === 'passed', `expected status=passed, got ${match.status}`);
    record('T2 guardian.test.complete passed episode', true);
  } catch (e) { record('T2 guardian.test.complete passed episode', false, e.message); }

  // T3 — bus event for test.start exists
  try {
    const rows = bus.replay('verifier-A', 'guardian.test.start');
    assert(rows.length >= 1, `expected >=1 bus event on guardian.test.start, got ${rows.length}`);
    const ours = rows.find((r) => r.payload && r.payload.run_id === startRunId);
    assert(ours, 'expected our startRunId on the bus');
    record('T3 bus event fired on test.start', true);
  } catch (e) { record('T3 bus event fired on test.start', false, e.message); }

  // T4 — bus event for test.complete exists with payload.status
  try {
    const rows = bus.replay('verifier-A', 'guardian.test.complete');
    assert(rows.length >= 1, `expected >=1 bus event on guardian.test.complete, got ${rows.length}`);
    const ours = rows.find((r) => r.payload && r.payload.run_id === passRunId);
    assert(ours, 'expected our passRunId on the bus');
    assert(ours.payload.status === 'passed', `expected payload.status=passed, got ${ours.payload.status}`);
    record('T4 bus event fired on test.complete with status', true);
  } catch (e) { record('T4 bus event fired on test.complete with status', false, e.message); }

  // T5 — subscribeToEagleBus + fake eagle.run.complete → guardian fires _testsRunner
  try {
    const received = [];
    guardian._setTestsRunner((trigger) => {
      received.push(trigger);
      return Promise.resolve();
    });
    guardian.subscribeToEagleBus();
    bus.emit('eagle.run.complete', 'eagle', {
      run_id: fakeEagleRunId,
      feature: fakeEagleFeature,
      status: 'complete',
      meta: null,
    });
    // Subscriber has a 5s setTimeout before calling _testsRunner.
    await new Promise((r) => setTimeout(r, 5500));
    assert(received.length === 1, `expected 1 _testsRunner call, got ${received.length}`);
    assert(received[0].source === 'bus.eagle.run.complete', `expected source=bus.eagle.run.complete, got ${received[0].source}`);
    assert(received[0].eagle_run_id === fakeEagleRunId, `expected eagle_run_id=${fakeEagleRunId}, got ${received[0].eagle_run_id}`);
    assert(received[0].feature === fakeEagleFeature, `expected feature=${fakeEagleFeature}, got ${received[0].feature}`);
    record('T5 subscription receives eagle.run.complete', true);
  } catch (e) { record('T5 subscription receives eagle.run.complete', false, e.message); }

  // T6 — guardian.test.complete with failures emits status=failed
  try {
    guardian._emitTestComplete(failRunId, {
      run_id: failRunId,
      summary: { total: 5, passed: 2, failed: 3, skipped: 0 },
      trigger: { source: 'unit-test' },
    });
    const rows = mem.query({ agent: 'guardian', kind: 'guardian.test.complete', limit: 50 });
    const match = rows.find((r) => r.run_id === failRunId);
    assert(match, `expected episode with run_id=${failRunId}`);
    assert(match.status === 'failed', `expected status=failed, got ${match.status}`);
    record('T6 failed result emits status=failed', true);
  } catch (e) { record('T6 failed result emits status=failed', false, e.message); }
}

run().then(() => {
  // Cleanup — direct sqlite, scoped to the IDs/topics this test could have written.
  try {
    const epDb = new Database(epDbPath);
    const evDb = new Database(evDbPath);
    const epDel = epDb.prepare(
      "DELETE FROM episodes WHERE agent = 'guardian' AND run_id LIKE 'test-wire-%'"
    ).run();
    // Only delete the bus events we wrote — match by run_id in payload.
    const elDelGuardian = evDb.prepare(
      "DELETE FROM event_log WHERE topic LIKE 'guardian.test.%' AND publisher = 'guardian' AND payload LIKE '%test-wire-%'"
    ).run();
    const elDelEagle = evDb.prepare(
      "DELETE FROM event_log WHERE topic = 'eagle.run.complete' AND publisher = 'eagle' AND payload LIKE '%' || ? || '%'"
    ).run(fakeEagleRunId);
    // Cursors created by verifier-A and any test cursor on these topics.
    const cuDel = evDb.prepare(
      "DELETE FROM cursors WHERE subscriber = 'verifier-A' OR topic LIKE 'guardian.test.%' OR topic = 'eagle.run.complete'"
    ).run();
    epDb.close();
    evDb.close();
    console.log(
      `[cleanup] episodes=${epDel.changes} event_log_guardian=${elDelGuardian.changes} ` +
      `event_log_eagle=${elDelEagle.changes} cursors=${cuDel.changes}`
    );
  } catch (e) {
    console.error('[cleanup] failed:', e.message);
  }

  console.log('\n=== GUARDIAN WIRING SMOKE ===');
  for (const r of results) {
    console.log(`${r.name.padEnd(54)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
  }
  const allPass = results.length > 0 && results.every((r) => r.ok);
  if (allPass) {
    console.log('\nALL GUARDIAN WIRING TESTS PASSED');
    process.exit(0);
  } else {
    console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
    process.exit(1);
  }
}).catch((e) => {
  console.error('test runner crashed:', e);
  process.exit(1);
});
