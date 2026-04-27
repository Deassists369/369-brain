# Git Workflow — DeAssists Portal

# Last updated: 27 April 2026

# Active branch: feature/portal.shon369

## THE COMMIT SEQUENCE — IN THIS EXACT ORDER

1. npm run build:all — all 4 projects must pass, zero new errors

   Note: npx tsc --noEmit alone is not enough — it misses Nx build errors

2. Three grep checks — any result = fix before committing:

     grep -rn "await fetch(" apps/cms-next/components/ apps/cms-next/pages/

     grep -rn "getCookie" apps/cms-next/components/ apps/cms-next/pages/

     grep -rn "Authorization.*Bearer" apps/cms-next/components/ apps/cms-next/pages/

3. git add [specific file paths] — list each file explicitly

4. git diff --staged --name-only — read every file on this list

5. If more than 10 files staged: STOP — something went wrong with staging

6. git commit -m "type(area): description"

7. Do NOT push — commit stays local until Latha is on a call

## COMMIT MESSAGE FORMAT

type(area): plain English description

Types: feat / fix / design / chore / security / brain

Examples:

  feat(leads): add CallLogModal and Log Call button to LeadDetailPanel

  fix(crm): replace raw fetch with useLeadStats hook in dashboard

  design(sidebar): UIUX Superman visual pass — zero logic changes

  brain: session close 27 Apr — api-patterns and permission-patterns created

## THE TESTER-READY STANDARD

Only commit when the code is ready to be tested on qa-portal.deassists.com.

If not ready for the tester — stage with git add, keep building, do not commit.

Staging is safe and reversible. Committing locks it for Latha and testers.

Question before every commit: "Is this ready to test on QA right now?"

## LATHA HANDOVER MESSAGE (send before every push)

"Latha — pushing now.

Branch: feature/portal.shon369

Task: [what was built]

Files changed:

1. [filename] — [one sentence what it does]

2. [filename] — [one sentence what it does]

What to check: [exact URL and what to verify in browser]

No new packages installed. No files outside this list were modified. Safe to pull."

Push only after she confirms received.

## ABSOLUTE RULES — NEVER BREAK

Never: git add .

Never: git add -A

Never: npx prettier --write . (or any directory)

Never: npx prettier --write on any file not part of current task

Never: commit directly to main or dev_v2

Never: git commit --amend after a push

Never: commit pnpm-lock.yaml (Latha owns it)

Never: commit CLAUDE.md to the deassists repo (lives in 369-brain only)

Never: commit the deassists submodule (always shows modified — always ignore)

## AFTER EVERY PORTAL COMMIT

Run graphify to keep knowledge graph current:

cd ~/deassists && /opt/homebrew/bin/graphify update . --output ~/deassists-workspace/369-brain/graphify-out/

## BRAIN COMMITS (369-brain repo — separate from portal)

cd ~/deassists-workspace/369-brain

git add memory/session-state.md

git add memory/activity-log.md

git add [any other brain file changed today]

git diff --staged --name-only

git commit -m "brain: session close DD Mon — [what changed in one line]"

git push origin main
