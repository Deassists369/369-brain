#!/usr/bin/env node
// harness/self-improvement/self-improvement-harness.js
// CLI entry point for the self-improvement harness v1.
//
// Reads:
//   - Five SOP files (AGENTS, CLAUDE, CODING-CONSTITUTION, HOOKS, THE-DEASSISTS-OS)
//   - intelligence/harness-runs/eagle-harness.jsonl
//   - tickets/{open,waiting,awaiting-approval,complete}/*.md
//   - high-level codebase summary
//
// Writes:
//   - intelligence/proposed-fixes/[YYYY-MM-DD]-self-improvement-run-[NNN].md
//   - intelligence/LEARNING-MIND.md (append a new dated section)
//   - intelligence/harness-runs/self-improvement-harness.jsonl (append run row)
//
// Usage:
//   node self-improvement-harness.js
//   node self-improvement-harness.js --dry-run
//   node self-improvement-harness.js --skip-learning-mind
//   node self-improvement-harness.js --limit-runs 20
//
// Exit codes:
//   0  complete
//   1  failed mid-run
//   2  blocked (a Tier-1 SOP file missing)
//
// Owner: Shon AJ | Brain: VEERABHADRA

const fs = require('fs');
const path = require('path');

const logger = require('../core/logger');
const inputs = require('./inputs');
const analyzer = require('./analyzer');
const reportWriter = require('./report-writer');
const learningMind = require('./learning-mind-writer');
const { MemoryRouter } = require('../../memory/router');

const HARNESS_NAME = 'self-improvement-harness';
const FEATURE_NAME = 'self-improvement-harness-v1';
const BRAIN_ROOT = inputs.BRAIN_ROOT;
const LOCK_PATH = path.join(BRAIN_ROOT, 'intelligence', 'harness-runs', `${HARNESS_NAME}.lock`);

// ---------- CLI parsing ----------

function parseArgs(argv) {
  const args = {
    dryRun: false,
    skipLearningMind: false,
    limitRuns: null,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--skip-learning-mind') args.skipLearningMind = true;
    else if (a === '--limit-runs') {
      const n = parseInt(argv[++i], 10);
      if (!Number.isFinite(n) || n <= 0) throw new Error('--limit-runs requires a positive integer');
      args.limitRuns = n;
    } else if (a === '-h' || a === '--help') args.help = true;
    else throw new Error(`unknown flag: ${a}`);
  }
  return args;
}

function helpText() {
  return [
    'self-improvement-harness v1 — manual trigger only',
    '',
    'Usage:',
    '  node self-improvement-harness.js [flags]',
    '',
    'Flags:',
    '  --dry-run              build the prompt, print it, do not invoke Claude',
    '  --skip-learning-mind   produce report only, do not append to LEARNING-MIND.md',
    '  --limit-runs N         consider only the most recent N eagle-harness entries',
    '  -h, --help             show this help',
    '',
    'Outputs:',
    '  intelligence/proposed-fixes/[YYYY-MM-DD]-self-improvement-run-[NNN].md',
    '  intelligence/LEARNING-MIND.md (append)',
    '  intelligence/harness-runs/self-improvement-harness.jsonl (append)',
  ].join('\n');
}

// ---------- workspace lock ----------

function acquireLock() {
  if (fs.existsSync(LOCK_PATH)) {
    const heldBy = fs.readFileSync(LOCK_PATH, 'utf8');
    throw new Error(`lock held by another instance: ${LOCK_PATH}\n${heldBy}`);
  }
  fs.mkdirSync(path.dirname(LOCK_PATH), { recursive: true });
  fs.writeFileSync(LOCK_PATH, `pid=${process.pid}\nstarted=${new Date().toISOString()}\n`, 'utf8');
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_PATH)) fs.unlinkSync(LOCK_PATH);
  } catch (e) {
    // ignore
  }
}

// ---------- phase logging helpers ----------

function logPhase(runId, phase, status, detail = '') {
  return logger.logPhase(HARNESS_NAME, runId, { phase, status, detail });
}

function startPhase(runId, phase) {
  return logPhase(runId, phase, 'running');
}

function completePhase(runId, phase, detail = '') {
  return logPhase(runId, phase, 'complete', detail);
}

function failPhase(runId, phase, err) {
  return logPhase(runId, phase, 'failed', String(err && err.message || err).slice(0, 500));
}

// ---------- main flow ----------

