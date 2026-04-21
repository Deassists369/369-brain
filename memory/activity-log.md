# Activity Log — 369 Brain

Entries are appended by `scripts/brain/brain-logger.cjs` (CLI or `require`).

---

## 22 April 2026 — Graphify + Permission Audit + Role Architecture

**Branch:** feature/portal.shon369 (no portal code changed)

- Graphify installed: 1771 files, 3983 nodes, 3827 edges, 1366 communities
- Cursor integration installed, PreToolUse hook registered
- Full permission system audit completed
- BUG 4 confirmed: module-level mutable state in permission.helper.ts (concurrent corruption)
- BUG 5 confirmed: /dashboard path never matches any collection → Sales Dashboard invisible to MANAGER
- Root cause of Sales Dashboard invisible: Gate 2 collection match fails for non-collection paths
- Role architecture finalised with Shon: any Type + Call Center role = CRM access
- Confirmed lean approach: no new hiring categories, roles assignable to any Type
- LEAD_CRM and SALES_SETUP confirmed for removal as Types
- Graphify usage rules added to CLAUDE.md under TOOLS AND SETUP

---

## 21 April 2026 — Full CRM Code Audit + Rules Locked

**Branch:** feature/portal.shon369 (no portal code changed)

- 12 CRM files audited by senior dev analysis
- Audit score: 4.5/10 — foundation correct, 3 critical bugs found
- Bug 1: Queue name mismatch — all counts show 0 (entity vs service string mismatch)
- Bug 2: 'Completed' status invalid — entity uses 'Converted', service sets 'Completed'
- Bug 3: Initial comment silently dropped — frontend sends, backend ignores
- Rules 15–18 locked in CLAUDE.md (enums, read-before-write, minimal changes, no behaviour change)
- lead.constants.ts architecture decided: LeadStatus, LeadQueue, LeadSource, LeadService, CallOutcome, SidebarRole, CRM_ALLOWED_ROLES
- LEAD_CRM and SALES_SETUP to be removed as Types — replaced by role-based access
- Sales Dashboard moves to Call Center 369 children
- SidebarRole enum approach locked — no magic strings

---

## 20 April 2026 — QA Testing + Sales Intelligence PRD

**Branch:** feature/portal.shon369 (no portal code changed)

- CRM Phase 1 pushed to qa.deassists.com by Latha
- Kingston tested — network error found (pm2 restart needed)
- Root cause: Kingston logged into Arden org, not DeAssists
- Tester guide created and sent to Kingston
- LATHA-SERVICES-FIELD-ADDITIONS.docx created
- DEASSISTS-SALES-INTELLIGENCE-MASTER-PRD.docx created
- Decision locked: Shon + VEERABHADRA do UIUX redesign — not Latha

---

## 21 April 2026 — VEERABHADRA / Full CRM Phase 1 Code Audit + Brain Update

**Branch:** feature/portal.shon369 (audit only — no portal code changed)

### What Happened

1. FULL CRM AUDIT — 12 FILES READ AND ANALYSED
   Senior dev analysis of every file created or modified in Phase 1.
   Files covered: user.types.ts, collections.ts, sidemenu.ts, permission.helper.ts,
   lead.entity.ts, leads-routing.service.ts, leads.controller.ts, leads.service.ts,
   leads/index.tsx, leads/new.tsx, dashboard/index.tsx, crmTokens.ts.

2. THREE CRITICAL BUGS FOUND
   BUG 1: Queue name mismatch — entity uses '369_MAIN', getQueueCounts() searches '369_CALL_CENTER'.
          All queue counts show 0. Sidebar badge is broken live.
   BUG 2: Status 'Completed' does not exist in entity enum. convert() sets 'Completed',
          getStats() filters on 'Completed'. Converts may fail silently. Stats are wrong.
   BUG 3: Frontend sends initial_comment in create payload. Backend ignores it.
          Initial notes are silently dropped and never saved to database.

3. SHARED ENUM ARCHITECTURE DECIDED
   lead.constants.ts to be created: LeadStatus, LeadQueue, LeadSource, CallOutcome enums.
   SidebarRoles enum to be created in libs/shared/constants/.
   CRM_ROLES constant to replace repeated role arrays in every controller endpoint.

4. CODE STANDARDS LOCKED IN CLAUDE.md
   Rules 15–18 added: Enums non-negotiable, Read before writing,
   Minimal changes only, Never change behaviour only organisation.

5. BRAIN FULLY UPDATED
   session-state.md: 3 critical bugs documented with full detail.
   decisions.md: 7 new decisions added.
   activity-log.md: this entry.

**Audit score:** 4.5 / 10 — foundation exists but 3 critical bugs + widespread magic strings
**No portal code changed in this session.**

---

## 19 April 2026 — VEERABHADRA / Final Session Close — CRM Phase 1 Squashed + Pushed

**Branch:** feature/portal.shon369

### SESSION SUMMARY

All 7 CRM commits squashed into one clean commit (26d8957e). Force pushed to GitHub.
Rule 14 added to CLAUDE.md — one phase one commit, always confirm before committing.
Session properly closed. Waiting for Latha review and merge.

### WHAT WAS DONE

**1. All 7 commits squashed into one clean commit**
Commit: 26d8957e
Message: feat(crm): CRM Phase 1 complete — leads management system
22 files total — 16 new files + 6 modified files.
Force pushed to feature/portal.shon369 on GitHub.

**2. Rule 14 added to CLAUDE.md**
One phase = one commit. Always ask Shon "Is this feature/phase complete and fully tested?"
Before committing. Stage freely, commit only when done.
Never multiple commits for the same feature or phase.

**3. Session properly closed**
All brain files updated. Latha handover confirmed.
Branch: feature/portal.shon369
One clean commit: 26d8957e — feat(crm): CRM Phase 1 complete — 22 files
Waiting for Latha to review and merge to dev_v2.

### NEXT PRIORITIES

- Q Intelligence fields + CallLogModal
- UIUX redesign

### KEY DECISIONS

- One commit per phase — Rule 14 locked permanently in CLAUDE.md
- Always confirm feature complete before committing
- Stage freely, commit only when done

---

## 19 April 2026 — VEERABHADRA / CRM Migration Complete + Sidebar (Session 17 continued)

**Branch:** feature/portal.shon369

### SESSION SUMMARY

CRM migration fully completed. All 16 new files and 4 modified files committed and pushed.
Sidebar updated with Call Center 369 and Sales CRM. Sidebar audit passed all 7 checks.
Pre-commit hook permanently removed. Latha handover package prepared and sent.

### WHAT WAS DONE

