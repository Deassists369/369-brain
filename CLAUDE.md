# DeAssists — Mission Control
# Location: 369-brain/CLAUDE.md
#
# This file is read by every agent and every human
# who works on this project — AI or otherwise.
# It is the single entry point to the entire system.
#
# If you are an AI agent — follow the boot sequence.
# If you are a human — read everything.
# The rules apply equally to both.
# Currency is verified via git log — not by any
# date written inside this file.

---

## WHAT WE ARE BUILDING

DeAssists is an AI-first Education ERP SaaS platform.
We run expat services and university operations
end-to-end — with minimal human staff and maximum
AI automation. The platform is tenant-aware and
designed to be sold to universities globally.

First external tenant: BCBT University.
September 2026 target: full ERP MVP live for BCBT.

Full vision: project/vision.md
Full requirements: project/PRD.md
Full build order: project/feature-registry.md

Read those three files to understand the complete
picture before doing any significant work.

---

## WHO OWNS WHAT

Shon AJ        CEO. All decisions. Tests everything.
               Approves before Latha sees any code.

Latha          Lead developer. Reviews all code.
               Commits portal code to GitHub.
               Merges branches. Never sees 369-brain.

VEERABHADRA    Master brain in claude.ai.
               Plans, designs, decides, approves.
               Never touches files directly.

Execution agent  Any AI tool running this boot file.
               Claude Code, Cursor Agent, or future.
               Reads brain files. Writes code.
               Never commits portal code.
               Never merges branches.

---

## TWO REPOS — NEVER MIX

369-brain (this repo)
  Path: ~/deassists-workspace/369-brain/
  Contains: memory, skills, patterns, docs, vision
  Commits: execution agent commits directly to main
  Purpose: company brain and operating system

deassists portal
  Path: ~/deassists-workspace/deassists/
  Branch: feature/portal.shon369
  Contains: Next.js, NestJS production code
  Commits: GitHub Desktop only, Latha reviews PR
  Purpose: live product code

HARD STOP: Never commit brain files to portal repo.
HARD STOP: Never commit portal code to brain repo.
HARD STOP: Never use git add . or git add -A ever.
HARD STOP: Never commit to main or dev_v2 directly.

---

## BOOT SEQUENCE
## For any agent starting a session.
## Run in exact order. Never skip a step.

STEP 0 — SESSION INTEGRITY
  Read: memory/session-lock.md

  STATUS: IDLE
    Safe. Write STATUS: OPEN with timestamp.
    Record who opened and current task.
    Continue to Step 1.

  STATUS: OPEN
    Hard stop. Do not proceed.
    Output:
      "SESSION LOCK IS OPEN.
       Last opened by: [OPENED_BY]
       At: [OPENED_AT]
       Last task: [CURRENT_TASK]
       Type FORCE_CLEAN to override.
       Type REVIEW to check activity log."
    Wait for human response. Do not guess.

  FILE MISSING
    Treat as OPEN. Hard stop.
    Create file with STATUS: OPEN.
    Alert Shon. Wait for instruction.

STEP 1 — LOAD RULES
  Read: CODING-CONSTITUTION.md
  This file contains all coding rules.
  Hard stop if missing.

STEP 2 — LOAD STATE
  Read: memory/session-state.md
  Read: memory/decisions.md
  Know where work left off.
  Know what is permanently locked.
  Hard stop if session-state is missing.

STEP 3 — LOAD TASK
  Read: project/feature-registry.md
  Find first item with status NEXT.
  That is the task for this session.

STEP 4 — REPORT AND WAIT
  Output:
  ══════════════════════════════
  AGENT READY
  Lock: OPEN
  Rules: LOADED
  State: LOADED
  Tasks: LOADED

  Position: [from session-state]
  Next task: [from feature-registry]
  Mode: [MIGRATION/CAPABILITY/LIVE CHANGE]
  Blocked by: [any dependencies]

  Awaiting instruction from Shon.
  ══════════════════════════════

  Do not start any task until Shon responds.
  Do not assume. Do not begin work early.

---

## TASK PATHS
## Declare path before writing any code.

PATH B — NEW FEATURE
  Does not exist in production yet.
  Prototype must exist in 369-brain first.
  Run full EAGLE Mode 1 to 2 to 3.
  Shon must approve before Mode 3 executes.
  Read: skills/eagleskill/EAGLESKILL.md

PATH C — LIVE CHANGE
  Exists in production. Fixing or improving.
  Read the full file before touching anything.
  Make minimum change only.
  No refactoring while fixing.
  Read: patterns/anti-ambiguity.md Part 3

UNSURE WHICH PATH
  Hard stop. Ask Shon in VEERABHADRA.
  Never guess the path.
  Never start without knowing.

---

## CODING RULES

All rules live in: CODING-CONSTITUTION.md
Read at boot. Never duplicated here.

