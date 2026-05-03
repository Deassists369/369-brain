// harness/self-improvement/__tests__/inputs.test.js
// node:test coverage for inputs.js — readers must be pure, must not write,
// and must handle empty / missing / malformed inputs gracefully.

const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const inputs = require('../inputs');

// Build an isolated brain root in tmpdir for each describe block.
function makeFakeBrain() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-test-'));
  fs.mkdirSync(path.join(root, 'intelligence', 'harness-runs'), { recursive: true });
  fs.mkdirSync(path.join(root, 'tickets', 'open'), { recursive: true });
  fs.mkdirSync(path.join(root, 'tickets', 'waiting'), { recursive: true });
  fs.mkdirSync(path.join(root, 'tickets', 'awaiting-approval'), { recursive: true });
  fs.mkdirSync(path.join(root, 'tickets', 'complete'), { recursive: true });
  fs.mkdirSync(path.join(root, 'harness'), { recursive: true });
  fs.mkdirSync(path.join(root, 'project'), { recursive: true });
  return root;
}

function rmFakeBrain(root) {
  if (root && fs.existsSync(root)) fs.rmSync(root, { recursive: true, force: true });
}

describe('SOP_FILES constant', () => {
  test('lists exactly the five locked SOP filenames', () => {
    assert.equal(inputs.SOP_FILES.length, 5);
    assert.deepEqual([...inputs.SOP_FILES], [
      'AGENTS.md',
      'CLAUDE.md',
      'CODING-CONSTITUTION.md',
      'HOOKS.md',
      'THE-DEASSISTS-OS.md',
    ]);
  });

  test('is frozen — cannot be mutated at runtime', () => {
    assert.throws(() => { inputs.SOP_FILES.push('VEERABHADRA.md'); });
  });
});

describe('readSops', () => {
  let root;
  before(() => {
    root = makeFakeBrain();
    fs.writeFileSync(path.join(root, 'AGENTS.md'), '# agents');
    fs.writeFileSync(path.join(root, 'CLAUDE.md'), '# claude\nbody');
    fs.writeFileSync(path.join(root, 'CODING-CONSTITUTION.md'), '# rules');
    fs.writeFileSync(path.join(root, 'HOOKS.md'), '# hooks');
    fs.writeFileSync(path.join(root, 'THE-DEASSISTS-OS.md'), '# os');
  });
  after(() => rmFakeBrain(root));

  test('returns five entries when all SOPs present', () => {
    const result = inputs.readSops({ root });
    assert.equal(result.length, 5);
    assert.equal(result.every((s) => s.missing === false), true);
  });

  test('flags missing files as missing:true with empty content', () => {
    const partial = makeFakeBrain();
    fs.writeFileSync(path.join(partial, 'AGENTS.md'), '# agents');
    fs.writeFileSync(path.join(partial, 'CLAUDE.md'), '# claude');
    // HOOKS.md, CODING-CONSTITUTION.md, THE-DEASSISTS-OS.md missing
    const result = inputs.readSops({ root: partial });
    const missing = result.filter((s) => s.missing);
    assert.equal(missing.length, 3);
    assert.equal(missing.every((s) => s.content === ''), true);
    assert.equal(missing.every((s) => s.bytes === 0), true);
    rmFakeBrain(partial);
  });

  test('reports byte counts for present files', () => {
    const result = inputs.readSops({ root });
    const claude = result.find((s) => s.name === 'CLAUDE.md');
    assert.equal(claude.bytes, Buffer.byteLength('# claude\nbody', 'utf8'));
    assert.equal(claude.content, '# claude\nbody');
  });
});

describe('readHarnessRuns', () => {
  let root;
  before(() => {
    root = makeFakeBrain();
    const runs = [
      { run_id: 'a', started_at: '2026-05-01T10:00:00Z', status: 'complete' },
      { run_id: 'b', started_at: '2026-05-03T09:00:00Z', status: 'failed' },
      { run_id: 'c', started_at: '2026-05-02T12:00:00Z', status: 'complete' },
    ];
    const body = runs.map((r) => JSON.stringify(r)).join('\n') + '\n';
    fs.writeFileSync(path.join(root, 'intelligence', 'harness-runs', 'eagle-harness.jsonl'), body);
  });
  after(() => rmFakeBrain(root));

  test('returns empty array when log file missing', () => {
    const empty = makeFakeBrain();
    const result = inputs.readHarnessRuns({ root: empty });
    assert.deepEqual(result, []);
    rmFakeBrain(empty);
  });

  test('parses JSONL and sorts ascending by started_at', () => {
    const result = inputs.readHarnessRuns({ root });
    assert.equal(result.length, 3);
    assert.deepEqual(result.map((r) => r.run_id), ['a', 'c', 'b']);
  });

  test('respects the limit option (returns most recent N)', () => {
    const result = inputs.readHarnessRuns({ root, limit: 2 });
    assert.equal(result.length, 2);
    assert.deepEqual(result.map((r) => r.run_id), ['c', 'b']);
  });

  test('skips malformed JSON lines silently', () => {
    const broken = makeFakeBrain();
    const body = [
      JSON.stringify({ run_id: 'x', started_at: '2026-05-01T10:00:00Z' }),
      'this is not json',
      JSON.stringify({ run_id: 'y', started_at: '2026-05-02T10:00:00Z' }),
      '',
    ].join('\n');
    fs.writeFileSync(path.join(broken, 'intelligence', 'harness-runs', 'eagle-harness.jsonl'), body);
    const result = inputs.readHarnessRuns({ root: broken });
    assert.equal(result.length, 2);
    rmFakeBrain(broken);
  });
});

