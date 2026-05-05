'use strict';
// memory/test-router.js
// Verification harness for MemoryRouter (Step 2B).
// Inserts episodes under a unique feature tag, runs assertions, then deletes
// every row it inserted before exiting. Exit 0 on all-pass, 1 on first failure.

const path = require('path');
const Database = require('better-sqlite3');
const { MemoryRouter } = require('./router');

const tag = `router-test-${Date.now()}`;
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

const mem = new MemoryRouter();
const insertedIds = [];

// T1 — emit() basic
try {
  const r = mem.emit({ kind: 'test.start', agent: 'tester', feature: tag, status: 'running' });
  assert(r && typeof r.id === 'string' && r.id.length > 0, 'expected truthy id');
  assert(r && typeof r.ts === 'number' && r.ts > 0, 'expected truthy ts');
  assert(r && typeof r.seq === 'number' && r.seq > 0, 'expected truthy seq');
  insertedIds.push(r.id);
  record('T1 emit basic', true);
} catch (e) { record('T1 emit basic', false, e.message); }

// T2 — emit() rejects missing fields
try {
  let threw = false;
  try { mem.emit({ kind: 'x' }); } catch { threw = true; }
  assert(threw, 'expected emit({kind:"x"}) to throw (missing agent)');
  record('T2 emit rejects missing', true);
} catch (e) { record('T2 emit rejects missing', false, e.message); }

// T3 — emit() with payload object → query → asserted parsed back
try {
  const r = mem.emit({
    kind: 'test.payload', agent: 'tester', feature: tag,
    payload: { hello: 'world', n: 42 },
  });
  insertedIds.push(r.id);
  const rows = mem.query({ kind: 'test.payload', feature: tag, limit: 1 });
  assert(rows.length === 1, `expected 1 row, got ${rows.length}`);
  assert(rows[0].payload && typeof rows[0].payload === 'object', 'payload should be parsed object, not string');
  assert(rows[0].payload.hello === 'world', `payload.hello = ${rows[0].payload.hello}`);
  assert(rows[0].payload.n === 42, `payload.n = ${rows[0].payload.n}`);
  record('T3 emit payload roundtrip', true);
} catch (e) { record('T3 emit payload roundtrip', false, e.message); }

// T4 — emit x3 + query DESC
//   Under feature=tag we have: T1 (test.start) + T3 (test.payload) = 2.
//   T4 adds 3 more (test.bulk). Expect 5 total under tag, ordered DESC by ts.
try {
  for (let i = 0; i < 3; i++) {
    const r = mem.emit({ kind: 'test.bulk', agent: 'tester', feature: tag, status: `step-${i}` });
    insertedIds.push(r.id);
  }
  const rows = mem.query({ feature: tag });
  assert(rows.length === 5, `expected 5 rows under feature=${tag}, got ${rows.length}`);
  for (let i = 1; i < rows.length; i++) {
    assert(rows[i - 1].ts >= rows[i].ts, `expected DESC ts; row ${i - 1} ts=${rows[i - 1].ts} not >= row ${i} ts=${rows[i].ts}`);
  }
  record('T4 emit x3 + query DESC', true);
} catch (e) { record('T4 emit x3 + query DESC', false, e.message); }

// T5 — query filtering
try {
  const rows = mem.query({ agent: 'tester', kind: 'test.start', limit: 10 });
  assert(rows.length >= 1, `expected >=1 row, got ${rows.length}`);
  for (const r of rows) {
    assert(r.agent === 'tester', `expected agent=tester, got ${r.agent}`);
    assert(r.kind === 'test.start', `expected kind=test.start, got ${r.kind}`);
  }
  record('T5 query filtering', true);
} catch (e) { record('T5 query filtering', false, e.message); }

