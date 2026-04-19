# VEERABHADRA — Master State Reference
# Created: 19 April 2026
# Purpose: Single file that captures everything about how this system works
# Read this at the start of any session if brain files are not attached

---

## THE TWO REPOSITORIES — NEVER MIX

| Repo | What lives here | Who commits |
|------|----------------|-------------|
| threesixtynine-de/369-brain | Brain files, SOPs, decisions, session logs, code snapshot, skills | Shon directly |
| threesixtynine-de/deassists | Portal code only — NestJS, Next.js, shared libs | Latha reviews then commits |

---

## THE PEOPLE

- **Shon AJ** — CEO. Makes all decisions. Tests everything. Directs VEERABHADRA.
- **Latha** — Developer. Reviews ALL code. Commits to GitHub. Merges branches. Role: SUPER_ADMIN. Windows, Node 22.
- **VEERABHADRA** — Master brain in Claude.ai. Plans features. Writes all prompts.
- **Gopika** — Call center. Enters leads. Will use LEAD_CRM role.
- **Don** — Senior Manager. University partnerships. Role: MANAGER.
- **Sajir** — Germany Services Manager. Role: MANAGER.

---

## ACTIVE BRANCH — PORTAL

Branch: feature/portal.shon369
Base: dev_v2 (confirmed by Latha 19 April 2026)
Reference: feature/portal-crm-phase1 (old branch — code copied from here)
URL: https://github.com/threesixtynine-de/deassists/tree/feature/portal.shon369

Old branch feature/portal-crm-phase1 is RETIRED. Do not touch it.

---

## THE 5-STAGE PROCESS — EVERY IT TASK

Stage 1 — PLAN here in VEERABHADRA (Claude.ai)
Stage 2 — BUILD in Claude Code on Mac Mini
Stage 3 — VERIFY in browser + compile check
Stage 4 — COMMIT (specific files only, never git add .)
Stage 5 — LATHA HANDOVER (WhatsApp before push)

Nothing moves to next task until current task merged by Latha.

---

## THE CHANGE LOG SYSTEM

Every branch has: change-logs/BRANCH-CHANGE-LOG-[branch-name].md in 369-brain
Every task gets an entry BEFORE the commit is made
Latha receives: PR link + change log file + WhatsApp message

Current active log: change-logs/BRANCH-CHANGE-LOG-portal.shon369.md

---

## CODE SNAPSHOT — REFERENCE FOR MIGRATION

All working code from old branch saved at:
369-brain/code-snapshot/backend/   — 6 files
369-brain/code-snapshot/frontend/  — 10 files
369-brain/code-snapshot/shared/    — 3 files

Every migrated file is compared line by line against these before committing.

---

## MIGRATION TASK ORDER — 8 TASKS SEQUENTIAL

| # | Task | Files | Status |
|---|------|-------|--------|
| 1 | Design tokens | crmTokens.ts | NOT STARTED |
| 2 | Backend entity + ID service | lead.entity.ts, lead-id.service.ts | NOT STARTED |
| 3 | Backend routing + module + controller + service | 4 files + app.module.ts + collections.ts | NOT STARTED |
| 4 | Badge components | StatusBadge.tsx, QueueBadge.tsx | NOT STARTED |
| 5 | Queue View page | 5 files | NOT STARTED |
| 6 | New Lead Form | pages/leads/new.tsx | NOT STARTED |
| 7 | Dashboard | pages/dashboard/index.tsx | NOT STARTED |
| 8 | Sidebar + Avatar | libs/shared-ui/ files | NOT STARTED |

---

## BRAIN FILE LOCATIONS — WHERE EVERYTHING LIVES

```
369-brain/
├── CLAUDE.md                  ← codebase rules for Claude Code
├── VEERABHADRA.md             ← company identity and master state
├── change-logs/
│   └── BRANCH-CHANGE-LOG-portal.shon369.md
├── code-snapshot/
│   ├── backend/               ← 6 backend files from old branch
│   ├── frontend/              ← 10 frontend files from old branch
│   └── shared/                ← 3 shared files from old branch
├── memory/
│   ├── session-state.md       ← current build position (rewritten every session)
│   ├── activity-log.md        ← permanent session history (only appended)
│   ├── decisions.md           ← all locked decisions
│   ├── it-change-log-sop.md   ← IT change log rules
│   ├── portal-shon369-sop.md  ← 5-stage process SOP
│   └── session-workflow.md    ← how sessions start and end
├── skills/
│   ├── sales-design/          ← Sales Output Engine skill
│   ├── sidebar-audit.md       ← sidebar audit skill
│   └── uiux-superman.md       ← UIUX redesign skill
├── company/                   ← partners, revenue, sales, vision
├── services/                  ← CRM, admissions, accommodation, etc
└── technology/                ← codebase, mobile, automation brains
```

---

## WHAT NEVER HAPPENS

- Never git add . in either repo — always specific file paths
- Never commit tool folders (.superpowers, .cursor, .compound-engineering)
- Never push without Latha on a call
- Never commit directly to dev_v2 or main
- Never commit brain files to deassists portal repo
- Never run Prettier on whole codebase
- Never use pm2 kill — always pm2 stop
- Never skip brain commit at session end

---

## SESSION RHYTHM

START: New chat → attach session-state.md + activity-log.md from GitHub → say "VEERABHADRA — [context]"
WORK: Plan here → build in Claude Code → test in browser → commit portal code → update change log
END: Terminal prompt → update session-state.md + activity-log.md + decisions.md → commit to 369-brain

---

## PENDING BLOCKERS

- assigned_to enum EMPTY — needs 37 agent names from Sheets col K =UNIQUE(K2:K9999)
- JWT secrets not rotated — Latha CRITICAL
- 4 AWS ACL errors — Latha
- Stripe write-back bug — Latha
- Security guard bypass scope.guard.ts ~L79 — Latha
- LEAD_CRM + SALES_SETUP roles not yet in codebase

---

## FILES THAT STILL NEED UPDATING (old branch name)

These brain files still reference feature/portal-crm-phase1 as active:
- CLAUDE.md — line: "feature/portal-crm-phase1 — active build branch"
- VEERABHADRA.md — Scenario 3 and ACTIVE BRANCH section
- memory/session-workflow.md — "Active branch: feature/portal-crm-phase1"
- memory/session-state.md — still showing Session 16, not Session 17

These must be corrected before next session.

---

*VEERABHADRA — Master State Reference*
*Created: 19 April 2026*
