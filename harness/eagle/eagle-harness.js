// harness/eagle/eagle-harness.js
// EAGLE-specific orchestration. Reads tickets, runs existing slash commands
// in sequence, pauses at approval gates, logs every phase.
//
// Architecture:
//   The harness OWNS sequence and state. It does NOT own rules or commands.
//   Rules live in CODING-CONSTITUTION.md.
//   Commands live in ~/.claude/369/commands/ and are invoked headless.
//
// Owner: Shon AJ | Brain: VEERABHADRA

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const logger = require('../core/logger');
const workspace = require('../core/workspace');
const orchestrator = require('../core/orchestrator');
const patcher = require('../core/patcher');

const HARNESS_NAME = 'eagle-harness';
const BRAIN_ROOT = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const PORTAL_ROOT = path.join(process.env.HOME, 'deassists');
const PREVIEWS_DIR = path.join(BRAIN_ROOT, 'previews');

// Mode 3 stage registry — keyed by ticket name. Defines, per stage:
//   repo            : absolute path of the git repo the patch targets
//   allowed_paths   : repo-relative paths the patch may touch (everything else rejected)
//   context_files   : repo-relative files whose current contents are included in the prompt
//   commit_msg      : commit message string the patch should be tied to (Latha/Shon commits manually)
//
// TODO: future improvement — Mode 2 should emit this stage list as JSON between
// markers so the harness reads it from the run instead of a hardcoded registry.
// Tracking ticket: harness-eagle-stage-marker-contract-followups.
const MODE3_STAGES = {
  'sidebar-restructure': [
    {
      name: 's1-sidemenu',
      title: 'Stage 1 — sidemenu.ts six-edit refactor',
      repo: PORTAL_ROOT,
      repo_label: 'portal (~/deassists)',
      allowed_paths: ['libs/shared/models/sidemenu.ts'],
      context_files: ['libs/shared/models/sidemenu.ts'],
      commit_msg:
        'refactor(sidemenu): restructure CRM tree, gate Service Setup leaves, document AGENT scope — EAGLE sidebar-restructure',
    },
    {
      name: 's2-feature-registry',
      title: 'Stage 2 — append sidebar-split-internal-student row to feature-registry.md',
      repo: BRAIN_ROOT,
      repo_label: 'brain (~/deassists-workspace/369-brain)',
      allowed_paths: ['project/feature-registry.md'],
      context_files: ['project/feature-registry.md'],
      commit_msg:
        'brain: queue sidebar-split-internal-student feature ticket — EAGLE sidebar-restructure follow-up',
    },
  ],
  'harness-eagle-stage-marker-contract': [
    {
      name: 'mode3-s1-patcher-tests',
      title: 'Stage 1 — add node:test coverage for patcher and eagle-harness',
      description: 'Add node:test coverage for patcher and eagle-harness',
      repo: BRAIN_ROOT,
      repo_label: 'brain (~/deassists-workspace/369-brain)',
      allowedPaths: [
        'harness/__tests__/patcher.test.js',
        'harness/__tests__/eagle-harness.test.js',
      ],
      allowed_paths: [
        'harness/__tests__/patcher.test.js',
        'harness/__tests__/eagle-harness.test.js',
        'harness/__tests__/',
      ],
      context_files: ['harness/core/patcher.js', 'harness/eagle/eagle-harness.js'],
      commit_msg:
        'test(harness): add node:test coverage for marker, patch, and porcelain helpers — EAGLE harness-eagle-stage-marker-contract S1',
    },
    {
      name: 'mode3-s2-constitution-parser',
      title: 'Stage 2 — replace hardcoded NEVER_TOUCH_SUBSTRINGS with lazy A7 parser',
      description: 'Replace hardcoded NEVER_TOUCH_SUBSTRINGS with lazy A7 parser',
      repo: BRAIN_ROOT,
      repo_label: 'brain (~/deassists-workspace/369-brain)',
      allowedPaths: ['harness/core/patcher.js'],
      allowed_paths: [
        'harness/core/patcher.js',
      ],
      context_files: ['harness/core/patcher.js', 'CODING-CONSTITUTION.md'],
      commit_msg:
        'refactor(harness): parse NEVER-TOUCH list from CODING-CONSTITUTION A7 — EAGLE harness-eagle-stage-marker-contract S2',
    },
  ],
};

