// harness/self-improvement/report-writer.js
// Writes the self-improvement analysis report to:
//   intelligence/proposed-fixes/[YYYY-MM-DD]-self-improvement-run-[NNN].md
//
// Pure function: given a normalized analysis object, returns the markdown string
// AND saves it to disk. Never modifies an existing report — refuses if the path
// already exists.
//
// Owner: Shon AJ | Brain: VEERABHADRA

const fs = require('fs');
const path = require('path');

const BRAIN_ROOT = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const REPORTS_DIR = path.join(BRAIN_ROOT, 'intelligence', 'proposed-fixes');

const REQUIRED_SECTIONS = Object.freeze([
  'DEEPENED UNDERSTANDING',
  'WRONG ASSUMPTIONS CORRECTED',
  'PATTERNS IDENTIFIED',
  'PROPOSED FIXES',
  'OPEN QUESTIONS FOR VEERABHADRA',
  'CHALLENGE FOR NEXT SESSION',
]);

function ensureReportsDir({ dir = REPORTS_DIR } = {}) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Format YYYY-MM-DD from a Date or ISO string.
function ymd(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Compute the next sequential run number for the given date by scanning REPORTS_DIR.
function nextRunNumber({ dir = REPORTS_DIR, date = new Date() } = {}) {
  ensureReportsDir({ dir });
  const prefix = `${ymd(date)}-self-improvement-run-`;
  const existing = fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.md'));
  if (existing.length === 0) return 1;
  const nums = existing
    .map((f) => f.slice(prefix.length, f.length - '.md'.length))
    .map((n) => parseInt(n, 10))
    .filter((n) => Number.isFinite(n));
  return Math.max(...nums) + 1;
}

function reportFilename({ runNumber, date = new Date() } = {}) {
  const n = String(runNumber).padStart(3, '0');
  return `${ymd(date)}-self-improvement-run-${n}.md`;
}

function reportPath({ runNumber, date = new Date(), dir = REPORTS_DIR } = {}) {
  return path.join(dir, reportFilename({ runNumber, date }));
}

// Validate the analysis object has the six required sections as arrays/strings.
function validateAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') {
    throw new Error('analysis must be an object');
  }
  const missing = [];
  if (!Array.isArray(analysis.deepenedUnderstanding)) missing.push('deepenedUnderstanding');
  if (!Array.isArray(analysis.wrongAssumptions)) missing.push('wrongAssumptions');
  if (!Array.isArray(analysis.patterns)) missing.push('patterns');
  if (!Array.isArray(analysis.proposedFixes)) missing.push('proposedFixes');
  if (!Array.isArray(analysis.openQuestions)) missing.push('openQuestions');
  if (typeof analysis.challenge !== 'string') missing.push('challenge');
  if (missing.length) {
    throw new Error(`analysis missing required fields: ${missing.join(', ')}`);
  }
}

// Render a list of strings as bullet items. Empty array → "(none)".
function renderBullets(items) {
  if (!items || items.length === 0) return '_(none)_';
  return items.map((s) => `- ${String(s).trim()}`).join('\n');
}

// Render proposed fixes — each fix has { title, category, severity, evidence,
// proposal, ticket }. Tolerant of missing optional fields.
function renderFixes(fixes) {
  if (!fixes || fixes.length === 0) return '_(none)_';
  return fixes.map((f, i) => {
    const lines = [];
    lines.push(`### Fix ${i + 1}. ${f.title || '(untitled)'}`);
    if (f.category) lines.push(`- **Category:** ${f.category}`);
    if (f.severity) lines.push(`- **Severity:** ${f.severity}`);
    if (f.evidence) lines.push(`- **Evidence:** ${f.evidence}`);
    if (f.proposal) lines.push(`- **Proposal:** ${f.proposal}`);
    if (f.ticket) lines.push(`- **Suggested ticket:** \`${f.ticket}\``);
    return lines.join('\n');
  }).join('\n\n');
}

