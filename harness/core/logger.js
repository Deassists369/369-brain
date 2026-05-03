// harness/core/logger.js
// Reusable run logger. Writes JSONL to intelligence/harness-runs/[harness-name].jsonl.
// Today JSONL. June 2026 swap to MongoDB collection — schema unchanged.
// Owner: Shon AJ | Brain: VEERABHADRA

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BRAIN_ROOT = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const RUNS_DIR = path.join(BRAIN_ROOT, 'intelligence', 'harness-runs');

function ensureRunsDir() {
  if (!fs.existsSync(RUNS_DIR)) {
    fs.mkdirSync(RUNS_DIR, { recursive: true });
  }
}

function runFile(harnessName) {
  ensureRunsDir();
  return path.join(RUNS_DIR, `${harnessName}.jsonl`);
}

function readAllRuns(harnessName) {
  const file = runFile(harnessName);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  return lines.map((line) => {
    try {
      return JSON.parse(line);
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}

function writeAllRuns(harnessName, runs) {
  const file = runFile(harnessName);
  const body = runs.map((r) => JSON.stringify(r)).join('\n') + (runs.length ? '\n' : '');
  fs.writeFileSync(file, body, 'utf8');
}

function newRunId() {
  return crypto.randomBytes(8).toString('hex');
}

// Start a new run. Returns the run object.
function startRun(harnessName, { feature, tenantId = null, meta = {} } = {}) {
  const run = {
    run_id: newRunId(),
    harness: harnessName,
    feature,
    tenant_id: tenantId,
    meta,
    started_at: new Date().toISOString(),
    completed_at: null,
    status: 'running',
    phases: [],
    approval_history: [],
    preview_path: null,
    error: null,
  };
  const runs = readAllRuns(harnessName);
  runs.push(run);
  writeAllRuns(harnessName, runs);
  return run;
}

// Get a single run by id.
function getRun(harnessName, runId) {
  const runs = readAllRuns(harnessName);
  return runs.find((r) => r.run_id === runId) || null;
}

// Update top-level fields on a run.
function updateRun(harnessName, runId, patch) {
  const runs = readAllRuns(harnessName);
  const idx = runs.findIndex((r) => r.run_id === runId);
  if (idx === -1) return null;
  runs[idx] = { ...runs[idx], ...patch };
  if (patch.status === 'complete' || patch.status === 'failed' || patch.status === 'rejected') {
    runs[idx].completed_at = runs[idx].completed_at || new Date().toISOString();
  }
  writeAllRuns(harnessName, runs);
  return runs[idx];
}

// Append a phase entry to the run's phases array.
function logPhase(harnessName, runId, { phase, status, detail = '' }) {
  const runs = readAllRuns(harnessName);
  const idx = runs.findIndex((r) => r.run_id === runId);
  if (idx === -1) return null;
  const entry = {
    phase,
    status,
    detail,
    timestamp: new Date().toISOString(),
  };
  runs[idx].phases.push(entry);
  writeAllRuns(harnessName, runs);
  return entry;
}

// Append an approval-history entry (approved / not approved / doubt).
function logApproval(harnessName, runId, { phrase, by = 'shon' }) {
  const runs = readAllRuns(harnessName);
  const idx = runs.findIndex((r) => r.run_id === runId);
  if (idx === -1) return null;
  const entry = {
    phrase,
    by,
    timestamp: new Date().toISOString(),
  };
  runs[idx].approval_history.push(entry);
  writeAllRuns(harnessName, runs);
  return entry;
}

// List runs for a harness, optionally filtered by status.
function listRuns(harnessName, { status = null } = {}) {
  const runs = readAllRuns(harnessName);
  if (!status) return runs;
  return runs.filter((r) => r.status === status);
}

module.exports = {
  startRun,
  updateRun,
  logPhase,
  logApproval,
  getRun,
  listRuns,
  RUNS_DIR,
};