**1. All 6 CRM commits pushed to feature/portal.shon369**
- f8a28f87 — chore(crm): add design tokens — crmTokens.ts
- bee4c6b5 — feat(crm): add lead entity and ID service
- 4e81cbe4 — feat(crm): add leads backend module
- f1123638 — feat(crm): add leads frontend components and pages
- ebabbe9c — feat(crm): add sales dashboard
- de62cd72 — feat(crm): add Call Center 369 and Sales CRM to sidebar
Commits were grouped in 3 batches per Latha's preference, pushed together at end of session.

**2. Pre-commit hook removed permanently**
.husky/pre-commit deleted. git config --unset core.hooksPath run.
Hook was running prettier --write . on every commit — root cause of 1000+ file disaster.
Now replaced with non-blocking reminder only. CLAUDE.md Rule 11 + Rule 13 enforced.

**3. Sidebar updated — sidemenu.ts only**
Call Center 369: SUPER_ADMIN, ORG_ADMIN, MANAGER, LEAD_CRM
Sales CRM: SUPER_ADMIN, ORG_ADMIN, MANAGER, SALES_SETUP
Inserted after Dashboard, before Applications (lines 21–65).
UserTypes.LEAD_CRM and UserTypes.SALES_SETUP confirmed already in user.types.ts.

**4. Sidebar audit — all 7 checks passed**
SUPER_ADMIN ✅ MANAGER ✅ LEAD_CRM (CC369 only) ✅ SALES_SETUP (CRM only) ✅
STAFF blocked ✅ AGENT blocked ✅ No existing items broken ✅
Flag B raised: Sales Dashboard child path /dashboard won't match collection for non-SUPER_ADMIN.
Decision required before next build session.

**5. Latha handover package prepared and sent**
Branch: feature/portal.shon369
Change log: BRANCH-CHANGE-LOG-portal.shon369.md filled with all 6 commit hashes.
Waiting for Latha review and merge.

### FILES MODIFIED TODAY (this session — deassists portal)

- `libs/shared/models/sidemenu.ts` — Call Center 369 + Sales CRM sections added
- `.husky/pre-commit` — DELETED permanently

### FILES COMMITTED TODAY (full CRM migration — all 6 commits)

**New files (16):**
- apps/cms-next/styles/crmTokens.ts
- apps/backend-nest/src/leads/entities/lead.entity.ts
- apps/backend-nest/src/leads/lead-id.service.ts
- apps/backend-nest/src/leads/leads-routing.service.ts
- apps/backend-nest/src/leads/leads.module.ts
- apps/backend-nest/src/leads/leads.controller.ts
- apps/backend-nest/src/leads/leads.service.ts
- apps/cms-next/components/leads/StatusBadge.tsx
- apps/cms-next/components/leads/QueueBadge.tsx
- apps/cms-next/components/leads/LeadQueueSidebar.tsx
- apps/cms-next/components/leads/LeadTable.tsx
- apps/cms-next/components/leads/LeadDetailPanel.tsx
- apps/cms-next/components/leads/CommentThread.tsx
- apps/cms-next/pages/leads/index.tsx
- apps/cms-next/pages/leads/new.tsx
- apps/cms-next/pages/dashboard/index.tsx

**Modified files (4):**
- apps/backend-nest/src/app.module.ts
- libs/shared/constants/collections.ts
- libs/shared/models/sidemenu.ts
- apps/backend-nest/src/accounts/accounts.service.ts (779c7930 — ACL fix, Latha approved)

### KEY DECISIONS

- Pre-commit hook permanently removed — no blanket formatting ever
- Sidebar hook changed to non-blocking reminder only
- CRM migration done in 3 groups not 7 individual commits — Latha's preference
- All 6 commits local before pushing — push together at session end
- LEAD_CRM and SALES_SETUP already exist in user.types.ts — no separate step needed

### CURRENT STATUS

Branch: feature/portal.shon369
All 6 CRM commits pushed. Sidebar audit passed. Waiting for Latha review and merge.

---

## 19 April 2026 — VEERABHADRA / Branch Reset + 5-Stage SOP + Change Log System (Session 17)

**Branch:** feature/portal.shon369 (new clean branch from dev_v2)

### SESSION SUMMARY

Major reset session. Old branch feature/portal-crm-phase1 retired after reviewing all problems.
New branch feature/portal.shon369 declared from dev_v2. Complete process discipline established.

### WHAT WAS DONE

**1. Old branch problems reviewed**
Full review of all problems and solutions from feature/portal-crm-phase1.
Complete build summary reviewed — 16 files added, 2 modified across 8 tasks.
Decision: old branch retired. Fresh start with new discipline.

**2. New branch declared**
Branch feature/portal.shon369 created from dev_v2 (confirmed by Latha 19 April 2026).
Reference branch for code migration: feature/portal-crm-phase1.
No code committed yet — ready for Task 1.

**3. 5-Stage SOP locked permanently**
New standard operating procedure for all IT work:
Stage 1 — Plan (VEERABHADRA writes full task plan)
Stage 2 — Compare (verify file against reference branch)
Stage 3 — Build (write file in Claude Code)
Stage 4 — Document (add entry to branch change log before commit)
Stage 5 — Commit (git add specific files only, never git add .)

**4. IT Change Log SOP created**
Permanent addition to all portal and IT work.
Every branch has a BRANCH-CHANGE-LOG file.
Every task gets an entry before commit.
Every PR to Latha includes the change log.
Saved to: memory/it-change-log-sop.md

**5. Branch change log created**
BRANCH-CHANGE-LOG-portal.shon369.md created for new branch.
8 task templates pre-written for migration.
Running summary table at bottom.
Saved to: change-logs/BRANCH-CHANGE-LOG-portal.shon369.md

**6. Code snapshot taken from old branch**
19 files copied from feature/portal-crm-phase1 for line-by-line comparison.
Saved to: code-snapshot/ folder in 369-brain.
This is the reference for all migration tasks.

### FILES CREATED

- ~/deassists-workspace/369-brain/change-logs/ — new folder
- ~/deassists-workspace/369-brain/change-logs/BRANCH-CHANGE-LOG-portal.shon369.md
- ~/deassists-workspace/369-brain/memory/it-change-log-sop.md
- ~/deassists-workspace/369-brain/code-snapshot/ — 19 reference files

### KEY DECISIONS

- feature/portal-crm-phase1 retired — no more commits to old branch
- feature/portal.shon369 = new clean branch from dev_v2
- 5-stage SOP = permanent standard for all IT work
- IT Change Log SOP = every branch, every task, every PR
- Code snapshot = reference for all migration tasks

### CURRENT STATUS

Branch: feature/portal.shon369
Status: Ready for Task 1 (Design Tokens)
Change log: BRANCH-CHANGE-LOG-portal.shon369.md ready
Reference: code-snapshot/ files ready for comparison

---

