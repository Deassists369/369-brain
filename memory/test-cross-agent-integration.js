'use strict';
// memory/test-cross-agent-integration.js
// Step 4D — cross-agent integration. Single-process simulation of:
//   eagle → episodes.db + bus → guardian subscriber fires + emits its own
//   episodes + bus → self-improvement reads everything via watermark cursor.
//
// IMPORTANT — production caveat (B-007 worth flagging):
//   In production, logger.js (eagle/SI) runs in the harness-worker process
//   and guardian-bridge.js runs in the guardian PM2 process. Each module
//   creates its OWN EventBus instance. In-memory subscribe()/emit() never
//   crosses processes. Guardian's bus subscriber only fires when emits
//   originate IN GUARDIAN'S OWN PROCESS. Cross-process delivery today
//   relies on the durable event_log + a poller (which Guardian doesn't
//   yet have — its 30s watchEagle still polls JSONL).
//   For this single-process test we force logger to share guardian's bus
//   singleton via LOGGER_TEST_MODE so the eagle→guardian chain is
//   exercisable end-to-end in one Node process.

// MUST set both env vars BEFORE require — they're checked at module load.
process.env.GUARDIAN_TEST_MODE = '1';
process.env.LOGGER_TEST_MODE = '1';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const BRAIN = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const logger = require(path.join(BRAIN, 'harness/core/logger.js'));
const guardian = require(path.join(BRAIN, 'guardian-bridge.js'));
const inputs = require(path.join(BRAIN, 'harness/self-improvement/inputs.js'));

// Force shared singletons. Logger's _bus and _mem now point at guardian's.
const sharedMem = guardian._mem();
const sharedBus = guardian._bus();
logger._setMemSingleton(sharedMem);
logger._setBusSingleton(sharedBus);

const mem = sharedMem;
const bus = sharedBus;

const epDbPath = path.join(BRAIN, 'memory', 'db', 'episodes.db');
const evDbPath = path.join(BRAIN, 'memory', 'db', 'events.db');
const wkDbPath = path.join(BRAIN, 'memory', 'db', 'working.db');
const eagleJsonl = path.join(BRAIN, 'intelligence', 'harness-runs', 'eagle-harness.jsonl');
const siJsonl = path.join(BRAIN, 'intelligence', 'harness-runs', 'self-improvement-harness.jsonl');

const runTag = `cross-agent-${Date.now()}`;
const guardianRunId = `guardian-${runTag}`;
const watermarkKey = `last_episode_seq_${runTag}`;
let eagleRunId = null;
let siRunId = null;

const guardianTriggers = [];
guardian._setTestsRunner((trigger) => {
  guardianTriggers.push(trigger);
  return Promise.resolve();
});
guardian.subscribeToEagleBus();

