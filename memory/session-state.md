LAST UPDATED: 2 May 2026 — SESSION CLOSED (sidebar audit + 4 fixes applied, uncommitted)
369-ECC BUILD STATUS:
Phase 0 — COMPLETE (inventory done)
Phase 1 — COMPLETE (25 files in ~/.claude/369/, all 10 tests passed)
Phase 2 — COMPLETE (brain wired, AGENTS.md, HOOKS.md, lean CLAUDE.md)
Phase 3 — COMPLETE (archive created, superseded files moved, brain cleaned)
Phase 4 — IN REVIEW (sidebar audit PASS post-fix; awaiting browser smoke test + Latha review of permission.helper.ts edit)
Phase 5 — COMPLETE
Phase 6 — COMPLETE (Playwright installed, SCORING-RUBRIC.md, GAN Planner + Evaluator agents, first test written, A19 added to Coding Constitution)
Portal build: 4 uncommitted fixes pending Latha review (see SESSION 2 May 2026 below)
Active portal blocker: NONE — sidebar audit PASS for all 7 roles; pre-commit browser smoke test required (ORG_ADMIN reaching /catalog, STAFF blocked from /leads + /catalog)
GAN loop: READY FOR FIRST RUN after Latha approves Phase 4 fixes

---

# DeAssists OS — Current State
**Maintained by:** VEERABHADRA

---

**Last updated:** 27 April 2026 — QA Fix Applied

**Brain root:** `~/deassists-workspace/369-brain/`

---

## CRM Phase 1 Status: CODE FIX APPLIED 27 Apr 2026
- Fixed new.tsx: raw fetch → useCustomMutationV2
- Fixed dashboard/index.tsx: raw fetch → useCustomQueryV2
- Audited 4 other components: already correct
- Awaiting QA redeployment and Latha verification
Remaining blockers: assigned_to enum hardcoded, Stripe write-back, scope.guard bypass, JWT rotation

---

## SESSION 2 May 2026 — Sidebar Audit + 4 Fixes (UNCOMMITTED)

Three-layer access audit run on SUPER_ADMIN, ORG_ADMIN, MANAGER, TEAM_LEAD, STAFF, AGENT, ORG_OWNER.
Audit FAIL → 4 fixes applied → re-audit PASS.

**Portal files modified (NOT committed — Latha review required):**

| File | Fix |
|------|-----|
| `apps/cms-next/pages/catalog/index.tsx` | Fix 1: ALLOWED_ROLES dropped STAFF, added ORG_ADMIN — now matches sidebar visibility |
| `apps/cms-next/pages/leads/index.tsx` | Fix 2: ALLOWED_ROLES dropped STAFF — closes deep-link bypass |
| `libs/shared/functions/permission.helper.ts` | Fix 3: removed dead block (lines 205-218) with broken arrow `(perm) => { perm.collection.includes(item.path); }` (no return). Behavior unchanged, trap removed |
| `libs/shared/models/sidemenu.ts` | Fix 4: AGENT "Courses" path → `/service/${CollectionNames.Courses}` (was admin path, violated AGENT pattern rule) |

**Build:** `npx nx build shared --skip-nx-cache` → SUCCESS
**Audit verdict:** PASS for all 7 roles across all 3 layers.

**Pre-commit blockers:**
1. `pm2 restart backend` (permission.helper.ts edit per pattern doc Rule 4)
2. Browser smoke test: ORG_ADMIN reaching `/catalog`, STAFF blocked from `/leads` + `/catalog`
3. Latha review (permission.helper.ts is MAXIMUM RISK per pattern doc)
4. `/latha-handover` to produce PR package

---

## NEXT SESSION: Q Intelligence (Phase 2)

- CallLogModal — new component
- LeadDetailPanel — add Log Call button + call summary block
- Backend endpoint already exists: POST /leads/:id/call-log
- Zero backend changes needed
- Two files only: CallLogModal.tsx (new) + LeadDetailPanel.tsx (modified)
- Wait for Latha to merge feature/portal.shon369 first OR build in parallel — decision for next session

---

## WAITING FOR

- Latha QA verification of QA fix (e67089df)
- Latha merge: feature/portal.shon369 → dev_v2
- Kingston QA on qa-portal.deassists.com
- Latha's UIUX + sidebar + finance branch to pull

---

## CURRENT BUILD STATE

**Branch:** feature/portal.shon369
**Backend:** Compiling and running on port 8000 ✅
**CMS:** Running on port 4002 ✅
**Login:** Working ✅
**Phase 1 CRM:** COMPLETE AND PUSHED ✅

---

## LATEST COMMIT

**Hash:** b0d2fdc4
**Message:** fix(crm): Phase 1 complete — enums, UI polish, nav guard, country code
**Date:** 25 April 2026
**Files:** 8