## 19 April 2026 — VEERABHADRA / Sales Output Engine + Karpathy + Workflow (Session 16)

**Branch:** main (369-brain repo)

### SESSION SUMMARY

Full strategy and design session. No portal code written today.
Three major things completed.

### WHAT WAS BUILT

**1. Session workflow tested and locked**
Tested new session start. GitHub MCP not loading in chat.
Decision: session start = attach session-state.md + activity-log.md 
from GitHub via + button in chat input every session.
This is now the permanent workflow. Documented in session-workflow.md.

**2. Karpathy principles researched and merged into CLAUDE.md**
Read Karpathy CLAUDE.md — 4 principles for better AI coding:
Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution.
Also read Karpathy LLM Wiki gist — MARP mentioned as one tool among many.
Merged all 4 principles into our CLAUDE.md rewritten in DeAssists language.
49 lines added. Commit bc2ad97 pushed to 369-brain.

**3. Sales Output Engine designed and saved**
Full Salesdocskill.md designed from scratch.
8-step build process. Senior Creative Director persona.
Web research mandatory. Claude native design + MARP export.
PPT + PDF every output. 12-point quality gate.
5 output template types. Full brand system encoded.
Folder structure created: data / templates / inputs / outputs.
Commit 578ed1f pushed to 369-brain.

### FILES CHANGED

- ~/deassists-workspace/369-brain/CLAUDE.md — Karpathy principles added
- ~/deassists-workspace/369-brain/skills/sales-design/Salesdocskill.md — CREATED
- ~/deassists-workspace/369-brain/skills/sales-design/data/ — CREATED
- ~/deassists-workspace/369-brain/skills/sales-design/templates/ — CREATED
- ~/deassists-workspace/369-brain/skills/sales-design/inputs/ — CREATED
- ~/deassists-workspace/369-brain/skills/sales-design/outputs/ — CREATED

### KEY DECISIONS

- Session start = attach session-state.md + activity-log.md via + button — permanent
- Salesdocskill.md is the Sales Output Engine — lives in skills/sales-design/
- MARP for slide export — PPT + PDF both every time
- Old brochures = content extraction only — never design reference
- Web research mandatory on every sales output — no stale data ever

### NEXT SESSION

Priority options:
A — Q Intelligence fields + CallLogModal (portal CRM build)
B — Fill sales data files (universities, courses, services, accommodation)
C — Install MARP + run first test output with Salesdocskill

---

## 18-19 April 2026 — VEERABHADRA / Session Workflow Locked (Session 15)

**Branch:** `main` (369-brain repo)

### SESSION SUMMARY

This session locked the complete session workflow — how we start, work, and end every session.
The goal was to eliminate drift by establishing GitHub 369-brain as the single source of truth.

### WHAT WAS BUILT

**1. memory/session-workflow.md — CREATED**
Complete session workflow documentation:
- THE SINGLE SOURCE OF TRUTH — GitHub 369-brain is the only record
- THE TWO REPOSITORIES — 369-brain (memory) vs deassists (code)
- ONE SESSION = ONE CHAT — clean separation per working block
- SESSION START — VEERABHADRA asks to read GitHub via MCP
- SESSION END — non-negotiable brain commit
- WHAT GETS SAVED WHERE — complete file map for all brain files
- HOW TO DO BRAIN COMMIT FROM PORTAL — step-by-step instructions
- GOLDEN RULES — 6 rules that must never be broken

**2. VEERABHADRA.md — MODIFIED**
Replaced THE SESSION RHYTHM section with:
- Link to memory/session-workflow.md for full detail
- THE COMPLETE DAILY LOOP — 8-step visual summary
- SESSION START — 5 steps
- SESSION END — NON-NEGOTIABLE — terminal prompt + git commands

**3. CLAUDE.md — MODIFIED**
Added new section at end: SESSION END — ALWAYS SAVE TO 369-BRAIN
- AT END OF EVERY SESSION — RUN THIS (4 steps)
- THE ONE RULE — 369-brain is the single destination

**4. memory/decisions.md — MODIFIED**
7 new decisions locked:
- One session = one chat in VEERABHADRA project
- 369-brain GitHub = single source of truth for all memory
- No files stored in Claude Project
- VEERABHADRA asks to read GitHub at every session start
- VEERABHADRA flags SAVE THIS mid-session for important decisions
- Git rules live in CLAUDE.md only — never duplicated elsewhere
- Session end brain commit is non-negotiable

### FILES CHANGED

- `/Users/deassists369/deassists-workspace/369-brain/memory/session-workflow.md` — CREATED
- `/Users/deassists369/deassists-workspace/369-brain/memory/decisions.md` — MODIFIED
- `/Users/deassists369/deassists-workspace/369-brain/VEERABHADRA.md` — MODIFIED
- `/Users/deassists369/deassists-workspace/369-brain/CLAUDE.md` — MODIFIED

### COMMITS PUSHED

- `2021037` — brain: lock session workflow — one source, two repos, two commits 18 Apr
- `4a5f484` — brain: add save map and session end rule to both files 18 Apr

### KEY DECISIONS

- GitHub 369-brain is the single source of truth — no files in Claude Project
- VEERABHADRA must ask to read GitHub at every session start
- Session end brain commit is non-negotiable — only failure mode is skipping it
- Git rules live in CLAUDE.md only — never duplicated in session-workflow.md

### NEXT SESSION

1. Start with "VEERABHADRA — [context]"
2. VEERABHADRA reads from GitHub MCP
3. Priority: Q Intelligence fields + CallLogModal OR questionnaire content

**Brain:** `session-state.md`, `activity-log.md` updated

---

## 18 April 2026 — VEERABHADRA / PM2/Build Cache Debugging (Session 13)

**Branch:** `feature/portal-crm-phase1`

### SESSION HIGHLIGHTS

- **No code changes** — debugging session only
- **Root cause:** Hard `kill -9` from early morning session corrupted `.next/build-manifest.json`
- **PM2 restart loop:** cms process had 422 restarts, kept crashing on corrupted cache
- **Port conflict:** EADDRINUSE on port 4002 due to restart storm

### FIX APPLIED

1. `pm2 stop all`
2. `rm -rf apps/cms-next/.next`
3. `pm2 start all`
4. `pm2 reset cms` (reset restart counter)

### ALL SERVICES VERIFIED

- backend: port 8000 (returns 403 — auth working)
- cms: port 4002 (returns HTML — portal working)
- website: port 4001

### PREVENTION RULE ESTABLISHED

**Use `pm2 stop cms` instead of `kill -9`** to gracefully shut down Next.js.

If stuck: `pm2 stop all && rm -rf apps/cms-next/.next && pm2 start all`

**Brain:** `session-state.md`, `activity-log.md` updated

---

