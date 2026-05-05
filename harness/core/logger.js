// harness/core/logger.js
// Reusable run logger. Writes JSONL to intelligence/harness-runs/[harness-name].jsonl.
// Today JSONL. June 2026 swap to MongoDB collection — schema unchanged.
// Owner: Shon AJ | Brain: VEERABHADRA

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BRAIN_ROOT = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const RUNS_DIR = path.join(BRAIN_ROOT, 'intelligence', 'harness-runs');

// ---------- Step 4A: lazy router/bus singletons (eagle dual-write) ----------
// Logger is shared by multiple harnesses (eagle, self-improvement). Only
// eagle dual-writes through MemoryRouter + EventBus today; self-improvement
// will be wired in Step 4C. The `_isEagle` gate keeps the surface narrow.
let _memSingleton = null;
let _busSingleton = null;
function _mem() {
  if (!_memSingleton) {
    const { MemoryRouter } = require('../../memory/router');
    _memSingleton = new MemoryRouter();
  }
  return _memSingleton;
}
function _bus() {
  if (!_busSingleton) {
    const { EventBus } = require('../../memory/event-bus');
    _busSingleton = new EventBus();
  }
  return _busSingleton;
}
function _safeEmitEpisode(payload) {
  try { _mem().emit(payload); }
  catch (e) {
    console.error('[logger] mem.emit failed (JSONL still succeeded):',
      e && e.message ? e.message : e);
  }
}
function _safeEmitBus(topic, publisher, payload) {
  try { _bus().emit(topic, publisher, payload); }
  catch (e) {
    console.error('[logger] bus.emit failed:',
      e && e.message ? e.message : e);
  }
}
// Step 4C: dispatcher replaces the old _isEagle gate. Maps harness name →
// agent name. Logger dual-writes only for harnesses listed here.
const HARNESS_AGENTS = {
  'eagle-harness': 'eagle',
  'self-improvement-harness': 'self-improvement',
};
function _harnessAgent(harnessName) {
  return HARNESS_AGENTS[harnessName] || null;
}

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

  const agentStart = _harnessAgent(harnessName);
  if (agentStart) {
    _safeEmitEpisode({
      kind: `${agentStart}.run.started`,
      agent: agentStart,
      run_id: run.run_id,
      feature: run.feature,
      status: 'running',
      summary: `Run started for feature ${run.feature}`,
      payload: run,
    });
    _safeEmitBus(`${agentStart}.run.started`, agentStart, {
      run_id: run.run_id,
      feature: run.feature,
    });
  }

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

  const agentUpd = _harnessAgent(harnessName);
  if (agentUpd) {
    const updatedRun = runs[idx];
    const newStatus = patch.status || updatedRun.status;
    _safeEmitEpisode({
      kind: `${agentUpd}.run.${newStatus}`,
      agent: agentUpd,
      run_id: updatedRun.run_id,
      feature: updatedRun.feature,
      status: newStatus,
      summary: `Run ${newStatus}${patch.error ? `: ${patch.error}` : ''}`,
      payload: patch,
    });
    _safeEmitBus(`${agentUpd}.run.${newStatus}`, agentUpd, {
      run_id: updatedRun.run_id,
      feature: updatedRun.feature,
      status: newStatus,
      meta: patch.meta || null,
    });
  }

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

  const agentPh = _harnessAgent(harnessName);
  if (agentPh) {
    const run = runs[idx];
    _safeEmitEpisode({
      kind: `${agentPh}.phase.${status}`,
      agent: agentPh,
      run_id: run.run_id,
      feature: run.feature,
      status,
      summary: `Phase ${phase} ${status}`,
      payload: entry,
    });
    if (status === 'failed') {
      _safeEmitBus(`${agentPh}.phase.failed`, agentPh, {
        run_id: run.run_id,
        feature: run.feature,
        phase,
        detail,
      });
    }
  }

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

  const agentAp = _harnessAgent(harnessName);
  if (agentAp) {
    const run = runs[idx];
    const phraseStr = phrase || '';
    const isReject = /^not\s+approved/i.test(phraseStr);
    const gateMatch = phraseStr.match(/^(?:not\s+)?approved\s+(mode1|mode2|stage)/i);
    const gate = gateMatch ? gateMatch[1].toLowerCase() : 'unknown';
    const status = isReject ? 'rejected' : 'approved';
    _safeEmitEpisode({
      kind: `${agentAp}.approval.${gate}`,
      agent: agentAp,
      run_id: run.run_id,
      feature: run.feature,
      status,
      summary: `${gate} ${status} by ${by}`,
      payload: entry,
    });
    _safeEmitBus(`${agentAp}.approval.${gate}`, agentAp, {
      run_id: run.run_id,
      feature: run.feature,
      gate,
      status,
      by,
    });
  }

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

// Test-mode hooks — ABSENT in production exports. Gate prevents accidental
// production access to the singleton internals. Used by Step 4D's cross-agent
// integration test to force logger.js and guardian-bridge.js to share the
// SAME bus + mem instance so eagle's emit triggers guardian's in-process
// subscriber within a single Node process. In production these are different
// processes and the in-memory subscriber path is not the cross-process channel
// (event_log + a future poller would be) — see B-007.
if (process.env.LOGGER_TEST_MODE === '1') {
  module.exports._mem = _mem;
  module.exports._bus = _bus;
  module.exports._setMemSingleton = (m) => { _memSingleton = m; };
  module.exports._setBusSingleton = (b) => { _busSingleton = b; };
}
