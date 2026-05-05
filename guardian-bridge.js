const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const BRAIN = path.join(os.homedir(), 'deassists-workspace', '369-brain');
const EAGLE_LOG = path.join(BRAIN, 'intelligence', 'harness-runs', 'eagle-harness.jsonl');
const TEST_RUNS = path.join(BRAIN, 'intelligence', 'test-runs');
const LEARNING = path.join(BRAIN, 'intelligence', 'learning-log.md');

// ---------- Step 4B: lazy router/bus singletons + safe-emit helpers ----------
// Mirror of harness/core/logger.js. File writes stay authoritative; mem.emit
// and bus.emit run AFTER existing writes succeed and never propagate errors.
let _memSingleton = null;
let _busSingleton = null;
function _mem() {
  if (!_memSingleton) {
    const { MemoryRouter } = require('./memory/router');
    _memSingleton = new MemoryRouter();
  }
  return _memSingleton;
}
function _bus() {
  if (!_busSingleton) {
    const { EventBus } = require('./memory/event-bus');
    _busSingleton = new EventBus();
  }
  return _busSingleton;
}
function _safeEmitEpisode(payload) {
  try { _mem().emit(payload); }
  catch (e) {
    console.error('[guardian] mem.emit failed (file writes still succeeded):',
      e && e.message ? e.message : e);
  }
}
function _safeEmitBus(topic, publisher, payload) {
  try { _bus().emit(topic, publisher, payload); }
  catch (e) {
    console.error('[guardian] bus.emit failed:',
      e && e.message ? e.message : e);
  }
}
function _emitTestStart(runId, trigger, startTs) {
  const source = (trigger && trigger.source) || 'manual';
  _safeEmitEpisode({
    kind: 'guardian.test.start',
    agent: 'guardian',
    run_id: runId,
    status: 'running',
    summary: `Guardian test run started (trigger: ${source})`,
    payload: { trigger, started_at: startTs },
  });
  _safeEmitBus('guardian.test.start', 'guardian', {
    run_id: runId,
    trigger,
  });
}
function _emitTestComplete(runId, result) {
  const status = (result && result.summary && result.summary.failed === 0) ? 'passed' : 'failed';
  _safeEmitEpisode({
    kind: 'guardian.test.complete',
    agent: 'guardian',
    run_id: runId,
    status,
    summary: `Tests ${status}: ${(result.summary && result.summary.passed) || 0} passed, ${(result.summary && result.summary.failed) || 0} failed`,
    payload: result,
  });
  _safeEmitBus('guardian.test.complete', 'guardian', {
    run_id: runId,
    status,
    passed: (result.summary && result.summary.passed) || 0,
    failed: (result.summary && result.summary.failed) || 0,
  });
}

let lastProcessedId = null;
let isRunning = false;

function getLastEagleEntry() {
  try {
    const lines = fs.readFileSync(EAGLE_LOG, 'utf8').trim().split('\n').filter(Boolean);
    return JSON.parse(lines[lines.length - 1]);
  } catch { return null; }
}

function shouldRunTests(entry) {
  if (!entry) return false;
  if (entry.run_id === lastProcessedId) return false;
  return ['code_written','complete','approved'].includes(entry.status);
}

function writeLearningEntry(result, prev) {
  const diff = prev ? result.summary.failed - prev.summary.failed : 0;
  const trend = diff > 0 ? `REGRESSION: ${diff} more failures than yesterday.`
              : diff < 0 ? `IMPROVEMENT: ${Math.abs(diff)} fewer failures.`
              : 'No change from yesterday.';
  const entry = [
    `\n## ${result.run_date} — ${result.run_id}`,
    `- Reason: ${result.trigger.reason}`,
    `- EAGLE build: ${result.trigger.eagle_feature || 'n/a'} (${result.trigger.eagle_run_id || 'n/a'})`,
    `- Tests: ${result.summary.total} total · ${result.summary.passed} passed · ${result.summary.failed} failed`,
    `- Status: ${result.status.toUpperCase()}`,
    `- ${trend}`,
    `- ${result.summary.failed > 0 ? 'ACTION NEEDED before next Latha review' : 'Safe to proceed with builds'}`,
  ].join('\n');
  if (!fs.existsSync(LEARNING)) {
    fs.writeFileSync(LEARNING, '# Guardian Learning Log\n\nDaily test history. Self-Improvement reads this weekly.\n');
  }
  fs.appendFileSync(LEARNING, entry + '\n');
  console.log('[Guardian] Learning entry written');
}

