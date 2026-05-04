const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const BRAIN = path.join(os.homedir(), 'deassists-workspace', '369-brain');
const EAGLE_LOG = path.join(BRAIN, 'intelligence', 'harness-runs', 'eagle-harness.jsonl');
const TEST_RUNS = path.join(BRAIN, 'intelligence', 'test-runs');
const LEARNING = path.join(BRAIN, 'intelligence', 'learning-log.md');

const startTime = Date.now();
const runDate = new Date().toISOString().split('T')[0];
console.log('[Guardian-Once] Running tests —', runDate);

let output = '';
let exitCode = 0;
try {
  output = execSync('npx playwright test --reporter=list 2>&1', {
    cwd: BRAIN, timeout: 120000, encoding: 'utf8', env: { ...process.env }
  });
} catch(e) { output = e.stdout || e.message || ''; exitCode = e.status || 1; }

const passed  = parseInt((output.match(/(\d+)\s+passed/)  || [0,0])[1], 10) || 0;
const failed  = parseInt((output.match(/(\d+)\s+failed/)  || [0,0])[1], 10) || 0;
const skipped = parseInt((output.match(/(\d+)\s+skipped/) || [0,0])[1], 10) || 0;

const userTypes = ['super_admin','manager','team_lead','agent',
  'staff','organization_owner','organization_admin','organization_agent'];
const accounts = {};
userTypes.forEach(type => {
  const pr = new RegExp('✓.*login.*'+type.replace(/_/g,'[_\\s]'),'i');
  const fr = new RegExp('(?:✘|×|FAILED).*login.*'+type.replace(/_/g,'[_\\s]'),'i');
  accounts[type] = pr.test(output) ? 'passed' : fr.test(output) ? 'failed' : 'unknown';
});

const features = [];
if (passed > 0 || failed > 0) {
  const pP = userTypes.filter(t=>accounts[t]==='passed').length;
  const pF = userTypes.filter(t=>accounts[t]==='failed').length;
  features.push({name:'Portal Login — All User Roles',type:'Portal',passed:pP,failed:pF,total:userTypes.length});
  const aP = output.includes('portal loads')?1:0;
  const aA = output.includes('backend API')?1:0;
  if(aP||aA) features.push({name:'Portal Availability',type:'Availability',passed:aP+aA,failed:0,total:2});
}

const result = {
  run_id: `guardian-${Date.now()}`,
  run_date: runDate,
  run_time: new Date().toISOString(),
  duration_ms: Date.now() - startTime,
  exit_code: exitCode,
  trigger: { reason: 'manual_run', eagle_run_id: null, eagle_feature: null, eagle_status: null },
  summary: { total: passed+failed+skipped, passed, failed, skipped },
  status: failed === 0 ? 'passing' : 'failing',
  output: output.slice(-2000),
  accounts,
  features
};

if (!fs.existsSync(TEST_RUNS)) fs.mkdirSync(TEST_RUNS, { recursive: true });
fs.writeFileSync(path.join(TEST_RUNS,'latest.json'), JSON.stringify(result,null,2));
fs.writeFileSync(path.join(TEST_RUNS,result.run_id+'.json'), JSON.stringify(result,null,2));
fs.writeFileSync(path.join(TEST_RUNS,runDate+'.md'),
`# Guardian Test Run — ${runDate}
Triggered by: manual run
Status: ${result.status.toUpperCase()}

## Summary
- Passed: ${passed} · Failed: ${failed} · Skipped: ${skipped}
- Duration: ${(result.duration_ms/1000).toFixed(1)}s

## Verdict
${failed===0?'✅ All tests passed — safe for Latha review':'⚠️ '+failed+' failed — review before merging'}
`);

// Append learning log
const entry = `\n## ${runDate} (manual)\n- Tests: ${passed+failed+skipped} · ${passed}p ${failed}f\n- Status: ${result.status.toUpperCase()}\n- Triggered manually from Mission Vault\n`;
if (!fs.existsSync(LEARNING)) fs.writeFileSync(LEARNING,'# Guardian Learning Log\n\n');
fs.appendFileSync(LEARNING, entry);

console.log(`[Guardian-Once] Done: ${passed}p ${failed}f ${skipped}s — ${result.status}`);
process.exit(0);
