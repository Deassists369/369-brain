// harness/core/orchestrator.js
// Workflow logic — NOT rules. Rules live in CODING-CONSTITUTION.md.
// This file decides what sequence of commands to run based on what changed.
// Owner: Shon AJ | Brain: VEERABHADRA

const { execSync } = require('child_process');
const path = require('path');

const PORTAL = path.join(process.env.HOME, 'deassists');

// Detect what changed in the portal — used to decide which orchestration to run
function getChangedFiles() {
  try {
    const output = execSync(`cd ${PORTAL} && git diff --name-only HEAD 2>/dev/null`, { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (e) {
    return [];
  }
}

function touchedSidebarOrPermissions(changedFiles) {
  return changedFiles.some(f =>
    f.includes('libs/shared/models/sidemenu.ts') ||
    f.includes('libs/shared/functions/permission.helper.ts')
  );
}

function touchedSharedLib(changedFiles) {
  return changedFiles.some(f => f.includes('libs/shared/'));
}

// The discovered workflow: when sidebar changes, backend serves the menu
// so we MUST restart backend in addition to cms. This is workflow knowledge
// not a rule — it tells the harness what sequence of commands to run.
async function runFullRestartSequence(log) {
  log('Sidebar/permission change detected — running full restart sequence');
  log('Step 1/4: rebuild shared library');
  execSync(`cd ${PORTAL} && npx nx build shared --skip-nx-cache`, { encoding: 'utf8', timeout: 180000 });
  log('Step 2/4: restart backend (it serves the filtered menu)');
  execSync('pm2 restart backend', { encoding: 'utf8' });
  log('Step 3/4: restart cms with cache clear');
  execSync(`pm2 stop cms && rm -rf ${PORTAL}/apps/cms-next/.next && pm2 start cms`, { encoding: 'utf8' });
  log('Step 4/4: wait 90 seconds for compilation');
  execSync('sleep 90');
  log('Restart sequence complete');
}

async function runSharedRebuild(log) {
  log('Shared library change detected — rebuilding');
  execSync(`cd ${PORTAL} && npx nx build shared --skip-nx-cache`, { encoding: 'utf8', timeout: 180000 });
  log('Shared library rebuilt');
}

module.exports = {
  getChangedFiles,
  touchedSidebarOrPermissions,
  touchedSharedLib,
  runFullRestartSequence,
  runSharedRebuild,
};