// Headless Claude invocation. Override with env CLAUDE_BIN / CLAUDE_HEADLESS_FLAG if needed.
const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude';
const CLAUDE_HEADLESS_FLAG = process.env.CLAUDE_HEADLESS_FLAG || '-p';

// Mode 2 stdout-marker contract. The inner Claude emits the HTML preview between
// these exact markers; the harness extracts and writes the file itself. This avoids
// the headless permission-prompt deadlock for the Write tool in Mode 2.
const HTML_START_MARKER = '<<<HTML_PREVIEW_START>>>';
const HTML_END_MARKER = '<<<HTML_PREVIEW_END>>>';

function extractHtmlBetweenMarkers(text) {
  const start = text.indexOf(HTML_START_MARKER);
  if (start === -1) return null;
  const after = start + HTML_START_MARKER.length;
  const end = text.indexOf(HTML_END_MARKER, after);
  if (end === -1) return null;
  const body = text.slice(after, end).trim();
  return body.length ? body : null;
}

// ---------- internal helpers ----------

function tsLog(runId, msg) {
  const line = `[${new Date().toISOString()}] [${HARNESS_NAME}] [${runId}] ${msg}`;
  console.log(line);
}

function makePhaseLogger(runId) {
  return (msg) => tsLog(runId, msg);
}

// Run a slash command headless. Returns stdout. Throws on non-zero exit.
function runSlashCommand(slashCommand, extraContext = '') {
  const prompt = extraContext
    ? `${slashCommand}\n\n${extraContext}`
    : slashCommand;
  // -p makes Claude print and exit. We pass the prompt via stdin to avoid quoting issues.
  const cmd = `${CLAUDE_BIN} ${CLAUDE_HEADLESS_FLAG}`;
  const out = execSync(cmd, {
    input: prompt,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 30 * 60 * 1000,
  });
  return out;
}

function recordPhase(runId, phase, status, detail) {
  logger.logPhase(HARNESS_NAME, runId, { phase, status, detail });
}

// ---------- public API ----------

// Start a fresh run for a ticket sitting in tickets/open/[name].md.
// Runs phases: data-check → eagle-mode1. Pauses for Shon's Mode 1 approval.
async function startTicket(ticketName) {
  const body = workspace.readTicket(ticketName, 'open');
  if (!body) {
    throw new Error(`Ticket not found in tickets/open: ${ticketName}`);
  }

  const run = logger.startRun(HARNESS_NAME, { feature: ticketName });
  const log = makePhaseLogger(run.run_id);
  log(`Starting EAGLE run for ticket "${ticketName}"`);

  const ticketContext = `TICKET: ${ticketName}\n\n${body}`;

  // Phase: data-check
  try {
    log('Phase: /data-check');
    recordPhase(run.run_id, 'data-check', 'running');
    const out = runSlashCommand('/data-check', ticketContext);
    workspace.savePhaseOutput(ticketName, 'data-check', out);
    recordPhase(run.run_id, 'data-check', 'complete', 'output saved');
    log('Phase: /data-check complete');

    // Block on STATE 3
    if (/STATE\s*3/.test(out) || /BLOCKED/.test(out)) {
      log('Data state 3 detected — blocking ticket');
      logger.updateRun(HARNESS_NAME, run.run_id, { status: 'blocked' });
      recordPhase(run.run_id, 'data-check', 'blocked', 'STATE 3 — Latha task required first');
      return { runId: run.run_id, status: 'blocked' };
    }
  } catch (e) {
    recordPhase(run.run_id, 'data-check', 'failed', String(e.message || e));
    logger.updateRun(HARNESS_NAME, run.run_id, { status: 'failed', error: String(e.message || e) });
    throw e;
  }

  // Phase: eagle-mode1
  try {
    log('Phase: /eagle-mode1');
    recordPhase(run.run_id, 'eagle-mode1', 'running');
    const out = runSlashCommand('/eagle-mode1', ticketContext);
    workspace.savePhaseOutput(ticketName, 'eagle-mode1', out);
    recordPhase(run.run_id, 'eagle-mode1', 'complete', 'gap report saved');
    log('Phase: /eagle-mode1 complete — awaiting Mode 1 review');
  } catch (e) {
    recordPhase(run.run_id, 'eagle-mode1', 'failed', String(e.message || e));
    logger.updateRun(HARNESS_NAME, run.run_id, { status: 'failed', error: String(e.message || e) });
    throw e;
  }

  logger.updateRun(HARNESS_NAME, run.run_id, {
    status: 'awaiting-approval',
    meta: { ...(run.meta || {}), awaiting: 'mode1-review' },
  });

  return { runId: run.run_id, status: 'awaiting-approval', awaiting: 'mode1-review' };
}