async function runTests(trigger = null) {
  if (isRunning) return;
  isRunning = true;
  const runId = `guardian-${Date.now()}`;
  const startTs = Date.now();
  const runDate = new Date().toISOString().split('T')[0];
  const source = (trigger && trigger.source) || 'manual';
  console.log(`[Guardian] Running tests — ${runDate} — source: ${source} — run_id: ${runId}`);
  _emitTestStart(runId, trigger, startTs);

  try {
    let output = '';
    let exitCode = 0;
    try {
      output = execSync('npx playwright test --reporter=list 2>&1', {
        cwd: BRAIN,
        timeout: 120000,
        encoding: 'utf8',
        env: { ...process.env }
      });
    } catch(e) {
      output = e.stdout || e.message || '';
      exitCode = e.status || 1;
    }

    const passed  = parseInt((output.match(/(\d+)\s+passed/)  || [0,0])[1], 10) || 0;
    const failed  = parseInt((output.match(/(\d+)\s+failed/)  || [0,0])[1], 10) || 0;
    const skipped = parseInt((output.match(/(\d+)\s+skipped/) || [0,0])[1], 10) || 0;

    // Parse per-account login results from Playwright output
    const accounts = {};
    const userTypes = ['super_admin','manager','team_lead','agent',
      'staff','organization_owner','organization_admin','organization_agent',
      'organization_manager','organization_team_lead','organization_staff'];
    userTypes.forEach(type => {
      const passReg = new RegExp('✓.*login.*'+type.replace(/_/g,'[_\\s]'),'i');
      const failReg = new RegExp('(?:✘|×|FAILED).*login.*'+type.replace(/_/g,'[_\\s]'),'i');
      if (passReg.test(output)) accounts[type] = 'passed';
      else if (failReg.test(output)) accounts[type] = 'failed';
      else accounts[type] = 'unknown';
    });

    // Parse per-suite results
    const features = [];
    if (passed > 0 || failed > 0) {
      const portalPassed = userTypes.filter(t => accounts[t]==='passed').length;
      const portalFailed = userTypes.filter(t => accounts[t]==='failed').length;
      features.push({
        name: 'Portal Login — All User Roles',
        type: 'Portal',
        passed: portalPassed,
        failed: portalFailed,
        total: userTypes.length
      });
      const availPassed = output.includes('portal loads') ? 1 : 0;
      const apiPassed = output.includes('backend API') ? 1 : 0;
      if (availPassed || apiPassed) {
        features.push({
          name: 'Portal Availability',
          type: 'Availability',
          passed: availPassed + apiPassed,
          failed: 0,
          total: 2
        });
      }
    }

    const result = {
      run_id: runId,
      run_date: runDate,
      run_time: new Date().toISOString(),
      duration_ms: Date.now() - startTs,
      exit_code: exitCode,
      trigger: {
        // legacy fields kept for dashboard back-compat
        reason: source,
        // new structured field
        source,
        eagle_run_id: (trigger && trigger.eagle_run_id) || null,
        eagle_feature: (trigger && trigger.feature) || null,
        eagle_status: null,
      },
      summary: { total: passed+failed+skipped, passed, failed, skipped },
      status: failed === 0 ? 'passing' : 'failing',
      output: output.slice(-2000),
      accounts,
      features
    };

    if (!fs.existsSync(TEST_RUNS)) fs.mkdirSync(TEST_RUNS, { recursive: true });

    // latest.json — always overwrite
    fs.writeFileSync(path.join(TEST_RUNS,'latest.json'), JSON.stringify(result,null,2));

    // unique per-run JSON — never overwrite
    fs.writeFileSync(path.join(TEST_RUNS,`${result.run_id}.json`), JSON.stringify(result,null,2));

    // daily markdown — append friendly
    fs.writeFileSync(path.join(TEST_RUNS,`${runDate}.md`),
`# Guardian Test Run — ${runDate}
Triggered by: ${source}
EAGLE build: ${result.trigger.eagle_feature || 'n/a'}
Status: ${result.status.toUpperCase()}

## Summary
- Passed:  ${passed}
- Failed:  ${failed}
- Skipped: ${skipped}
- Duration: ${(result.duration_ms/1000).toFixed(1)}s

## Verdict
${failed === 0
  ? '✅ All tests passed — safe for Latha review'
  : `⚠️ ${failed} tests failed — do not merge until fixed`}

## Output
\`\`\`
${output.slice(-1000)}
\`\`\`
`);

    let prev = null;
    try {
      const y = new Date(); y.setDate(y.getDate()-1);
      const yf = path.join(TEST_RUNS, y.toISOString().split('T')[0]+'.json');
      if (fs.existsSync(yf)) prev = JSON.parse(fs.readFileSync(yf,'utf8'));
    } catch {}

    _emitTestComplete(runId, result);

    writeLearningEntry(result, prev);
    console.log(`[Guardian] Done: ${passed}p ${failed}f ${skipped}s — ${result.status}`);

  } finally {
    isRunning = false;
  }
}

