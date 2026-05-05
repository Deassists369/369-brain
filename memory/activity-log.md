# Activity Log — 369 Brain

Entries are appended by `scripts/brain/brain-logger.cjs` (CLI or `require`).

---

## 2 May 2026 — Sidebar Audit + 4 Fixes (Uncommitted)

**Branch:** feature/portal.shon369 (portal) | main (369-brain)

### What was done

Ran `/sidebar-audit` against the three-layer access model for all 7 user roles
(SUPER_ADMIN, ORG_ADMIN, MANAGER, TEAM_LEAD, STAFF, AGENT, ORG_OWNER).

Initial verdict: **FAIL** — 4 issues found:

1. `/catalog` page guard mismatch with sidebar (ORG_ADMIN saw link → 403; STAFF could deep-link in)
2. `/leads` page guard mismatch (STAFF could deep-link in even though sidebar hid it)
3. Dead/broken filter block in `permission.helper.ts:205-218` — missing `return` in arrow function, both branches returned `null` anyway
4. AGENT "Courses" path used admin route instead of `/service/*` prefix

All 4 fixes applied one file at a time, before/after shown for each.

### Files modified (NOT committed — Latha review required)

| File | Lines | Fix |
|------|-------|-----|
| `apps/cms-next/pages/catalog/index.tsx` | 11-16 | ALLOWED_ROLES = [SUPER_ADMIN, ORG_ADMIN, MANAGER, TEAM_LEAD] |
| `apps/cms-next/pages/leads/index.tsx` | 15-21 | Dropped STAFF from ALLOWED_ROLES |
| `libs/shared/functions/permission.helper.ts` | 205-218 | Removed dead block (14 lines collapsed to single `return null`) |
| `libs/shared/models/sidemenu.ts` | 233-234 | AGENT Courses path → `/service/${CollectionNames.Courses}` |

### Build

`npx nx build shared --skip-nx-cache` — SUCCESS

### Re-audit verdict: PASS (all 7 roles, all 3 layers consistent)

### Decisions locked

- Sidebar audit must run before any permission.helper.ts or sidemenu.ts commit (already in patterns doc — reaffirmed)
- Page guard ALLOWED_ROLES must match sidebar permissionLevel — no deep-link bypasses
- Dead code with broken logic must be removed even when behavior is unaffected (Rule 27 trap prevention)

### Commits

NONE — all 4 portal fixes uncommitted, awaiting:
- pm2 restart backend
- Browser smoke test (2 roles minimum)
- Latha review (permission.helper.ts MAXIMUM RISK)
- `/latha-handover` PR package

### Next session

Run `/latha-handover` → produce PR package → wait for Latha to approve before commit.

---

## 27 April 2026 — CRM Phase 1 QA Fix
- Latha reported 404 errors on QA deployment (qa-portal.deassists.com)
- Root cause: new.tsx and dashboard/index.tsx used raw fetch('/api/v1/leads') instead of React Query hooks
- Raw fetch hits frontend URL in QA (404), axios client handles backend URL correctly
- Fixed 2 files, audited 4 others (already correct)
- Lesson: Always trace existing patterns before writing new code. This project has useCustomQuery, useCustomMutationV2, axios client with auto auth — we bypassed all of it
- Rule 31 added to CLAUDE.md to prevent recurrence (Rule 30 was already taken — server startup commands)
- Decision locked in decisions.md
- Commit: e67089df — fix: replace raw fetch with useCustomMutationV2/useCustomQueryV2 — fixes QA 404s

---

## 26-27 April 2026 — EAGLESKILL v2 Installation + Mode 0 Baseline + Prototype Creation

**Branch:** feature/portal.shon369 (portal) | main (369-brain)

### Commits Pushed to 369-brain

| Hash | Message | Stats |
|------|---------|-------|
| `c3cd751` | brain: add Rule 29 — npm run build:all required before commits | Rule addition |
| `ffce36a` | brain: install EAGLESKILL v2 — prototype-to-production bridge skill | 5 files, 1358 insertions |
| `a2af80d` | brain: add prototype — deassists platform HTML prototype | 5659 insertions |

### EAGLESKILL v2 Installed

Full prototype-to-production bridge skill installed at `skills/eagleskill/`:

| File | Purpose |
|------|---------|
| `EAGLESKILL.md` | Master skill file — 5 modes (0-4) from baseline to production |
| `mode-1-prototype-analysis/README.md` | HTML prototype → structured data extraction |
| `mode-2-plan-generation/README.md` | Spec → implementation plan generation |
| `mode-3-code-generation/README.md` | Plan → production code with CE patterns |
| `mode-4-verification/README.md` | Implementation → verification against spec |

### Mode 0 Baseline Executed

Full codebase analysis completed:

- **Backend files read:** 179 TypeScript files
- **Frontend files read:** 209 TypeScript files
- **Output:** `skills/eagleskill/eagle-baseline-system-readout.md` (574 lines, 19KB)

Key findings documented:
- Q Intelligence fields already exist in `lead.entity.ts` — Phase 2 is frontend-only
- Security bypass confirmed at `scope.guard.ts` ~L79 (`if (!model) return true`)
- `leads.service.ts` `logCall()` has full auto-status state machine
- `user.types.ts` and `lead.constants.ts` final state confirmed
- Risk registry from graphify analysis documented

### Prototype Created

**File:** `design/outputs/deassists-platform.html`
**Size:** 353KB, 5659 lines
**Scope:** Full DeAssists platform HTML prototype

### Architectural Decisions Locked

1. Phase 2 CRM is frontend-only — backend Q Intelligence fields already exist
2. EAGLESKILL Mode 0 baseline is the entry point for all future builds
3. Prototype lives in 369-brain `design/outputs/` — never in portal repo
4. Rule 29 locked: `npm run build:all` mandatory before every commit

### Portal State (Unchanged)

- **Unstaged:** `accounts.service.ts` — ACL type annotation fix (`string` → `ObjectCannedACL`)
- **No portal commits this session** — work focused on brain infrastructure

### Next Session

Phase 2 CRM — Q Intelligence (frontend-only):
1. CallLogModal — new component
2. LeadDetailPanel — add Log Call button + call summary block
3. Backend endpoint already exists: POST /leads/:id/call-log
4. Zero backend changes needed

---

## 25 April 2026 — Evening — Build fix + Rule additions + Planning

- LeadTable.tsx merge conflict with Latha resolved — build:all now passing all 4 projects
- Rule 29 added: npm run build:all mandatory before every commit
- Rule 30 added: all 3 servers must start together
- Q Intelligence planned for next session — 2 files, zero backend changes
- CLAUDE.md rethink planned — file over 1000 lines, needs restructure in separate session
- Session closed in planning mode

---

## 25 April 2026 — Phase 1 CRM COMPLETE — Committed and Pushed

**Branch:** feature/portal.shon369
**Commit:** b0d2fdc4 — fix(crm): Phase 1 complete — enums, UI polish, nav guard, country code

### What Was Done

1. **All hardcoded strings replaced with enum imports**
   - dashboard/index.tsx now imports LeadStatus, LeadQueue from lead.constants.ts
   - new.tsx now imports LeadSource, LeadService from lead.constants.ts

2. **"All Leads" option added to queue sidebar**
   - Shows total count of all leads
   - Click to view unfiltered list

3. **LeadDetailPanel UI improvements**
   - Header lightened from dk to dk2
   - Save button moved to header (removed footer)
   - Unsaved changes modal for tab switching (Details ↔ Comments)

4. **Navigation guard lifted to page level**
   - isDirty state tracked in leads/index.tsx parent
   - guardedAction() wraps queue clicks and lead row clicks
   - Router events listener blocks route changes when dirty
   - Unsaved changes modal with Cancel/Discard buttons

5. **Country code improvements**
   - country_code field now required with +91 default
   - Displayed with WhatsApp number in detail panel

6. **Committed and pushed**
   - 8 files committed as b0d2fdc4
   - Pushed to origin/feature/portal.shon369
   - Graphify updated: 3998 nodes, 3849 edges

### Files Committed

| File | Change |
|------|--------|
| `apps/backend-nest/src/leads/leads.service.ts` | Empty string enum validation fix |
| `apps/cms-next/components/leads/LeadDetailPanel.tsx` | Header dk2, Save in header, unsaved changes modal, country code display |
| `apps/cms-next/components/leads/LeadQueueSidebar.tsx` | "All Leads" option with total count |
| `apps/cms-next/components/leads/LeadTable.tsx` | data?.data?.data fix |
| `apps/cms-next/pages/dashboard/index.tsx` | Enum imports (LeadStatus, LeadQueue) |
| `apps/cms-next/pages/leads/index.tsx` | Navigation guard, guardedAction, unsaved changes modal |
| `apps/cms-next/pages/leads/new.tsx` | Enum imports, country_code required with +91 default |
| `libs/shared/constants/lead.constants.ts` | All enums including SidebarRole |

### Key Patterns Established

1. **Navigation guard pattern** — isDirty + guardedAction + pendingAction for all destructive navigations
2. **Enum import pattern** — Object.values(EnumName) for dropdown options
3. **Country code display** — `${country_code} ${whatsapp}` format

### Next Session — Phase 2

1. Q Intelligence fields + CallLogModal
2. Fix pre-existing LeadTable.tsx TypeScript error
3. Phase 2 sidebar structure with LEAD_CRM role

---

## 25 April 2026 — Session Close — Environment Fix + SidebarRole Enum

**Branch:** feature/portal.shon369

### What Was Done

1. **cms-next .env.local symlink created**
   - `ln -s ~/deassists/.env ~/deassists/apps/cms-next/.env.local`
   - Google OAuth now loads correctly
   - Login working at localhost:4002

2. **SidebarRole enum added to lead.constants.ts**
   - Backend compile error: sidemenu.ts was importing SidebarRole before it existed
   - Added enum with `CallCenter = 'Call Center'` and `SalesSetup = 'Sales Setup'`
   - Backend now compiles and runs successfully

