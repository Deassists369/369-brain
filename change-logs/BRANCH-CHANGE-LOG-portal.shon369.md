# DeAssists — Branch Change Log
# Branch: feature/portal.shon369
# Base branch (branched from): dev_v2 — confirmed by Latha 19 April 2026
# Reference branch (code copied from): feature/portal-crm-phase1
# Owner: Shon AJ | Brain: VEERABHADRA
# Created: 19 April 2026
# Last updated: 25 April 2026 — Phase 1 complete (commit b0d2fdc4)

---

## HOW THIS FILE WORKS

This file is updated after every single commit in this branch.
One task = one entry. Never combined. Never skipped.

When Latha reviews the PR — this file goes with it.
She sees exactly what changed, what was compared against, and what to verify.
No surprises in the diff. No guessing what we touched.

---

## BRANCH RULES — LATHA TO NOTE

- Base branch: dev_v2 (confirmed — this is what portal.shon369 was created from)
- Reference branch: feature/portal-crm-phase1 (this is where all migrated code was copied from)
- No new npm packages installed anywhere in this branch
- No file is in this branch unless it appears in this log
- Every migrated file was compared against feature/portal-crm-phase1 line by line before committing
- Every task was browser-verified before commit

---

## TASK LOG — ENTRIES ADDED AFTER EACH COMMIT

---

### TASK 1 — Design Tokens
**Commit:** f8a28f87
**Date:** 19 April 2026
**Type:** chore

**What this is:**
Central colour and design token file for the entire CRM frontend.
All colours, spacing values, and typography references used across
every CRM component come from this single file.
This must exist before any frontend component is committed.

**Files added:**
| File | Action | Compared against feature/portal-crm-phase1 |
|------|--------|----------------------------|
| apps/cms-next/styles/crmTokens.ts | CREATED | Yes — identical to working version |

**Files modified:** None

**Files touched in any other way:** None

**What Latha should verify:**
- File exists at apps/cms-next/styles/crmTokens.ts
- No compile errors: npx tsc --noEmit
- No other files changed in this commit

---

### TASK 2 — Backend Entity + ID Service
**Commit:** bee4c6b5
**Date:** 19 April 2026
**Type:** feat

**What this is:**
The MongoDB document structure for the Leads collection and the
automatic lead ID generator. These are pure backend files.
No frontend changes. No API endpoints yet.

**Files added:**
| File | Action | Compared against feature/portal-crm-phase1 |
|------|--------|----------------------------|
| apps/backend-nest/src/leads/entities/lead.entity.ts | CREATED | Yes — verified field by field |
| apps/backend-nest/src/leads/lead-id.service.ts | CREATED | Yes — identical to working version |

**Files modified:** None

**Files touched in any other way:** None

**What Latha should verify:**
- Both files exist at correct paths
- Backend compiles clean: pnpm nx build backend-nest
- 4 pre-existing AWS ACL errors in accounts.service.ts are expected — not introduced by this task

---

### TASK 3 — Backend Routing + Module + Controller + Service
**Commit:** 4e81cbe4
**Date:** 19 April 2026
**Type:** feat

**What this is:**
The complete NestJS leads module. Routing logic, all 8 API endpoints,
all 9 service methods. Also registers LeadsModule in app.module.ts
and adds Leads to the collections constants file.

**Files added:**
| File | Action | Compared against feature/portal-crm-phase1 |
|------|--------|----------------------------|
| apps/backend-nest/src/leads/leads-routing.service.ts | CREATED | Yes — 9 routing rules verified |
| apps/backend-nest/src/leads/leads.module.ts | CREATED | Yes — identical |
| apps/backend-nest/src/leads/leads.controller.ts | CREATED | Yes — static routes before dynamic verified |
| apps/backend-nest/src/leads/leads.service.ts | CREATED | Yes — all 9 methods verified |

**Files modified:**
| File | Action | What changed |
|------|--------|-------------|
| apps/backend-nest/src/app.module.ts | MODIFIED | LeadsModule added to imports array |
| libs/shared/constants/collections.ts | MODIFIED | CollectionNames.Leads added |

**Files touched in any other way:** None