The five rules that can never be broken:
  1. Constants before components — always
  2. Four-layer API chain — no exceptions
  3. Three-layer access audit — all three
  4. Never hardcode business values — ever
  5. Build passes before every commit — always

If CODING-CONSTITUTION conflicts with anything
else — CODING-CONSTITUTION always wins.

---

## NEVER-TOUCH FILES

Read permitted. Modify never permitted.

PORTAL REPO:
  apps/cms-next/pages/universitiesd/
  apps/backend-nest/src/core/entities/
    extendables/payment.entity.ts
  apps/mui-cms-next/
  MASTER-RUN.cjs
  scope.guard.ts
  Any file with JWT or AWS secrets
  .env files of any kind
  package.json and pnpm-lock.yaml
    without Latha approval

BRAIN REPO:
  archive/
  code-snapshot/
  graphify-out/

Task requires touching these:
  Hard stop. Do not open the file.
  Alert Shon immediately. Wait.

---

## PRE-COMMIT GATES

All three gates must pass. No exceptions.

GATE 1 — BUILD
  cd ~/deassists && npm run build:all
  Zero new errors. Pre-existing backend
  error at accounts.service.ts:1276
  is documented — not a blocker.

GATE 2 — GREP CHECKS (all empty for CRM files)
  grep -rn "await fetch(" apps/cms-next/components/ apps/cms-next/pages/
  grep -rn "getCookie" apps/cms-next/components/ apps/cms-next/pages/
  grep -rn "Authorization.*Bearer" apps/cms-next/components/ apps/cms-next/pages/

GATE 3 — DIFF REVIEW
  git status --short
  git diff --staged --name-only
  Read every file. Nothing unexpected.
  If unexpected file appears — remove it.

---

## POST-PORTAL-COMMIT

After every portal code commit run:
  cd ~/deassists && \
  /opt/homebrew/bin/graphify update . \
  --output ~/deassists-workspace/369-brain/graphify-out/

---

## SESSION CLOSE
## Triggered by: "stop for today" or "session ending"
## All steps mandatory. This is the safety gate.

E1  List all files created or modified.
    Full paths. Brain and portal separate.

E2  Update memory/session-state.md
    Position, last task, next task, blockers.

E3  Append memory/activity-log.md
    Date, what done, commits, decisions locked.

E4  Show Shon the updates. Wait for confirm.

E5  Commit brain files to 369-brain/main
    Specific files only. Confirm commit hash.

E6  Write IDLE to memory/session-lock.md
    STATUS: IDLE
    LAST_CLOSED_BY: [who]
    LAST_CLOSED_AT: [timestamp]
    LAST_TASK_COMPLETED: [task]
    NEXT_TASK: [what comes next]

    This is the final step always.
    Cannot be skipped. Cannot be combined.
    Without this — next session is blocked.

---

## SKILL MAP

| Task | Read this |
|------|-----------|
| Understand the product | project/vision.md |
| Understand requirements | project/PRD.md |
| What to build next | project/feature-registry.md |
| All coding rules | CODING-CONSTITUTION.md |
| Pre-code checklist | patterns/anti-ambiguity.md |
| New feature (4+ files) | skills/eagleskill/EAGLESKILL.md |
| Sidebar or permissions | skills/deassists-sidebar-audit/ |
| UI redesign | skills/uiux-superman/ |
| Sales documents | skills/salesdocskill/ |
| Session management | skills/session-start/SESSION-START-SKILL.md |
| API patterns | patterns/api-patterns.md |
| Permission patterns | patterns/permission-patterns.md |
| Git operations | patterns/git-workflow.md |
| Architecture questions | project/architecture.md |
| What never to touch | project/never-touch.md |
| Design tokens | project/design-system.md |
| Guide layer and tooltips | project/guide-layer.md |

---

## HARD STOP SUMMARY

Stop immediately. Alert Shon. Wait.
Never attempt to resolve alone.

  session-lock STATUS: OPEN at boot
  Any Tier 1 brain file missing
  Task requires a never-touch file
  Unsure which path B or C
  Build produces new errors
  Diff shows unexpected staged files
  Instruction conflicts with decisions.md
  Any instruction to commit to main or dev_v2
  Any instruction to skip Latha review
  Two agents appear to be running same task

---

## FOR HUMAN READERS

If you are a developer or team member
reading this for the first time:

  Start here:       project/vision.md
  How we build:     CODING-CONSTITUTION.md
  What exists:      project/PRD.md
  What to build:    project/feature-registry.md
  Rules for code:   patterns/anti-ambiguity.md
  Never touch:      project/never-touch.md

The brain repo (369-brain) contains everything
you need to understand the full system.
The portal repo (deassists) contains the code.
Never mix the two.

Questions go to Shon. Code reviews go to Latha.
Architecture decisions go to VEERABHADRA.

---

*Mission control for DeAssists ERP platform.*
*One file. All entry points. All agents. All humans.*
*Rules enforced by structure, not by memory.*