// Called when Shon types: approved mode1 <ticket>
// Runs eagle-mode2, saves preview, moves ticket to awaiting-approval.
async function approveMode1(runId) {
  const run = logger.getRun(HARNESS_NAME, runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  const ticketName = run.feature;
  const log = makePhaseLogger(runId);

  logger.logApproval(HARNESS_NAME, runId, { phrase: `approved mode1 ${ticketName}` });

  const previewAbsPath = workspace.previewPath(ticketName);

  // Mode 2 prompt: stdout-marker contract. Inner Claude prints the spec freely,
  // then emits the FULL HTML preview between exact markers on their own lines.
  // The harness extracts the HTML and writes the file — inner Claude does NOT
  // call the Write tool (avoids the headless permission-prompt deadlock).
  const mode2Instruction = [
    `TICKET: ${ticketName}`,
    '',
    workspace.readTicket(ticketName, 'open') || '',
    '',
    'CRITICAL — HTML PREVIEW CONTRACT',
    'Do NOT use the Write tool. Do NOT save to any file. The harness will save the file.',
    '',
    'After you finish the spec, emit the FULL standalone HTML preview between these',
    'EXACT markers, each on its own line, with NO other text between the markers:',
    '',
    `${HTML_START_MARKER}`,
    '<!doctype html>',
    '<html>...full HTML document, complete and self-contained...</html>',
    `${HTML_END_MARKER}`,
    '',
    'The HTML must be a complete standalone document that opens in any browser.',
    'Inline all CSS. No external assets. No script tags fetching remote resources.',
    `The harness will write it to: ${previewAbsPath}`,
  ].join('\n');

  try {
    log('Phase: /eagle-mode2');
    recordPhase(runId, 'eagle-mode2', 'running');
    const out = runSlashCommand('/eagle-mode2', mode2Instruction);
    workspace.savePhaseOutput(ticketName, 'eagle-mode2', out);

    const html = extractHtmlBetweenMarkers(out);
    if (!html) {
      const detail = `HTML markers ${HTML_START_MARKER} / ${HTML_END_MARKER} not found in Mode 2 stdout`;
      recordPhase(runId, 'eagle-mode2', 'failed', detail);
      logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: detail });
      throw new Error(detail);
    }
    workspace.savePreview(ticketName, html);
    log(`Wrote ${html.length} bytes of HTML preview`);

    if (!workspace.previewExists(ticketName)) {
      const detail = `Preview missing at ${previewAbsPath} after savePreview()`;
      recordPhase(runId, 'eagle-mode2', 'failed', detail);
      logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: detail });
      throw new Error(detail);
    }

    workspace.moveTicket(ticketName, 'open', 'awaiting-approval');
    logger.updateRun(HARNESS_NAME, runId, {
      status: 'awaiting-approval',
      preview_path: previewAbsPath,
      error: null,
      meta: { ...(run.meta || {}), awaiting: 'mode2-approval' },
    });
    recordPhase(runId, 'eagle-mode2', 'complete', `preview saved: ${previewAbsPath} (${html.length} bytes)`);
    log(`Phase: /eagle-mode2 complete — preview at ${previewAbsPath}`);
    return { runId, status: 'awaiting-approval', awaiting: 'mode2-approval', previewPath: previewAbsPath };
  } catch (e) {
    const msg = String(e.message || '');
    if (!msg.startsWith('HTML markers') && !msg.startsWith('Preview missing')) {
      recordPhase(runId, 'eagle-mode2', 'failed', msg);
      logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: msg });
    }
    throw e;
  }
}

// ---------- Mode 3 stage execution (Option A — per-stage marker contract) ----------

function readContextFiles(repo, files) {
  const out = [];
  for (const rel of files) {
    const abs = path.join(repo, rel);
    if (!fs.existsSync(abs)) {
      out.push(`# ${rel}\n# (does not exist yet)\n`);
      continue;
    }
    const body = fs.readFileSync(abs, 'utf8');
    out.push(`# ${rel}\n\`\`\`\n${body}\n\`\`\`\n`);
  }
  return out.join('\n');
}