**What Latha should verify:**
- Backend compiles: pnpm nx build backend-nest
- POST /v1/leads returns 201 with a lead ID in DA-YYYY-MM-### format
- GET /v1/leads returns paginated list
- 4 pre-existing AWS ACL errors remain — no new errors

---

### TASK 4+5+6 — Frontend Components + Queue View + New Lead Form
**Commit:** f1123638
**Date:** 19 April 2026
**Type:** feat

**What this is:**
All frontend lead components and pages in one commit per Latha's preference.
Badge components (StatusBadge, QueueBadge), full Queue View page at /leads
(5 components: sidebar, table, detail panel, comment thread, page index),
and the New Lead Form at /leads/new (Gopika's data entry screen).

**Files added:**
| File | Action | Compared against feature/portal-crm-phase1 |
|------|--------|----------------------------|
| apps/cms-next/components/leads/StatusBadge.tsx | CREATED | Yes — colours verified against design tokens |
| apps/cms-next/components/leads/QueueBadge.tsx | CREATED | Yes — identical |
| apps/cms-next/components/leads/LeadQueueSidebar.tsx | CREATED | Yes — queue counts and filter logic verified |
| apps/cms-next/components/leads/LeadTable.tsx | CREATED | Yes — pagination verified |
| apps/cms-next/components/leads/LeadDetailPanel.tsx | CREATED | Yes — all fields verified |
| apps/cms-next/components/leads/CommentThread.tsx | CREATED | Yes — timestamp format verified |
| apps/cms-next/pages/leads/index.tsx | CREATED | Yes — role guards verified |
| apps/cms-next/pages/leads/new.tsx | CREATED | Yes — all 16 fields verified, duplicate modal verified |

**Files modified:** None

**Files touched in any other way:** None

**What Latha should verify:**
- localhost:4002/leads renders without errors
- SUPER_ADMIN and MANAGER can access the page
- STAFF can access the page
- AGENT cannot access the page
- Leads load from the backend
- localhost:4002/leads/new renders without errors
- Submitting form creates a lead in MongoDB
- Lead ID appears in DA-YYYY-MM-### format on success
- Duplicate WhatsApp shows modal with existing lead details
- Cancel returns to /leads

---

### TASK 7 — Sales Dashboard
**Commit:** ebabbe9c
**Date:** 19 April 2026
**Type:** feat

**What this is:**
The home screen for all portal roles. Read-only stats overview.
Shows total active leads, leads by status, leads by queue.
Colour coded using locked semantic colour system.

**Files added:**
| File | Action | Compared against feature/portal-crm-phase1 |
|------|--------|----------------------------|
| apps/cms-next/pages/dashboard/index.tsx | CREATED | Yes — stats endpoint verified, colours verified |

**Files modified:** None

**Files touched in any other way:** None

**What Latha should verify:**
- localhost:4002/dashboard renders without errors
- Stats cards show numbers from backend
- SUPER_ADMIN, MANAGER, STAFF can all see this page

---

### TASK 8 — Call Center 369 + Sales CRM Sidebar Sections
**Commit:** de62cd72
**Date:** 19 April 2026
**Type:** feat

**What this is:**
Two new sections added to the sidebar menu for the CRM roles.
Call Center 369 — for lead management staff (LEAD_CRM role).
Sales CRM — for sales setup staff (SALES_SETUP role).
Both sections also visible to SUPER_ADMIN, ORG_ADMIN, and MANAGER.
Sidebar audit ran before this commit — all 7 checks passed.

**Files added:** None

**Files modified:**
| File | Action | What changed |
|------|--------|-------------|
| libs/shared/models/sidemenu.ts | MODIFIED | Call Center 369 and Sales CRM sections inserted at lines 21–65, after Dashboard, before Home |

**Files touched in any other way:** None

**Sidebar audit results (all 7 checks):**
- SUPER_ADMIN sees everything including Call Center 369 and Sales CRM ✅
- MANAGER sees Call Center 369 and Sales CRM ✅
- LEAD_CRM sees Call Center 369 only ✅
- SALES_SETUP sees Sales CRM only ✅
- STAFF does NOT see Call Center 369 or Sales CRM ✅
- AGENT does NOT see Call Center 369 or Sales CRM ✅
- No existing items broken ✅

**Known flag (not a blocker):**
Sales Dashboard child uses path /dashboard which won't match any MongoDB collection name
in the children filter for non-SUPER_ADMIN users. SUPER_ADMIN sees it correctly.
Decision needed before next session: change path to page-workinprogress?status=sales
or accept SUPER_ADMIN-only visibility until Sales Dashboard has its own collection-backed endpoint.

**What Latha should verify:**
- Sidebar shows Call Center 369 when logged in as MANAGER
- Sidebar shows Sales CRM when logged in as MANAGER
- STAFF and AGENT do not see either section
- All existing sidebar items still visible per their previous roles

---

### TASK 9 — Phase 1 Complete — Enums, UI Polish, Navigation Guard, Country Code
**Commit:** b0d2fdc4
**Date:** 25 April 2026
**Type:** fix

**What this is:**
Final Phase 1 cleanup and polish. Replaces all hardcoded string arrays with
enum imports from lead.constants.ts. Adds navigation guard to prevent data loss.
UI improvements to detail panel. Country code now required with +91 default.

**Files modified:**
| File | Action | What changed |
|------|--------|-------------|
| apps/backend-nest/src/leads/leads.service.ts | MODIFIED | Empty string enum validation fix |
| apps/cms-next/components/leads/LeadDetailPanel.tsx | MODIFIED | Header lightened (dk2), Save moved to header, unsaved changes modal for tabs, country code display |
| apps/cms-next/components/leads/LeadQueueSidebar.tsx | MODIFIED | "All Leads" option with total count |
| apps/cms-next/components/leads/LeadTable.tsx | MODIFIED | data?.data?.data fix for table display |
| apps/cms-next/pages/dashboard/index.tsx | MODIFIED | Enum imports (LeadStatus, LeadQueue) |
| apps/cms-next/pages/leads/index.tsx | MODIFIED | Navigation guard lifted to page level, unsaved changes modal |
| apps/cms-next/pages/leads/new.tsx | MODIFIED | Enum imports, country_code required with +91 default |
| libs/shared/constants/lead.constants.ts | MODIFIED | All enums + SidebarRole |

**Files added:** None

**Key patterns established:**
- Navigation guard: isDirty + guardedAction + pendingAction for all destructive navigations
- Enum import: Object.values(EnumName) for dropdown options
- Country code display: `${country_code} ${whatsapp}` format

**What Latha should verify:**
- All CRM pages load without errors at localhost:4002
- Queue sidebar shows "All Leads" with total count
- Clicking different queues and leads prompts unsaved changes if form is dirty
- New lead form has country code dropdown with +91 default
- Lead detail panel shows country code with WhatsApp number

---

## WHAT HAS NOT BEEN TOUCHED IN THIS BRANCH

These files exist in the codebase but were not modified in this branch.
Latha should see zero changes to these in the diff:

- apps/cms-next/pages/universitiesd/ — BCBT white-label, never touched
- apps/backend-nest/src/core/entities/extendables/payment.entity.ts
- Any Stripe or payment logic
- apps/mui-cms-next/ — separate app entirely
- Any file not listed in the task entries above

Note: accounts.service.ts has 4 pre-existing AWS ACL errors that were there before this branch.
These are Latha's scope to fix. They are not in this branch's diff.

---

## RUNNING DIFF SUMMARY

| Task | Files Added | Files Modified | Commit |
|------|------------|----------------|--------|
| 1 — Design tokens | 1 | 0 | f8a28f87 |
| 2 — Entity + ID service | 2 | 0 | bee4c6b5 |
| 3 — Full backend module | 4 | 2 | 4e81cbe4 |
| 4+5+6 — Frontend components + pages | 8 | 0 | f1123638 |
| 7 — Dashboard | 1 | 0 | ebabbe9c |
| 8 — Sidebar (Call Center 369 + Sales CRM) | 0 | 1 | de62cd72 |
| 9 — Phase 1 Complete | 0 | 8 | b0d2fdc4 |
| **TOTAL** | **16** | **11** | |

---

*Updated by VEERABHADRA — 25 April 2026*
*Phase 1 CRM complete and pushed — ready for Latha merge*
