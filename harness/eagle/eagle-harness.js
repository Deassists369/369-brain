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

const HARNESS_NAME = 'eagle-harness';
const BRAIN_ROOT = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const PREVIEWS_DIR = path.join(BRAIN_ROOT, 'previews');

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

// Called when Shon types: approved <ticket>
// Runs eagle-mode3 → sidebar-audit → conditional restart → latha-handover.
async function approveMode2(runId) {
  const run = logger.getRun(HARNESS_NAME, runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  const ticketName = run.feature;
  const log = makePhaseLogger(runId);

  logger.logApproval(HARNESS_NAME, runId, { phrase: `approved ${ticketName}` });
  logger.updateRun(HARNESS_NAME, runId, { status: 'executing' });

  const ticketContext = [
    `TICKET: ${ticketName}`,
    '',
    workspace.readTicket(ticketName, 'awaiting-approval') || '',
  ].join('\n');

  // Phase: eagle-mode3
  try {
    log('Phase: /eagle-mode3');
    recordPhase(runId, 'eagle-mode3', 'running');
    const out = runSlashCommand('/eagle-mode3', ticketContext);
    workspace.savePhaseOutput(ticketName, 'eagle-mode3', out);
    recordPhase(runId, 'eagle-mode3', 'complete', 'execute output saved');
    log('Phase: /eagle-mode3 complete');
  } catch (e) {
    recordPhase(runId, 'eagle-mode3', 'failed', String(e.message || e));
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: String(e.message || e) });
    throw e;
  }

  // Conditional: full restart sequence when sidebar/permissions touched
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

  // Phase: sidebar-audit
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

  // Phase: latha-handover
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
  startTicket,
  approveMode1,
  approveMode2,
  reject,
  findWaitingRun,
};