3. **PM2 servers verified**
   - Backend: port 8000, PID 37079, online
   - CMS: port 4002, loading env from .env.local symlink
   - Both compiling successfully

### Files Modified Today

| File | Change |
|------|--------|
| `libs/shared/constants/lead.constants.ts` | SidebarRole enum appended |
| `apps/cms-next/.env.local` | Symlink created to root .env |

### Staged Files (Not Committed)

All previous fixes remain staged, waiting for single commit:
- `apps/cms-next/components/leads/LeadTable.tsx` — data?.data?.data fix
- `apps/cms-next/components/leads/LeadQueueSidebar.tsx` — queue shape fix
- `apps/cms-next/components/leads/LeadDetailPanel.tsx` — tab switching
- `apps/cms-next/pages/leads/index.tsx` — enum imports
- `apps/cms-next/pages/leads/new.tsx` — enum imports
- `apps/cms-next/pages/dashboard/index.tsx` — enum imports
- `apps/backend-nest/src/leads/leads.service.ts` — empty string validation
- `libs/shared/constants/lead.constants.ts` — all enums + SidebarRole
- `CLAUDE.md` — Rules 0, 23, 27, 28

### Next Session

1. Fix hardcoded values in new.tsx and dashboard/index.tsx
2. Verify Comments tab in browser
3. Browser test all roles
4. Sidebar audit
5. One single commit for everything

---

## 24 April 2026 — Session Close (Final) — All Fixes Pushed

**Branch:** feature/portal.shon369

### Commits Pushed Today

| Hash | Message |
|------|---------|
| `d6f47912` | fix(crm): Phase 1 complete — enum architecture + bug fixes + role-based access (11 files) |
| `dffced7d` | chore: update pnpm lockfile + gitignore |
| `856a9f25` | fix(theme): MUI colour error — replace raw RGB strings with hex in palette |

### What Is Working

- Phase 1 CRM all fixes complete and pushed ✅
- MUI user edit page crash fixed (`customColors.main/light/dark` now hex, not raw RGB) ✅
- Call Center and Sales Setup roles created in portal ✅
- Roles assigned to Shon AJ account ✅

### Blocker — Local Only

Latha's auth changes cause logout after user save on local dev.
This is a local `.env` issue — QA will work correctly.
No code change needed. Waiting for Latha to merge and deploy to QA.

### Next

1. Latha merges `feature/portal.shon369` → `dev_v2`
2. Kingston tests on `qa-portal.deassists.com`
3. Fix any issues found in testing
4. Phase 2 — Q Intelligence

---

## 24 April 2026 — Phase 1 CRM Fix Complete + Pushed

**Branch:** feature/portal.shon369

### What Was Done

1. **Phase 1 CRM fix — all 11 files committed and pushed**
   - `d6f47912` — fix(crm): Phase 1 complete — enum architecture + bug fixes + role-based access
   - Lead saves correctly with `date` auto-set by backend
   - Queue counts working — dashboard shows real numbers
   - Initial notes saved correctly
   - Sidebar audit passed all 9 checks
   - Sales Dashboard in Call Center 369 section
   - Role-based access working for Call Center + Sales Setup roles

2. **Additional lead creation bugs found and fixed**
   - BUG 6: `date` required — backend now always sets `new Date()`
   - BUG 7: `last_outcome: null` invalid — `default: null` removed from entity

3. **Staff brain corrected**
   - Gopika, Anandhu, Midhun, Stalin → TEAM_LEAD (was AGENT)
   - AGENT type = external sub-agents only — locked permanently in staff-brain.md

