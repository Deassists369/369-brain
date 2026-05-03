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

const seen = new Set();   // ticket names already started
const inFlight = new Set(); // ticket names currently being processed

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

  return { type: 'unknown', raw: trimmed };
}

async function main() {
  banner();
  pollOpenTickets();
  const interval = setInterval(pollOpenTickets, POLL_INTERVAL_MS);

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
      case 'unknown':
        console.log(`[worker] unknown command: "${cmd.raw}"`);
        console.log('         expected: approved mode1 <ticket> | approved <ticket> | not approved <ticket> | status | quit');
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