function buildStagePrompt(ticketName, ticketBody, mode2SpecText, stage) {
  const fileContext = readContextFiles(stage.repo, stage.context_files);
  const stageSpecificInstructions =
    ticketName === 'harness-eagle-stage-marker-contract' && stage.name === 'mode3-s1-patcher-tests'
      ? [
          '',
          'IMPORTANT: Only create these two files and nothing else:',
          'harness/__tests__/patcher.test.js',
          'harness/__tests__/eagle-harness.test.js',
          'Do NOT touch mission-control-index.html or any other file.',
        ]
      : [];

  return [
    `TICKET: ${ticketName}`,
    `STAGE: ${stage.title}`,
    `REPO: ${stage.repo_label}`,
    `ALLOWED PATHS (no other path may appear in the patch):`,
    ...stage.allowed_paths.map((p) => `  - ${p}`),
    '',
    'CRITICAL — PATCH CONTRACT (Option A · per-stage marker contract)',
    'Do NOT use the Write or Edit tool. Do NOT create files. Do NOT run git commands.',
    'The harness will apply your patch via `git apply` after validation.',
    '',
    'Emit a SINGLE unified diff between these EXACT markers, each on its own line:',
    '',
    `${patcher.PATCH_START_MARKER}`,
    'diff --git a/<repo-relative-path> b/<repo-relative-path>',
    'index 0000000..0000000 100644',
    '--- a/<repo-relative-path>',
    '+++ b/<repo-relative-path>',
    '@@ -<line>,<count> +<line>,<count> @@',
    ' context line',
    '-removed line',
    '+added line',
    `${patcher.PATCH_END_MARKER}`,
    '',
    'Rules:',
    '  - Repo-relative paths only (no leading `~`, no absolute paths).',
    '  - The patch must apply cleanly with `git apply` from the repo root.',
    '  - Touch ONLY the allowed paths above. Anything else aborts the stage.',
    ...stageSpecificInstructions,
    '  - Constitution NEVER-TOUCH list applies — never patch a NEVER-TOUCH file.',
    '  - If you cannot produce a valid patch, emit `STAGE_REFUSE: <reason>` ',
    '    instead of the markers and the harness will halt the run cleanly.',
    '',
    '---',
    '',
    'TICKET BODY:',
    '',
    ticketBody,
    '',
    '---',
    '',
    'MODE 2 SPEC (already approved by Shon — implement THIS spec, not the eagle-mode3 generic shape):',
    '',
    mode2SpecText,
    '',
    '---',
    '',
    'CURRENT FILE CONTENT(S) FOR THIS STAGE — your patch must apply against these exact bytes:',
    '',
    fileContext,
  ].join('\n');
}