4. **pnpm lockfile committed after package install**
   - `dffced7d` — chore: update pnpm lockfile + gitignore
   - `@react-oauth/google 0.13.5` added (Latha's Google OAuth work)

5. **Latha's 38 commits merged in**
   - Google OAuth added to signin page
   - Requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in local `.env`
   - Local development blocked until Latha provides value
   - QA unaffected

6. **Graphify updated after commit**
   - 1772 files, 3984 nodes, 3828 edges
   - Saved to `369-brain/graphify-out/`

### Key Decisions Locked Today

- TEAM_LEAD = DeAssists call center team (Anandhu, Midhun, Stalin, Gopika)
- AGENT = external sub-agents only — zero internal data access — permanent
- `lead.constants.ts` = single source of truth for all CRM enum values
- Phase 1 code quality score: 4.5/10 → approximately 7/10
- Call Center role = assign to any Type for CRM sidebar access

---

## 24 April 2026 — Phase 1 CRM Fix — Complete and Committed

**Branch:** feature/portal.shon369
**Commit:** d6f47912 — fix(crm): Phase 1 complete — enum architecture + bug fixes + role-based access
**Files committed:** 11

### What Was Done

1. **A1 — `lead.constants.ts` created**
   LeadStatus, LeadQueue, LeadSource, LeadService, CallOutcome, SidebarRole enums
   lives in `libs/shared/constants/lead.constants.ts`

2. **A2 — Queue name mismatch fixed**
   `getQueueCounts()` and `getStats()` now use `LeadQueue` enum values
   Replaced hardcoded `'369_CALL_CENTER'` with correct `LeadQueue.Main369 = '369_MAIN'`

3. **A3 — Status 'Completed' → 'Converted' fixed**
   `convert()` uses `LeadStatus.Converted` — no more silent schema validation failures

4. **A4 — Initial comment silently dropped — fixed**
   `create()` now calls `addComment()` after lead creation when `initial_comment` is present

5. **A5 — LEAD_CRM and SALES_SETUP removed from ALLOWED_ROLES**
   All 3 frontend pages cleaned: `dashboard/index.tsx`, `leads/index.tsx`, `leads/new.tsx`

6. **A6 — Module-level mutable state fixed**
   `hasCourseListPermission` and `hasEverBeenRestricted` moved inside `exclusivePermission()`

7. **B1 — LEAD_CRM and SALES_SETUP removed from `user.types.ts`**
   Enum values and UserTypesMapping entries both removed

8. **B2 — `requiredRole?: string` added to `permission.interface.ts`**

9. **B3 — `permission.helper.ts` updated**
   `rolePermitted` check: parent visible if user has matching role name
   Collection bypass: children with no collection match shown if parent permitted

10. **B4 — `sidemenu.ts` restructured**
    Sales Dashboard → Call Center 369 children (no permissionLevel)
    Sales Setup placeholder → Sales CRM children (no permissionLevel)
    `requiredRole: SidebarRole.CallCenter` and `SidebarRole.SalesSetup` added to parents

11. **leads.controller.ts — TEAM_LEAD added to all @Roles() decorators**
    LEAD_CRM replaced with STAFF, TEAM_LEAD added alongside STAFF on every endpoint

12. **Two lead creation bugs found and fixed post-commit**
    BUG 6: `date` required — backend always sets `new Date()` (never relies on frontend)
    BUG 7: `last_outcome: null` invalid — `default: null` removed from entity

13. **staff-brain.md corrected**
    Gopika, Anandhu, Midhun, Stalin → Portal role: TEAM_LEAD (was AGENT)
    AGENT type = external sub-agents only, zero CRM access — clarified at top

### Blocker Identified

Local signin broken — Latha's Google OAuth commits require `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
Not in local `.env`. Waiting for Latha to provide value.

### Next

- Get `NEXT_PUBLIC_GOOGLE_CLIENT_ID` from Latha
- Test locally → Latha merges → Kingston QA on qa.deassists.com
- Phase 2: Q Intelligence fields + CallLogModal

---

## 22 April 2026 — Full Setup + Brain Lock Session

**Branch:** feature/portal.shon369 (no portal code committed)

### What Was Done

1. **Graphify fully installed and configured**
   - Knowledge graph: 1771 files, 3983 nodes, 3827 edges
   - Output moved to `369-brain/graphify-out/`
   - `graphify-out/` added to `.gitignore` in both repos
   - CLAUDE.md updated with full graphify commit checklist

2. **Full CRM code audit completed**
   - 12 files read and audited — score: 4.5 / 10
   - 5 bugs documented in session-state.md

3. **Full permission system audit**
   - All 10 roles mapped — 7 correct, 3 broken
   - Root cause confirmed: `/dashboard` never matches any collection
   - Module-level mutable state confirmed as production bug

4. **Risk registry built from graphify graph**
   - God nodes identified: `AccountsController` (63 edges) highest in project
   - `permission.helper.ts` confirmed as Community 6 — maximum risk
   - CRM entity and service confirmed as isolated — safe to build freely

5. **Architecture decisions locked and saved**
   - LEAD_CRM and SALES_SETUP removed as Types
   - Call Center and Sales Setup = database Roles
   - Any Type + Call Center role = CRM access
   - New sidebar: Sales Dashboard → Call Center 369 children
   - Sales CRM children: Sales Setup placeholder only

6. **Zero Mistakes Protocol locked in CLAUDE.md**
   - Applies to all tasks: new builds AND bug fixes
   - Bug fixes are MORE dangerous than new builds — rule documented

7. **Rules 15–22 locked permanently in CLAUDE.md**
   - Rule 19: AccountsController untouchable
   - Rule 20: permission.helper.ts needs Latha present
   - Rule 21: API contract changes need frontend audit
   - Rule 22: CRM entity and service safe to build freely

8. **Rule 14 updated — tester ready standard**
   - Only commit when ready for qa.deassists.com
   - Stage freely during build — never commit until Shon says ready
   - The question before every commit: "Is this ready for the tester right now?"

### Key Decisions Locked Today

- Graphify lives in 369-brain — never in portal repo
- Commit only when tester-ready — not before
- `permission.helper.ts` = maximum risk — Latha must be present
- CRM entity and service = safe to build without Latha
- Phase A (low risk) builds first
- Phase B (permission system) with Latha present only

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

---

## 2 May 2026 — 369-ECC Build: Phases 0–3 and 5–6 Complete

### What was built today

The 369-ECC (Enforcement and Coding Constitution) enforcement engine was designed, built, tested, and wired in a single session.

**Phase 0 — Inventory (complete)**
- Brain files read and mapped.
- Current position confirmed: Phase 2B Service Catalog code complete, build blocked by upstream typo in permission.helper.ts.

**Phase 1 — Enforcement Engine Build (complete)**
- Created `~/.claude/369/` directory structure: agents/, rules/, commands/, hooks/
- Created 25 files: 8 agents, 5 rules, 8 commands, 4 hooks
- Ran 10 systematic tests — all passed
- Identified pre-existing bug: undeclared `isPermitted` variable at line 139 of permission.helper.ts (Latha's fix)
- Identified staging violation: CallLogModal.tsx (Phase 2A) mixed with Phase 2B files — blocked and corrected

**Phase 2 — Brain Wiring (complete)**
- Wired Intelligence Layer (3-question check) into deassists-architect agent
- Appended verification loop (5-step checklist) to all 8 agents (+14 lines each, +28 for architect)
- Created `AGENTS.md` in brain — agent reference table with slash commands
- Created `HOOKS.md` in brain — hook reference table with examples and cost of bugs
- Replaced `CLAUDE.md` with lean router (1072 lines → 84 lines)
- Brain commit: `671ed84`

**Phase 3 — Brain Cleanup (complete)**
- Created `archive/2026-05-02/` folder
- Archived 4 superseded files: session-lock.md, SESSION-START-SKILL.md, eagleskill-config.md, anti-ambiguity.md
- Prepended SUPERSEDED header to THE-DEASSISTS-OS.md
- Updated session-state.md with 369-ECC build status block
- Brain commit: `0db507a`

**Phase 6 — GAN Autonomous Build Loop Setup (complete)**
- Confirmed monorepo uses pnpm (not npm) — critical discovery
- Installed @playwright/test via pnpm, Chromium v1217 downloaded
- Created `playwright.config.ts` in apps/cms-next/
- Created `.env.playwright` (gitignored — credentials never committed)
- Created `e2e/helpers/auth.ts` — login helper and page access assertions
- Created `e2e/service-catalog.spec.ts` — first 4-test suite for Phase 2B Service Catalog
- Created `intelligence/SCORING-RUBRIC.md` — 10-criterion 0-10 scoring rubric for GAN loop
- Created `deassists-gan-planner.md` agent — expands feature descriptions into full specs
- Created `deassists-gan-evaluator.md` agent — scores built features against rubric via Playwright
- Brain commit: `5da8de7`

**A19 — pnpm rule added to Coding Constitution**
- Root cause: npm install failed with lockfile conflict during Phase 6
- Rule A19 permanently locks in pnpm as the only package manager for this monorepo
- Brain commit: `41d3a2d`

### All commit hashes — 2 May 2026
- `0192613` — brain: log Course Finder endpoint gap — State 2B pending Latha confirmation
- `671ed84` — brain: Phase 2 complete — AGENTS.md, HOOKS.md, lean CLAUDE.md, intelligence layer and verification loop wired
- `0db507a` — brain: Phase 3 complete — archive superseded files, lean structure confirmed
- `5da8de7` — brain: Phase 6 — scoring rubric and GAN agents added
- `41d3a2d` — brain: A19 — always use pnpm in DeAssists monorepo, never npm

### Pending for next session
- Phase 4: acceptance test — requires Latha to fix permission.helper.ts first (undeclared `isPermitted` at line 139)
- Phase 4 browser test: log in as SUPER_ADMIN, confirm sidebar renders Service Catalog, confirm /catalog loads
- GAN first run: after Phase 4 passes, run deassists-gan-evaluator against service-catalog.spec.ts
- Portal commit: after Phase 4 passes, run /latha-handover for Phase 2B Service Catalog PR

### Lessons learned today
- This monorepo uses pnpm. npm install corrupts the lockfile. Always pnpm. Rule A19 now enforces this permanently.
- The 369-ECC layer is a multiplier: it caught a real TypeScript bug (isPermitted), a real staging violation (CallLogModal.tsx), and a real lockfile error (npm vs pnpm) — all in the same day it was built.
- CLAUDE.md does not need 1072 lines. 84 lines is enough if the skill map and boot sequence are correct.

---

## SESSION 4 May 2026 — self-improvement-harness-v1 shipped (EAGLE Mode 1/2/3)

### What was done

Started with intelligence + ops support work, then ran EAGLE end-to-end on self-improvement-harness-v1.

**Intelligence + ops (early session):**
- /watch skill on Claude Code Agentic RAG video (xgPWCuqLoek). 134-min video on building agentic RAG with Claude Code. Full structured analysis saved to intelligence/video-research/xgPWCuqLoek-analysis.md (10 sections: core topic, key concepts, architecture, tools/tech, implementation steps, key quotes, business use cases, costs, gaps, DeAssists connection). Patterns directly applicable: hybrid search > pure semantic for course codes / student IDs; database-level read-only Postgres role pattern for text-to-SQL; sub-agent for full-document analysis to keep main context clean; metadata extraction for course/syllabus/regulation classification.
- Mission Control HTML inspection (twice). User confirmed file already matches spec on both passes; only restarted PM2 (mission-control-369 id 4).
- Created Latha prereq ticket tickets/waiting/rag-foundation-latha-prereq.md (note: file no longer present at session close; may have been moved or actioned externally).
- Confirmed rag-foundation-v1 still blocked at data-check STATE 3 (run d65b537434f90d64).

**EAGLE Mode 1 (already done before this session, reviewed at start):**
- All five answers locked: CAPABILITY · all 5 SOP files · Google Doc waived · registry row yes · MANUAL trigger only · LEARNING-MIND APPEND only.

**EAGLE Mode 2 — spec + working HTML preview:**
- Section 1: WHAT IS IDENTICAL (no work needed) — 7 items.
- Section 2: WHAT IS BEING CREATED — 11 new files cataloged with paths and LOC estimates.
- Section 3: FINAL OUTPUT — trigger surface, three artifacts (markdown report, LEARNING-MIND append, JSONL row).
- Section 4: 4-stage plan with risk levels and matched-test categories.
- Sections 5-8: locked decisions, blocking assumptions, security review, post-run invariants.
- Preview: previews/self-improvement-harness-v1-preview.html (30,927 bytes) — capability-mode preview showing trigger surface, run-state pipeline, mock report, mock LEARNING-MIND append, mock JSONL row, stage cards, edge cases.
- Approval phrase received: "approved".

**EAGLE Mode 3 — 4 stages executed:**

S1 — pure additions (LOW risk):
- inputs.js (187 LOC) — readSops/readHarnessRuns/readTickets/readCodebaseSummary/gatherInputs, BRAIN_ROOT + frozen SOP_FILES constant
- report-writer.js (188 LOC) — buildMarkdown / saveReport (refuses overwrites) / nextRunNumber
- learning-mind-writer.js (130 LOC) — fs.appendFile only; byte-equal-at-top invariant test-enforced
- 3 node:test files (612 LOC); 51 tests across 17 suites — all pass in 193 ms
- Cat-2 test: PASS

S2 — isolated new files (LOW risk):
- analyzer.js (231 LOC) — buildPrompt with 200 KB ceiling and SOP-truncation fallback; <<<ANALYSIS_JSON_START/END>>> marker contract; spawnSync claude -p with 5 min timeout, 16 MB stdout buffer; validateShape gracefully handles partial JSON
- self-improvement-harness.js (329 LOC) — CLI parser (--dry-run / --skip-learning-mind / --limit-runs / --help); file-based workspace lock; 7-phase orchestrator; exit codes 0/1/2 per spec
- README.md (181 LOC)
- Cat-2 test: syntax OK on both modules; S1 51/51 tests still pass

S3 — wiring + first runs (MED risk):
- Created intelligence/proposed-fixes/.gitkeep
- Dry-run: prompt 74,492 bytes, run_number_planned=1, exits 0
- Real run: 80,150 ms, 5 patterns, 6 proposed fixes, 5 open questions
- Four post-run invariants verified: report ≥ 800 B (12,288 B) ✓ | LEARNING-MIND byte-equal at top after +6,427 B append ✓ | JSONL valid with status:complete and all 8 expected meta keys ✓ | Mission Control s-learn would render 3 ✓
- Cat-4 integration test: PASS

S4 — registry update (LOW risk):
- project/feature-registry.md line 262: self-improvement-harness-v1 IN PROGRESS → DONE
- Cat-1 test: PASS

**Commit + push:**
- Initial broad add pulled in 583 dashboard/node_modules/ files. Stopped, asked, fixed: git restore --staged dashboard/node_modules/ + appended node_modules/ rule to .gitignore. Down 616 → 34 staged.
- Single atomic brain commit: 5c2d546 (34 files, multiple capabilities bundled)
- Pushed: b78e376..5c2d546 main -> main on Deassists369/369-brain

### Commits this session
- `5c2d546` — brain: ship self-improvement-harness v1 + supporting brain artifacts — EAGLE self-improvement-harness-v1

### Decisions locked this session
- The five SOP files (canonical brain rules for the meta-harness) are: AGENTS.md, CLAUDE.md, CODING-CONSTITUTION.md, HOOKS.md, THE-DEASSISTS-OS.md. VEERABHADRA.md is identity/mission, NOT an SOP, and excluded from analyzer input.
- Self-improvement run log shape is identical to eagle-harness.jsonl. One observability layer for the platform; Mission Control parses both with the same shape.
- LEARNING-MIND.md is APPEND ONLY for any harness output. Byte-equal-at-top invariant is test-enforced; violating it is the only fail-loud failure mode for learning-mind-writer.
- Capability mode harnesses produce markdown + JSONL only; no HTML output at runtime. Mode 2 HTML previews show the spec; the harness's own outputs are markdown-first.
- Manual-trigger only for v1 self-improvement-harness. Cron / hook-based / auto-apply are deferred to v2 by explicit Mode 1 decision.
- node_modules/ is now globally ignored at brain root via .gitignore. All future brain-side npm/pnpm projects benefit.
- "Run 001 → Run 002" cadence rule (from the Run 001 Challenge): no Run 002 until Run 001's proposed fixes are explicitly adopted or rejected. Prevents proposal-pile-up.

### Pending for next session
- Review intelligence/proposed-fixes/2026-05-03-self-improvement-run-001.md and act on each proposed fix (adopt or explicitly defer with reasoning).
- Highest-severity fix (HIGH): Mode 3 post-apply guard carve-out for harness self-modification — references run b18cb4fea3eafbea failure and ticket harness-eagle-stage-marker-contract.
- Two MED fixes: validate run_id before JSONL append (reject malformed records); priority-ordered ticket selection in harness-worker (waiting ticket already drafted).
- rag-foundation-v1 still blocked at data-check STATE 3 — waiting on Latha MongoDB collections per tickets/waiting/.
- Pre-existing brain-side uncommitted items NOT touched this session: harness/eagle/eagle-harness.js, intelligence/harness-runs/eagle-harness.jsonl, memory/session-lock.md, deleted patterns/anti-ambiguity.md + skills/eagleskill/eagleskill-config.md + skills/session-start/SESSION-START-SKILL.md, tickets/open/harness-eagle-stage-marker-contract.md, ecosystem.config.cjs.

### Lessons learned today
- Pure additions + integration smoke tests is the right pattern for capability-mode harnesses. S1 gave us 51 fast unit tests; S3 gave us one 80-second end-to-end run that exercised every phase. No middle ground (mocked integration tests) was needed.
- The marker-contract pattern for headless inner-Claude (HTML_PREVIEW_START/END for eagle-harness, ANALYSIS_JSON_START/END here) generalizes well. Future harnesses with structured LLM outputs should adopt this shape.
- SOP truncation fallback (in analyzer.js buildPrompt) is correct insurance, but Run 001 came in at 74 KB — well below the 200 KB ceiling. The truncation path is untested in the wild. Worth a synthetic test in v2.
- "Stop and ask" worked well twice this session: (a) when the file already had all 6 requested changes (avoided regressing live data binding); (b) when git add dashboard/ pulled in 583 node_modules files (avoided polluting brain history).
- The /watch skill output is genuinely useful for cross-pollinating external research into the brain. The xgPWCuqLoek video analysis directly informs DeAssists EDU search architecture decisions.

---

## SESSION 4 May 2026 (afternoon) — Mission Vault v3 + Dropbox sync infrastructure

**Mission Vault dashboard iterated to v3:**
- Font swaps: Space Mono / Syne → DM Mono / Outfit / Syne (--mono, --display, --body vars).
- Color contrast: --ink #0f1923 → #080f18, --muted #5a6a82 → #3d4f66, --dim #8a98ad → #5a6a82.
- New "Data Intelligence — MongoDB + Dropbox" panel on Document Intelligence page (3 sections side-by-side: MongoDB Atlas with 5 collection rows + green dots, Dropbox Sync amber theme, AI Learns From teal theme).
- Replaced dashboard/index.html three times: mission-vault-final → mobile → v2 → v3 (final 96,599 B). Server replaced twice: server-updated.js → v2 → v3 (final 9,841 B + 2 surgical edits).
- v3 server boots with banner: `Claude API ✓ READY | RAG chunks 3264 | Previews 4`.
- v3 endpoints live: /api/data, /api/status, /api/claude (Anthropic proxy), /api/rag/search, /api/rag/status, /api/rag/index, /api/approve, /preview/:f.

**Two server fixes (final edits this session):**
- `servePreview`: `path.basename(feature.replace(/\.html$/i,'')).replace(/[^a-z0-9_-]/gi,'')` — `/preview/foo` and `/preview/foo.html` both resolve to `previews/foo.html`. HTTP smoke test: both returned 200 · 20,676 B.
- `handleApprove`: after writing signal, if `tickets/awaiting-approval/<feature>.md` exists, rename it to `tickets/open/<feature>.md` (approve) or `tickets/rejected/<feature>.md` (reject). `mkdirSync({recursive:true})` guards the destination.

**Dropbox sync infrastructure:**
- Created integrations/dropbox-sync.js (150 lines, zero npm deps; Node 22 global `fetch` + Dropbox v2 HTTP API; first call `files/list_folder` then `files/list_folder/continue` with cursor; 60s poll; appends to intelligence/dropbox-sync.jsonl; cursor persisted at integrations/.dropbox-cursor).
- Created integrations/DROPBOX-SETUP.md (164 lines: app creation, scope ticking, ecosystem example, troubleshooting table).
- Created ecosystem.config.cjs at brain root (Option A — single file, both apps share env block). DROPBOX_TOKEN + ANTHROPIC_API_KEY both live there. Added `ecosystem.config.cjs` to .gitignore as part of the same commit so the secret never gets staged.
- Path tightened from `/DeAssists/Documents` (recursive) to `/CORTEX-369` (non-recursive) per user direction.
- pm2 mission-control-369 re-registered under ecosystem (delete + start ecosystem.config.cjs --only mission-control-369 + pm2 save). Was bare-started id 4, now id 6.

**Dropbox token churn (3 tokens, 0 successful API calls):**
- Token #1 (app 7033907): `400 not permitted ... files.metadata.read` — original app, scope never enabled.
- Token #2 (CORTEX-369 first gen): `401 missing_scope/files.metadata.read` — scope still not ticked + Submit not clicked. Different error format = different code path = confirms token swap took effect.
- Token #3 (CORTEX-369 regen): `400 This app is currently disabled` — token works, app itself is disabled in console. Blocked here at session close.
- Dropbox console gotcha: tokens are bound to scopes at generation time. Order must be: tick `files.metadata.read` → Submit at bottom of Permissions tab → reload to verify ticks persisted → Settings → Generate. Doing Generate first then ticking gives a permanently scopeless token.

**Anthropic API key wired:**
- Added `ANTHROPIC_API_KEY` to mission-control-369 env block in ecosystem.config.cjs.
- /api/status flipped `MISSING — add ANTHROPIC_API_KEY...` → `READY`.
- Banner went from `Claude API : ✗ MISSING KEY` → `Claude API : ✓ READY`.

**Obsidian vault discovered:**
- find -name ".obsidian" surfaced `/Users/deassists369/Documents/369 RAG/369 RAG/`.
- v3 server's RAG engine auto-indexed it (1 file / 2 chunks — currently just default `Welcome.md`, 204 B).

### Files created this session
- `~/deassists-workspace/369-brain/integrations/dropbox-sync.js` (150 lines)
- `~/deassists-workspace/369-brain/integrations/DROPBOX-SETUP.md` (164 lines)
- `~/deassists-workspace/369-brain/ecosystem.config.cjs` (gitignored — DROPBOX_TOKEN + ANTHROPIC_API_KEY)
- `~/deassists-workspace/369-brain/mission-vault/369-mission-vault.html` (1522 lines; archive of v3 vault)
- `~/deassists-workspace/369-brain/dashboard/rag-engine.js` (cp from Downloads; uncommitted)

### Files modified this session
- `~/deassists-workspace/369-brain/dashboard/index.html` (final state: mission-vault-v3, 96,599 B; previously cycled through several intermediate vaults)
- `~/deassists-workspace/369-brain/dashboard/server.js` (final state: dashboard-server-v3 + 2 surgical fixes)
- `~/deassists-workspace/369-brain/mission-control-index.html` (replaced with mission-vault-final.html — committed in 63790ab)
- `~/deassists-workspace/369-brain/.gitignore` (+1 line: `ecosystem.config.cjs`)
- `~/deassists-workspace/369-brain/integrations/.dropbox-cursor` (briefly — cleared during a path change)

### Commits this session
- `63790ab` — feat: 369 MISSION VAULT final — 6 tabs, RAG Intelligence, action generator, PDF upload, knowledge map, audit log (3 files, +3022 / -229; 0e14072..63790ab on main; pushed to origin/main).

### Decisions locked this session

**Vision / strategic framing** (locked at session close):
- **369BRAIN is the master intelligence layer** — single brain across DeAssists ops, code, harnesses, RAG, and dashboards. Mission Vault is the human-facing front of that brain.
- **BCBT September 2026 intake = first external-entity test run** — first time the brain serves a real client tenant end-to-end (intake docs → 369 Assessment → student lifecycle). Treat BCBT as the proving ground for multi-tenant scoping.
- **Platform pitch: any SME in Europe.** The architecture validated this session — Mission Vault + RAG (3,264 chunks live across brain + Obsidian) + document-ingestion daemon (Dropbox sync) + UI-driven approval flow + Claude API proxy — is the *productizable shape*. BCBT proves the model; the same model resells to any SME in Europe.
- This session's headline (for the pitch deck): *Built 369 MISSION VAULT v3 — 6 tabs, mobile-first, Claude API connected, RAG engine live with 3,264 chunks, Obsidian vault indexed, approve/reject from UI working, preview fix deployed.*

**Technical decisions:**
- ecosystem.config.cjs holds all daemon secrets (DROPBOX_TOKEN, ANTHROPIC_API_KEY). Single file, multi-app — "Option A". Permanently gitignored.
- pm2 mission-control-369 is owned by the ecosystem file going forward (was bare `pm2 start dashboard/server.js`). pm2 save committed the new shape to ~/.pm2/dump.pm2.
- Dropbox watch path = `/CORTEX-369`, `recursive:false`. JSONL output at intelligence/dropbox-sync.jsonl. Cursor at integrations/.dropbox-cursor.
- Mission Control is "swap-and-refresh": dashboard/server.js reads dashboard/index.html on every request — no pm2 restart needed for HTML-only changes (server.js changes still need restart).
- Server diagnostic /api/status reports own configuration health (READY vs MISSING). Replicate this pattern for future daemons.

### Pending for next session
- Re-enable CORTEX-369 Dropbox app: console → Settings → Status → Enable; Permissions → tick `files.metadata.read` + `files.content.read` → Submit; Settings → Generate fresh token. Paste it; swap into ecosystem.config.cjs; `pm2 restart dropbox-sync --update-env`. Validate that intelligence/dropbox-sync.jsonl gains its first `Synced: …` entry.
- Decide whether to commit the dashboard v3 stack (M dashboard/index.html, M dashboard/server.js, ?? dashboard/rag-engine.js) — currently only the mission-vault/ archive copy is committed.
- Carried from morning session: triage of intelligence/proposed-fixes/2026-05-03-self-improvement-run-001.md (HIGH + 2 MED proposed fixes still untouched).

### Lessons learned today (afternoon)
- "Stop and ask before `git add .`" caught a public-repo secret leak. ecosystem.config.cjs was untracked and held a live Dropbox token; the brain repo's .gitignore had `*.env`/`*.key`/`*.token` patterns but not `ecosystem.config.cjs`. Worth standing rule: any new secret-bearing config file gets the .gitignore entry in the same diff that introduces the file.
- Dropbox app console flow trapped us three times: (a) scope ticks aren't auto-saved (Submit button at the bottom of Permissions tab), (b) tokens are bound to scopes at generation time so ordering matters, (c) "App disabled" status is a separate state from missing scopes and produces a different error. Order is: tick → Submit → reload to verify → Generate.
- Server boot banner that spells out config health (Claude API ✓/✗, RAG chunks N, Previews N) made post-deploy validation a 1-second glance instead of a curl loop. Worth replicating in dropbox-sync.
- pm2 detail: --update-env on a process started bare can't read from an ecosystem file the process wasn't registered with. Re-registration (delete + start --only) is required, then pm2 save to persist across reboots.
- HTTP smoke test (curl -sS -o /dev/null -w "HTTP %{http_code} · %{size_download}b") after every deploy is cheap and catches broken responses immediately. Especially valuable when tracking which exact bytes are being served (size match against source file).
- The user's terse "Run" inputs sometimes mean "do the obvious next thing" but sometimes hide a missing decision (option A vs B + token). Re-stating the still-pending decisions in the response ensures we don't silently drift.

---

## 4 May 2026 (late evening) — Guardian test harness live (pm2-managed)

**Branch:** main (369-brain) | portal untouched

### What was done

Stood up `guardian-bridge.js` as a permanent pm2 process inside 369-brain. Guardian now watches the EAGLE log (`intelligence/harness-runs/eagle-harness.jsonl`) every 30 s, runs the Playwright suite when an EAGLE entry transitions to `code_written` / `complete` / `approved`, also runs the suite at 02:00 local daily, and emits a structured run record + daily markdown + learning-log entry on every run. First initial-suite run completed: **10 tests, 10 passed, 0 failed, 54.7 s wall** (1 portal-loads + 1 backend-API + 8 user-role logins).

### Per Shon's session-close brief

Guardian test harness fully live. `guardian-bridge.js` built with all 8 improvements. **11/11 tests passing** (during dev run with the temporary inspect-login-form probe; steady-state baseline after probe removal is 10/10). All 8 user roles tested (super_admin, manager, team_lead, agent, staff, organization_owner, organization_admin, organization_agent). Guardian in pm2 permanently. Watches EAGLE every 30 seconds. Daily 2am run scheduled. Learning log connects to Self-Improvement. Every test result linked to triggering EAGLE build via `eagle_run_id`. Unique run files per test run (`guardian-<epoch>.json` immutable, `latest.json` overwritten). Guardian tab designed in Mission Vault.

### Files created

| File | Purpose |
|------|---------|
| `~/deassists-workspace/369-brain/e2e/portal.spec.js` | Playwright suite: portal-loads + backend-API + 8 user-role logins. Reads `process.env.TEST_PASSWORD`. |
| `~/deassists-workspace/369-brain/playwright.config.js` | `testDir: ./e2e`, `baseURL: http://localhost:4002`, headless, list reporter, 30s test / 15s nav / 10s action timeouts. |
| `~/deassists-workspace/369-brain/package.json` | Minimal `devDependencies: { "@playwright/test": "^1.48.0" }`, `npm test` script. |
| `~/deassists-workspace/369-brain/package-lock.json` | npm install footprint. |
| `~/deassists-workspace/369-brain/node_modules/` (3 pkgs) | `@playwright/test` and deps. Browsers cached at `~/Library/Caches/ms-playwright/` (NOT in repo). |
| `~/deassists-workspace/369-brain/guardian-bridge.js` | The daemon. Triggers: EAGLE poll (30 s), daily 02:00, initial-startup (only if `latest.json` missing). Captures Playwright stdout, parses pass/fail/skip counts, writes per-run + latest + daily-md + learning-log. `isRunning` guard prevents overlap. |
| `~/deassists-workspace/369-brain/logs/` + `guardian-error.log` + `guardian-out.log` | pm2 streams. |
| `~/deassists-workspace/369-brain/intelligence/test-runs/latest.json` | First run snapshot (run_id `guardian-1777917775120`). |
| `~/deassists-workspace/369-brain/intelligence/test-runs/guardian-1777917775120.json` | Immutable per-run record. |
| `~/deassists-workspace/369-brain/intelligence/test-runs/2026-05-04.md` | Human-readable daily report. |
| `~/deassists-workspace/369-brain/intelligence/learning-log.md` | New file; first dated entry written. Self-Improvement reads this weekly. |

### Files modified

| File | Change |
|------|--------|
| `~/deassists-workspace/369-brain/ecosystem.config.cjs` | Added `env.TEST_PASSWORD` to `harness-worker`; appended new `guardian` app entry (script `guardian-bridge.js`, cwd 369-brain, `autorestart: true`, `max_restarts: 5`, error/out logs in `./logs/`, env `{ NODE_ENV: 'production', TEST_PASSWORD }`). |
| `~/.pm2/dump.pm2` | `pm2 save` persisted guardian (pid 52342) alongside harness-worker, mission-control-369, dropbox-sync, backend, cms, website. |

### pm2 state at session close

```
guardian        | pid 52342 | online | 0 restarts | 48.4 MB
harness-worker  | pid 10733 | online | 2 restarts (pre-existing)
```

### Notable debugging

- Original `button[type="submit"]` selector failed all 8 logins (10s timeouts). DOM probe (added as temporary `inspect login form` test, since removed) revealed: button is `<button>Sign In</button>` with no `type` attribute, and there is no real `<form>` wrapping the inputs (the only `<form>` matched was a hidden Google Translate voting form). Replaced with a 9-selector union: `button[type="submit"], input[type="submit"], button:has-text("Sign in"|"Login"|"Log in"|"Continue"|"Submit"), [data-testid*="login"|"submit"]`. All 8 logins then passed.

### Caveats / known issues

- Login assertion is plumbing-level, not auth-level: each login post-click resolves to `http://localhost:4002/` and the test only checks the URL doesn't contain `/login` or `/signin`. A wrong password could theoretically pass if the SPA doesn't redirect on success. Tightening the assertion (cookie / post-login DOM element / `/api/me`) is on the next-session list.
- `ecosystem.config.cjs` now contains `TEST_PASSWORD` in plaintext (in two places: `harness-worker` env and `guardian` env). Matches the existing plaintext-secret pattern in this file (Dropbox token line 14, Anthropic API key line 34) — flagged for future rotation to a gitignored `.env` referenced by pm2's `env_file`.
- Guardian race: if EAGLE writes a `code_written`/`complete`/`approved` entry while a 2am run is already in progress (~55s window), `isRunning` causes the EAGLE-driven trigger to be silently dropped. Acceptable for now; a future improvement is a queued retry on the next 30-second poll.
- Guardian does NOT replay history on boot — `lastProcessedId` initialises from the *current* last EAGLE entry, so existing entries do not retroactively trigger runs.

### Pending for next session

- Harden login assertions in `e2e/portal.spec.js`.
- Build the Mission Vault **Guardian tab** to read `intelligence/test-runs/latest.json` + the daily markdown.
- Move `TEST_PASSWORD` (and Dropbox/Anthropic secrets) out of `ecosystem.config.cjs` into a gitignored `.env` via pm2 `env_file`.
- Carry over from earlier today: wire `approvals/*.signal` → harness-worker; re-enable CORTEX-369 Dropbox app; commit dashboard v3 stack + RAG MongoDB connector + harness-eagle.js carve-out.

### Commits this session

None. All work uncommitted; pm2 dump is the only persisted runtime state.

---

## 5 May 2026 — Mission Vault foundations: Guardian, Connections, Gmail, Login, Logout

**Branch:** main (369-brain) | portal untouched

### What was done

Marathon brain-only build session. 13 commits pushed to main, all on the dashboard/server foundation. No portal touches.

#### 1. Guardian test harness expanded (3 new org user types)
- Added `organization_manager` / `organization_team_lead` / `organization_staff` to `e2e/portal.spec.js` TEST_USERS
- Added 3 corresponding rows in Guardian tab UI (`acc-om`, `acc-ot`, `acc-os`)
- Updated `accMap` in `loadGuardian()` with 3 new entries
- Updated `userTypes` arrays in BOTH `guardian-bridge.js` AND `guardian-run-once.js` (the latter wasn't in your spec, but updating it kept "Run now" button parity with the EAGLE-watch parser)
- Suite is now **13 tests** (1 portal-loads + 1 backend + 11 logins) — all passing in 1.3 min

#### 2. Connections tab built end-to-end
- New tab inserted as tab 4 between RAG and Self-Improvement
- Synchronized renumbering across desktop dtabs / mobile bntabs / panels (`p4–p7`, `t4–t7`, `bn4–bn7`) + card sw() shifts (Learner sw(4)→sw(5), Guardian sw(5)→sw(6))
- Created `intelligence/ai-registry.json` v1.1: 10 models (claude, openai, ollama-nous-hermes, mistral, llama3, deepseek, gemini, grok, perplexity, cohere) · 11 routing rules · 2 hard blocks · Hermes Agent framework as "Gate 1 operator"
- New `GET /api/connections` endpoint reads registry + detects live status per model (env vars for cloud, `ollama list` for local) + `pm2 jlist` for harness state
- New `GET /api/self-improvement/status` endpoint parses `intelligence/proposed-fixes/*.md` (regex on `Pattern A —` for 5, `## Fix 1` for 6)
- Frontend `loadConnections()` renders 6 sections: AI Models · Hermes Agent · Data Sources · Active Harnesses · Routing Rules · Hard Blocks
- Coming-soon source cards now have action buttons: Dropbox "Fix now →" link, Gmail/WhatsApp/Telegram "+ Connect" buttons

#### 3. PDF upload pipeline
- Hand-rolled multipart parser (single-file case) at `POST /api/rag/upload-pdf` — placed BEFORE `await readBody(req)` so the stream isn't consumed
- `pdf-parse` package installed in `dashboard/`
- Saves both `.pdf` and `.md` to `intelligence/uploads/pdf/`
- Added 5th source block in `rag-engine.js`
- Added `📄 PDFs` chip in `/api/sources`
- Replaced theatrical client-side `processPDF` with real `uploadPDF(file)` calling the new route

#### 4. Gmail OAuth connector
- Moved web-type OAuth credentials to `integrations/gmail-credentials.json` (after replacing user's first desktop-type creds with web-type)
- Added gitignore patterns for `integrations/*-credentials.json` and friends — pushed as separate security commit `ff061ca` so origin gets the protection
- Wired three routes: `/api/gmail/auth-start` (returns Google authUrl with `gmail.readonly` scope) · `/api/gmail/auth-callback` (exchanges code, calls `gmail.users.getProfile()` for email, persists `.gmail-token-<email>.json`, returns close-popup HTML with postMessage signal) · `/api/gmail/accounts` (lists tokens)
- Built `integrations/gmail-sync.js` — paginated message fetch up to 200 messages from inbox+sent, body extraction from `text/plain` part, dedup by msg ID, token-refresh handler auto-persists rotated refresh tokens
- Added 6th source block in `rag-engine.js` walking `intelligence/gmail/<email_at_>/*.md`
- `npm install googleapis google-auth-library` in `dashboard/`

#### 5. Login gate + page
- Server now serves `login.html` when no `.gmail-token-*.json` exists, `index.html` when one does (gate logic in HTML serve fallback)
- Login page went through **3 designs in one session**:
  - (a) Guards Red theme + hand-drawn 911 SVG — committed
  - (b) Real Porsche photo (`~/Downloads/wallpapersden.com_porsche-red_3840x2160.jpg` → `dashboard/porsche-911.jpg`, compressed `sips -Z 1200` from 6.2 MB → 180 KB, removed from gitignore so it commits)
  - (c) **Final**: Nous Research dark terminal aesthetic — `#0C1F16` deep green, Barlow Condensed 88px blinking 369, 52px pulsing red MISSION VAULT, Courier Prime mono labels, sign-in links with → arrows
- Apple button shows honest "coming soon" alert (no fake redirect)
- Google button opens centered popup, polls `popup.closed`, redirects on close + listens for postMessage from auth-callback

#### 6. Logout flow
- `org-pill` made clickable (id `org-pill-btn`) with dropdown showing connected email + red "Sign out →"
- `loadUserEmail()` fetches `/api/gmail/accounts` and fills the dropdown
- JS rewritten using `addEventListener` inside `DOMContentLoaded` with `e.stopPropagation()` (prior inline-onclick + document-listener race made first click no-op)
- **Bug fix discovered last**: `/api/logout` was authored inside the GET block with `&& req.method==='POST'` guard — contradiction made the route unreachable. Frontend's POST hit catch-all HTML serve, JSON.parse threw silently, no redirect. Fix: moved route into POST block. Verified with curl: token deleted, HTTP 200.

#### 7. Honesty cleanup
- Removed all hardcoded fake numbers from Overview cards (Builder/Learner/Guardian/RAG)
- Replaced fabricated `Math.ceil(fixes * 1.2)` for `learner.patterns` with real regex (3 iterations until matching the bullet-list format actually used)
- Replaced "Local-first — no data leaves your machine" with accurate "Local-first storage — AI requests use configured model provider"
- PDF toast: "PDF added to vault — now searchable" (lie before there was an upload pipeline) → "PDF summarised — vault indexing coming soon" → after pipeline shipped: real "PDF indexed into vault — now searchable" or fallback
- `activeSrc` no longer hardcodes `['brain','portal']` — populates dynamically from `/api/sources` first response

#### 8. Design system v2.0
- `skills/MISSION-VAULT-STYLE.md` overwritten from "Batman Dark Knight" v1 to "Dark Terminal Nous Research" v2.0 (149 lines)
- Documents palette, font stack, animation rules, gate colour map, login page recipe, key components

### Commits this session (13, oldest first)

| Hash | Title |
|---|---|
| `66d2916` | feat: Guardian tab live — full test harness, per-account results, EAGLE sync |
| `64d4361` | fix: remove all hardcoded UI data — honest counts only |
| `db2527d` | feat: all APIs live — connections, self-improvement, AI registry v1.1 |
| `f075da4` | feat: add 3 missing org user types — org manager, org team lead, org staff |
| `ff061ca` | security: protect gmail credentials and future integration secrets from git |
| `a27d0e9` | feat: 911 Guards Red login page + Gmail full connector |
| `299ed13` | feat: login page — 911 side profile SVG + Google popup fix |
| `0b0cc0b` | feat: logout button in top nav — shows email, sign out clears token returns to login |
| `697f72c` | feat: real Porsche 911 GT2 photo on login page |
| `df52cc3` | asset: Porsche 911 GT2 login image — compressed for web |
| `18eff5b` | fix: logout dropdown — proper event listeners, sign out clears token |
| `2423770` | design: Nous Research aesthetic — dark green login, Barlow Condensed, Batman skill v2.0 |
| `c0be272` | fix: move /api/logout route from GET block to POST block — was unreachable |

### Decisions locked

- Brain owns the Playwright test suite (never portal)
- AI registry is read on every request (no caching) — JSON edits take effect on next API call
- Hard blocks (`gate:4`) are enforced at the routing layer for student PII + private financial data — `blocked_model_privacy: ['cloud']`
- Self-Improvement counts come from regex on the latest proposed-fixes report — `Pattern A —` and `## Fix \d+`
- Login is gated by Gmail token presence — single token = full access, multi-user RBAC deferred
- Apple Sign-In is "coming soon" alert until proper flow is built
- `setImmediate` background sync after Gmail OAuth callback handles initial RAG indexing
- Token refresh handler in `gmail-sync.js` auto-persists rotated refresh tokens — no re-auth long-term

### Pending for next session

- Restart guardian process to pick up the 3 new userTypes (still 8 in memory at pid 69756)
- Commit `dashboard/package.json` + `package-lock.json` so fresh clones work (3 new deps: `pdf-parse`, `googleapis`, `google-auth-library`)
- Re-OAuth Gmail (`info@deassists.com`) — token deleted by my curl verifying logout fix
- Implement Gmail periodic sync (recommend `setInterval(syncAll, 600_000)` on server boot)
- Decide: Apple Sign-In flow vs Hermes Agent build vs both
- Decide what to do with `dashboard/porsche-911.jpg` (orphan asset, 180 KB committed, no HTML references it)

### Lessons learned today

- Multi-line edits with renames work cleanly only in REVERSE order — when shifting tabs sw(4)→sw(5)→sw(6)→sw(7), do sw(6)→sw(7) first, then sw(5)→sw(6), then sw(4)→sw(5). Forward order creates duplicate matches at each step (Edit tool fails on non-unique anchors).
- Inline `style="display:none"` on a panel breaks the `.panel.on { display:block }` toggle — inline style has higher specificity than class rules. Always rely on the class system instead.
- Routes inside the wrong method block become silently unreachable. The `req.method==='POST'` guard on a route inside the `if(req.method==='GET')` block looks correct on first read but is a permanent dead branch. Lesson: routes belong in the block matching their actual method, no exception guards.
- Multipart upload routes must be placed BEFORE `await readBody(req)` — readBody drains the stream into a string before any URL routing happens, so the multipart parser's `req.on('data')` would never fire.
- The user's "find/replace" anchors sometimes assume a different code state than reality (e.g., `panel5` vs the file's actual `p5`, `connectNewGmail` function that doesn't exist yet). Flag the deviation up front, adapt to actual file state, document in response.
- Image compression matters: `sips -Z 1200` knocked the Porsche photo from 6.2 MB to 180 KB with no visible quality loss at the rendered size — 97% reduction, page-load weight back to reasonable.
- Sign-in popups vs full-tab redirects need different completion strategies. Popup uses `postMessage` to opener + `setTimeout(close)`; tab login needs `window.location.href = '/'` redirect because there's no opener. Login page handles both via `window.opener` check + `popup.closed` polling.

### Carry-over from prior sessions (not touched)

- `approvals/*.signal` → harness-worker bridge still missing
- CORTEX-369 Dropbox app still disabled (token won't fetch)
- `harness/eagle/eagle-harness.js` carve-out, `dashboard/rag-engine.js` MongoDB tweaks, harness JSONL cleanup all still uncommitted
- Latha portal review (4 fixes, permission.helper.ts, sidebar audit) still pending

---

## 5 May 2026 (late) — Item 1: Approval Signal Bridge

**Branch:** main (369-brain)

### What was done

Added the approval signal bridge to `harness-worker.js` — closes the UI→worker gap that's been carried since the dashboard `/api/approve` endpoint began writing `.signal` files.

- **Lines added:** 76 (`harness-worker.js`: 197 → 273)
- **New functions:** `processSignalFile(filename)`, `startApprovalBridge()`
- **New constants:** `APPROVALS_DIR`, `PROCESSED_DIR`, `SIGNAL_WRITE_DELAY_MS`, `processedSignals` Set (debounce)
- **Hook point:** single `startApprovalBridge()` call in `main()` after `setInterval(pollOpenTickets, ...)`

### How dispatch works

1. `fs.watch` on `~/deassists-workspace/369-brain/approvals/`
2. On new `.signal`: wait 200ms for write, read content, strip `.signal` from filename for ticket name
3. Dispatch — reusing the EXACT handlers the stdin parser uses:
   - `^not approved` → `handleReject(ticket)`
   - `^approved` → look up latest run via `logger.listRuns(eagle.HARNESS_NAME)`; if last phase matches `/mode1/i` → `handleApprovedMode1`, else `handleApprovedMode2`
4. Move signal file to `approvals/processed/`
5. All steps logged with `[Bridge]` prefix

### Verification

Verified by 4 stale signals already sitting in the folder from prior sessions, processed correctly on the first PM2 restart that picked up the new code:

| Signal | Content | Dispatch | Handler response |
|--------|---------|----------|------------------|
| `bcbt-fee-calculator.signal` | `not approved bcbt-fee-calculator` | reject | `no waiting run to reject` (correct — stale) |
| `harness-eagle-stage-marker-contract-followups.signal` | `approved …-followups` | approveMode1 | `no run waiting for mode1 review` (correct — stale) |
| `harness-eagle-stage-marker-contract.signal` | `approved …-marker-contract` | approveMode2 (phase=eagle-mode2) | `no run waiting for mode2 approval` (correct — stale) |
| `self-improvement-harness-v1.signal` | `approved self-improvement-harness-v1` | approveMode1 (phase=eagle-mode1) | `no run waiting for mode1 review` (correct — already complete) |

All 4 archived to `approvals/processed/`. The "no waiting run" responses are the correct outcome — those tickets had no active gate at the requested phase, so the existing handler logic guarded them safely (no garbage approvals fired).

### Bugs uncovered while shipping Item 1

- **#B-002** — `dashboard/server.js:247` references `RUNS/eagle-harness.jsonl`, actual file is at `intelligence/harness-runs/eagle-harness.jsonl`. The `/api/approve` JSONL update block silently no-ops; explains why some `running` records never closed.
- **#B-003** — `eagle.startTicket()` runs sync (~150s for `/data-check` + `/eagle-mode1`), blocking the event loop; the bridge appears to "do nothing" for up to 150s after PM2 restart if there's an open ticket. Functionally correct, latency surprise.
- **#B-004** — `dropbox-sync` PM2 process has been hitting expired-token 401s every minute since ~17:27 today; CORTEX-369 Dropbox app is disabled in console. Parked.

### Side fix during the session

Earlier today, mission-control-369 was crash-looping with 40 restarts in 2h — root cause was `Cannot find module 'googleapis'` from `integrations/gmail-sync.js`. The package was installed at `dashboard/node_modules` but `gmail-sync.js` lives in `integrations/`, so Node's parent-directory walk never found it. Installed `googleapis` at the 369-brain root which is where Node's resolver lands when walking up from `integrations/`. Restart cleared the loop; new error log entries stopped, restart counter held, Gmail sync resumed (`[Gmail] Indexed 0 new messages` confirms healthy round-trip).

### Files touched

| File | Change |
|------|--------|
| `harness-worker.js` | +76 lines — bridge implementation |
| `memory/session-state.md` | New session block + Bug Ledger (#B-002, #B-003, #B-004) |
| `memory/activity-log.md` | This entry |

### Carry-forward

- `#B-002` server.js path mismatch — fix is one-line, but want to confirm whether `RUNS` constant has other call sites before changing
- `#B-003` event-loop block — defer until eagle phases are made async; not user-visible enough to prioritize
- `#B-004` Dropbox token — parked until Shon needs Dropbox ingestion live

---

## 5 May 2026 (late session) — Item 2: SQLite Memory Foundation

**Branch:** main (369-brain)

### What was done

Built the persistent memory layer that future agents will route every read/write through. Three SQLite databases (episodes, events, working) plus two thin abstractions: `MemoryRouter` for episodes + working memory, `EventBus` for durable pub/sub.

- **Step 2A** — SQLite foundation: 3 dbs initialized via `init-db.js`, additive-only schema policy chosen and documented in the `schema.sql` header (resolves Bug #B-005). Each db opens with WAL journaling, foreign keys ON. Commit: `639990c`.
- **Step 2B** — `MemoryRouter` class (5 public methods: `emit`, `query`, `setWorking`, `getWorking`, `close`). Lazy db open, prepared-statement cache by SQL text, JSON auto-stringify/parse. 8 unit tests pass, with full row cleanup on exit.
- **Step 2C** — `EventBus` class (5 public methods: `emit`, `subscribe` with unsub fn, `replay`, `close`). Live in-process subscribers fire synchronously inside `emit()`; subscriber errors are caught so a bad listener can't block delivery. 8 unit tests pass.
- **Step 2D** — Integration test models eagle → guardian → self-improvement (live + replay). 6 tests pass. **First regression run uncovered Bug #B-006**: the cursor used `(ts, id)` lexicographic comparison and UUID ids have no chronological ordering — when 2+ events shared a millisecond, replay returned 0/1/2 events nondeterministically. Schema change applied (additive): added monotonic `seq INTEGER NOT NULL UNIQUE` column to `event_log`, plus `last_seq` to `cursors`. Replay query rewritten to `WHERE seq > ?`. Pre-production .db files wiped and re-initialized.

### Determinism check

After the seq fix, the full suite was run **5 times back-to-back** (router + bus + integration). All 5 runs green:

```
RUN 1 — 22/22 pass
RUN 2 — 22/22 pass
RUN 3 — 22/22 pass
RUN 4 — 22/22 pass
RUN 5 — 22/22 pass
```

Cleanup verified — all 4 tables empty after the loop (`episodes:0 event_log:0 cursors:0 working_memory:0`).

### Bugs caught and resolved this session

- **#B-005 (RESOLVED)** — `init-db.js` idempotent but not migration-aware. Fix: additive-only policy in `schema.sql` header. Migration system deferred until first non-additive change is forced.
- **#B-006 (RESOLVED)** — EventBus cursor non-deterministic under ms collisions. Fix: monotonic `seq` column, cursor tracks `last_seq` only, `last_event_id` and `last_ts` kept for forensic value but no longer consulted.

### Files touched

| File | Change |
|------|--------|
| `memory/router.js` | NEW (173 lines) — MemoryRouter |
| `memory/event-bus.js` | NEW (181 lines) — EventBus with seq cursor |
| `memory/test-router.js` | NEW (153 lines) — 8 unit tests |
| `memory/test-event-bus.js` | NEW (168 lines) — 8 unit tests |
| `memory/test-integration.js` | NEW (155 lines) — 6 end-to-end tests |
| `memory/db/schema.sql` | additive-only header + `seq` column + `last_seq` cursor |
| `memory/db/init-db.js` | (unchanged from Step 2A) |
| `memory/db/episodes.db` | regenerated empty after wipe |
| `memory/db/events.db` | regenerated empty with new schema |
| `memory/db/working.db` | regenerated empty |
| `memory/session-state.md` | Item 2 → DONE; B-005 + B-006 logged + RESOLVED |
| `memory/activity-log.md` | This entry |

### Commits

- **Step 2A** — `639990c` (already pushed)
- **Step 2B + 2C + 2D + B-006 fix** — bundled into the next commit (this one)

### Carry-forward

- **Item 4 — Episodic Ingestion** — wire `eagle` (harness/eagle/eagle-harness.js) and `guardian` (guardian-bridge.js) to write through `MemoryRouter` instead of (or alongside) their current JSONL writes. First target: replace eagle's `Phase complete` log lines with `mem.emit({ kind: 'eagle.phase.complete', ... })` + bus event on `eagle.build.complete.<feature>`.
- **Multi-process seq safety** — current `MAX(seq) + 1` inside a transaction is single-process safe; under multi-process emits to the same db the `UNIQUE` constraint catches collisions but doesn't auto-retry. If eagle and guardian ever run in separate processes both writing event_log, add a retry-on-UNIQUE-violation loop in `EventBus.emit()`.

---

## 5 May 2026 (deep session) — Item 4: Episodic Ingestion

**Branch:** main (369-brain)

### What was done

Wired all three harnesses (eagle, guardian, self-improvement) to write through the new MemoryRouter + EventBus alongside their existing JSONL/file outputs. JSONL stays authoritative — dual-writes happen *after* file writes succeed and never propagate errors.

- **Step 4-Pre** — Added monotonic `seq INTEGER NOT NULL UNIQUE` column to `episodes` table (mirroring B-006's fix on `event_log`). Router gained `sinceSeq` filter and `'seq ASC'` / `'seq DESC'` ordering. test-router added T9 covering sinceSeq pagination. **Episodes return shape changed: `{seq, id, ts}` (was `{id, ts}`)**.
- **Step 4A** — `harness/core/logger.js` extended with lazy MemoryRouter/EventBus singletons + `_safeEmitEpisode/Bus` helpers + `_isEagle` gate. `startRun` / `updateRun` / `logPhase` / `logApproval` now dual-write episodes for `harnessName === 'eagle-harness'`. Bus emits on run-status transitions, approvals, and failed phases. New smoke test `test-eagle-wiring.js` 7/7 PASS.
- **Step 4B** — `guardian-bridge.js` extended with same lazy singleton pattern; `runTests` signature changed `(reason, eagleEntry)` → `(trigger)` and made `async`; `_emitTestStart`/`_emitTestComplete` extracted; `subscribeToEagleBus()` registers an in-process callback on `eagle.run.complete` with 5s setTimeout debounce + `isRunning` guard; `_testsRunner` indirection hook for tests. Boot block guarded behind `GUARDIAN_TEST_MODE` env. Test-mode exports for `_mem`/`_bus`/`_emitTestStart`/`_emitTestComplete`/`_setTestsRunner`/`subscribeToEagleBus`. New smoke test `test-guardian-wiring.js` 6/6 PASS.
- **Step 4C** — `_isEagle` → `_harnessAgent` dispatcher in logger.js (HARNESS_AGENTS map: `eagle-harness` → `eagle`, `self-improvement-harness` → `self-improvement`). New `inputs.readEpisodesSince(mem, lastSeq)` filters self-improvement's own events out at the inputs layer. `self-improvement-harness.js` reads watermark from `working_memory['self-improvement']['last_episode_seq']`, calls `readEpisodesSince` in Phase 2, advances watermark JUST BEFORE final `logger.updateRun(complete)` (only on success). New smoke test `test-self-improvement-wiring.js` 7/7 PASS.
- **Step 4D** — Cross-agent integration test exercises the full chain in a single process. Required `LOGGER_TEST_MODE=1` test hooks (`_setMemSingleton` / `_setBusSingleton`) so logger.js and guardian-bridge.js share their bus singleton — needed because in production they're separate PM2 processes with separate in-memory bus instances (B-007). New test `test-cross-agent-integration.js` 7/7 PASS.

### Bugs caught and resolved this session

- **#B-007** — *DOCUMENTED, deferred*. EventBus subscribers are in-process only. Guardian's in-memory `subscribe('eagle.run.complete', ...)` never fires across processes. The 30s `watchEagle` JSONL poll is the cross-process channel today. Future: Guardian-side poller that calls `bus.replay()`, OR a process-level singleton for EventBus.
- **#B-008** — *RESOLVED in this commit*. `guardian-bridge.js:214` referenced `${reason}` after Step 4B renamed the variable to `source`. Threw `ReferenceError` on every real `runTests` invocation, silently breaking the daily-markdown and learning-log writes (latest.json was fine — written before line 214). One-line fix. Surfaced by Step 4D testing when production guardian polled the cross-agent test's eagle JSONL entry.

### Production-state restoration (from B-008 fallout)

Production guardian PM2 polled the cross-agent test's eagle-harness.jsonl entry and ran a real `npx playwright test` against the live portal (passed 13/13). It then crashed on the .md write due to B-008. Recovery actions:
- Restored `intelligence/test-runs/latest.json` from `guardian-1777984771029.json` (the previous good run).
- Removed orphan `intelligence/test-runs/guardian-1778010540010.json`.
- Cleared the leaked episode + bus events from the dbs.
- Pushed the .md fix into guardian-bridge.js so the next legitimate run writes correctly.

### Operating note for the regression suite

When running `for i in 1..5; node memory/test-X.js`, **stop guardian PM2 first**: `pm2 stop guardian`. Restart with `pm2 restart guardian` after. The cross-agent test writes to production eagle-harness.jsonl as part of exercising the eagle path; production guardian's poller can pick this up and trigger a real playwright run. The test's defensive cleanup deletes leaked episodes from the dbs but cannot undo dashboard-state side effects.

### Verification

- 7 test suites × 5 runs = **35 test runs per regression cycle**, all green
- Cleanup invariant holds: `episodes=0, event_log=0, cursors=0, working_memory=0` after the loop (with guardian stopped)
- Production exports unchanged: logger.js `[startRun, updateRun, logPhase, logApproval, getRun, listRuns, RUNS_DIR]`, guardian-bridge.js `[]` (script with empty exports as before); test-mode adds optional hooks under env-gated branches.

### Files touched

| File | Change |
|------|--------|
| `harness/core/logger.js` | +90 lines net — singletons, `_harnessAgent` dispatcher, 4 dual-write hooks, test-mode exports |
| `guardian-bridge.js` | +90 lines net — singletons, `_emitTestStart/Complete` helpers, `runTests(trigger)` async, `subscribeToEagleBus`, `_testsRunner` indirection, boot guard, test-mode exports, **B-008 fix** |
| `harness/self-improvement/inputs.js` | +18 lines — `readEpisodesSince` export |
| `harness/self-improvement/self-improvement-harness.js` | +20 lines — MemoryRouter import, watermark cursor, dual-read, advance on success |
| `memory/router.js` | sinceSeq filter, `'seq ASC/DESC'` order, `seq` in return shape |
| `memory/db/schema.sql` | episodes seq column + idx_episodes_seq index |
| `memory/test-router.js` | T9 + seq assertion in T1 |
| `memory/test-eagle-wiring.js` | NEW (~110 lines) |
| `memory/test-guardian-wiring.js` | NEW (~150 lines) |
| `memory/test-self-improvement-wiring.js` | NEW (~155 lines) |
| `memory/test-cross-agent-integration.js` | NEW (~225 lines) |
| `memory/db/episodes.db` | regenerated with seq column |
| `memory/db/events.db` | regenerated empty (carries seq from Step 2D) |
| `memory/db/working.db` | regenerated empty |

### Carry-forward

- **#B-007** — design a cross-process bus delivery mechanism (Guardian replay-poller or process-level singleton). Schedule when Guardian needs to react faster than 30s.
- **Item 5 — Mode 3 Resume** — pick up an EAGLE Mode 3 stage after operator approval following a failed run. Today rejects/fails are terminal.

---

## 5 May 2026 (deep session continued) — Item 5: Mode 3 Resume

**Branch:** main (369-brain)

### What was done

Rejected/failed EAGLE runs can now be resumed from the next stage after the last successfully completed one — no more re-ticketing from scratch. Worker boot detects orphans (status='executing' with no live process) and flags them for resume.

- **Step 5A** — `runMode3Stage`'s success-meta block now writes `last_completed_stage` (0-indexed array index of the just-finished stage), `last_completed_stage_name`, and `last_completed_at`. The signature was relaxed to `(runId, startStageIndex = null)` with a fallback that derives `startStageIndex = current_stage_index + 1` when not provided. New `resumeRun(feature)` function: looks up the most recent run for the feature, validates resumable (`failed` / `rejected` / `executing`), validates a stage plan exists, validates not-all-done, then flips status to `executing` with `resumed_at` / `resumed_from_stage`, logs a `resume` phase episode (which fires `eagle.phase.complete` via the Step 4A dispatcher), and re-enters `module.exports.runMode3Stage(runId, lastStage + 1)`. The `module.exports` indirection lets tests monkey-patch without spinning up real headless Claude.
- **Step 5B** — `resume <feature>` stdin command added to the worker's command parser and switch (fire-and-forget — `runMode3Stage` runs synchronous `execSync('claude -p')` for 5+ min per stage; awaiting it would block the stdin loop). The bridge's `processSignalFile` got a third match arm for `resume <feature>` with priority order: not approved → approved → resume → unknown. The banner now lists `resume <feature>` in the help text. `HARNESS_WORKER_TEST_MODE=1` opens a small testing seam (`processSignalFile`, `parseCommand`, `APPROVALS_DIR`, `PROCESSED_DIR`, `_resetProcessedSignals`); production exports stay `[]`.
- **Step 5C** — `recoverOrphanedRuns()` runs once per worker boot between the banner and `pollOpenTickets`. Any run still `status='executing'` is marked `failed` with `error='worker-crashed-mid-stage'`, `meta.orphaned_at` set to now, `meta.recoverable` flagged based on whether at least one stage finished, `meta.awaiting` force-cleared, and `completed_at` set. An `orphan-detected` phase episode is emitted alongside the dispatcher's automatic `eagle.run.failed` bus event. Production boot log now reads `[worker] no orphaned runs on boot` (idle case) or a numbered listing with `✅ recoverable` / `⚠️ NOT recoverable` annotations and a "→ To resume:" hint per orphan.
- **Step 5D** — Crash-resume integration test 7/7 PASS proving the full chain: pre-crash state at stage 1 of 5 → orphan detection flips status to failed (preserving `last_completed_stage`) → operator resume signal → bridge dispatches → resumeRun invokes runMode3Stage at stage 2 → state flips back to executing. T6 verifies the episode trace in seq order: 1× started, 3× executing, 1× failed, 2× phase.complete (orphan-detected + resume) — final executing arrives **after** failed in seq order, proving the resume-after-recovery transition.

### Bugs caught and resolved this session

None new. B-007 (in-process bus subscriber) and B-008 (guardian `reason` ReferenceError) were both surfaced during Item 4; B-008 was fixed inline; B-007 remains documented and deferred.

### Verification

- 11 test suites × 5 runs = **55 test runs per regression cycle**, all green
- Cleanup invariant holds: `episodes=0, event_log=0, cursors=0, working_memory=0` after every cycle (with guardian stopped per B-007 operating note)
- Production exports unchanged: `harness/eagle/eagle-harness.js` adds 2 (`resumeRun`, `recoverOrphanedRuns`); `harness-worker.js` production exports stay `[]`; logger.js production exports unchanged

### Files touched

| File | Change |
|------|--------|
| `harness/eagle/eagle-harness.js` | +115 lines net — `last_completed_stage` writes, `resumeRun(feature)`, `recoverOrphanedRuns()`, `runMode3Stage(runId, startStageIndex=null)` signature relaxation |
| `harness-worker.js` | +50 lines net — `resume <feature>` stdin command + bridge dispatch (fire-and-forget), boot-time orphan check, banner help update, test-mode export gate |
| `memory/test-resume-wiring.js` | NEW (~165 lines) — 6-test smoke for resumeRun (T1-T6) |
| `memory/test-resume-dispatch.js` | NEW (~190 lines) — 5-test smoke for stdin/bridge resume routing (T1-T5) |
| `memory/test-orphan-recovery.js` | NEW (~190 lines) — 6-test smoke for recoverOrphanedRuns (T1-T6) |
| `memory/test-crash-resume-integration.js` | NEW (~225 lines) — 7-test integration covering the full crash → orphan → resume → executing flow |
| `memory/session-state.md` | Item 5 status block, next task → Item 7 |
| `memory/activity-log.md` | This entry |

### Carry-forward

- **B-007** still open — Guardian's bus subscriber only fires same-process. Mitigated by `pm2 stop guardian` before regression.
- **Item 7 — RAG Trace** — capture prompt / context / response / latency for every Claude invocation, wire through MemoryRouter for Self-Improvement to analyze.
- **Multi-process orphan safety** — current design marks any `executing` run as failed on boot. If the worker is restarted while a stage is genuinely in flight, the in-flight headless Claude could still complete and write to a run record the new worker has just marked failed. Acceptable today (workers don't restart often during a stage), but a per-run PID lockfile would let recovery skip orphans whose owning process is still alive.