const results = [];
let firstFailure = null;
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok && !firstFailure) firstFailure = { name, detail };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function run() {
  // STAGE B — eagle plays its full lifecycle through logger.js.
  const eagleRun = logger.startRun('eagle-harness', { feature: runTag });
  eagleRunId = eagleRun.run_id;
  logger.logPhase('eagle-harness', eagleRunId, { phase: 'data-check', status: 'running' });
  logger.logPhase('eagle-harness', eagleRunId, { phase: 'data-check', status: 'complete' });
  logger.updateRun('eagle-harness', eagleRunId, { status: 'awaiting-approval', meta: { awaiting: 'mode1-review' } });
  logger.logApproval('eagle-harness', eagleRunId, { phrase: `approved mode1 ${runTag}`, by: 'shon' });
  logger.updateRun('eagle-harness', eagleRunId, { status: 'complete' });

  // T1 — eagle wrote 6 episodes with the expected kind set
  try {
    const rows = mem.query({ feature: runTag, agent: 'eagle', limit: 50 });
    assert(rows.length === 6, `expected 6 eagle episodes, got ${rows.length}`);
    const kinds = rows.map((r) => r.kind).sort();
    const expected = [
      'eagle.approval.mode1',
      'eagle.phase.complete',
      'eagle.phase.running',
      'eagle.run.awaiting-approval',
      'eagle.run.complete',
      'eagle.run.started',
    ];
    assert(kinds.join(',') === expected.join(','), `unexpected kinds: ${kinds.join(',')}`);
    record('T1 eagle wrote all 6 lifecycle episodes', true);
  } catch (e) { record('T1 eagle wrote all 6 lifecycle episodes', false, e.message); }

  // T2 — guardian's bus subscriber fired (after the 5s setTimeout settles)
  try {
    await new Promise((r) => setTimeout(r, 5500));
    assert(guardianTriggers.length === 1, `expected 1 guardian trigger, got ${guardianTriggers.length}`);
    assert(guardianTriggers[0].source === 'bus.eagle.run.complete', `source=${guardianTriggers[0].source}`);
    assert(guardianTriggers[0].eagle_run_id === eagleRunId, `eagle_run_id mismatch: ${guardianTriggers[0].eagle_run_id}`);
    record('T2 guardian bus subscriber fired on eagle.run.complete', true);
  } catch (e) { record('T2 guardian bus subscriber fired on eagle.run.complete', false, e.message); }

  // STAGE C — guardian emits its own episodes (simulates real test runner)
  guardian._emitTestStart(
    guardianRunId,
    { source: 'bus.eagle.run.complete', eagle_run_id: eagleRunId, feature: runTag },
    Date.now()
  );
  guardian._emitTestComplete(guardianRunId, {
    run_id: guardianRunId,
    summary: { total: 13, passed: 13, failed: 0, skipped: 0 },
    run_date: '2026-05-05',
    run_time: new Date().toISOString(),
    duration_ms: 1234,
    exit_code: 0,
    status: 'passing',
    trigger: { source: 'bus.eagle.run.complete', eagle_run_id: eagleRunId, feature: runTag },
  });

  // T3 — guardian episodes landed and link back to eagle via payload.trigger.eagle_run_id
  try {
    const startRows = mem.query({ agent: 'guardian', kind: 'guardian.test.start', limit: 50 });
    const startTied = startRows.filter(
      (r) => r.payload && r.payload.trigger && r.payload.trigger.eagle_run_id === eagleRunId
    );
    assert(startTied.length >= 1, `expected >=1 guardian.test.start tied to eagle, got ${startTied.length}`);

    const completeRows = mem.query({ agent: 'guardian', kind: 'guardian.test.complete', limit: 50 });
    const completeTied = completeRows.filter(
      (r) => r.payload && r.payload.trigger && r.payload.trigger.eagle_run_id === eagleRunId
    );
    assert(completeTied.length >= 1, `expected >=1 guardian.test.complete tied to eagle, got ${completeTied.length}`);
    assert(completeTied[0].status === 'passed', `expected status=passed, got ${completeTied[0].status}`);
    record('T3 guardian episodes landed + linked to eagle', true);
  } catch (e) { record('T3 guardian episodes landed + linked to eagle', false, e.message); }

  // STAGE D — SI plays its lifecycle and reads everything via the inputs API
  const siRun = logger.startRun('self-improvement-harness', { feature: 'self-improvement-harness-v1' });
  siRunId = siRun.run_id;
  logger.logPhase('self-improvement-harness', siRunId, { phase: 'read-harness-runs', status: 'running' });

  const events = inputs.readEpisodesSince(mem, 0);

  // T4 — readEpisodesSince found eagle + guardian events but excluded SI's own
  try {
    const eventsForThisRun = events.filter((ep) =>
      ep.feature === runTag ||
      ep.run_id === eagleRunId ||
      ep.run_id === guardianRunId ||
      (ep.payload && ep.payload.trigger && ep.payload.trigger.eagle_run_id === eagleRunId)
    );
    assert(eventsForThisRun.length >= 8,
      `expected >=8 events tied to this run (6 eagle + 2 guardian), got ${eventsForThisRun.length}`);
    const ownEvents = eventsForThisRun.filter((ep) => ep.agent === 'self-improvement');
    assert(ownEvents.length === 0, `SI's own events leaked into the read; got ${ownEvents.length}`);
    record('T4 readEpisodesSince found cross-agent events without SI', true);
  } catch (e) { record('T4 readEpisodesSince found cross-agent events without SI', false, e.message); }

  // T5 — watermark advance + re-read returns nothing tied to this run
  let maxSeq = 0;
  try {
    maxSeq = events.reduce((m, ep) => Math.max(m, ep.seq), 0);
    mem.setWorking('self-improvement', watermarkKey, maxSeq);
    const cursorAfter = mem.getWorking('self-improvement', watermarkKey);
    assert(cursorAfter === maxSeq, `expected cursor=${maxSeq}, got ${cursorAfter}`);

    const afterEvents = inputs.readEpisodesSince(mem, maxSeq);
    const afterFiltered = afterEvents.filter((ep) =>
      ep.feature === runTag ||
      ep.run_id === eagleRunId ||
      ep.run_id === guardianRunId ||
      (ep.payload && ep.payload.trigger && ep.payload.trigger.eagle_run_id === eagleRunId)
    );
    assert(afterFiltered.length === 0, `cursor failed to catch up; ${afterFiltered.length} stale events remain`);
    record('T5 watermark advance + re-read empty', true);
  } catch (e) { record('T5 watermark advance + re-read empty', false, e.message); }

  // STAGE E — finish SI lifecycle so the durable record exists for T6/T7
  logger.logPhase('self-improvement-harness', siRunId, {
    phase: 'read-harness-runs',
    status: 'complete',
    detail: `${events.length} episodes processed`,
  });
  logger.updateRun('self-improvement-harness', siRunId, {
    status: 'complete',
    meta: { new_episodes_processed: events.length },
  });

  // T6 — SI episodes carry the right agent + kind prefix
  try {
    const siRows = mem.query({ agent: 'self-improvement', limit: 50 });
    const ours = siRows.filter((r) => r.run_id === siRunId);
    assert(ours.length >= 3,
      `expected >=3 SI episodes for ${siRunId} (started + phase.running + phase.complete + run.complete), got ${ours.length}`);
    assert(ours.every((r) => r.agent === 'self-improvement'),
      'every SI episode must have agent=self-improvement');
    assert(ours.every((r) => r.kind.startsWith('self-improvement.')),
      'every SI episode kind must start with "self-improvement."');
    record('T6 SI episodes labeled correctly', true);
  } catch (e) { record('T6 SI episodes labeled correctly', false, e.message); }

  // T7 — bus events landed durably for all 3 agents (replay path)
  try {
    const eagleEvents = bus.replay('verifier-final', 'eagle.run.complete');
    assert(eagleEvents.some((e) => e.payload && e.payload.run_id === eagleRunId),
      `eagle.run.complete bus event with run_id=${eagleRunId} not found`);

    const guardianStart = bus.replay('verifier-final', 'guardian.test.start');
    assert(guardianStart.some(
      (e) => e.payload && e.payload.trigger && e.payload.trigger.eagle_run_id === eagleRunId
    ), `guardian.test.start bus event tied to eagle ${eagleRunId} not found`);

    const siComplete = bus.replay('verifier-final', 'self-improvement.run.complete');
    assert(siComplete.some((e) => e.payload && e.payload.run_id === siRunId),
      `self-improvement.run.complete bus event with run_id=${siRunId} not found`);
    record('T7 bus events durable across all 3 agents', true);
  } catch (e) { record('T7 bus events durable across all 3 agents', false, e.message); }
}