async function main(argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`error: ${e.message}\n\n${helpText()}\n`);
    process.exit(1);
  }
  if (args.help) {
    process.stdout.write(helpText() + '\n');
    process.exit(0);
  }

  acquireLock();

  const startedAt = Date.now();
  const run = logger.startRun(HARNESS_NAME, {
    feature: FEATURE_NAME,
    meta: {
      cli_args: { dryRun: args.dryRun, skipLearningMind: args.skipLearningMind, limitRuns: args.limitRuns },
    },
  });
  const runId = run.run_id;
  process.stdout.write(`[self-improvement] run_id=${runId}\n`);

  // ---- watermark cursor (Step 4C) ----
  const mem = new MemoryRouter();
  const cursorBefore = mem.getWorking('self-improvement', 'last_episode_seq') || 0;
  process.stdout.write(`[SI] cursor before run: seq=${cursorBefore}\n`);
  let newEpisodes = [];

  try {
    // Phase 1: read SOPs
    startPhase(runId, 'read-sops');
    const sops = inputs.readSops({ root: BRAIN_ROOT });
    const blocked = sops.some((s) => s.missing);
    if (blocked) {
      const missing = sops.filter((s) => s.missing).map((s) => s.name).join(', ');
      failPhase(runId, 'read-sops', new Error(`Missing SOP files: ${missing}`));
      logger.updateRun(HARNESS_NAME, runId, {
        status: 'blocked',
        error: `Missing SOP files: ${missing}`,
      });
      process.stderr.write(`[self-improvement] blocked: missing SOP files: ${missing}\n`);
      releaseLock();
      process.exit(2);
    }
    completePhase(runId, 'read-sops', `${sops.length} files, ${sops.reduce((s, f) => s + f.bytes, 0)} bytes total`);

    // Phase 2: read harness runs
    startPhase(runId, 'read-harness-runs');
    const harnessRuns = inputs.readHarnessRuns({ root: BRAIN_ROOT, limit: args.limitRuns });
    completePhase(runId, 'read-harness-runs', `${harnessRuns.length} entries`);

    // Phase 2b (Step 4C): dual-read from episodes.db since watermark.
    // Self-Improvement's own events are filtered out at the inputs layer.
    newEpisodes = inputs.readEpisodesSince(mem, cursorBefore, { limit: 5000 });
    process.stdout.write(`[SI] new episodes since cursor: ${newEpisodes.length}\n`);
    if (newEpisodes.length === 5000) {
      process.stdout.write(`[SI] WARNING: hit limit; watermark may not catch up this run\n`);
    }

    // Phase 3: read tickets
    startPhase(runId, 'read-tickets');
    const tickets = inputs.readTickets({ root: BRAIN_ROOT });
    const ticketCount = Object.values(tickets).reduce((s, arr) => s + arr.length, 0);
    completePhase(runId, 'read-tickets', `${ticketCount} tickets`);

    // Phase 4: build prompt
    startPhase(runId, 'build-prompt');
    const codebase = inputs.readCodebaseSummary({ root: BRAIN_ROOT });
    const bundle = { sops, harnessRuns, tickets, codebase, newEpisodes };
    const runNumber = reportWriter.nextRunNumber({ date: new Date() });
    const prompt = analyzer.buildPrompt({ inputs: bundle, runNumber });
    completePhase(runId, 'build-prompt', `${Buffer.byteLength(prompt, 'utf8')} bytes, run_number=${runNumber}`);

    // Dry-run short-circuit: print the prompt and exit cleanly.
    if (args.dryRun) {
      logger.updateRun(HARNESS_NAME, runId, {
        status: 'complete',
        meta: {
          ...run.meta,
          dry_run: true,
          prompt_bytes: Buffer.byteLength(prompt, 'utf8'),
          run_number_planned: runNumber,
        },
      });
      process.stdout.write('\n----- PROMPT (dry-run) -----\n');
      process.stdout.write(prompt);
      process.stdout.write('\n----- END PROMPT -----\n');
      process.stdout.write(`[self-improvement] dry-run complete · ${Date.now() - startedAt}ms\n`);
      releaseLock();
      process.exit(0);
    }

    // Phase 5: invoke analyzer
    startPhase(runId, 'invoke-analyzer');
    let analysis;
    let invocationMs;
    try {
      const t0 = Date.now();
      const stdout = analyzer.invokeAnalyzer({ prompt });
      invocationMs = Date.now() - t0;
      analysis = analyzer.extractAnalysis(stdout);
    } catch (e) {
      failPhase(runId, 'invoke-analyzer', e);
      logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: e.message });
      process.stderr.write(`[self-improvement] analyzer failed: ${e.message}\n`);
      releaseLock();
      process.exit(1);
    }
    completePhase(runId, 'invoke-analyzer', `claude -p · ${invocationMs}ms · ${analysis.proposedFixes.length} proposed fixes`);

    // Phase 6: write report
    startPhase(runId, 'write-report');
    let reportInfo;
    try {
      reportInfo = reportWriter.saveReport({
        runNumber,
        date: new Date(),
        runId,
        durationMs: Date.now() - startedAt,
        inputs: bundle,
        analysis,
      });
    } catch (e) {
      failPhase(runId, 'write-report', e);
      logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: e.message });
      process.stderr.write(`[self-improvement] write-report failed: ${e.message}\n`);
      releaseLock();
      process.exit(1);
    }
    completePhase(runId, 'write-report', `${reportInfo.bytes} bytes saved: ${reportInfo.path}`);

    // Phase 7: append LEARNING-MIND (unless skipped)
    let lmInfo = null;
    if (args.skipLearningMind) {
      logPhase(runId, 'append-learning-mind', 'skipped', '--skip-learning-mind flag');
    } else {
      startPhase(runId, 'append-learning-mind');
      try {
        const sourcePath = `intelligence/proposed-fixes/${path.basename(reportInfo.path)}`;
        lmInfo = learningMind.appendSection({
          runNumber,
          date: new Date(),
          fields: {
            deepenedUnderstanding: analysis.deepenedUnderstanding,
            wrongAssumptions: analysis.wrongAssumptions,
            patterns: analysis.patterns,
            openQuestions: analysis.openQuestions,
            challenge: analysis.challenge,
          },
          sourcePath,
        });
      } catch (e) {
        failPhase(runId, 'append-learning-mind', e);
        logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: e.message });
        process.stderr.write(`[self-improvement] learning-mind append failed: ${e.message}\n`);
        releaseLock();
        process.exit(1);
      }
      completePhase(runId, 'append-learning-mind', `+${lmInfo.appendedBytes} bytes`);
    }

    // ---- advance watermark (Step 4C) — only on success ----
    if (newEpisodes.length > 0) {
      const maxSeq = newEpisodes.reduce((m, ep) => Math.max(m, ep.seq), cursorBefore);
      mem.setWorking('self-improvement', 'last_episode_seq', maxSeq);
      process.stdout.write(`[SI] cursor advanced: seq=${cursorBefore} → ${maxSeq}\n`);
    } else {
      process.stdout.write(`[SI] cursor unchanged (no new episodes since seq ${cursorBefore})\n`);
    }
    try { mem.close(); } catch { /* swallow */ }

    // Final update — status complete with summary meta.
    logger.updateRun(HARNESS_NAME, runId, {
      status: 'complete',
      meta: {
        ...run.meta,
        sop_files_read: sops.length,
        harness_runs_read: harnessRuns.length,
        new_episodes_processed: newEpisodes.length,
        tickets_read: ticketCount,
        patterns_found: analysis.patterns.length,
        proposed_fixes: analysis.proposedFixes.length,
        report_path: path.relative(BRAIN_ROOT, reportInfo.path),
        learning_mind_appended: !args.skipLearningMind,
      },
    });

    const totalMs = Date.now() - startedAt;
    process.stdout.write([
      '',
      `[self-improvement] complete in ${totalMs}ms`,
      `  report:        ${reportInfo.path}`,
      `  learning-mind: ${args.skipLearningMind ? '(skipped)' : lmInfo.path}`,
      `  patterns:      ${analysis.patterns.length}`,
      `  fixes:         ${analysis.proposedFixes.length}`,
      `  questions:     ${analysis.openQuestions.length}`,
      '',
    ].join('\n'));

    releaseLock();
    process.exit(0);
  } catch (e) {
    logger.updateRun(HARNESS_NAME, runId, { status: 'failed', error: e.message });
    process.stderr.write(`[self-improvement] unexpected failure: ${e.message}\n`);
    releaseLock();
    process.exit(1);
  }
}

// ---------- entry point guard ----------

if (require.main === module) {
  main(process.argv.slice(2)).catch((e) => {
    releaseLock();
    process.stderr.write(`fatal: ${e.message}\n`);
    process.exit(1);
  });
}

module.exports = {
  HARNESS_NAME,
  FEATURE_NAME,
  LOCK_PATH,
  parseArgs,
  helpText,
  main,
};
