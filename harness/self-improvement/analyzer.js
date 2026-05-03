// harness/self-improvement/analyzer.js
// Builds the structured prompt for the self-improvement analysis run, invokes
// Claude headless once, and parses the JSON response between fixed markers.
// Returns a validated `{ deepenedUnderstanding, wrongAssumptions, patterns,
// proposedFixes, openQuestions, challenge, evidenceIndex }` object.
//
// Owner: Shon AJ | Brain: VEERABHADRA

const { spawnSync } = require('child_process');

// Headless Claude invocation. Same env-var hooks as harness/eagle/eagle-harness.js.
const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude';
const CLAUDE_HEADLESS_FLAG = process.env.CLAUDE_HEADLESS_FLAG || '-p';

// Marker contract for the analyzer's JSON output. Distinct from the eagle-harness
// HTML markers so output streams don't collide if both are tee'd into one log.
const JSON_START_MARKER = '<<<ANALYSIS_JSON_START>>>';
const JSON_END_MARKER = '<<<ANALYSIS_JSON_END>>>';

const PROMPT_TIMEOUT_MS = 5 * 60 * 1000; // 5 min hard cap on the analyzer call.
const MAX_PROMPT_BYTES = 200 * 1024;     // 200 KB ceiling — keeps token cost bounded.

// Render a compact summary of one harness run for the prompt.
function summarizeRun(run) {
  const phases = Array.isArray(run.phases) ? run.phases : [];
  const phaseSummary = phases.map((p) => `${p.phase}:${p.status}`).join(' → ');
  return [
    `- run_id=${run.run_id} feature=${run.feature || '?'} status=${run.status || '?'}`,
    `  started=${run.started_at} completed=${run.completed_at || '—'}`,
    `  phases: ${phaseSummary || '(none)'}`,
    run.error ? `  error: ${String(run.error).slice(0, 200)}` : null,
  ].filter(Boolean).join('\n');
}

// Render a compact summary of one ticket file (path + first 600 chars of body).
function summarizeTicket(ticket) {
  const head = String(ticket.content || '').slice(0, 600);
  return `- bucket=${ticket.bucket} name=${ticket.name} bytes=${ticket.bytes}\n${head.split('\n').map((l) => `    ${l}`).join('\n')}`;
}

// Render a compact summary of the codebase walk (no file contents).
function summarizeCodebase(codebase) {
  if (!codebase || !Array.isArray(codebase.dirs)) return '(no codebase summary)';
  return codebase.dirs.map((d) => `- ${d.dir}/  files=${d.fileCount}  bytes=${d.totalBytes}`).join('\n');
}

// Build the full prompt body. Pure function. Does not exceed MAX_PROMPT_BYTES;
// truncates SOP content if necessary, preferring CLAUDE.md and CODING-CONSTITUTION.md.
function buildPrompt({ inputs, runNumber }) {
  const sops = (inputs.sops || []).filter((s) => !s.missing);
  const ticketBuckets = inputs.tickets || {};
  const allTickets = []
    .concat(ticketBuckets.open || [])
    .concat(ticketBuckets.waiting || [])
    .concat(ticketBuckets.awaitingApproval || [])
    .concat(ticketBuckets.complete || []);

  const sopBlocks = sops.map((s) => `### SOP — ${s.name} (${s.bytes} bytes)\n\n${s.content}\n`).join('\n---\n');
  const runsBlocks = (inputs.harnessRuns || []).map(summarizeRun).join('\n\n');
  const ticketBlocks = allTickets.map(summarizeTicket).join('\n\n');
  const codebaseBlock = summarizeCodebase(inputs.codebase);

  const header = [
    `# Self-Improvement Analysis Run ${String(runNumber).padStart(3, '0')}`,
    '',
    'You are analyzing the DeAssists brain to find what to learn from recent harness runs,',
    'what patterns are emerging, and what concrete fixes (skill rules, source-file edits, or',
    'new patterns) would prevent recurring problems.',
    '',
    'You will be given:',
    '  1. Five SOP files (the canonical brain rules).',
    '  2. The full eagle-harness JSONL log (every run, every phase).',
    '  3. The current ticket queue (open, waiting, awaiting-approval, complete).',
    '  4. A high-level codebase summary (directory + file counts; no file content).',
    '',
    'Output JSON between these exact markers — nothing else outside:',
    JSON_START_MARKER,
    '{ ...analysis JSON object... }',
    JSON_END_MARKER,
    '',
    'Required JSON shape:',
    '{',
    '  "deepenedUnderstanding": [string, ...],',
    '  "wrongAssumptions":      [string, ...],',
    '  "patterns":              [string, ...],',
    '  "proposedFixes": [',
    '    { "title": string, "category": "skill rule"|"source file"|"new pattern",',
    '      "severity": "LOW"|"MED"|"HIGH",',
    '      "evidence": string, "proposal": string, "ticket": string }, ...',
    '  ],',
    '  "openQuestions":         [string, ...],',
    '  "challenge":             string,',
    '  "evidenceIndex": { "runIds": [string], "sopFiles": [string], "ticketFiles": [string] }',
    '}',
    '',
    'Be concrete. Cite specific run_ids, file paths, and ticket names in evidence fields.',
    'If you have nothing to say in a section, return an empty array (or empty string for challenge).',
    '',
    '---',
    '',
  ].join('\n');

  const bodySections = [
    '## SOP FILES',
    '',
    sopBlocks || '(none read)',
    '',
    '---',
    '',
    '## EAGLE HARNESS RUNS',
    '',
    runsBlocks || '(none yet)',
    '',
    '---',
    '',
    '## TICKET QUEUE',
    '',
    ticketBlocks || '(none)',
    '',
    '---',
    '',
    '## CODEBASE SUMMARY',
    '',
    codebaseBlock,
    '',
    '---',
    '',
    'Return the analysis JSON now, between the markers.',
  ];

  let prompt = header + bodySections.join('\n');
  if (Buffer.byteLength(prompt, 'utf8') > MAX_PROMPT_BYTES) {
    // Truncate SOP content to fit. Prefer keeping CLAUDE.md + CODING-CONSTITUTION.md.
    const truncated = truncateSopBlocks(sops, MAX_PROMPT_BYTES, header.length + 4096);
    prompt = header + truncated + bodySections.slice(2).join('\n');
  }
  return prompt;
}