// Execute a single Mode 3 stage end-to-end:
//   1. Headless `claude -p` with stage-scoped prompt
//   2. Extract patch between markers
//   3. Validate patch paths (allow-list + NEVER-TOUCH)
//   4. `git apply --check` then `git apply`
//   5. Post-apply guard: `git status --porcelain` must contain ONLY allowed paths
// Returns { ok, stage, patchPath } or throws on failure (logs + halts run).
async function runMode3Stage(runId, stageIndex) {
  const run = logger.getRun(HARNESS_NAME, runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  const ticketName = run.feature;
  const stages = MODE3_STAGES[ticketName];
  if (!stages) {
    throw new Error(`No Mode 3 stage registry entry for ticket "${ticketName}". Add an entry to MODE3_STAGES.`);
  }
  const stage = stages[stageIndex];
  if (!stage) throw new Error(`Stage index out of range: ${stageIndex} of ${stages.length}`);

  const log = makePhaseLogger(runId);
  const phaseName = `mode3-${stage.name}`;
  log(`${stage.title} — repo: ${stage.repo_label}`);

  // Pre-flight: staged paths must currently be unmodified — else we cannot tell what the patch did.
  const preStatus = patcher.gitStatusPorcelain(stage.repo);
  const preTouched = patcher.parsePorcelainPaths(preStatus).filter((p) => stage.allowed_paths.includes(p));
  if (preTouched.length) {
    const detail = `Pre-flight: allowed paths already modified before stage: ${preTouched.join(', ')}. Aborting.`;
    recordPhase(runId, phaseName, 'failed', detail);
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: detail });
    throw new Error(detail);
  }

  // Compose prompt
  const ticketBody = workspace.readTicket(ticketName, 'awaiting-approval') || workspace.readTicket(ticketName, 'open') || '';
  const mode2SpecPath = path.join(BRAIN_ROOT, 'intelligence', 'harness-runs', 'output', ticketName, 'eagle-mode2.txt');
  const mode2Spec = fs.existsSync(mode2SpecPath) ? fs.readFileSync(mode2SpecPath, 'utf8') : '(Mode 2 spec output not found)';
  const prompt = buildStagePrompt(ticketName, ticketBody, mode2Spec, stage);

  recordPhase(runId, phaseName, 'running', `repo=${stage.repo_label}, allowed=${stage.allowed_paths.join(',')}`);

  let stdout;
  try {
    stdout = runSlashCommand('/eagle-mode3', prompt);
    workspace.savePhaseOutput(ticketName, phaseName, stdout);
  } catch (e) {
    const detail = `headless claude failed: ${e.message || e}`;
    recordPhase(runId, phaseName, 'failed', detail);
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: detail });
    throw new Error(detail);
  }

  // Refuse path
  if (/STAGE_REFUSE:/.test(stdout)) {
    const refuse = (stdout.match(/STAGE_REFUSE:\s*(.+)/) || [])[1] || 'no reason given';
    const detail = `Inner Claude refused stage: ${refuse}`;
    recordPhase(runId, phaseName, 'refused', detail);
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: detail });
    throw new Error(detail);
  }

  // Extract and validate patch
  const patchText = patcher.extractPatchBetweenMarkers(stdout);
  if (!patchText) {
    const detail = `Patch markers ${patcher.PATCH_START_MARKER} / ${patcher.PATCH_END_MARKER} not found`;
    recordPhase(runId, phaseName, 'failed', detail);
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: detail });
    throw new Error(detail);
  }
  const validation = patcher.validatePatch(patchText, { allowedPaths: stage.allowed_paths });
  if (!validation.ok) {
    const detail = `Patch path validation failed. neverTouch=${JSON.stringify(validation.violations.neverTouch)} outOfScope=${JSON.stringify(validation.violations.outOfScope)} paths=${JSON.stringify(validation.paths)}`;
    recordPhase(runId, phaseName, 'failed', detail);
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: detail });
    throw new Error(detail);
  }
  log(`Patch validated. Touches paths: ${validation.paths.join(', ')}`);

  // Save the patch alongside the run for full auditability
  const patchSavePath = path.join(BRAIN_ROOT, 'intelligence', 'harness-runs', 'output', ticketName, `${phaseName}.patch`);
  fs.writeFileSync(patchSavePath, patchText, 'utf8');

  // Dry-run, then apply
  const check = patcher.applyPatch(stage.repo, patchText, { check: true });
  if (!check.ok) {
    const detail = `git apply --check failed: ${check.stderr.trim()}`;
    recordPhase(runId, phaseName, 'failed', detail);
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: detail });
    throw new Error(detail);
  }
  const applied = patcher.applyPatch(stage.repo, patchText, { check: false });
  if (!applied.ok) {
    const detail = `git apply failed: ${applied.stderr.trim()}`;
    recordPhase(runId, phaseName, 'failed', detail);
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: detail });
    throw new Error(detail);
  }
  log('Patch applied');

  // Post-apply guard: status must contain ONLY allowed paths
  const postStatus = patcher.gitStatusPorcelain(stage.repo);
  const postTouched = patcher.parsePorcelainPaths(postStatus);

  // Carve-out: harness self-modification tickets may also touch harness machinery.
  // Triggered when run_id or feature name contains "harness" — lets the harness
  // improve itself without the post-apply guard tripping.
  // (Self-Improvement Run 001 — HIGH-severity fix #1)
  const isHarnessTicket = /harness/i.test(ticketName) || /harness/i.test(runId);
  const HARNESS_CARVE_OUT_PREFIXES = ['harness/', 'intelligence/harness-runs/output/', 'harness/__tests__/'];
  const isHarnessCarvedOut = (p) =>
    isHarnessTicket && HARNESS_CARVE_OUT_PREFIXES.some((prefix) => p.startsWith(prefix));

  const outOfScope = postTouched.filter((p) =>
    !preTouched.includes(p) &&
    !stage.allowed_paths.includes(p) &&
    !isHarnessCarvedOut(p)
  );

  // Filter out paths that were ALREADY dirty before the stage (we record those at run start).
  const preexistingDirty = patcher.parsePorcelainPaths(preStatus).filter((p) => !stage.allowed_paths.includes(p));
  const trulyOutOfScope = outOfScope.filter((p) => !preexistingDirty.includes(p));

  if (trulyOutOfScope.length) {
    const detail = `Post-apply guard: out-of-scope paths modified: ${trulyOutOfScope.join(', ')}. Reverting patch.`;
    patcher.revertPatch(stage.repo, patchText);
    recordPhase(runId, phaseName, 'failed', detail);
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: detail });
    throw new Error(detail);
  }

  // Success — record and pause for review
  const total = stages.length;
  const isLast = stageIndex === total - 1;
  const meta = {
    ...(run.meta || {}),
    current_stage_index: stageIndex,
    total_stages: total,
    awaiting: isLast ? 'final-stage-review' : `stage-${stageIndex + 2}-approval`,
    last_patch_path: patchSavePath,
    last_stage_repo: stage.repo,
    last_stage_commit_msg: stage.commit_msg,
  };
  logger.updateRun(HARNESS_NAME, runId, { status: 'awaiting-approval', meta });
  recordPhase(runId, phaseName, 'complete', `applied ${validation.paths.length} path(s); commit msg: ${stage.commit_msg}`);
  log(`${stage.title} applied. Awaiting: ${meta.awaiting}`);
  return { runId, status: 'awaiting-approval', awaiting: meta.awaiting, stageIndex, patchPath: patchSavePath, paths: validation.paths };
}