// Render the evidence index — { runIds, sopFiles, ticketFiles }.
function renderEvidenceIndex(idx) {
  if (!idx) return '_(none)_';
  const parts = [];
  if (idx.runIds && idx.runIds.length) parts.push(`- harness-runs entries cited: ${idx.runIds.map((s) => `\`${s}\``).join(', ')}`);
  if (idx.sopFiles && idx.sopFiles.length) parts.push(`- SOP files cited: ${idx.sopFiles.map((s) => `\`${s}\``).join(', ')}`);
  if (idx.ticketFiles && idx.ticketFiles.length) parts.push(`- ticket files cited: ${idx.ticketFiles.map((s) => `\`${s}\``).join(', ')}`);
  if (parts.length === 0) return '_(none)_';
  return parts.join('\n');
}

// Build the complete markdown body. Pure function — no I/O.
function buildMarkdown({ runNumber, date = new Date(), runId, durationMs, inputs, analysis }) {
  validateAnalysis(analysis);
  const dateStr = ymd(date);
  const dur = typeof durationMs === 'number' ? `${(durationMs / 1000).toFixed(1)}s` : '—';
  const sopCount = (inputs && inputs.sops) ? inputs.sops.filter((s) => !s.missing).length : 0;
  const runsCount = (inputs && inputs.harnessRuns) ? inputs.harnessRuns.length : 0;
  const ticketsCount = (inputs && inputs.tickets)
    ? Object.values(inputs.tickets).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
    : 0;

  return [
    `# Self-Improvement Run ${String(runNumber).padStart(3, '0')} — ${dateStr}`,
    `# Harness: self-improvement-harness-v1`,
    `# Run ID: ${runId || '(unknown)'}`,
    `# Duration: ${dur}`,
    `# Inputs: ${sopCount} SOPs · ${runsCount} harness-run entries · ${ticketsCount} tickets`,
    '',
    '---',
    '',
    `## ${REQUIRED_SECTIONS[0]}`,
    '',
    renderBullets(analysis.deepenedUnderstanding),
    '',
    `## ${REQUIRED_SECTIONS[1]}`,
    '',
    renderBullets(analysis.wrongAssumptions),
    '',
    `## ${REQUIRED_SECTIONS[2]}`,
    '',
    renderBullets(analysis.patterns),
    '',
    `## ${REQUIRED_SECTIONS[3]}`,
    '',
    renderFixes(analysis.proposedFixes),
    '',
    `## ${REQUIRED_SECTIONS[4]}`,
    '',
    renderBullets(analysis.openQuestions),
    '',
    `## ${REQUIRED_SECTIONS[5]}`,
    '',
    String(analysis.challenge || '').trim() || '_(none)_',
    '',
    '## EVIDENCE INDEX',
    '',
    renderEvidenceIndex(analysis.evidenceIndex || {}),
    '',
  ].join('\n');
}

// Save the report to disk. Refuses if the target path already exists
// (no overwrites — the run number is supposed to be unique per day).
function saveReport({ runNumber, date = new Date(), runId, durationMs, inputs, analysis, dir = REPORTS_DIR }) {
  ensureReportsDir({ dir });
  const out = reportPath({ runNumber, date, dir });
  if (fs.existsSync(out)) {
    throw new Error(`refusing to overwrite existing report: ${out}`);
  }
  const body = buildMarkdown({ runNumber, date, runId, durationMs, inputs, analysis });
  fs.writeFileSync(out, body, 'utf8');
  return { path: out, bytes: Buffer.byteLength(body, 'utf8') };
}

module.exports = {
  REPORTS_DIR,
  REQUIRED_SECTIONS,
  ensureReportsDir,
  ymd,
  nextRunNumber,
  reportFilename,
  reportPath,
  validateAnalysis,
  buildMarkdown,
  saveReport,
};
