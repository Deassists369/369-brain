// harness/self-improvement/__tests__/learning-mind-writer.test.js
// node:test coverage for learning-mind-writer.js — append-only invariant,
// existing content byte-equal at top after every write.

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const lmw = require('../learning-mind-writer');

function tmpFile(contents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-test-'));
  const p = path.join(dir, 'LEARNING-MIND.md');
  fs.writeFileSync(p, contents, 'utf8');
  return { dir, path: p };
}

function rmDir(dir) {
  if (dir && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function validFields(overrides = {}) {
  return {
    deepenedUnderstanding: ['x is harder than expected'],
    wrongAssumptions: ['WRONG: foo. RIGHT: bar.'],
    patterns: ['retries cluster around stage pre-flight'],
    openQuestions: ['should the harness close its own ticket?'],
    challenge: 'prove run 001 fixes were adopted before letting run 002 propose more',
    ...overrides,
  };
}

describe('humanDate / sessionDate', () => {
  test('humanDate is upper-case', () => {
    assert.equal(lmw.humanDate(new Date('2026-05-03T00:00:00Z')), '3 MAY 2026');
  });

  test('sessionDate is title-case', () => {
    assert.equal(lmw.sessionDate(new Date('2026-05-03T00:00:00Z')), '3 May 2026');
  });
});

describe('validateFields', () => {
  test('passes valid object', () => {
    assert.doesNotThrow(() => lmw.validateFields(validFields()));
  });

  test('throws on missing array field', () => {
    const f = validFields();
    delete f.patterns;
    assert.throws(() => lmw.validateFields(f), /missing required keys/);
  });

  test('throws when challenge is not a string', () => {
    assert.throws(() => lmw.validateFields(validFields({ challenge: 42 })), /missing required keys/);
  });

  test('throws on null input', () => {
    assert.throws(() => lmw.validateFields(null), /must be an object/);
  });
});

describe('buildSection', () => {
  test('contains the dated heading and SESSION line', () => {
    const out = lmw.buildSection({
      runNumber: 1,
      date: new Date('2026-05-03T00:00:00Z'),
      fields: validFields(),
    });
    assert.match(out, /## LEARNING — 3 MAY 2026 — SELF-IMPROVEMENT RUN 001/);
    assert.match(out, /SESSION: 3 May 2026 — Self-improvement harness Run 001/);
  });

  test('contains all five field labels', () => {
    const out = lmw.buildSection({
      runNumber: 1,
      date: new Date('2026-05-03T00:00:00Z'),
      fields: validFields(),
    });
    for (const label of lmw.TEMPLATE_FIELDS) {
      assert.match(out, new RegExp(`${label}:`));
    }
  });

  test('appends Source line when sourcePath given', () => {
    const out = lmw.buildSection({
      runNumber: 1,
      date: new Date('2026-05-03T00:00:00Z'),
      fields: validFields(),
      sourcePath: 'intelligence/proposed-fixes/2026-05-03-self-improvement-run-001.md',
    });
    assert.match(out, /Source: intelligence\/proposed-fixes\/2026-05-03/);
  });

  test('starts with horizontal rule for visual separation from prior content', () => {
    const out = lmw.buildSection({
      runNumber: 1,
      date: new Date('2026-05-03T00:00:00Z'),
      fields: validFields(),
    });
    assert.match(out, /^\n---\n/);
  });
});

describe('appendSection — invariants', () => {
  test('throws when LEARNING-MIND.md does not exist', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-missing-'));
    const fakePath = path.join(dir, 'nope.md');
    assert.throws(() => lmw.appendSection({
      runNumber: 1,
      fields: validFields(),
      target: fakePath,
    }), /not found/);
    rmDir(dir);
  });

  test('previous content is byte-equal at the top of the file after append', () => {
    const original = '# LEARNING MIND\n\n## existing entry\nbody\n';
    const { dir, path: p } = tmpFile(original);
    lmw.appendSection({
      runNumber: 1,
      date: new Date('2026-05-03T00:00:00Z'),
      fields: validFields(),
      target: p,
    });
    const after = fs.readFileSync(p, 'utf8');
    assert.equal(after.startsWith(original), true,
      'existing content must remain byte-equal at top after append');
    rmDir(dir);
  });

  test('handles file that does not end with newline (prepends one)', () => {
    const original = 'no trailing newline';
    const { dir, path: p } = tmpFile(original);
    lmw.appendSection({
      runNumber: 2,
      date: new Date('2026-05-03T00:00:00Z'),
      fields: validFields(),
      target: p,
    });
    const after = fs.readFileSync(p, 'utf8');
    assert.equal(after.startsWith(original + '\n'), true);
    assert.match(after, /## LEARNING — 3 MAY 2026/);
    rmDir(dir);
  });

  test('two appends produce two distinct sections, both preserving original', () => {
    const original = '# LM\n\nbase content\n';
    const { dir, path: p } = tmpFile(original);
    lmw.appendSection({ runNumber: 1, date: new Date('2026-05-03T00:00:00Z'), fields: validFields(), target: p });
    lmw.appendSection({ runNumber: 2, date: new Date('2026-05-04T00:00:00Z'), fields: validFields(), target: p });
    const after = fs.readFileSync(p, 'utf8');
    assert.equal(after.startsWith(original), true);
    assert.match(after, /SELF-IMPROVEMENT RUN 001/);
    assert.match(after, /SELF-IMPROVEMENT RUN 002/);
    rmDir(dir);
  });

  test('returns appendedBytes and previousBytes counters', () => {
    const original = 'base\n';
    const { dir, path: p } = tmpFile(original);
    const result = lmw.appendSection({
      runNumber: 1,
      date: new Date('2026-05-03T00:00:00Z'),
      fields: validFields(),
      target: p,
    });
    assert.equal(result.path, p);
    assert.equal(result.previousBytes, Buffer.byteLength(original, 'utf8'));
    assert.ok(result.appendedBytes > 100);
    rmDir(dir);
  });
});