// Reduce SOP content size while preserving CLAUDE.md and CODING-CONSTITUTION.md.
function truncateSopBlocks(sops, maxBytes, reservedBytes) {
  const budget = Math.max(maxBytes - reservedBytes, 8 * 1024);
  const perFile = Math.floor(budget / sops.length);
  return sops.map((s) => {
    const head = s.content.slice(0, perFile);
    const tag = s.content.length > perFile ? `\n…(truncated ${s.content.length - perFile} chars)` : '';
    return `### SOP — ${s.name} (${s.bytes} bytes)\n\n${head}${tag}\n`;
  }).join('\n---\n') + '\n\n---\n\n## EAGLE HARNESS RUNS\n\n';
}

// Extract JSON between markers from arbitrary stdout. Returns the parsed object.
// Throws with a clear error if markers absent, JSON malformed, or required fields missing.
function extractAnalysis(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('analyzer received empty stdout');
  }
  const start = rawText.indexOf(JSON_START_MARKER);
  if (start === -1) throw new Error('analyzer output missing JSON_START_MARKER');
  const after = start + JSON_START_MARKER.length;
  const end = rawText.indexOf(JSON_END_MARKER, after);
  if (end === -1) throw new Error('analyzer output missing JSON_END_MARKER');
  const jsonText = rawText.slice(after, end).trim();
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    throw new Error(`analyzer JSON parse failed: ${e.message}`);
  }
  return validateShape(parsed);
}

function validateShape(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('analysis must be an object');
  const out = {
    deepenedUnderstanding: Array.isArray(obj.deepenedUnderstanding) ? obj.deepenedUnderstanding : [],
    wrongAssumptions: Array.isArray(obj.wrongAssumptions) ? obj.wrongAssumptions : [],
    patterns: Array.isArray(obj.patterns) ? obj.patterns : [],
    proposedFixes: Array.isArray(obj.proposedFixes) ? obj.proposedFixes : [],
    openQuestions: Array.isArray(obj.openQuestions) ? obj.openQuestions : [],
    challenge: typeof obj.challenge === 'string' ? obj.challenge : '',
    evidenceIndex: obj.evidenceIndex && typeof obj.evidenceIndex === 'object' ? {
      runIds: Array.isArray(obj.evidenceIndex.runIds) ? obj.evidenceIndex.runIds : [],
      sopFiles: Array.isArray(obj.evidenceIndex.sopFiles) ? obj.evidenceIndex.sopFiles : [],
      ticketFiles: Array.isArray(obj.evidenceIndex.ticketFiles) ? obj.evidenceIndex.ticketFiles : [],
    } : { runIds: [], sopFiles: [], ticketFiles: [] },
  };
  return out;
}

// Invoke Claude headless with the given prompt. Returns the raw stdout.
function invokeAnalyzer({ prompt, claudeBin = CLAUDE_BIN, headlessFlag = CLAUDE_HEADLESS_FLAG, timeoutMs = PROMPT_TIMEOUT_MS } = {}) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('invokeAnalyzer requires a string prompt');
  }
  const result = spawnSync(claudeBin, [headlessFlag, prompt], {
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 16 * 1024 * 1024, // 16 MB
  });
  if (result.error) {
    throw new Error(`claude invocation failed: ${result.error.message}`);
  }
  if (typeof result.status === 'number' && result.status !== 0) {
    const stderr = (result.stderr || '').toString().slice(0, 500);
    throw new Error(`claude exited ${result.status}: ${stderr}`);
  }
  return result.stdout || '';
}

// One-shot: build prompt → invoke → extract → validate. Used by the harness in
// non-dry-run mode.
function runAnalysis({ inputs, runNumber, claudeBin, headlessFlag, timeoutMs } = {}) {
  const prompt = buildPrompt({ inputs, runNumber });
  const stdout = invokeAnalyzer({ prompt, claudeBin, headlessFlag, timeoutMs });
  const analysis = extractAnalysis(stdout);
  return { prompt, stdout, analysis };
}

module.exports = {
  CLAUDE_BIN,
  CLAUDE_HEADLESS_FLAG,
  JSON_START_MARKER,
  JSON_END_MARKER,
  PROMPT_TIMEOUT_MS,
  MAX_PROMPT_BYTES,
  buildPrompt,
  extractAnalysis,
  validateShape,
  invokeAnalyzer,
  runAnalysis,
};