---

## WHAT WAS COMPLETED TODAY (25 April 2026)

### Commit b0d2fdc4 — Phase 1 CRM Complete

| File | What was fixed |
|------|----------------|
| `apps/backend-nest/src/leads/leads.service.ts` | Empty string enum validation fix |
| `apps/cms-next/components/leads/LeadDetailPanel.tsx` | Header lighter (dk2), Save in header, unsaved changes modal, country code display |
| `apps/cms-next/components/leads/LeadQueueSidebar.tsx` | "All Leads" option with total count |
| `apps/cms-next/components/leads/LeadTable.tsx` | data?.data?.data fix |
| `apps/cms-next/pages/dashboard/index.tsx` | Enum imports from lead.constants.ts |
| `apps/cms-next/pages/leads/index.tsx` | Navigation guard lifted to page level, unsaved changes modal |
| `apps/cms-next/pages/leads/new.tsx` | Enum imports, country_code required with +91 default |
| `libs/shared/constants/lead.constants.ts` | All enums + SidebarRole |

### Key Improvements
1. **Enum architecture** — All hardcoded strings replaced with imports from lead.constants.ts
2. **Navigation guard** — Unsaved changes protection on queue clicks, lead row clicks, route changes
3. **Country code** — Required field with +91 default, displayed with WhatsApp number
4. **UI polish** — Lighter header banner, Save button in header, "All Leads" option

---

## NEXT SESSION — PHASE 2

**After Latha merges feature/portal.shon369 → dev_v2:**

1. **Q Intelligence fields** — call_attempts, last_called_at, last_outcome, callback_at, callback_note
2. **CallLogModal** — Agent call logging interface
3. **Fix pre-existing LeadTable.tsx TypeScript error** — Property 'data' does not exist on type 'Lead[]'
4. Phase 2 sidebar structure with LEAD_CRM role

---

## TEAM ROLES — CONFIRMED AND LOCKED

| Type | Who | Portal Access |
|------|-----|---------------|
| SUPER_ADMIN | Shon, Latha | Everything |
| MANAGER | Don, Sruthi, Santosh | Full portal access |
| TEAM_LEAD | Anandhu, Midhun, Stalin, Gopika | CRM access via Call Center role |
| AGENT | External sub-agents ONLY | Zero internal portal access — ever |

**Role assignments:**
- Call Center role → assign to TEAM_LEAD for CRM sidebar access
- Sales Setup role → assign to anyone for Sales CRM access

---

## GRAPHIFY STATUS

**Last update:** 25 April 2026 after commit b0d2fdc4
**Files:** 1772 | **Nodes:** 3998 | **Edges:** 3849

---

## PENDING BLOCKERS

- JWT secrets rotation — Latha CRITICAL
- 4 AWS ACL errors in `accounts.service.ts` — Latha MEDIUM
- Stripe write-back bug — Latha HIGH
- Security guard bypass `scope.guard.ts` ~L79 — Latha HIGH
- `assigned_to` enum EMPTY — Shon runs `=UNIQUE(K2:K9999)` on Sheets col K

---

## FINALISED BUILD PLAN — LOCKED 23 APRIL 2026

### PHASE 1 — Foundation + Permissions + Roles ✅ COMPLETE (b0d2fdc4)

### PHASE 2 — Q Intelligence (ONE COMMIT)

Q Intelligence fields + CallLogModal
`call_attempts`, `last_called_at`, `last_outcome`, `callback_at`, `callback_note`

### PHASE 3 — My Queue page (ONE COMMIT)

Agent's personal queue view — filtered by `assigned_to`

### PHASE 4 — Sales Support panel (ONE COMMIT)

Sales support functionality — TBD with Shon

### PHASE 5 — Config panel (ONE COMMIT)

CRM configuration panel — TBD with Shon

---

## PORTAL SETUP — COMPLETE

- **Call Center** role created in portal ✅
- **Sales Setup** role created in portal ✅
- Roles assigned to Shon AJ account ✅

---

## CLAUDE.md RULES — LOCKED

| Rule | Description |
|------|-------------|
| Rule 0 | Always verify before adding or changing any rule |
| Rule 23 | git diff mandatory before any brain file commit |
| Rule 24 | NEVER commit `pnpm-lock.yaml` — Latha owns it |
| Rule 25 | Never commit `.gitignore` without Latha approval |
| Rule 26 | Any `package.json` change requires Latha approval before commit |
| Rule 27 | Three-layer access audit — mandatory for every CRM page |
| Rule 28 | Constants file is a hard gate — enums must exist before use |

---

*VEERABHADRA — DeAssists Master Brain | Updated: 25 April 2026 — Phase 1 COMPLETE*
