// harness/self-improvement/inputs.js
// Pure input readers for the self-improvement harness.
// Reads five SOP files, the eagle-harness JSONL log, ticket queue files,
// and a high-level codebase summary. Returns plain JS objects only —
// no LLM calls, no writes, no side effects beyond reading the filesystem.
//
// Owner: Shon AJ | Brain: VEERABHADRA

const fs = require('fs');
const path = require('path');

const BRAIN_ROOT = path.join(process.env.HOME, 'deassists-workspace', '369-brain');

// Five SOP files at brain root. Locked in Mode 1.
const SOP_FILES = Object.freeze([
  'AGENTS.md',
  'CLAUDE.md',
  'CODING-CONSTITUTION.md',
  'HOOKS.md',
  'THE-DEASSISTS-OS.md',
]);

// Subdirectories the codebase summary walks.
const CODEBASE_DIRS = Object.freeze([
  'harness',
  'project',
  'skills',
  'intelligence',
  'patterns',
  'commands',
  'agents',
]);

// Files we never include in codebase summaries (binary or noisy).
const SUMMARY_SKIP_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.lock']);

function brainPath(...parts) {
  return path.join(BRAIN_ROOT, ...parts);
}

// Read all five SOP files. If any are missing, the entry is { name, missing: true }.
function readSops({ root = BRAIN_ROOT } = {}) {
  return SOP_FILES.map((name) => {
    const full = path.join(root, name);
    if (!fs.existsSync(full)) {
      return { name, path: full, missing: true, bytes: 0, content: '' };
    }
    const content = fs.readFileSync(full, 'utf8');
    return {
      name,
      path: full,
      missing: false,
      bytes: Buffer.byteLength(content, 'utf8'),
      content,
    };
  });
}

// Read all entries from intelligence/harness-runs/eagle-harness.jsonl.
// Returns array of run objects sorted ascending by started_at.
// limit caps to the most recent N entries (after sort). Default: no limit.
function readHarnessRuns({ root = BRAIN_ROOT, limit = null } = {}) {
  const file = path.join(root, 'intelligence', 'harness-runs', 'eagle-harness.jsonl');
  if (!fs.existsSync(file)) return [];

  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const parsed = [];
  for (const line of lines) {
    try {
      parsed.push(JSON.parse(line));
    } catch (e) {
      // Skip malformed lines silently — analyzer will note count drift if any.
    }
  }
  parsed.sort((a, b) => String(a.started_at).localeCompare(String(b.started_at)));
  if (limit && parsed.length > limit) {
    return parsed.slice(parsed.length - limit);
  }
  return parsed;
}

// Read the ticket queue across open / waiting / awaiting-approval / complete buckets.
// Returns { open: [...], waiting: [...], awaitingApproval: [...], complete: [...] }
// Each entry: { name, path, bucket, bytes, content }.
function readTickets({ root = BRAIN_ROOT } = {}) {
  const buckets = {
    open: 'open',
    waiting: 'waiting',
    awaitingApproval: 'awaiting-approval',
    complete: 'complete',
  };
  const out = { open: [], waiting: [], awaitingApproval: [], complete: [] };
  for (const [key, dir] of Object.entries(buckets)) {
    const full = path.join(root, 'tickets', dir);
    if (!fs.existsSync(full)) continue;
    const entries = fs.readdirSync(full, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!e.name.endsWith('.md')) continue;
      const filePath = path.join(full, e.name);
      const content = fs.readFileSync(filePath, 'utf8');
      out[key].push({
        name: e.name,
        path: filePath,
        bucket: dir,
        bytes: Buffer.byteLength(content, 'utf8'),
        content,
      });
    }
  }
  return out;
}

// Walk a small set of brain subdirectories and return a structural summary.
// Returns { root, dirs: [{ dir, files: [{ rel, bytes }], totalBytes, fileCount }] }
// Does NOT include file contents — keeps prompt size bounded.
function readCodebaseSummary({ root = BRAIN_ROOT, dirs = CODEBASE_DIRS } = {}) {
  const result = { root, dirs: [] };
  for (const d of dirs) {
    const full = path.join(root, d);
    if (!fs.existsSync(full)) continue;
    const files = [];
    walk(full, full, files);
    const totalBytes = files.reduce((s, f) => s + f.bytes, 0);
    result.dirs.push({
      dir: d,
      files,
      totalBytes,
      fileCount: files.length,
    });
  }
  return result;
}

function walk(rootDir, currentDir, out) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(currentDir, e.name);
    if (e.isDirectory()) {
      walk(rootDir, full, out);
      continue;
    }
    if (!e.isFile()) continue;
    const ext = path.extname(e.name).toLowerCase();
    if (SUMMARY_SKIP_EXT.has(ext)) continue;
    let bytes = 0;
    try {
      bytes = fs.statSync(full).size;
    } catch (err) {
      continue;
    }
    out.push({
      rel: path.relative(rootDir, full),
      bytes,
    });
  }
}

// Gather all four input streams and return a single bundle.
// blocked is true if any SOP file is missing (Tier-1 contract).
function gatherInputs({ root = BRAIN_ROOT, runsLimit = null } = {}) {
  const sops = readSops({ root });
  const blocked = sops.some((s) => s.missing);
  return {
    sops,
    harnessRuns: readHarnessRuns({ root, limit: runsLimit }),
    tickets: readTickets({ root }),
    codebase: readCodebaseSummary({ root }),
    blocked,
    blockedReason: blocked
      ? `Missing SOP files: ${sops.filter((s) => s.missing).map((s) => s.name).join(', ')}`
      : null,
  };
}

module.exports = {
  BRAIN_ROOT,
  SOP_FILES,
  CODEBASE_DIRS,
  brainPath,
  readSops,
  readHarnessRuns,
  readTickets,
  readCodebaseSummary,
  gatherInputs,
};