## 15 April 2026 — VEERABHADRA / CLAUDE.md + Compound Engineering Setup (Session 7)

**Branch:** `feature/portal-crm-phase1` (clean, pushed)

### SESSION HIGHLIGHTS

- **Compound Engineering v2.65.0** installed with local config
- **agent-browser** installed globally (browser automation)
- **CLAUDE.md** created (149 lines) — committed `35954f85`
- **git pull** synced 129 commits from origin (fast-forward)
- **Dual codebase discovery:** `libs/shared-ui/` is PRIMARY, not `apps/mui-cms-next/`
- **UIUX Superman:** Step 2 COMPLETE, Step 3 (Design Interview) PENDING

### FILES CREATED

- `/Users/deassists369/deassists/CLAUDE.md` — Codebase intelligence (149 lines)
- `/Users/deassists369/deassists/.compound-engineering/config.local.yaml` — CE local config
- `/Users/deassists369/deassists/.compound-engineering/config.local.example.yaml` — CE example template

### FILES MODIFIED

- `/Users/deassists369/deassists/.gitignore` — Added `.compound-engineering/*.local.yaml`

### TOOLS INSTALLED

- `agent-browser` — Browser automation for testing/screenshots (global npm)

### COMMITS (2 total, pushed)

- `ba7f92d0` — chore: add CLAUDE.md codebase intelligence + CE gitignore rule
- `35954f85` — chore: update CLAUDE.md — skills, dual codebase, build status 15 Apr

### CLAUDE.md CONTENTS (149 lines)

- Team roles (Shon/Latha/VEERABHADRA)
- Monorepo structure (backend-nest, cms-next, website-next, libs)
- Critical patterns: entity imports from `../../types/mongoose.types`, auth via `getCookie('token')`, NestJS static-before-dynamic routes, sidebar config in `permission.helper.ts`
- Files never to touch: BCBT white-label, payment.entity.ts, MASTER-RUN.cjs, Stripe
- Build status with ✅/🔴 indicators
- Skills: Sidebar Audit (mandatory), UIUX Superman (mandatory for visual), Brainstorming
- Dual codebase warning: `libs/shared-ui/` PRIMARY
- CE workflow (8-step feature build process)
- 4 pending blockers

### KEY DISCOVERY

**Dual codebase exists:**
- `libs/shared-ui/` = PRIMARY for portal work
- `apps/mui-cms-next/` = SEPARATE app (do not modify for portal)

### NEXT ACTION

**UIUX Superman Step 3: Design Interview** — Collect design preferences before HTML preview.

**Brain:** `session-state.md`, `activity-log.md` updated

---

## 12 April 2026 — VEERABHADRA / Phase 5 CRM Complete + Bug Fixes (Sessions 1-4)

**COMPLETED**

### SESSION 1 — Queue View Visual Overhaul (9 commits)

- Created `apps/cms-next/styles/crmTokens.ts` — design tokens from prototype
- Restyled 7 lead components to match prototype: StatusBadge, QueueBadge, LeadQueueSidebar, LeadTable, LeadDetailPanel, CommentThread, leads/index.tsx
- Fixed `.husky/pre-commit` CRLF line endings

### SESSION 2 — Phase 5 Implementation (17 commits)

- Created `apps/cms-next/pages/dashboard/index.tsx` — stats overview (total active, by-status, by-queue)
- Created `apps/cms-next/pages/leads/new.tsx` — 4-card form with duplicate modal and success confirmation
- Fixed ALLOWED_ROLES to use valid UserTypes (no DATA_ENTRY)

### SESSION 3 — Bug Fixes: MUI Color Crash + API Proxy (4 commits)

- Fixed "MUI: Unsupported 50, 71, 92 color" crash — replaced MUI Alert/Button/Dialog/Snackbar with Box-based components
- Added API rewrite proxy in `next.config.js`: `/api/*` → `localhost:8000/api/*`
- Added ORG_ADMIN and AGENT to stats endpoint roles in `leads.controller.ts`

### SESSION 4 — Auth Headers + Card Styling Fixes (4 commits)

- Added JWT Authorization header to dashboard and new lead form using `getCookie('token')` pattern
- Fixed card headers: cream background (`crmTokens.cr`), dark text, 14px padding
- Added `overflow: hidden` to cards to prevent icon clipping
- Renamed "Place / Country" → "Current Residence / Country" with ℹ️ tooltip
- Fixed focus loss in text fields with `useCallback` for stable handlers

### FILES MODIFIED TODAY

- `apps/cms-next/styles/crmTokens.ts`
- `apps/cms-next/components/leads/StatusBadge.tsx`
- `apps/cms-next/components/leads/QueueBadge.tsx`
- `apps/cms-next/components/leads/LeadQueueSidebar.tsx`
- `apps/cms-next/components/leads/LeadTable.tsx`
- `apps/cms-next/components/leads/LeadDetailPanel.tsx`
- `apps/cms-next/components/leads/CommentThread.tsx`
- `apps/cms-next/pages/leads/index.tsx`
- `apps/cms-next/pages/dashboard/index.tsx`
- `apps/cms-next/pages/leads/new.tsx`
- `apps/cms-next/next.config.js`
- `apps/backend-nest/src/leads/leads.controller.ts`

### KEY DECISIONS LOCKED

