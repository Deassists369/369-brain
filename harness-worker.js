#!/usr/bin/env node
// harness-worker.js
// Entry point for the EAGLE harness.
// Watches tickets/open/, runs eagle-harness, accepts approval/rejection commands via stdin.
// Owner: Shon AJ | Brain: VEERABHADRA

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const eagle = require('./harness/eagle/eagle-harness');
const workspace = require('./harness/core/workspace');
const logger = require('./harness/core/logger');

const BRAIN_ROOT = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const POLL_INTERVAL_MS = 5000;
const APPROVALS_DIR = path.join(BRAIN_ROOT, 'approvals');
const PROCESSED_DIR = path.join(APPROVALS_DIR, 'processed');
const SIGNAL_WRITE_DELAY_MS = 200;

const seen = new Set();   // ticket names already started
const inFlight = new Set(); // ticket names currently being processed
const processedSignals = new Set(); // signals currently being handled (debounce fs.watch)

function banner() {
  const lines = [
    '═══════════════════════════════════════════════════════════════════',
    '  DeAssists EAGLE Harness — worker started',
    '═══════════════════════════════════════════════════════════════════',
    `  Brain root      : ${BRAIN_ROOT}`,
    `  Tickets folder  : ${workspace.TICKETS_ROOT}`,
    `  Previews folder : ${workspace.PREVIEWS_ROOT}`,
    `  Run log         : ${path.join(logger.RUNS_DIR, eagle.HARNESS_NAME + '.jsonl')}`,
    '',
    '  Commands (type and press enter):',
    '    approved mode1 <ticket>   — proceed from Mode 1 to Mode 2',
    '    approved <ticket>          — proceed from Mode 2 preview to Mode 3',
    '    not approved <ticket>      — reject the current waiting phase',
    '    resume <feature>           — resume a failed/rejected run from last completed stage',
    '    status                     — show all active runs',
    '    quit                       — stop the worker',
    '═══════════════════════════════════════════════════════════════════',
  ];
  console.log(lines.join('\n'));
}

async function startTicketSafe(ticketName) {
  if (seen.has(ticketName) || inFlight.has(ticketName)) return;
  inFlight.add(ticketName);
  console.log(`[worker] picked up ticket: ${ticketName}`);
  try {
    const res = await eagle.startTicket(ticketName);
    console.log(`[worker] ticket ${ticketName} → ${res.status} (run ${res.runId})`);
    seen.add(ticketName);
  } catch (e) {
    console.error(`[worker] ticket ${ticketName} failed: ${e.message || e}`);
  } finally {
    inFlight.delete(ticketName);
  }
}

async function pollOpenTickets() {
  try {
    const open = workspace.listTickets('open');
    for (const name of open) {
      // Skip tickets that have an awaiting-mode1 run already running for them.
      const existing = logger.listRuns(eagle.HARNESS_NAME).filter(
        (r) => r.feature === name && (r.status === 'running' || r.status === 'awaiting-approval' || r.status === 'executing')
      );
      if (existing.length) {
        seen.add(name);
        continue;
      }
      await startTicketSafe(name);
    }
  } catch (e) {
    console.error(`[worker] poll error: ${e.message || e}`);
  }
}

async function handleApprovedMode1(ticketName) {
  const run = eagle.findWaitingRun(ticketName, 'mode1-review');
  if (!run) {
    console.log(`[worker] no run waiting for mode1 review on ticket "${ticketName}"`);
    return;
  }
  console.log(`[worker] approving Mode 1 for ${ticketName} (run ${run.run_id}) — running Mode 2`);
  try {
    const res = await eagle.approveMode1(run.run_id);
    console.log(`[worker] Mode 2 done → ${res.status}, preview: ${res.previewPath}`);
  } catch (e) {
    console.error(`[worker] approveMode1 failed: ${e.message || e}`);
  }
}

async function handleApprovedMode2(ticketName) {
  const run = eagle.findWaitingRun(ticketName, 'mode2-approval');
  if (!run) {
    console.log(`[worker] no run waiting for mode2 approval on ticket "${ticketName}"`);
    return;
  }
  console.log(`[worker] approving Mode 2 for ${ticketName} (run ${run.run_id}) — executing Mode 3`);
  try {
    const res = await eagle.approveMode2(run.run_id);
    console.log(`[worker] Mode 3 done → ${res.status}`);
  } catch (e) {
    console.error(`[worker] approveMode2 failed: ${e.message || e}`);
  }
}