// Run the post-stage sequence: conditional restart → /sidebar-audit → /latha-handover.
// Called after the LAST stage is approved.
async function runPostStageSequence(runId) {
  const run = logger.getRun(HARNESS_NAME, runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  const ticketName = run.feature;
  const log = makePhaseLogger(runId);
  const ticketContext = [
    `TICKET: ${ticketName}`,
    '',
    workspace.readTicket(ticketName, 'awaiting-approval') || '',
  ].join('\n');

  try {
    const changed = orchestrator.getChangedFiles();
    log(`Detected ${changed.length} changed files in portal`);
    if (orchestrator.touchedSidebarOrPermissions(changed)) {
      recordPhase(runId, 'restart-sequence', 'running', 'sidebar/permissions touched');
      await orchestrator.runFullRestartSequence(log);
      recordPhase(runId, 'restart-sequence', 'complete');
    } else if (orchestrator.touchedSharedLib(changed)) {
      recordPhase(runId, 'shared-rebuild', 'running', 'shared lib touched');
      await orchestrator.runSharedRebuild(log);
      recordPhase(runId, 'shared-rebuild', 'complete');
    } else {
      recordPhase(runId, 'restart-sequence', 'skipped', 'no shared/sidebar/permission changes');
    }
  } catch (e) {
    recordPhase(runId, 'restart-sequence', 'failed', String(e.message || e));
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: String(e.message || e) });
    throw e;
  }

  try {
    log('Phase: /sidebar-audit');
    recordPhase(runId, 'sidebar-audit', 'running');
    const out = runSlashCommand('/sidebar-audit', ticketContext);
    workspace.savePhaseOutput(ticketName, 'sidebar-audit', out);
    recordPhase(runId, 'sidebar-audit', 'complete', 'audit output saved');
    log('Phase: /sidebar-audit complete');
  } catch (e) {
    recordPhase(runId, 'sidebar-audit', 'failed', String(e.message || e));
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: String(e.message || e) });
    throw e;
  }

  try {
    log('Phase: /latha-handover');
    recordPhase(runId, 'latha-handover', 'running');
    const out = runSlashCommand('/latha-handover', ticketContext);
    workspace.savePhaseOutput(ticketName, 'latha-handover', out);
    recordPhase(runId, 'latha-handover', 'complete', 'PR package saved');
    log('Phase: /latha-handover complete');
  } catch (e) {
    recordPhase(runId, 'latha-handover', 'failed', String(e.message || e));
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: String(e.message || e) });
    throw e;
  }

  workspace.moveTicket(ticketName, 'awaiting-approval', 'complete');
  logger.updateRun(HARNESS_NAME, runId, { status: 'complete' });
  log('Run complete — ticket moved to tickets/complete');
  return { runId, status: 'complete' };
}