// T6 — setWorking + getWorking roundtrip with nested object
try {
  const value = { foo: 'bar', n: 42, nested: { a: 1 } };
  mem.setWorking('tester', 'currentTask', value);
  const got = mem.getWorking('tester', 'currentTask');
  assert(deepEqual(got, value), `deep-equal failed: got ${JSON.stringify(got)}`);
  record('T6 setWorking/getWorking roundtrip', true);
} catch (e) { record('T6 setWorking/getWorking roundtrip', false, e.message); }

// T7 — getWorking missing key returns null (not undefined, no throw)
try {
  const got = mem.getWorking('tester', 'nope-not-here');
  assert(got === null, `expected null, got ${JSON.stringify(got)}`);
  record('T7 getWorking missing → null', true);
} catch (e) { record('T7 getWorking missing → null', false, e.message); }

// T9 — query with sinceSeq filter (must run BEFORE T8's close)
try {
  // Insert 3, capture seqs.
  const firstThree = [];
  for (let i = 0; i < 3; i++) {
    firstThree.push(mem.emit({ kind: 'test.seq', agent: 'tester', feature: tag, status: `seq-${i}` }));
    insertedIds.push(firstThree[i].id);
  }
  // Insert 2 more — these are the ones we expect back from sinceSeq.
  const lastTwo = [];
  for (let i = 0; i < 2; i++) {
    lastTwo.push(mem.emit({ kind: 'test.seq', agent: 'tester', feature: tag, status: `seq-${i + 3}` }));
    insertedIds.push(lastTwo[i].id);
  }
  const cursorSeq = firstThree[2].seq; // seq of the 3rd insert
  const rows = mem.query({ feature: tag, sinceSeq: cursorSeq, order: 'seq ASC' });
  assert(rows.length === 2, `expected 2 rows after sinceSeq=${cursorSeq}, got ${rows.length}`);
  assert(rows[0].seq === lastTwo[0].seq, `[0].seq = ${rows[0].seq}, expected ${lastTwo[0].seq}`);
  assert(rows[1].seq === lastTwo[1].seq, `[1].seq = ${rows[1].seq}, expected ${lastTwo[1].seq}`);
  assert(rows[0].seq < rows[1].seq, `expected ASC seq ordering`);
  record('T9 query with sinceSeq', true);
} catch (e) { record('T9 query with sinceSeq', false, e.message); }

// T8 — close() and verify subsequent emit throws (per JSDoc'd contract)
try {
  mem.close();
  let threw = false;
  try { mem.emit({ kind: 'after.close', agent: 'tester' }); } catch { threw = true; }
  assert(threw, 'expected emit after close() to throw');
  record('T8 close + post-close throws', true);
} catch (e) { record('T8 close + post-close throws', false, e.message); }

// Cleanup — router has no DELETE API by design (additive-only contract on episodes).
// The harness reaches the dbs directly. This is test-only and OK.
try {
  const epDb = new Database(path.join(__dirname, 'db', 'episodes.db'));
  const wkDb = new Database(path.join(__dirname, 'db', 'working.db'));
  const epDel = epDb.prepare('DELETE FROM episodes WHERE feature = ?').run(tag);
  const wkDel = wkDb.prepare('DELETE FROM working_memory WHERE agent = ? AND key = ?').run('tester', 'currentTask');
  epDb.close(); wkDb.close();
  console.log(`[cleanup] deleted ${epDel.changes} episode rows under feature=${tag}`);
  console.log(`[cleanup] deleted ${wkDel.changes} working_memory rows for tester/currentTask`);
} catch (e) {
  console.error('[cleanup] failed:', e.message);
}

console.log('\n=== MEMORY ROUTER TESTS ===');
for (const r of results) {
  console.log(`${r.name.padEnd(36)}: ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ' — ' + r.detail}`);
}
const allPass = results.every((r) => r.ok);
if (allPass) {
  console.log('\nALL ROUTER TESTS PASSED');
  process.exit(0);
} else {
  console.log(`\nFAILED at ${firstFailure.name}: ${firstFailure.detail}`);
  process.exit(1);
}