// Test-mode override hook for the bus-triggered runTests call. In production
// this points at the real runTests; tests can swap it via _setTestsRunner.
let _testsRunner = runTests;

function subscribeToEagleBus() {
  try {
    _bus().subscribe('guardian', 'eagle.run.complete', (event) => {
      console.log(
        `[guardian] EAGLE run complete heard via bus: run_id=${event.payload.run_id}, ` +
        `feature=${event.payload.feature}. Triggering tests in 5s.`
      );
      setTimeout(() => {
        _testsRunner({
          source: 'bus.eagle.run.complete',
          eagle_run_id: event.payload.run_id,
          feature: event.payload.feature,
        }).catch((err) => {
          console.error('[guardian] bus-triggered test run failed:', err);
        });
      }, 5000);
    });
    console.log('[guardian] subscribed to eagle.run.complete on bus');
  } catch (e) {
    console.error('[guardian] bus subscription failed:', e && e.message ? e.message : e);
  }
}

function watchEagle() {
  console.log('[Guardian] Watching EAGLE every 30 seconds...');
  const entry = getLastEagleEntry();
  if (entry) lastProcessedId = entry.run_id;
  setInterval(() => {
    const e = getLastEagleEntry();
    if (shouldRunTests(e)) {
      console.log(`[Guardian] EAGLE completed: ${e.feature} (${e.status})`);
      lastProcessedId = e.run_id;
      runTests({ source: 'watchEagle.poll', eagle_run_id: e.run_id, feature: e.feature });
    }
  }, 30000);
}

function scheduleDailyRun() {
  const now = new Date();
  const next = new Date(); next.setHours(2,0,0,0);
  if (next <= now) next.setDate(next.getDate()+1);
  const ms = next - now;
  setTimeout(() => {
    console.log('[Guardian] Running scheduled 2am tests');
    runTests({ source: 'scheduled' });
    setInterval(() => runTests({ source: 'scheduled' }), 86400000);
  }, ms);
  console.log(`[Guardian] Daily run in ${(ms/3600000).toFixed(1)} hours`);
}

if (process.env.GUARDIAN_TEST_MODE !== '1') {
  console.log('[Guardian] Starting...');
  watchEagle();
  subscribeToEagleBus();
  scheduleDailyRun();

  // Only run initial suite if no previous results exist
  setTimeout(() => {
    const latest = path.join(TEST_RUNS, 'latest.json');
    if (!fs.existsSync(latest)) {
      console.log('[Guardian] No previous results — running initial suite');
      runTests({ source: 'startup' });
    } else {
      console.log('[Guardian] latest.json exists — skipping initial run');
    }
  }, 20000);
}

// Test-mode hooks. ABSENT in production — production module.exports stays {}.
if (process.env.GUARDIAN_TEST_MODE === '1') {
  module.exports._mem = _mem;
  module.exports._bus = _bus;
  module.exports.subscribeToEagleBus = subscribeToEagleBus;
  module.exports._emitTestStart = _emitTestStart;
  module.exports._emitTestComplete = _emitTestComplete;
  module.exports._setTestsRunner = (fn) => { _testsRunner = fn; };
}