function handleReject(ticketName) {
  const m1 = eagle.findWaitingRun(ticketName, 'mode1-review');
  const m2 = eagle.findWaitingRun(ticketName, 'mode2-approval');
  const target = m2 || m1;
  if (!target) {
    console.log(`[worker] no waiting run to reject for "${ticketName}"`);
    return;
  }
  const gate = m2 ? 'mode2-approval' : 'mode1-review';
  const res = eagle.reject(target.run_id, gate);
  console.log(`[worker] rejected ${gate} for ${ticketName} (run ${res.runId})`);
}

/* ── Approval Signal Bridge ───────────────────────────────────
   Watches approvals/*.signal files written by the dashboard
   /api/approve endpoint and dispatches to the SAME handlers used
   by the stdin parser (handleApprovedMode1 / handleApprovedMode2 /
   handleReject).
*/
async function processSignalFile(filename) {
  if (!filename || !filename.endsWith('.signal')) return;
  if (processedSignals.has(filename)) return;
  processedSignals.add(filename);

  const fullPath = path.join(APPROVALS_DIR, filename);
  const ticket = filename.replace(/\.signal$/, '');

  try {
    await new Promise((r) => setTimeout(r, SIGNAL_WRITE_DELAY_MS));
    if (!fs.existsSync(fullPath)) return;

    const content = fs.readFileSync(fullPath, 'utf8').trim();
    console.log(`[Bridge] signal received: ${filename} → "${content}"`);

    // Priority: not-approved > approved > resume > unknown.
    // (a) "not approved" must match before "approved" because the
    // "approved" pattern is a strict-prefix and would also match a
    // "not approved" line if checked first without the negation.
    if (/^not\s+approved/i.test(content)) {
      console.log(`[Bridge] dispatching reject for ${ticket}`);
      handleReject(ticket);
    } else if (/^approved/i.test(content)) {
      const runs = logger.listRuns(eagle.HARNESS_NAME).filter((r) => r.feature === ticket);
      const latest = runs[runs.length - 1];
      const lastPhase =
        latest && Array.isArray(latest.phases) && latest.phases.length
          ? latest.phases[latest.phases.length - 1].phase || ''
          : '';

      if (/mode1/i.test(lastPhase)) {
        console.log(`[Bridge] dispatching approveMode1 for ${ticket} (phase=${lastPhase})`);
        await handleApprovedMode1(ticket);
      } else {
        console.log(`[Bridge] dispatching approveMode2 for ${ticket} (phase=${lastPhase || 'unknown'})`);
        await handleApprovedMode2(ticket);
      }
    } else if (/^resume\s+/i.test(content)) {
      // Fire-and-forget: resumeRun kicks off a real Mode 3 stage
      // (5+ min headless Claude). Don't block the bridge / fs.watch.
      const resumeMatch = content.match(/^resume\s+(.+)$/i);
      const feature = resumeMatch ? resumeMatch[1].trim() : ticket;
      console.log(`[Bridge] dispatching resume for ${feature}`);
      eagle.resumeRun(feature).then(() => {
        console.log(`[Bridge] resume dispatched for ${feature}`);
      }).catch((err) => {
        console.error(`[Bridge] resume failed for ${feature}: ${err && err.message ? err.message : err}`);
      });
    } else {
      console.log(`[Bridge] unrecognized signal content for ${ticket}: "${content}" — archiving without dispatch`);
    }

    if (fs.existsSync(fullPath)) {
      fs.renameSync(fullPath, path.join(PROCESSED_DIR, filename));
      console.log(`[Bridge] archived ${filename} → processed/`);
    }
  } catch (e) {
    console.error(`[Bridge] failed processing ${filename}: ${e.message || e}`);
  } finally {
    setTimeout(() => processedSignals.delete(filename), 1000);
  }
}

function startApprovalBridge() {
  if (!fs.existsSync(APPROVALS_DIR)) fs.mkdirSync(APPROVALS_DIR, { recursive: true });
  if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  console.log(`[Bridge] watching ${APPROVALS_DIR}`);

  const existing = fs.readdirSync(APPROVALS_DIR).filter((f) => f.endsWith('.signal'));
  if (existing.length) {
    console.log(`[Bridge] found ${existing.length} pending signal(s) on startup — processing`);
    for (const f of existing) processSignalFile(f);
  }

  fs.watch(APPROVALS_DIR, (eventType, filename) => {
    if (!filename || !filename.endsWith('.signal')) return;
    if (!fs.existsSync(path.join(APPROVALS_DIR, filename))) return;
    processSignalFile(filename);
  });
}