function cleanJsonl(filePath, runIdsToRemove) {
  if (!fs.existsSync(filePath)) return 0;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
  const kept = lines.filter((line) => {
    try {
      const r = JSON.parse(line);
      return !runIdsToRemove.includes(r.run_id);
    } catch { return true; }
  });
  const body = kept.join('\n') + (kept.length ? '\n' : '');
  fs.writeFileSync(filePath, body, 'utf8');
  return lines.length - kept.length;
}

function cleanup() {
  // Close shared singletons before opening fresh delete connections.
  try { sharedMem.close(); } catch { /* */ }
  try { sharedBus.close(); } catch { /* */ }

  try {
    const epDb = new Database(epDbPath);
    const evDb = new Database(evDbPath);
    const wkDb = new Database(wkDbPath);

    const epDelByFeature = epDb.prepare('DELETE FROM episodes WHERE feature = ?').run(runTag);
    const epDelByRunId = epDb.prepare(
      'DELETE FROM episodes WHERE run_id IN (?, ?, ?)'
    ).run(eagleRunId || '', guardianRunId, siRunId || '');
    // Defense: production guardian PM2 may have polled our eagle JSONL write
    // and emitted its own guardian.test.start/complete with our eagleRunId in
    // payload.trigger.eagle_run_id. See B-007.
    const epDelByPayload = epDb.prepare(
      "DELETE FROM episodes WHERE agent='guardian' AND (payload LIKE '%' || ? || '%' OR payload LIKE '%' || ? || '%')"
    ).run(eagleRunId || '__never__', runTag);

    const elDel = evDb.prepare(`
      DELETE FROM event_log WHERE (
        topic IN (
          'eagle.run.started', 'eagle.run.awaiting-approval', 'eagle.run.complete',
          'eagle.approval.mode1', 'eagle.phase.failed',
          'guardian.test.start', 'guardian.test.complete',
          'self-improvement.run.started', 'self-improvement.run.complete'
        )
      ) AND (
        payload LIKE '%' || ? || '%' OR
        payload LIKE '%' || ? || '%' OR
        payload LIKE '%' || ? || '%'
      )
    `).run(runTag, eagleRunId || '__never__', siRunId || '__never__');

    const cuDel = evDb.prepare(`
      DELETE FROM cursors WHERE subscriber IN ('verifier-final', 'guardian')
        AND topic IN (
          'eagle.run.complete', 'eagle.run.started',
          'guardian.test.start', 'guardian.test.complete',
          'self-improvement.run.complete'
        )
    `).run();

    const wkDel = wkDb.prepare(
      "DELETE FROM working_memory WHERE agent = 'self-improvement' AND key = ?"
    ).run(watermarkKey);

    epDb.close(); evDb.close(); wkDb.close();

    const eagleJsonlRemoved = cleanJsonl(eagleJsonl, [eagleRunId].filter(Boolean));
    const siJsonlRemoved = cleanJsonl(siJsonl, [siRunId].filter(Boolean));

    console.log(
      `[cleanup] episodes_by_feature=${epDelByFeature.changes} ` +
      `episodes_by_runid=${epDelByRunId.changes} ` +
      `event_log=${elDel.changes} cursors=${cuDel.changes} ` +
      `working_memory=${wkDel.changes} ` +
      `eagle_jsonl=${eagleJsonlRemoved} si_jsonl=${siJsonlRemoved}`
    );
  } catch (e) {
    console.error('[cleanup] failed:', e.message);
  }
}

function summarize() {
  console.log('\n=== CROSS-AGENT INTEGRATION TESTS ===');
  for (const r of results) {
    console.log(`${r.name.padEnd(56)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
  }
  const allPass = results.length > 0 && results.every((r) => r.ok);
  if (allPass) {
    console.log('\nALL CROSS-AGENT TESTS PASSED');
    process.exit(0);
  } else if (results.length === 0) {
    console.log('\nFAILED — no tests executed (setup error)');
    process.exit(1);
  } else {
    console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
    process.exit(1);
  }
}

run()
  .catch((e) => { console.error('test crashed:', e); })
  .finally(() => {
    cleanup();
    summarize();
  });
