// harness/self-improvement/__tests__/report-writer.test.js
// node:test coverage for report-writer.js — markdown shape, validation,
// no-overwrite contract, sequential numbering.

const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const writer = require('../report-writer');

function tmpReportsDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'reports-test-'));
}

function rm(dir) {
  if (dir && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function validAnalysis(overrides = {}) {
  return {
    deepenedUnderstanding: ['foo', 'bar'],
    wrongAssumptions: ['was wrong'],
    patterns: ['pattern A'],
    proposedFixes: [{ title: 'f1', category: 'skill rule', severity: 'LOW' }],
    openQuestions: ['q1?'],
    challenge: 'next time check X first',
    evidenceIndex: { runIds: ['abc'], sopFiles: ['CLAUDE.md'] },
    ...overrides,
  };
}

describe('REQUIRED_SECTIONS constant', () => {
  test('lists all six analysis sections', () => {
    assert.equal(writer.REQUIRED_SECTIONS.length, 6);
    assert.ok(writer.REQUIRED_SECTIONS.includes('PROPOSED FIXES'));
    assert.ok(writer.REQUIRED_SECTIONS.includes('CHALLENGE FOR NEXT SESSION'));
  });
});

describe('ymd', () => {
  test('formats a Date as YYYY-MM-DD in UTC', () => {
    assert.equal(writer.ymd(new Date('2026-05-03T22:14:00Z')), '2026-05-03');
  });

  test('accepts ISO string', () => {
    assert.equal(writer.ymd('2026-12-31T23:59:59Z'), '2026-12-31');
  });
});

describe('reportFilename', () => {
  test('zero-pads run number to 3 digits', () => {
    const f = writer.reportFilename({ runNumber: 1, date: new Date('2026-05-03T00:00:00Z') });
    assert.equal(f, '2026-05-03-self-improvement-run-001.md');
  });

  test('handles run numbers > 99', () => {
    const f = writer.reportFilename({ runNumber: 142, date: new Date('2026-05-03T00:00:00Z') });
    assert.equal(f, '2026-05-03-self-improvement-run-142.md');
  });
});

describe('nextRunNumber', () => {
  let dir;
  before(() => { dir = tmpReportsDir(); });
  after(() => rm(dir));

  test('returns 1 for an empty directory', () => {
    const n = writer.nextRunNumber({ dir, date: new Date('2026-05-03T00:00:00Z') });
    assert.equal(n, 1);
  });

  test('returns max+1 when prior runs exist for the date', () => {
    fs.writeFileSync(path.join(dir, '2026-05-03-self-improvement-run-001.md'), 'r1');
    fs.writeFileSync(path.join(dir, '2026-05-03-self-improvement-run-002.md'), 'r2');
    fs.writeFileSync(path.join(dir, '2026-05-03-self-improvement-run-005.md'), 'r5');
    const n = writer.nextRunNumber({ dir, date: new Date('2026-05-03T00:00:00Z') });
    assert.equal(n, 6);
  });

  test('ignores reports for other dates', () => {
    const n = writer.nextRunNumber({ dir, date: new Date('2026-05-04T00:00:00Z') });
    assert.equal(n, 1);
  });
});

describe('validateAnalysis', () => {
  test('passes a valid analysis object', () => {
    assert.doesNotThrow(() => writer.validateAnalysis(validAnalysis()));
  });

  test('throws on missing field', () => {
    const a = validAnalysis();
    delete a.patterns;
    assert.throws(() => writer.validateAnalysis(a), /missing required fields/);
  });

  test('throws when challenge is not a string', () => {
    const a = validAnalysis({ challenge: ['bad'] });
    assert.throws(() => writer.validateAnalysis(a), /missing required fields/);
  });

  test('throws on non-object input', () => {
    assert.throws(() => writer.validateAnalysis(null), /must be an object/);
    assert.throws(() => writer.validateAnalysis('string'), /must be an object/);
  });
});

describe('buildMarkdown', () => {
  test('contains all six required section headings', () => {
    const md = writer.buildMarkdown({
      runNumber: 1,
      date: new Date('2026-05-03T22:14:00Z'),
      runId: 'abc123',
      durationMs: 47000,
      inputs: { sops: Array(5).fill({ missing: false }), harnessRuns: [], tickets: { open: [], waiting: [], awaitingApproval: [], complete: [] } },
      analysis: validAnalysis(),
    });
    for (const heading of writer.REQUIRED_SECTIONS) {
      assert.match(md, new RegExp(`## ${heading}`));
    }
    assert.match(md, /## EVIDENCE INDEX/);
  });

  test('includes runId and duration in header', () => {
    const md = writer.buildMarkdown({
      runNumber: 1,
      date: new Date('2026-05-03T22:14:00Z'),
      runId: 'XYZ',
      durationMs: 5000,
      inputs: { sops: [], harnessRuns: [], tickets: {} },
      analysis: validAnalysis(),
    });
    assert.match(md, /Run ID: XYZ/);
    assert.match(md, /Duration: 5\.0s/);
  });

  test('renders "(none)" for empty bullet sections', () => {
    const md = writer.buildMarkdown({
      runNumber: 1,
      date: new Date('2026-05-03T22:14:00Z'),
      runId: 'r',
      durationMs: 1000,
      inputs: { sops: [], harnessRuns: [], tickets: {} },
      analysis: validAnalysis({ patterns: [], openQuestions: [] }),
    });
    assert.match(md, /## PATTERNS IDENTIFIED\n\n_\(none\)_/);
  });

  test('renders fix entries with category, severity, evidence', () => {
    const md = writer.buildMarkdown({
      runNumber: 1,
      date: new Date('2026-05-03T22:14:00Z'),
      runId: 'r',
      durationMs: 1000,
      inputs: { sops: [], harnessRuns: [], tickets: {} },
      analysis: validAnalysis({
        proposedFixes: [
          { title: 'add stash hint', category: 'skill rule', severity: 'LOW', evidence: 'phase X', proposal: 'add line to EAGLESKILL', ticket: 'eagleskill-stash' },
        ],
      }),
    });
    assert.match(md, /Fix 1\. add stash hint/);
    assert.match(md, /Category:\*\* skill rule/);
    assert.match(md, /Severity:\*\* LOW/);
    assert.match(md, /eagleskill-stash/);
  });
});

describe('saveReport', () => {
  let dir;
  before(() => { dir = tmpReportsDir(); });
  after(() => rm(dir));

  test('writes the file and returns path + bytes', () => {
    const result = writer.saveReport({
      runNumber: 1,
      date: new Date('2026-05-03T00:00:00Z'),
      runId: 'r',
      durationMs: 1000,
      inputs: { sops: [], harnessRuns: [], tickets: {} },
      analysis: validAnalysis(),
      dir,
    });
    assert.ok(result.path.endsWith('2026-05-03-self-improvement-run-001.md'));
    assert.ok(result.bytes > 100);
    assert.ok(fs.existsSync(result.path));
  });

  test('refuses to overwrite an existing report', () => {
    assert.throws(() => writer.saveReport({
      runNumber: 1,
      date: new Date('2026-05-03T00:00:00Z'),
      runId: 'r',
      durationMs: 1000,
      inputs: { sops: [], harnessRuns: [], tickets: {} },
      analysis: validAnalysis(),
      dir,
    }), /refusing to overwrite/);
  });
});