function handleStatus() {
  const runs = logger.listRuns(eagle.HARNESS_NAME);
  if (!runs.length) {
    console.log('[worker] no runs yet');
    return;
  }
  for (const r of runs) {
    const awaiting = r.meta && r.meta.awaiting ? ` (awaiting ${r.meta.awaiting})` : '';
    console.log(`  ${r.run_id}  ${r.feature.padEnd(30)}  ${r.status}${awaiting}`);
  }
}

function parseCommand(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (trimmed === 'quit' || trimmed === 'exit') return { type: 'quit' };
  if (trimmed === 'status') return { type: 'status' };

  const m1 = trimmed.match(/^approved\s+mode1\s+(.+)$/i);
  if (m1) return { type: 'approved-mode1', ticket: m1[1].trim() };

  const m2 = trimmed.match(/^approved\s+(.+)$/i);
  if (m2) return { type: 'approved-mode2', ticket: m2[1].trim() };

  const r = trimmed.match(/^not\s+approved\s+(.+)$/i);
  if (r) return { type: 'reject', ticket: r[1].trim() };

  const res = trimmed.match(/^resume\s+(.+)$/i);
  if (res) return { type: 'resume', feature: res[1].trim() };

  return { type: 'unknown', raw: trimmed };
}

async function main() {
  banner();

  // Step 5C — orphan detection runs ONCE per boot, before the polling
  // loop and bridge come online. Any run still status='executing' must
  // belong to a previous worker process (we just booted; nothing in this
  // process started those). Mark them failed and tell the operator
  // whether resume is viable.
  try {
    const orphans = eagle.recoverOrphanedRuns();
    if (orphans.length > 0) {
      console.log('═══════════════════════════════════════════════');
      console.log(`[worker] ${orphans.length} orphaned run${orphans.length === 1 ? '' : 's'} detected on boot:`);
      for (const o of orphans) {
        const tag = o.recoverable ? '✅ recoverable' : '⚠️  NOT recoverable (no completed stages)';
        console.log(`  • ${o.feature}  last_completed_stage=${o.last_completed_stage} of ${o.total_stages}  ${tag}`);
        if (o.recoverable) {
          console.log(`    → To resume: write "resume ${o.feature}" to a signal file, or stdin: resume ${o.feature}`);
        }
      }
      console.log('═══════════════════════════════════════════════');
    } else {
      console.log('[worker] no orphaned runs on boot');
    }
  } catch (e) {
    console.error('[worker] orphan recovery failed:', e && e.message ? e.message : e);
  }

  pollOpenTickets();
  const interval = setInterval(pollOpenTickets, POLL_INTERVAL_MS);
  startApprovalBridge();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rl.on('line', async (line) => {
    const cmd = parseCommand(line);
    if (!cmd) return;
    switch (cmd.type) {
      case 'quit':
        console.log('[worker] shutting down');
        clearInterval(interval);
        rl.close();
        process.exit(0);
        break;
      case 'status':
        handleStatus();
        break;
      case 'approved-mode1':
        await handleApprovedMode1(cmd.ticket);
        break;
      case 'approved-mode2':
        await handleApprovedMode2(cmd.ticket);
        break;
      case 'reject':
        handleReject(cmd.ticket);
        break;
      case 'resume':
        // Fire-and-forget — see processSignalFile resume branch comment.
        console.log(`[worker] resume command received: feature=${cmd.feature}`);
        eagle.resumeRun(cmd.feature).then(() => {
          console.log(`[worker] resume dispatched for ${cmd.feature}`);
        }).catch((err) => {
          console.error(`[worker] resume failed for ${cmd.feature}: ${err && err.message ? err.message : err}`);
        });
        break;
      case 'unknown':
        console.log(`[worker] unknown command: "${cmd.raw}"`);
        console.log('         expected: approved mode1 <ticket> | approved <ticket> | not approved <ticket> | resume <feature> | status | quit');
        break;
    }
  });

  process.on('SIGINT', () => {
    console.log('\n[worker] SIGINT received — exiting');
    clearInterval(interval);
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch((e) => {
    console.error('[worker] fatal:', e);
    process.exit(1);
  });
}

// Test-mode hooks — ABSENT in production exports. Used by Step 5B's resume
// dispatch test to drive processSignalFile directly without spinning up
// the polling loop, fs.watch, or stdin readline. Daemon mode is unaffected
// because this file is required only when not run directly.
if (process.env.HARNESS_WORKER_TEST_MODE === '1') {
  module.exports.processSignalFile = processSignalFile;
  module.exports.parseCommand = parseCommand;
  module.exports.APPROVALS_DIR = APPROVALS_DIR;
  module.exports.PROCESSED_DIR = PROCESSED_DIR;
  module.exports._resetProcessedSignals = () => processedSignals.clear();
}
