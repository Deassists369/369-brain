'use strict';
// memory/test-event-bus.js
// Verification harness for EventBus (Step 2C).
// Uses a unique topic per run, runs 8 assertions, deletes its rows on the
// way out. Exit 0 on all-pass, 1 on first failure.

const path = require('path');
const Database = require('better-sqlite3');
const { EventBus } = require('./event-bus');

const topic = `bus-test.${Date.now()}`;
const results = [];
let firstFailure = null;

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok && !firstFailure) firstFailure = { name, detail };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

const bus = new EventBus();

// Subscriber-scoped received arrays so each test asserts only its target.
const testSubReceived = [];
const tempSubReceived = [];
const goodSubReceived = [];

// T1 — emit returns id and ts (no subscribers yet)
try {
  const r = bus.emit(topic, 'tester', { msg: 'hello' });
  assert(r && typeof r.id === 'string' && r.id.length > 0, 'expected truthy id');
  assert(r && typeof r.ts === 'number' && r.ts > 0, 'expected truthy ts');
  record('T1 emit returns id+ts', true);
} catch (e) { record('T1 emit returns id+ts', false, e.message); }

// T2 — subscribe receives synchronously
try {
  bus.subscribe('test-sub', topic, (event) => testSubReceived.push(event));
  bus.emit(topic, 'tester', { n: 1 });
  bus.emit(topic, 'tester', { n: 2 });
  assert(testSubReceived.length === 2, `expected 2 events, got ${testSubReceived.length}`);
  assert(testSubReceived[0].payload && typeof testSubReceived[0].payload === 'object', 'payload should be object');
  assert(testSubReceived[0].payload.n === 1, `[0].n = ${testSubReceived[0].payload.n}`);
  assert(testSubReceived[1].payload.n === 2, `[1].n = ${testSubReceived[1].payload.n}`);
  record('T2 subscribe sync delivery', true);
} catch (e) { record('T2 subscribe sync delivery', false, e.message); }

// T3 — unsubscribe stops delivery (test-sub from T2 still active and still receives)
try {
  const unsub = bus.subscribe('temp-sub', topic, (event) => tempSubReceived.push(event));
  unsub();
  bus.emit(topic, 'tester', { n: 99 });
  assert(tempSubReceived.length === 0, `temp-sub should not have received; got ${tempSubReceived.length}`);
  record('T3 unsubscribe stops delivery', true);
} catch (e) { record('T3 unsubscribe stops delivery', false, e.message); }

// T4 — emit isolates subscriber failures.
//   bad-sub is subscribed FIRST so it fires before good-sub. If isolation is
//   broken, the throw escapes the emit loop and good-sub never runs.
try {
  bus.subscribe('bad-sub',  topic, () => { throw new Error('boom (expected)'); });
  bus.subscribe('good-sub', topic, (event) => goodSubReceived.push(event));
  bus.emit(topic, 'tester', { n: 'isolation-test' });
  assert(goodSubReceived.length === 1, `good-sub should have received 1, got ${goodSubReceived.length}`);
  assert(goodSubReceived[0].payload.n === 'isolation-test', 'payload should round-trip to good-sub');
  record('T4 emit isolates failures', true);
} catch (e) { record('T4 emit isolates failures', false, e.message); }

// T5 — replay() from no cursor returns all events for topic
//   Events emitted under topic so far:
//     T1 (msg=hello) + T2 (n=1) + T2 (n=2) + T3 (n=99) + T4 (isolation-test) = 5
try {
  const rows = bus.replay('replay-sub-A', topic);
  assert(rows.length === 5, `expected 5 events from cold replay, got ${rows.length}`);
  for (const r of rows) {
    assert(r.payload && typeof r.payload === 'object', `expected object payload, got ${typeof r.payload}`);
  }
  record('T5 replay cold returns all', true);
} catch (e) { record('T5 replay cold returns all', false, e.message); }

// T6 — replay() advances cursor; second call is empty
try {
  const rows = bus.replay('replay-sub-A', topic);
  assert(rows.length === 0, `expected 0 events after cursor caught up, got ${rows.length}`);
  record('T6 replay advances cursor', true);
} catch (e) { record('T6 replay advances cursor', false, e.message); }

// T7 — replay() picks up new events after cursor, in ts ASC order
try {
  bus.emit(topic, 'tester', { n: 'after-cursor-1' });
  bus.emit(topic, 'tester', { n: 'after-cursor-2' });
  const rows = bus.replay('replay-sub-A', topic);
  assert(rows.length === 2, `expected 2 new events, got ${rows.length}`);
  assert(rows[0].payload.n === 'after-cursor-1', `[0].n = ${rows[0].payload.n}`);
  assert(rows[1].payload.n === 'after-cursor-2', `[1].n = ${rows[1].payload.n}`);
  assert(rows[0].ts <= rows[1].ts, `expected ASC ts; ${rows[0].ts} > ${rows[1].ts}`);
  record('T7 replay picks up new events', true);
} catch (e) { record('T7 replay picks up new events', false, e.message); }

// T8 — close() and verify subsequent emit throws
try {
  bus.close();
  let threw = false;
  try { bus.emit(topic, 'tester', { n: 'after-close' }); } catch { threw = true; }
  assert(threw, 'expected emit after close() to throw');
  record('T8 close + post-close throws', true);
} catch (e) { record('T8 close + post-close throws', false, e.message); }

// Cleanup — direct sqlite, since EventBus has no DELETE API by design
try {
  const db = new Database(path.join(__dirname, 'db', 'events.db'));
  const elDel = db.prepare('DELETE FROM event_log WHERE topic = ?').run(topic);
  const cuDel = db.prepare('DELETE FROM cursors WHERE topic = ?').run(topic);
  db.close();
  console.log(`[cleanup] deleted ${elDel.changes} event_log rows under topic=${topic}`);
  console.log(`[cleanup] deleted ${cuDel.changes} cursor rows under topic=${topic}`);
} catch (e) {
  console.error('[cleanup] failed:', e.message);
}

console.log('\n=== EVENT BUS TESTS ===');
for (const r of results) {
  console.log(`${r.name.padEnd(36)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
}
const allPass = results.every((r) => r.ok);
if (allPass) {
  console.log('\nALL EVENT BUS TESTS PASSED');
  process.exit(0);
} else {
  console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
  process.exit(1);
}
