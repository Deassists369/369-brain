// harness/core/patcher.js
// Patch contract for Mode 3 (and any future code-mutation stage):
//   Inner Claude emits a unified diff between PATCH_START / PATCH_END markers.
//   The harness extracts it, validates every path against allow-list and
//   NEVER-TOUCH list, runs `git apply --check`, then applies for real.
//   Inner Claude never gets Write/Edit permission.
//
// Owner: Shon AJ | Brain: VEERABHADRA

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PATCH_START_MARKER = '<<<PATCH_START>>>';
const PATCH_END_MARKER = '<<<PATCH_END>>>';

// Constitution NEVER-TOUCH list — substring matches against patch paths.
// Source of truth: 369-brain/CODING-CONSTITUTION.md  Rule A7.
// Keep this list in sync. Any path in a patch containing one of these substrings is rejected.
const NEVER_TOUCH_SUBSTRINGS = [
  // Portal repo
  'apps/cms-next/pages/universitiesd/',
  'apps/backend-nest/src/core/entities/extendables/payment.entity.ts',
  'apps/mui-cms-next/',
  'MASTER-RUN.cjs',
  'scope.guard.ts',
  'package.json',
  'pnpm-lock.yaml',
  '.env',
  // Brain repo
  'archive/',
  'code-snapshot/',
  'graphify-out/',
];

function extractPatchBetweenMarkers(text) {
  const start = text.indexOf(PATCH_START_MARKER);
  if (start === -1) return null;
  const after = start + PATCH_START_MARKER.length;
  const end = text.indexOf(PATCH_END_MARKER, after);
  if (end === -1) return null;
  // Trim leading/trailing whitespace but keep internal structure exactly.
  const body = text.slice(after, end).replace(/^\s*\n/, '').replace(/\n\s*$/, '\n');
  return body.length ? body : null;
}

// Pulls every path mentioned in a unified diff. Looks at:
//   diff --git a/X b/Y
//   --- a/X      (or --- /dev/null for new files)
//   +++ b/Y      (or +++ /dev/null for deletions)
function parsePatchPaths(patchText) {
  const paths = new Set();
  const lines = patchText.split('\n');
  for (const line of lines) {
    let m = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (m) {
      paths.add(m[1]);
      paths.add(m[2]);
      continue;
    }
    m = line.match(/^---\s+a\/(.+)$/);
    if (m) { paths.add(m[1]); continue; }
    m = line.match(/^\+\+\+\s+b\/(.+)$/);
    if (m) { paths.add(m[1]); continue; }
  }
  return Array.from(paths);
}

// Validate a patch against allow-list and NEVER-TOUCH list.
// allowedPaths: array of repo-relative paths the stage permits.
// Returns { ok, paths, violations: { neverTouch: [], outOfScope: [] } }.
function validatePatch(patchText, { allowedPaths = [] } = {}) {
  const paths = parsePatchPaths(patchText);
  const neverTouch = paths.filter((p) =>
    NEVER_TOUCH_SUBSTRINGS.some((s) => p.includes(s)),
  );
  const allowedSet = new Set(allowedPaths);
  const outOfScope = paths.filter((p) => !allowedSet.has(p));
  return {
    ok: neverTouch.length === 0 && outOfScope.length === 0,
    paths,
    violations: { neverTouch, outOfScope },
  };
}

function writePatchToTempFile(patchText) {
  const file = path.join(os.tmpdir(), `harness-patch-${Date.now()}-${Math.random().toString(36).slice(2)}.patch`);
  fs.writeFileSync(file, patchText, 'utf8');
  return file;
}

// Run `git apply` (with optional --check) at repoPath. Returns { ok, stderr }.
function applyPatch(repoPath, patchText, { check = false } = {}) {
  const file = writePatchToTempFile(patchText);
  try {
    const flags = ['--whitespace=nowarn'];
    if (check) flags.unshift('--check');
    const cmd = `cd ${repoPath} && git apply ${flags.join(' ')} ${file}`;
    execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, stderr: '', patchFile: file };
  } catch (e) {
    return { ok: false, stderr: String(e.stderr || e.stdout || e.message || e), patchFile: file };
  }
}

// Returns the porcelain `git status` output for a repo. Used as a post-apply guard:
// the harness checks that ONLY allowed paths appear modified.
function gitStatusPorcelain(repoPath) {
  try {
    return execSync(`cd ${repoPath} && git status --porcelain`, { encoding: 'utf8' });
  } catch (e) {
    return '';
  }
}

// Parse porcelain output → array of repo-relative paths that have ANY change
// (modified, added, deleted, untracked). Used to confirm only stage-scoped files moved.
function parsePorcelainPaths(porcelain) {
  return porcelain
    .split('\n')
    .map((l) => l.replace(/^.{2}\s+/, '').trim())
    .filter(Boolean);
}

// Revert a patch — used on rejection or post-apply guard failure.
function revertPatch(repoPath, patchText) {
  const file = writePatchToTempFile(patchText);
  try {
    execSync(`cd ${repoPath} && git apply -R --whitespace=nowarn ${file}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, stderr: String(e.stderr || e.stdout || e.message || e) };
  }
}

module.exports = {
  PATCH_START_MARKER,
  PATCH_END_MARKER,
  NEVER_TOUCH_SUBSTRINGS,
  extractPatchBetweenMarkers,
  parsePatchPaths,
  validatePatch,
  applyPatch,
  revertPatch,
  gitStatusPorcelain,
  parsePorcelainPaths,
};