describe('readTickets', () => {
  let root;
  before(() => {
    root = makeFakeBrain();
    fs.writeFileSync(path.join(root, 'tickets', 'open', 'one.md'), 'open ticket one');
    fs.writeFileSync(path.join(root, 'tickets', 'open', 'two.md'), 'open ticket two');
    fs.writeFileSync(path.join(root, 'tickets', 'waiting', 'three.md'), 'waiting');
    fs.writeFileSync(path.join(root, 'tickets', 'awaiting-approval', 'four.md'), 'await');
    fs.writeFileSync(path.join(root, 'tickets', 'complete', 'five.md'), 'complete');
    // Non-md file should be ignored.
    fs.writeFileSync(path.join(root, 'tickets', 'open', 'note.txt'), 'ignore me');
  });
  after(() => rmFakeBrain(root));

  test('returns four buckets with the right counts', () => {
    const result = inputs.readTickets({ root });
    assert.equal(result.open.length, 2);
    assert.equal(result.waiting.length, 1);
    assert.equal(result.awaitingApproval.length, 1);
    assert.equal(result.complete.length, 1);
  });

  test('skips non-.md files', () => {
    const result = inputs.readTickets({ root });
    assert.equal(result.open.find((t) => t.name === 'note.txt'), undefined);
  });

  test('returns empty arrays when ticket dirs missing', () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-empty-'));
    const result = inputs.readTickets({ root: empty });
    assert.deepEqual(result, { open: [], waiting: [], awaitingApproval: [], complete: [] });
    fs.rmSync(empty, { recursive: true, force: true });
  });
});

describe('readCodebaseSummary', () => {
  let root;
  before(() => {
    root = makeFakeBrain();
    fs.writeFileSync(path.join(root, 'harness', 'a.js'), 'console.log("a");');
    fs.writeFileSync(path.join(root, 'harness', 'b.js'), 'console.log("b");');
    fs.mkdirSync(path.join(root, 'harness', 'sub'), { recursive: true });
    fs.writeFileSync(path.join(root, 'harness', 'sub', 'c.js'), 'console.log("c");');
    fs.writeFileSync(path.join(root, 'harness', 'image.png'), 'fakebinary');  // skipped
    fs.writeFileSync(path.join(root, 'project', 'note.md'), 'note');
  });
  after(() => rmFakeBrain(root));

  test('returns directory entries with file counts and totals', () => {
    const result = inputs.readCodebaseSummary({ root, dirs: ['harness', 'project'] });
    const harness = result.dirs.find((d) => d.dir === 'harness');
    assert.equal(harness.fileCount, 3);  // png is skipped
    const proj = result.dirs.find((d) => d.dir === 'project');
    assert.equal(proj.fileCount, 1);
  });

  test('skips dot-files and binary extensions', () => {
    const result = inputs.readCodebaseSummary({ root, dirs: ['harness'] });
    const harness = result.dirs.find((d) => d.dir === 'harness');
    assert.equal(harness.files.find((f) => f.rel.endsWith('.png')), undefined);
  });

  test('skips dirs that do not exist', () => {
    const result = inputs.readCodebaseSummary({ root, dirs: ['nonexistent', 'harness'] });
    assert.equal(result.dirs.length, 1);
    assert.equal(result.dirs[0].dir, 'harness');
  });
});

describe('gatherInputs', () => {
  let root;
  before(() => {
    root = makeFakeBrain();
    for (const f of inputs.SOP_FILES) {
      fs.writeFileSync(path.join(root, f), `# ${f}`);
    }
  });
  after(() => rmFakeBrain(root));

  test('not blocked when all SOPs present', () => {
    const result = inputs.gatherInputs({ root });
    assert.equal(result.blocked, false);
    assert.equal(result.blockedReason, null);
  });

  test('blocked when any SOP missing', () => {
    const partial = makeFakeBrain();
    fs.writeFileSync(path.join(partial, 'CLAUDE.md'), '# claude');
    const result = inputs.gatherInputs({ root: partial });
    assert.equal(result.blocked, true);
    assert.match(result.blockedReason, /Missing SOP files:/);
    rmFakeBrain(partial);
  });

  test('returns all four input streams', () => {
    const result = inputs.gatherInputs({ root });
    assert.ok(Array.isArray(result.sops));
    assert.ok(Array.isArray(result.harnessRuns));
    assert.ok(typeof result.tickets === 'object');
    assert.ok(typeof result.codebase === 'object');
  });
});