// Called when Shon types: approved <ticket>
// Replaces the monolithic /eagle-mode3 with the Option A stage loop.
// Runs Stage 1 and pauses. Caller invokes approveStage() to proceed.
async function approveMode2(runId) {
  const run = logger.getRun(HARNESS_NAME, runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  const ticketName = run.feature;
  const log = makePhaseLogger(runId);

  logger.logApproval(HARNESS_NAME, runId, { phrase: `approved ${ticketName}` });
  logger.updateRun(HARNESS_NAME, runId, { status: 'executing' });

  log('Mode 2 approved — entering Mode 3 stage loop');
  return runMode3Stage(runId, 0);
}

// Called when Shon approves the most recent stage.
// Runs the next stage. If no more stages, runs the post-stage sequence.
async function approveStage(runId) {
  const run = logger.getRun(HARNESS_NAME, runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  const ticketName = run.feature;
  const stages = MODE3_STAGES[ticketName];
  if (!stages) throw new Error(`No Mode 3 stage registry for "${ticketName}"`);

  const currentIdx = (run.meta && typeof run.meta.current_stage_index === 'number') ? run.meta.current_stage_index : -1;
  const nextIdx = currentIdx + 1;
  const log = makePhaseLogger(runId);

  logger.logApproval(HARNESS_NAME, runId, { phrase: `approved stage ${currentIdx + 1} (commit msg: ${stages[currentIdx]?.commit_msg || ''})`, by: 'shon' });

  if (nextIdx >= stages.length) {
    log('All stages approved — running post-stage sequence');
    logger.updateRun(HARNESS_NAME, runId, { status: 'executing', meta: { ...(run.meta || {}), awaiting: null } });
    return runPostStageSequence(runId);
  }
  log(`Running next stage (index ${nextIdx})`);
  logger.updateRun(HARNESS_NAME, runId, { status: 'executing' });
  return runMode3Stage(runId, nextIdx);
}

// Reject the most recent stage — revert the patch and mark run rejected.
function rejectStage(runId, reason = 'no reason given') {
  const run = logger.getRun(HARNESS_NAME, runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  const ticketName = run.feature;
  const meta = run.meta || {};
  if (meta.last_patch_path && fs.existsSync(meta.last_patch_path) && meta.last_stage_repo) {
    const patchText = fs.readFileSync(meta.last_patch_path, 'utf8');
    const reverted = patcher.revertPatch(meta.last_stage_repo, patchText);
    logger.logApproval(HARNESS_NAME, runId, {
      phrase: `not approved stage ${(meta.current_stage_index ?? -1) + 1}: ${reason} (revert ${reverted.ok ? 'ok' : 'FAILED: ' + (reverted.stderr || '').trim()})`,
      by: 'shon',
    });
  } else {
    logger.logApproval(HARNESS_NAME, runId, { phrase: `not approved stage: ${reason} (no patch to revert)`, by: 'shon' });
  }
  logger.updateRun(HARNESS_NAME, runId, { status: 'rejected', error: `Stage rejected: ${reason}` });
  return { runId, status: 'rejected', reason };
}

// Reject the current waiting phase. Caller specifies which gate is being rejected.
function reject(runId, gate /* 'mode1-review' | 'mode2-approval' */) {
  const run = logger.getRun(HARNESS_NAME, runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  logger.logApproval(HARNESS_NAME, runId, { phrase: `not approved (${gate})` });
  logger.updateRun(HARNESS_NAME, runId, { status: 'rejected', meta: { ...(run.meta || {}), rejected_at: gate } });
  return { runId, status: 'rejected', gate };
}

// Find the most recent run for a given ticket that is waiting on the named gate.
function findWaitingRun(ticketName, gate) {
  const runs = logger.listRuns(HARNESS_NAME, { status: 'awaiting-approval' });
  const matches = runs.filter((r) => r.feature === ticketName && r.meta && r.meta.awaiting === gate);
  if (!matches.length) return null;
  return matches[matches.length - 1];
}

module.exports = {
  HARNESS_NAME,
  MODE3_STAGES,
  startTicket,
  approveMode1,
  approveMode2,
  approveStage,
  rejectStage,
  reject,
  findWaitingRun,
  runMode3Stage,
  runPostStageSequence,
};
