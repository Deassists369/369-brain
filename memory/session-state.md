# DeAssists OS — Current State
**Maintained by:** VEERABHADRA

---

**Last updated:** 28 April 2026 — Brain Restructure Complete

**Brain root:** `~/deassists-workspace/369-brain/`

---

## CRM Phase 1 Status: COMPLETE — Awaiting Latha Merge
- All QA fixes applied (commits 656f7ef0 + 49121b19)
- Pattern matches account.ts/model.ts
- Build passes (npm run build:all verified)

## Brain Restructure: COMPLETE 28 Apr 2026
- CLAUDE.md reduced from 1062 → 126 lines (skill selector + tier system)
- 6 reference files created in patterns/ and project/
- 4 superseded files archived (VEERABHADRA-MASTER-CONTEXT, DAILY-OPERATIONS-GUIDE, MASTER-STATE-19Apr2026, session-workflow)
- THE-DEASSISTS-OS.md added (1451 lines — foundational playbook)
- decisions.md is now single source of truth for all locked rules

Remaining items (unchanged):
- assigned_to: hardcoded in new.tsx — needs backend dynamic endpoint
- country_codes: hardcoded — switch to react-phone-input-2
- Stripe write-back bug (Latha)
- scope.guard bypass (Latha)
- JWT rotation (Latha)

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

> Locked rules → see memory/decisions.md (single source of truth, dated and append-only).

---

*VEERABHADRA — DeAssists Master Brain | Updated: 25 April 2026 — Phase 1 COMPLETE*
