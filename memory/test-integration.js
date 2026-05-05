'use strict';
// memory/test-integration.js
// Item 2 — Step 2D: end-to-end MemoryRouter + EventBus flow.
// Models a realistic scenario:
//   - eagle finishes a build → emits an immutable router episode AND a bus event.
//   - guardian is a live subscriber that reacts: queries the router by id,
//     writes its own episode, and re-publishes on its own bus topic.
//   - self-improvement is a LATE consumer that uses replay() to catch up
//     after live delivery already happened.

const path = require('path');
const Database = require('better-sqlite3');
const { MemoryRouter } = require('./router');
const { EventBus } = require('./event-bus');

const runTag     = `int-test-${Date.now()}`;
const topicBuild = `eagle.build.complete.${runTag}`;
const topicTest  = `guardian.test.start.${runTag}`;

const results = [];
let firstFailure = null;
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok && !firstFailure) firstFailure = { name, detail };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual(a[k], b[k]));
}

// STAGE A — setup
const mem = new MemoryRouter();
const bus = new EventBus();

const guardianReceived = [];
let guardianEpisode = null;

try {
  // STAGE B — wire guardian as live subscriber on topicBuild
  bus.subscribe('guardian', topicBuild, (event) => {
    guardianReceived.push(event);
    const epRows = mem.query({ feature: runTag, kind: 'eagle.build.complete', limit: 1 });
    if (!epRows.length) return; // setup error — T1 will fail loudly
    const sourceEp = epRows[0];
    // Honor the bus event's episode_id reference; bail if it points elsewhere.
    if (event.payload && event.payload.episode_id && sourceEp.id !== event.payload.episode_id) {
      // T6 deliberately sends a fake episode_id; bail without writing.
      return;
    }
    const myEp = mem.emit({
      kind: 'guardian.test.start',
      agent: 'guardian',
      feature: runTag,
      status: 'running',
      summary: `reacting to ${sourceEp.id}`,
      payload: { source_episode: sourceEp.id },
    });
    guardianEpisode = myEp;
    bus.emit(topicTest, 'guardian', {
      episode_id: myEp.id,
      source_build: sourceEp.id,
      feature: runTag,
    });
  });

  // STAGE C — DO NOT subscribe self-improvement here; T3 tests cold replay.

  // STAGE D — eagle emits build-complete: router first, then bus
  const eagleEp = mem.emit({
    kind: 'eagle.build.complete',
    agent: 'eagle',
    feature: runTag,
    status: 'complete',
    summary: 'integration-test build',
    payload: { duration_ms: 12345 },
  });
  bus.emit(topicBuild, 'eagle', { episode_id: eagleEp.id, feature: runTag });

  // T1 — guardian fired and stored its episode
  try {
    assert(guardianReceived.length === 1, `expected guardian to receive 1 event, got ${guardianReceived.length}`);
    assert(guardianReceived[0].payload.episode_id === eagleEp.id, 'guardian event payload should reference eagle episode_id');
    assert(guardianEpisode && guardianEpisode.id, 'guardian should have written its own episode');
    const gRows = mem.query({ kind: 'guardian.test.start', feature: runTag, limit: 5 });
    assert(gRows.length === 1, `expected 1 guardian episode in router, got ${gRows.length}`);
    assert(gRows[0].agent === 'guardian', `expected agent=guardian, got ${gRows[0].agent}`);
    assert(gRows[0].payload && gRows[0].payload.source_episode === eagleEp.id, 'guardian episode payload should link back to eagle episode');
    record('T1 guardian reacted + stored episode', true);
  } catch (e) { record('T1 guardian reacted + stored episode', false, e.message); }

  // T2 — guardian's bus event durably persisted in event_log
  try {
    const tmpRows = bus.replay('verify-bus-T2', topicTest);
    assert(tmpRows.length === 1, `expected 1 event on topicTest, got ${tmpRows.length}`);
    assert(tmpRows[0].publisher === 'guardian', `expected publisher=guardian, got ${tmpRows[0].publisher}`);
    assert(tmpRows[0].payload && tmpRows[0].payload.source_build === eagleEp.id, 'topicTest payload should link back to eagle episode_id');
    record('T2 guardian bus event durable', true);
  } catch (e) { record('T2 guardian bus event durable', false, e.message); }

  // T3 — self-improvement (late consumer) replays both topics
  try {
    const buildBacklog = bus.replay('self-improvement', topicBuild);
    const testBacklog  = bus.replay('self-improvement', topicTest);
    assert(buildBacklog.length === 1, `expected 1 build event from cold replay, got ${buildBacklog.length}`);
    assert(testBacklog.length === 1, `expected 1 test event from cold replay, got ${testBacklog.length}`);
    const buildAgain = bus.replay('self-improvement', topicBuild);
    const testAgain  = bus.replay('self-improvement', topicTest);
    assert(buildAgain.length === 0, `expected 0 events on 2nd build replay, got ${buildAgain.length}`);
    assert(testAgain.length === 0, `expected 0 events on 2nd test replay, got ${testAgain.length}`);
    record('T3 self-improvement replay catch-up', true);
  } catch (e) { record('T3 self-improvement replay catch-up', false, e.message); }

  // T4 — working memory cross-agent
  try {
    const value = { feature: runTag, stage: 'mode3' };
    mem.setWorking('eagle', 'currentTask', value);
    const got = mem.getWorking('eagle', 'currentTask');
    assert(deepEqual(got, value), `deep-equal failed: got ${JSON.stringify(got)}`);
    record('T4 working memory cross-agent', true);
  } catch (e) { record('T4 working memory cross-agent', false, e.message); }

  // T5 — end-to-end query consistency: 2 rows under runTag, ordered DESC
  try {
    const all = mem.query({ feature: runTag, limit: 100 });
    assert(all.length === 2, `expected 2 episodes under feature=${runTag}, got ${all.length}`);
    const kinds = all.map((r) => r.kind).sort();
    assert(kinds.join(',') === 'eagle.build.complete,guardian.test.start', `unexpected kinds: ${kinds.join(',')}`);
    for (let i = 1; i < all.length; i++) {
      assert(all[i - 1].ts >= all[i].ts, `expected DESC ts at index ${i}`);
    }
    record('T5 query consistency', true);
  } catch (e) { record('T5 query consistency', false, e.message); }

  // T6 — subscriber failure does not break the chain
  try {
    const before = guardianReceived.length;
    bus.subscribe('noisy-sub', topicBuild, () => { throw new Error('noisy boom (expected)'); });
    bus.emit(topicBuild, 'eagle', { episode_id: 'fake', feature: runTag });
    assert(guardianReceived.length === before + 1, `expected guardian to fire +1; got ${guardianReceived.length - before}`);
    record('T6 subscriber failure does not break chain', true);
  } catch (e) { record('T6 subscriber failure does not break chain', false, e.message); }
} finally {
  // Cleanup — direct sqlite, runs whether tests passed or not
  try { mem.close(); } catch { /* */ }
  try { bus.close(); } catch { /* */ }
  try {
    const epDb = new Database(path.join(__dirname, 'db', 'episodes.db'));
    const evDb = new Database(path.join(__dirname, 'db', 'events.db'));
    const wkDb = new Database(path.join(__dirname, 'db', 'working.db'));
    const epDel = epDb.prepare('DELETE FROM episodes WHERE feature = ?').run(runTag);
    const elDel = evDb.prepare('DELETE FROM event_log WHERE topic IN (?, ?)').run(topicBuild, topicTest);
    const cuDel = evDb.prepare('DELETE FROM cursors WHERE topic IN (?, ?)').run(topicBuild, topicTest);
    const wkDel = wkDb.prepare('DELETE FROM working_memory WHERE agent = ? AND key = ?').run('eagle', 'currentTask');
    epDb.close(); evDb.close(); wkDb.close();
    console.log(`[cleanup] episodes:${epDel.changes} event_log:${elDel.changes} cursors:${cuDel.changes} working_memory:${wkDel.changes}`);
  } catch (e) {
    console.error('[cleanup] failed:', e.message);
  }
}

console.log('\n=== INTEGRATION TESTS ===');
for (const r of results) {
  console.log(`${r.name.padEnd(46)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
}
const allPass = results.length > 0 && results.every((r) => r.ok);
if (allPass) {
  console.log('\nALL INTEGRATION TESTS PASSED');
  process.exit(0);
} else if (results.length === 0) {
  console.log('\nFAILED — no tests executed (setup error)');
  process.exit(1);
} else {
  console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
  process.exit(1);
}
