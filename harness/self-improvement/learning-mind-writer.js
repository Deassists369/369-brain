// harness/self-improvement/learning-mind-writer.js
// Appends one new dated section to intelligence/LEARNING-MIND.md.
// Strictly append-only: uses fs.appendFile, never reads-then-writes the whole file.
// Existing content must remain byte-equal at the top after every write.
//
// Owner: Shon AJ | Brain: VEERABHADRA

const fs = require('fs');
const path = require('path');

const BRAIN_ROOT = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const LEARNING_MIND_PATH = path.join(BRAIN_ROOT, 'intelligence', 'LEARNING-MIND.md');

// Same six fields as the existing LEARNING-MIND template at the top of that file.
const TEMPLATE_FIELDS = Object.freeze([
  'DEEPENED UNDERSTANDING',
  'WRONG ASSUMPTIONS CORRECTED',
  'PATTERNS IDENTIFIED',
  'OPEN QUESTIONS',
  'CHALLENGE FOR NEXT SESSION',
]);

// Format a date as "3 May 2026" for the section heading.
function humanDate(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Format a date as "3 May 2026" (mixed case for inline session-line use).
function sessionDate(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Validate the fields object has all six required template fields.
// deepenedUnderstanding / wrongAssumptions / patterns / openQuestions: arrays of strings
// challenge: string
function validateFields(fields) {
  if (!fields || typeof fields !== 'object') {
    throw new Error('fields must be an object');
  }
  const missing = [];
  if (!Array.isArray(fields.deepenedUnderstanding)) missing.push('deepenedUnderstanding');
  if (!Array.isArray(fields.wrongAssumptions)) missing.push('wrongAssumptions');
  if (!Array.isArray(fields.patterns)) missing.push('patterns');
  if (!Array.isArray(fields.openQuestions)) missing.push('openQuestions');
  if (typeof fields.challenge !== 'string') missing.push('challenge');
  if (missing.length) {
    throw new Error(`fields missing required keys: ${missing.join(', ')}`);
  }
}

// Indent each line of a multi-line string by two spaces. Used for the
// existing LEARNING-MIND visual style (entries are indented under their heading).
function indentLines(items) {
  if (!items || items.length === 0) return '  _(none)_';
  return items.map((s) => {
    const trimmed = String(s).trim();
    return trimmed.split('\n').map((line, idx) => (idx === 0 ? `  ${line}` : `  ${line}`)).join('\n');
  }).join('\n\n');
}

// Build the markdown section body. Pure function.
function buildSection({ runNumber, date = new Date(), fields, sourcePath }) {
  validateFields(fields);
  const headingDate = humanDate(date);
  const sessionLine = `${sessionDate(date)} — Self-improvement harness Run ${String(runNumber).padStart(3, '0')}`;

  const lines = [
    '',
    '---',
    '',
    `## LEARNING — ${headingDate} — SELF-IMPROVEMENT RUN ${String(runNumber).padStart(3, '0')}`,
    '',
    `SESSION: ${sessionLine}`,
    'DEEPENED UNDERSTANDING:',
    indentLines(fields.deepenedUnderstanding),
    '',
    'WRONG ASSUMPTIONS CORRECTED:',
    indentLines(fields.wrongAssumptions),
    '',
    'PATTERNS IDENTIFIED:',
    indentLines(fields.patterns),
    '',
    'OPEN QUESTIONS:',
    indentLines(fields.openQuestions),
    '',
    'CHALLENGE FOR NEXT SESSION:',
    indentLines([fields.challenge]),
    '',
  ];

  if (sourcePath) {
    lines.push(`Source: ${sourcePath}`);
    lines.push('');
  }
  return lines.join('\n');
}

// Append the section to LEARNING-MIND.md. If the existing file does not end
// in a newline, prepend one to ensure clean separation. Uses fs.appendFileSync
// so the previous file content is byte-equal at the top.
function appendSection({ runNumber, date = new Date(), fields, sourcePath, target = LEARNING_MIND_PATH }) {
  if (!fs.existsSync(target)) {
    throw new Error(`LEARNING-MIND.md not found at: ${target}`);
  }
  const existing = fs.readFileSync(target, 'utf8');
  const needsNewline = !existing.endsWith('\n');
  const body = buildSection({ runNumber, date, fields, sourcePath });
  const toAppend = (needsNewline ? '\n' : '') + body;
  fs.appendFileSync(target, toAppend, 'utf8');
  return {
    path: target,
    appendedBytes: Buffer.byteLength(toAppend, 'utf8'),
    previousBytes: Buffer.byteLength(existing, 'utf8'),
  };
}

module.exports = {
  LEARNING_MIND_PATH,
  TEMPLATE_FIELDS,
  humanDate,
  sessionDate,
  validateFields,
  indentLines,
  buildSection,
  appendSection,
};