- **Auth pattern:** `getCookie('token')` + `Authorization: Bearer ${token}` header (same as axios-client)
- **No DATA_ENTRY role:** Map to AGENT (Gopika's role)
- **Card styling:** Cream bg, dark text, 14px padding, overflow hidden
- **No MUI color utilities:** Use crmTokens hex values directly to avoid darken/lighten crashes

**Brain:** `session-state.md` updated with 12.04.2026 session block

---

## 07 April 2026 — VEERABHADRA / Phase 1 Portal CRM — FULLY LOCKED (Shon)

**COMPLETED**

### DOCUMENTS PRODUCED AND LOCKED

- **`DEASSISTS-CRM-Phase1-Functional-Specification-v5.docx`** — **LOCKED.** 21-field schema, 10 endpoints, 9 routing rules, 8 statuses, 8 queues, 4 roles, export, filters, duplicate detection, all validation rules.  
- **`DEASSISTS-MASTER-BUILD-PLAN-PHASE1-CRM-FINAL-v5.docx`** — **LOCKED.** 8 build phases, 22 files, endpoint behaviour rules, Phase 5B dashboard, Sales tab placeholder note, convert handoff mechanic, Phase 2A roadmap, filter verification tests.  
- **`DEASSISTS-CRM-Phase1-Rollout-Plan-FINAL.docx`** — **ALIGNED** to locked system.  
- **`DEASSISTS-Lead-Sources-CRM-Connection-Plan-FINAL.docx`** — **ALIGNED.** BCBT routing corrected, Source Detail two-level system.  
- **`DEASSISTS-Lead-Source-Implementation-Plan-FINAL.docx`** — **ALIGNED.** Export CSV row added as NOW priority.  
- **`DEASSISTS-Portal-CRM-Phase1-Prototype-LOCKED-v2.html`** — **LOCKED.** 8 pages, collapsible sidebar, Status + Service filters, Sales tab placeholder, dynamic Source Detail, role comparison table.  

### KEY DECISIONS LOCKED

- VEERABHADRA (Claude) + Shon write all code. Latha reviews and commits. **No exceptions.**  
- **4 CRM roles:** `SUPER_ADMIN`, `MANAGER`, `STAFF`, `DATA_ENTRY`. Align with portal staff system **post-launch.**  
- **Sales tab** in lead detail panel: visible Phase 1, **non-functional.** Programs / Course Finder = **Phase 2A** first module.  
- **Convert endpoint:** Phase 1 **stub.** Phase 2A adds signed portal URL + Application pre-fill.  
- **CRITICAL:** Latha adds `lead_id: { type: String, default: null }` to Application schema **on day 1.**  
- **Source Detail:** free text, optional, **never affects routing.** BCBT = Source: Partner + Source Detail: `"BCBT"`.  
- **Applications sidebar:** existing portal context only, **not** Phase 1.  

### TOMORROW

- Cursor open → **Phase 0:** branch `feature/portal-crm-phase1` from `dev_v2`  
- **Phase 1:** `lead.schema.ts` — VEERABHADRA writes, Latha reviews, Latha commits  
- Confirm role names with Latha **before** starting  

**Brain:** `369-brain/memory/session-state.md` — **07.04.2026** block at top; optional export copy: `design/outputs/SESSION-STATE-UPDATE-07042026.md`  

## 06 April 2026 — VEERABHADRA / MCP Sector 12 — **12-sector alignment complete** (Shon)

**COMPLETED**

- **`369-brain/memory/mcp-sector-12.md`** — what MCP is, current vs future connections, daily ops impact, priority checklist (GitHub, Gmail, Drive, Sheets, custom Portal MCP), MCP + OpenClaw loop  
- **Milestone:** full **12-sector** brain alignment set for DeAssists (Sectors 01–12)

## 06 April 2026 — VEERABHADRA / Storage & connections Sector 11 (Shon)

**COMPLETED**

- **`369-brain/memory/storage-connections-sector-11.md`** — master storage map (Atlas, S3, Sheets legacy, Drive, Gmail, Cursor workspaces, Mac Mini), live vs to-build connections, end-to-end lead→intelligence map, data ownership, GDPR notes, phase checklists; **Sector 12 — MCP** next

## 06 April 2026 — VEERABHADRA / Shon control layer Sector 10 (Shon)

**COMPLETED**

- **`369-brain/memory/shon-control-layer-sector-10.md`** — CEO interaction model (Paperclip primary, WhatsApp alerts, Claude for thinking), daily rhythm, what Shon stops doing manually, phased build of control layer, **filter rules** for what reaches Shon; **Sector 11 — Storage & system connections** next

## 06 April 2026 — VEERABHADRA / Paperclip Sector 09 (Shon)

**COMPLETED**

- **`369-brain/memory/paperclip-sector-09.md`** — Paperclip as company OS (organise/track/govern, not think/execute), CEO dashboard outline, Phase 1–2 governance scope, OpenClaw **under** Paperclip, full operating model table, Phase 0–3 timeline (**~Apr 10** Mac Mini + OpenClaw), standing rules, **Sector 10 — Shon control layer** next

## 06 April 2026 — VEERABHADRA / OpenClaw Sector 08 — CORE MODEL (Shon)

**COMPLETED**

- **`369-brain/memory/openclaw-sector-08.md`** — **Three Layer Model + CEO** locked: Claude (intelligence), OpenClaw (Mac Mini M4 execution), Paperclip (company OS), Shon (CEO); flow Shon → Claude → OpenClaw → Paperclip → Shon; **no layer skipped**

## 06 April 2026 — VEERABHADRA / BUILDERS = Shon + Claude (final lock)

**LOCKED**

- **BUILDERS:** **Shon + Claude** — **all implementation** via **Cursor**  
- **Latha:** **reviews code before every commit and deploy** — does not build  
- **All other team:** **data and feedback only** — **no building**, **no deciding**  
- **Decisions:** **Shon** only  

**Brain:** `session-state.md`, `automation-sector-07.md`, `company-structure-sector-01.md`, `workspace-guide.md`, `portal.md`, `portal-sector-04.md`, `mobile-sector-05.md`, `developer-BRAIN.md`, `mobile-app.md`

## 06 April 2026 — VEERABHADRA / Automation Sector 07 full document (Shon)

**COMPLETED**

- **`369-brain/memory/automation-sector-07.md`** — locked **5-phase** build order (portal CRM → sales → data → connections → automation); **Phase 1** breakdown: `leads` schema, `leads-routing.service.ts` rules, `lead-id.service.ts`, `/v1/leads` API, queue UI, entry form, ALL LEADS migration, verification checklist

## 06 April 2026 — VEERABHADRA / Documentation Sector 06 full document (Shon)

**COMPLETED**

- **`369-brain/memory/documentation-sector-06.md`** — AI brain vs operational knowledge gap, current inventory, **DeAssists Operations Guide** as top gap, target two-type architecture + bridge, P1–P3 staff doc backlog, ownership/Kaizen rules; **Sector 07 — Automation** next

## 06 April 2026 — VEERABHADRA / Mobile App Sector 05 full document (Shon)

**COMPLETED**

- **`369-brain/memory/mobile-sector-05.md`** — Expo RN + same NestJS/Mongo, locked design + MVP/nav, `deassists-rn.zip` handoff, **06 Apr reality** (API/Swagger/Postman, Latha↔mobile gap), **locked build order** (portal CRM first), risks + next-step checklists; **Sector 06 — Documentation** next

## 06 April 2026 — VEERABHADRA / Web Portal Sector 04 full document (Shon / Latha codebase)

**COMPLETED**

- **`369-brain/memory/portal-sector-04.md`** — full alignment from **dev_v2**: monorepo apps/libs, stack, 8 roles, 20 modules / schemas / state machine, website + cms-next surfaces, `.env` issues, **critical security/payment bugs**, operational **island** diagram, honest ~55% status, **P1–P5** build order, git log; **Sector 05 — Mobile App** next

## 06 April 2026 — VEERABHADRA / Sales Support Sector 03 full document (Shon)

**COMPLETED**

- **`369-brain/memory/sales-support-sector-03.md`** — full alignment: sales support definition, current agent reality, **locked single CMS → 3 views** (public / sales / admin), two conversion flows, 369 Private De Assists + handoff gaps, preserve vs improve, Phase 1–2 build checklists, **Sector 04 — Web Portal** next

## 06 April 2026 — VEERABHADRA / CRM Sector 02 full document (Shon)

**COMPLETED**

- **`369-brain/memory/crm-sector-02.md`** — full Sector 02 alignment: current Sheets CRM, tabs, 7 routing rules, daily usage (Gopika / call center), working vs painful, portal must-not-break + improvements, Phase 1 MVP checklist, scripts, **Sector 03 — Sales Support** next

## 06 April 2026 — VEERABHADRA / Company Structure Sector 01 (brain alignment)

**COMPLETED**

- Created **`369-brain/memory/company-structure-sector-01.md`** — operational reality: services, revenue model, team (Berlin + India), developer connectivity gap (Latha vs mobile dev), systems, bottlenecks, target 3–4 month model, 12-month criteria
- **Next:** Sector 02 — CRM (document Sheets heart before portal CRM build)

**Brain:** `session-state.md` pointer added

## 05 April 2026 — VEERABHADRA / Auth mobile preview in repo

**COMPLETED**

- **`deassists-auth-mobile-preview.html`** — designated **mobile auth** reference (Sign In, Sign Up, reset, email sent, session expiry)
- **Source:** `Downloads\MOBILE 369_Deassists\deassists-auth-mobile-preview.html`
- **Synced to repo:** `design/outputs/deassists-auth-mobile-preview.html`

**Brain:** `session-state.md`, `mobile-app.md` updated

## 05 April 2026 — VEERABHADRA / Final locked prototype in repo (public pages)

**COMPLETED**

- Confirmed **final locked** file: `deassists-mobile-prototype.html` (**public pages** only)
- **Source:** `Downloads\MOBILE 369_Deassists\deassists-mobile-prototype.html`
- **Synced to repo:** `design/outputs/deassists-mobile-prototype.html` (~550KB)

**Brain:** `session-state.md`, `mobile-app.md` updated (scope + paths)

## 05 April 2026 — VEERABHADRA / Mobile App Sprint + Latha Handoff

**COMPLETED**

- `deassists-mobile-prototype.html` locked as new baseline (05.04.2026)
- MVP scope classified: Core (13 screens), Supporting (5), Later (7)
- 4 user journeys mapped — cliff edges and missing product states documented
- Home page updated: browse-first CTA, admissions subtitle, trust section replaces Career Pathways
- `deassists-rn.zip` delivered: 24 React Native screens, AppNavigator, design tokens
- `deassists-latha-api-guide.docx` delivered: Swagger setup, 25 API endpoints, mobile dev guide
- Shon taking study break — Git, GitHub, AI tools, automation

**Brain:** `session-state.md`, `activity-log.md`, `mobile-app.md` updated

---

## 05 April 2026 — VEERABHADRA / Mobile HTML LOCKED v11 synced to repo

**COMPLETED**

- Copied **`deassists-mobile-LOCKED 11.html`** (Downloads) → **`design/outputs/deassists-mobile-LOCKED-v11.html`**
- **Canonical reference** for JSX / page-by-page build: **LOCKED v11** (replaces shot2 as sole canonical)
- **Code.gs:** no changes

**Brain:** `session-state.md`, `mobile-app.md` updated

## 05 April 2026 — VEERABHADRA / Mobile HTML Shot 2 (canonical locked)

**COMPLETED**

- **`deassists-mobile-shot2.html`** — **canonical** mobile HTML reference (**LOCKED**)
- **Shot 1 + Shot 2** complete (`deassists-mobile-complete.html` v2 = Shot 1 lineage)
- **Code.gs:** no changes

**HANDOFF:** **Latha** — JSX from **`deassists-mobile-shot2.html`** only

**Brain:** `session-state.md`, `mobile-app.md` updated

## 05 April 2026 — VEERABHADRA / Mobile HTML v2 (Shot 1)

**COMPLETED**

- **`deassists-mobile-complete.html` v2** — logo embedded, emails fixed (**Shot 1 complete**)
- **Code.gs:** no changes

**HANDOFF:** **Latha** — JSX conversion (v2 reference) — *superseded by Shot 2 canonical (`deassists-mobile-shot2.html`)*

**Brain:** `session-state.md`, `mobile-app.md` updated

## 04 April 2026 — VEERABHADRA / Mobile App HTML Reference Build (full session)

**COMPLETED**

- **`deassists-mobile-complete.html`** (~137KB) → delivered to **outputs**
- **21 screens:** Home, Programs, Accommodation, Blocked Accounts, Full Time Jobs, Part Time Jobs, Legal Supports, APS, Ausbildung, Insurance, Visa, Post Landing, Partners, About, Contact, Imprint, Terms & Conditions, Privacy Policy, Sign In, Sign Up, Profile
- **11 filter bottom sheets** (qa.deassists.com-aligned); **services grid** (10 services)
- **Design:** Outfit + Fraunces, **#1D7A45**, **#F6F7F4** cream, **dark gradient hero**
- **Nav:** fixed header, EN/DE pill, bottom nav + **red dot on Profile** when logged out

**DECISIONS LOCKED**

- Mobile **footer** = legal strip only: Contact Us | About Us | Imprint | Terms | Privacy | Made in ♥ with Germany
- **Filter-first** listings (sheet, not keyboard)
- **Accommodation** hero **amber #c47b00** + pagination
- **Programs** = **list** layout (not grid)

**NEXT:** RN dev gets HTML reference; Easter Sprint portal CRM module build

**Brain:** `session-state.md` + `mobile-app.md` updated

## 03 April 2026 — SYSTEM-LOGIC.md v2.0 update (Shon approved)
- Version header updated to v2.0
- Column order updated to v3.0 layout (D=Agent Name, E=Full Name etc.)
- SRUTHI removed from team section, tab order, routing, lifecycle
- Routing rules replaced: 9 old rules → 7 clean rules, no SRUTHI, no uni-based routing
- Dropdowns section updated: 37 agents, all NOT STRICT except Source/Service/Status
- Changelog entry added
- All changes Shon-approved

## 03 April 2026 — Brain batch: workspace-guide, CRM v3 memory, Paperclip, mobile, portal

- **Created** `369-brain/memory/workspace-guide.md` — two workspaces (brain vs code), paths, tokens, conflict-check rule.
- **Replaced** `369-brain/memory/crm-system.md` with **CRM SYSTEM — v3.0 FINAL** (column map, tabs without SRUTHI, 7 routing rules, Code.gs v3.0 notes). **Note:** Until **SYSTEM-LOGIC.md** Section 5 and **MASTER-RUN.cjs** / **Code.gs** are explicitly updated to match, agents must treat **SYSTEM-LOGIC.md** as the lock for script/sheet operations; **crm-system.md** documents the v3.0 product target.
- **Updated** `369-brain/MASTER-BRAIN-ARCHITECTURE.md` — new **PAPERCLIP ARCHITECTURE (April 2026)** block before Brain Communication Rules.
- **Replaced** `369-brain/memory/mobile-app.md` — Product Brain v7 public screens, design rules, data needs.
- **Replaced** `369-brain/memory/portal.md` — Product Brain (stack, dev servers, Latha build status, 5 modules, Excel→web).

## 03 April 2026 — memory/portal.md (Portal & Product architecture)

- Canonical **Portal & Product — Complete Architecture** in `369-brain/memory/portal.md`: five Excel→web modules, connected data flow (Lead→Student→Service→Archive→commission), build phases 1–6, AI automation layer (VEERABHADRA / OpenClaw / Paperclip / WATI), locked staff access levels, Shon learning protocol, VEERABHADRA↔Latha and mobile dev coordination, locked tech stack (Next.js nx, NestJS, MongoDB, JWT, pnpm, S3).

## 03 April 2026 — VEERABHADRA / CRM v2.0 Deployment

- Code.gs v2.0 written: new 15-column layout, all routing rules confirmed with Shon + Don
- Column migration completed: all 13 tabs reordered (ACTIVE LEADS 77 rows, BCBT CC 55, BCBT FU 16, DON 10, SRUTHI 8, ACCOMMODATION 1, SAJIR 6, COMPLETED 242, LOST LEADS 106)
- Trigger re-enabled: onEditSync, Head, On edit, exactly 1 trigger
- Dropdowns applied: setupSheetValidation run successfully
- ALL LEADS confirmed safe: full audit log intact
- Issue: queue tabs empty after Sync Now — source typo validation conflict
- Recovery in progress: recoverFromAuditLog running from ALL LEADS
- Brain fully intact in Cursor: 42 files confirmed

## 1 April 2026 — VEERABHADRA / Code.gs v5 + CRM full redesign session

**Date:** 01.04.2026 — full session

### CODE.GS VERSIONS TODAY
- v2: No +91 default, delete block, Public University->DON, comment timestamps, highlights
- v3: 4 bug fixes (regex timestamp, getLastRow off-by-one, clearQueue performance, stale colours)
- v4: Two-stage routing — Lead ID on any edit, route ONLY when Status=Active set (Shon approved)
- v5 (FINAL - deploy this): All issues fixed — see below

### v5 FIXES (Shon approved 01.04.2026)
1. Status reverts to blank if Active set without Country Code — no ghost active leads
2. Warning toast if Service blank when setting Active — routes to 369 CC with warning
3. Edit-after-routing — changing Service/University on queue tab auto re-routes lead
4. Comment timestamps use tab name as fallback if Agent Name blank (not "Staff")
5. Header row frozen on ACTIVE LEADS via refreshAllTabs
6. Draft leads (Date filled, Status blank) = light blue background

### ROUTING DECISIONS LOCKED
- Public University → DON (non-BCBT source)
- Country Code: required before Active, but no default, staff selects from dropdown
- Service: warning if blank, not blocked — routes to 369 CC catch-all
- Two-stage: ID assigned on Date entry, routing only on Status=Active

### MASTER-RUN.cjs
- Public University added to DON_SERVICES ✅
- Run confirmed: ACTIVE LEADS 102, ALL LEADS 440

### FILE TO DEPLOY
- Code-gs-v5-01042026.gs → paste into Apps Script → Save → run refreshAllTabs

---

## 1 April 2026 — VEERABHADRA / CRM redesign + Code.gs v2

**Date:** 01.04.2026

### CRM ANALYSIS COMPLETED
- Full CRM flow mapped and reviewed with Shon
- 6 problems identified and analysed
- All decisions locked before any code written

### MASTER-RUN.cjs UPDATED
- Public University added to DON_SERVICES
- Deployed and verified — ALL LEADS: 440, ACTIVE LEADS: 102
- Counts match expected routing

### Code.gs v2 WRITTEN (pending Apps Script deployment)
5 changes:
1. Country Code — no default +91, required, blocks routing if blank
2. Block row deletion — toast guides staff to set Lost instead
3. Public University → DON routing
4. Comments auto-timestamp [DD/MM/YYYY HH:MM - AgentName]:
5. Unpicked highlights — yellow 24h, red 48h on ACTIVE LEADS

### ISSUES FOUND IN SHEET
- #ERROR! in column E rows 101, 103 — formula corruption from old Code.gs
- Old Code.gs still running (new one not yet pasted into Apps Script)
- Fix: run fix-country-code-column.cjs then paste new Code.gs

### PORTAL (Latha in-person session)
- Claude Code v2.1.85 confirmed running in Cursor at C:\deassists
- Two workspaces clarified: deassists-workspace = BRAIN, deassists = PORTAL
- Sales tool fully built, backend + CMS admin complete

### SAAS VISION LOCKED
- Every CRM rule today = future API endpoint + DB field in portal
- Routing rules, status values, column structure = portal data model foundation

---

## 31 March 2026 — VEERABHADRA / MASTER-RUN execution (evening)

**Date:** 31.03.2026 — evening run

### COMMAND EXECUTED
- `node scripts\crm-369-master\MASTER-RUN.cjs`
- Result: completed successfully (no runtime errors)

### OUTPUT SUMMARY
- Merged pipeline Lead IDs: 125
- Queue writes:
  - 369 CALL CENTER: 33
  - 369 CALL CENTER FOLLOW UP: 5
  - BCBT CALL CENTER: 55
  - BCBT FOLLOW UP: 11
  - DON: 7
  - SRUTHI: 8
  - ACCOMMODATION: 1
  - SAJIR: 5
- ACTIVE LEADS (pickup): 102
- COMPLETED: 241
- LOST LEADS: 84
- ALL LEADS (audit): 440
- Audit sync: 434 rows updated, 0 appended

### DATA QUALITY STATUS
- Unrouted: 0
- Blank Lead ID: none
- Non-DA Lead ID: none
- Blank Source: none
- Blank Status: none
- Legacy Service "Private": 0 across checked tabs
- Agent portal typos: 0 across checked tabs

---

## 31 March 2026 — VEERABHADRA / Latha in-person + Sales Tool build

**Date:** 31.03.2026 — daytime session (Latha in person)

### TOOL CONFIRMED
- Claude Code v2.1.85 running inside Cursor at C:\deassists
- Two workspaces clarified and locked:
  - C:\deassists-workspace\ = BRAIN
  - C:\deassists\ = PORTAL
- One session-state.md confirmed (brain folder only)

### PORTAL — MAJOR BUILD
- Sales tool fully built: Course Finder, Fee Calculator, Universities, Sales Script
- 162 courses from Excel file loaded into codebase and MongoDB schemas
- NestJS backend: 3 schemas, 3 services, 3 controllers, seed endpoints
- CMS admin page: full CRUD for courses, universities, scripts
- Bug fixes: EMFILE webpack, 4x TypeScript AWS SDK, bcrypt rebuild
- Website connected to live MongoDB API via getServerSideProps

### PENDING FROM THIS SESSION
- CMS login — backend must run simultaneously (not yet tested end-to-end)
- MongoDB seed — pending backend confirmation
- MASTER CRM problems — to fix next

---

## 31 March 2026 — VEERABHADRA / Full overnight session (portal + mobile app)

**Date:** 31.03.2026 — session ran from ~22:00 to ~02:30

### PORTAL DEV ENVIRONMENT — LIVE
- pnpm install completed successfully (4m 34.7s, pnpm v10.33.0)
- All 3 servers running: backend:serve, cms:serve, website:serve
- http://localhost:4001 confirmed LIVE — "Your Path to Germany, Simplified."
- http://localhost:4001/programs — header loads, content empty (backend webpack 4 errors)
- Root cause: .env has placeholder AWS + DATABASE_HOST values
- Action: Latha to provide real local dev .env values tomorrow
- Rule confirmed: NEVER commit, NEVER deploy — Latha reviews all changes

### MOBILE APP — STRATEGY + DESIGN COMPLETE
- Product strategy finalised:
  - Tagline locked: "Your life in Germany, sorted."
  - 75% users already in Germany — need relief, not inspiration
  - 25% coming to Germany — need guidance
  - Document Vault = retention weapon (lock-in once 20+ docs stored)
  - DeAssists = Airbnb of expat services in Germany (marketplace vision)
- Phase 1 services: University Programs + Accommodation
- Phase 2: Ausbildung, Visa, Blocked Account
- Phase 3: Partner marketplace
- Framework: React Native (NOT Capacitor) — separate developer from Latha
- Backend: same NestJS REST API as portal

### MOBILE APP FILES PRODUCED
- deassists-public-screens-v7.html — 4 public screens + filter interaction states
- deassists-mobile-all-screens.html — all 14 screens reference
- mobile-app.md — complete product brain file
- Versions: v1 → v2 → v3 → v4 → v5 → v6 → v7 (each locked)

### PUBLIC SCREENS v7 — ALL CORRECTIONS APPLIED
- Full logo — all 11 SVG paths restored (was missing 3 = missing 's' letters)
- Language toggle — EN/DE pill with white circle flag thumb (matches reference image)
- "University Programs" — renamed from "University" on all screens
- Accommodation Popular badge — on service tile + listing cards
- Google Reviews strip — 4.8 stars · 120+ verified students — Home screen
- Profile tab = Sign In when not logged in (person icon outline + red dot)
- Fixed headers — nav/title/search never scroll, only content scrolls
- Filter system — tap search bar → filter sheet slides up
- Active filter state — bar shows filters + Clear button
- Results count — "Showing 47 programs" / "Showing 12 results for your filters"
- Scroll tooltip — animated "scroll to explore" on Home only

### PRODUCT DESIGN DECISIONS LOCKED
- Filter-first search: tap search bar → filter sheet (not keyboard)
- Price transparency on program cards (tuition fees visible without login)
- Accommodation = Airbnb-style listings with availability + Popular badges
- Sign Up only required at application — browsing always free

---

## 30 March 2026 — VEERABHADRA / Full day session (brain + dev setup)

**Date:** 30.03.2026 — full day + evening

- Brain architecture finalised — 13 brains confirmed (VEERABHADRA + 12 sub-brains)
- Media Production Brain created: 369-brain/media/media-BRAIN.md
- Brand & Commercial Brain corrected — video editing → Media Production
- All BRAIN.md files renamed with prefix: brand-BRAIN.md, media-BRAIN.md, legal-BRAIN.md, developer-BRAIN.md
- MASTER-BRAIN-ARCHITECTURE.md fully updated — all folder references corrected
- Claude Project set as master copy — Cursor = execution environment only
- Daily sync habit established: session-state.md + activity-log.md
- GitHub connected — threesixtynine-de/deassists cloned to C:\deassists\
- Branch: feature/excel-sales checked out
- .env file placed at C:\deassists\.env
- npm install completed — node_modules ready
- Mobile app scoping started — student/expat facing only

**Status:** Brain complete. Dev environment ready.

---

## 30 March 2026 — VEERABHADRA / 369 CRM Sheets (Column E-F link)

- Rule: Column E (Country Code) and Column F (Phone Number) are linked
- E auto-fills +91 when F is filled and E is empty
- E clears when F is cleared; E must not hold a value when F is empty
- Code: scripts/crm-369-master/Code.gs — ensureCountryCodeDefaultForRow_
- Three scenarios to validate after Shon pastes Code.gs into Apps Script

---

## 30 March 2026 — VEERABHADRA / Session close (evening handoff)

- Gmail automation policy locked — sendAs-only signatures, token refresh persist
- oauth-desktop-info.json client alignment in gmail-api.cjs
- Test draft to Don (don@deassists.com): draft ID r-7654518888444326004 — not sent
- Brain saved: session-state.md; twelve-brain architecture in MASTER-BRAIN-ARCHITECTURE.md

---

## 30 March 2026 — VEERABHADRA / Master architecture + Communication

- Email signature redesigned — left-aligned, name block added
- Signature copy tool built and tested
- Rafael / GoEasyBerlin email body written and scheduled manually
- Root cause of draft issues identified and fixed

---

## 30 March 2026 — EMAIL DRAFTED + OpenClaw pipeline spec

- Rafael/GoEasyBerlin partnership email drafted and saved to Gmail Drafts
- To: rafael@goeasyberlin.de | Cc: renan@, contact@goeasyberlin.de
- Subject: Re: Our Collaboration — Next Steps & Proposal Framework
- OpenClaw email pipeline architecture defined (OpenClaw-dependent)
- Communication Brain status: Gmail labels live, inbox router running

---

## 29 March 2026 — MASTER-RUN.cjs created

- Single script replaces all overlapping CRM scripts
- Always run this and nothing else
- Eliminates script conflict problem permanently
- CRM routing + Agent Name cleanup included
- Conflict-check protocol mirrored in SYSTEM-LOGIC Section 10

---

## 29 March 2026 — 369 Brain created

- Complete DeAssists control center established
- All knowledge, lessons, agents in one place
- OpenClaw will read this on first boot

Add to this file every session.
One improvement minimum per session.
This log is proof that we get better every day.
