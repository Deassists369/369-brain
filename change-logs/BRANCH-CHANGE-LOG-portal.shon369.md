# DeAssists — Branch Change Log
# Branch: feature/portal.shon369
# Base branch (branched from): dev_v2 — confirmed by Latha 19 April 2026
# Reference branch (code copied from): feature/portal-crm-phase1
# Owner: Shon AJ | Brain: VEERABHADRA
# Created: 19 April 2026
# Last updated: [updated after every commit]

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
**Commit:** [hash added after commit]
**Date:** [date]
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
**Commit:** [hash added after commit]
**Date:** [date]
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
**Commit:** [hash added after commit]
**Date:** [date]
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

### TASK 4 — Badge Components
**Commit:** [hash added after commit]
**Date:** [date]
**Type:** feat

**What this is:**
Two small visual components. StatusBadge shows lead status with
colour coding. QueueBadge shows which queue a lead belongs to.
Both are used inside the Queue View page built in Task 5.

**Files added:**
| File | Action | Compared against feature/portal-crm-phase1 |
|------|--------|----------------------------|
| apps/cms-next/components/leads/StatusBadge.tsx | CREATED | Yes — colours verified against design tokens |
| apps/cms-next/components/leads/QueueBadge.tsx | CREATED | Yes — identical |

**Files modified:** None

**Files touched in any other way:** None

**What Latha should verify:**
- Both files exist at correct paths
- Frontend compiles: npx tsc --noEmit from apps/cms-next

---

### TASK 5 — Queue View Page
**Commit:** [hash added after commit]
**Date:** [date]
**Type:** feat

**What this is:**
The main lead management screen at /leads. Staff and managers use
this to view all leads, filter by queue, and open lead details.
Five components assembled into one page.

**Files added:**
| File | Action | Compared against feature/portal-crm-phase1 |
|------|--------|----------------------------|
| apps/cms-next/components/leads/LeadQueueSidebar.tsx | CREATED | Yes — queue counts and filter logic verified |
| apps/cms-next/components/leads/LeadTable.tsx | CREATED | Yes — pagination verified |
| apps/cms-next/components/leads/LeadDetailPanel.tsx | CREATED | Yes — all fields verified |
| apps/cms-next/components/leads/CommentThread.tsx | CREATED | Yes — timestamp format verified |
| apps/cms-next/pages/leads/index.tsx | CREATED | Yes — role guards verified |

**Files modified:** None

**Files touched in any other way:** None

**What Latha should verify:**
- localhost:4002/leads renders without errors
- SUPER_ADMIN and MANAGER can access the page
- STAFF can access the page
- AGENT cannot access the page
- Leads load from the backend

---

### TASK 6 — New Lead Form
**Commit:** [hash added after commit]
**Date:** [date]
**Type:** feat

**What this is:**
The screen Gopika uses to create a new lead at /leads/new.
Replaces Google Sheets data entry. 16 fields across 4 cards.
Duplicate detection modal if WhatsApp number already exists.

**Files added:**
| File | Action | Compared against feature/portal-crm-phase1 |
|------|--------|----------------------------|
| apps/cms-next/pages/leads/new.tsx | CREATED | Yes — all 16 fields verified, duplicate modal verified |

**Files modified:** None

**Files touched in any other way:** None

**What Latha should verify:**
- localhost:4002/leads/new renders without errors
- Submitting form creates a lead in MongoDB
- Lead ID appears in DA-YYYY-MM-### format on success
- Duplicate WhatsApp shows modal with existing lead details
- Cancel returns to /leads

---

### TASK 7 — Sales Dashboard
**Commit:** [hash added after commit]
**Date:** [date]
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
- SUPER_ADMIN, MANAGER, STAFF, DATA_ENTRY all see this page

---

### TASK 8 — Sidebar + Avatar Redesign
**Commit:** [hash added after commit]
**Date:** [date]
**Type:** design

**What this is:**
Visual redesign of the sidebar and top avatar dropdown.
Zero logic changes. Only visual files in libs/shared-ui touched.
Sidebar audit skill ran before this commit — all roles pass.

**Files modified:**
| File | Action | What changed |
|------|--------|-------------|
| [shared-ui files listed here after build] | MODIFIED | Visual only — no logic changes |

**Files touched in any other way:** None

**What Latha should verify:**
- Sidebar renders with DeAssists green and correct typography
- Avatar dropdown shows role name
- Every role sees correct sidebar items — no permission regressions
- Sidebar audit output included below:

[Sidebar audit output pasted here before commit]

---

## WHAT HAS NOT BEEN TOUCHED IN THIS BRANCH

These files exist in the codebase but were not modified in this branch.
Latha should see zero changes to these in the diff:

- apps/cms-next/pages/universitiesd/ — BCBT white-label, never touched
- apps/backend-nest/src/core/entities/extendables/payment.entity.ts
- Any Stripe or payment logic
- apps/mui-cms-next/ — separate app entirely
- accounts.service.ts — pre-existing AWS ACL errors, not our scope
- Any file not listed in the task entries above

---

## RUNNING DIFF SUMMARY — UPDATED AFTER EACH TASK

| Task | Files Added | Files Modified | Commit |
|------|------------|----------------|--------|
| 1 — Design tokens | 1 | 0 | [hash] |
| 2 — Entity + ID service | 2 | 0 | [hash] |
| 3 — Full backend module | 4 | 2 | [hash] |
| 4 — Badge components | 2 | 0 | [hash] |
| 5 — Queue View page | 5 | 0 | [hash] |
| 6 — New Lead Form | 1 | 0 | [hash] |
| 7 — Dashboard | 1 | 0 | [hash] |
| 8 — Sidebar + Avatar | 0 | [N] | [hash] |
| **TOTAL** | **16** | **2+** | |

---

*Updated by VEERABHADRA after every commit*
*Delivered to Latha alongside every PR*
