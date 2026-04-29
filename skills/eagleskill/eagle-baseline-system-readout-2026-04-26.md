# EAGLE BASELINE SYSTEM READOUT
# DeAssists Portal + CRM — Comprehensive Mode 0 Analysis
# Date: 26 April 2026
# Branch: feature/portal.shon369
# EAGLE Version: 2.0

---

## EXECUTIVE SUMMARY

This is the foundational baseline for EAGLE operations. All Mode 1-3 work references this document.

**Codebase health:** OPERATIONAL — CRM Phase 1 complete, Phase 2 ready
**Prototype status:** DOES NOT EXIST — production is source of truth
**Risk level:** MEDIUM — 4 pre-existing blockers, no new critical issues
**Recommendation:** Proceed with Phase 2 (Q Intelligence) after this baseline is reviewed

---

## SECTION 1: REPOSITORY STRUCTURE

### Portal Repository: ~/deassists/

```
apps/
├── backend-nest/           NestJS API — port 8000 (179 TypeScript files)
├── cms-next/               Staff portal — port 4002 (209 TSX files)
├── website-next/           Public site — port 4001
└── mui-cms-next/           SEPARATE app — NEVER TOUCH for portal work

libs/
├── shared/                 Enums, constants, helpers, interfaces
│   ├── constants/          user.types.ts, collections.ts, lead.constants.ts
│   ├── functions/          permission.helper.ts (MAXIMUM RISK)
│   ├── models/             sidemenu.ts (MEDIUM RISK)
│   └── interfaces/         All shared interfaces
└── shared-ui/              UI components, layouts, sidebar renderer (PRIMARY for portal work)
```

### Brain Repository: ~/deassists-workspace/369-brain/

```
memory/                     Session state, activity log, decisions
change-logs/                Branch change logs (one per branch)
skills/                     EAGLESKILL and other skills
code-snapshot/              Reference code from retired branches
graphify-out/               Knowledge graph output (never commit)
```

### Critical Files Count

| Location | Files | Purpose |
|----------|-------|---------|
| apps/backend-nest/src | 179 | NestJS API |
| apps/cms-next (TSX) | 209 | CMS frontend |
| libs/shared | ~40 | Shared code |
| libs/shared-ui | ~30 | UI components |

---

## SECTION 2: ROLE AND PERMISSION SYSTEM

### User Types (10 total)

```typescript
enum UserTypes {
  SUPER_ADMIN = 'super_admin',      // Shon, Latha — everything
  ORG_OWNER = 'organization_owner', // External org owners
  ORG_ADMIN = 'organization_admin', // External org admins
  MANAGER = 'manager',              // Don, Sruthi, Santosh
  TEAM_LEAD = 'team_lead',          // Anandhu, Midhun, Stalin, Gopika
  STAFF = 'staff',                  // Internal staff
  AGENT = 'agent',                  // External sub-agents ONLY — zero portal access
  ORG_AGENT = 'organization_agent', // Org-level agents
  USER = 'user',                    // Students/public
  ALL = 'all',                      // Special marker
}
```

**LOCKED DECISIONS:**
- LEAD_CRM and SALES_SETUP removed as UserTypes (24 April 2026)
- Call Center and Sales Setup are now DATABASE ROLES, not Types
- AGENT = external sub-agents only — zero internal portal access ever
- TEAM_LEAD = DeAssists call center team (Gopika, Anandhu, Midhun, Stalin)

### Sidebar Role System

```typescript
enum SidebarRole {
  CallCenter = 'Call Center',
  SalesSetup = 'Sales Setup',
}
```

**How it works:**
1. User has a Type (e.g., TEAM_LEAD)
2. User can be assigned database Roles (e.g., "Call Center")
3. Sidebar items have `permissionLevel` (Type array) AND/OR `requiredRole` (Role name)
4. Item visible if Type matches OR Role matches

### Three-Layer Access Model (Rule 27)

Every CRM page has THREE separate access layers:

| Layer | File | What it controls |
|-------|------|------------------|
| 1. Sidebar visibility | sidemenu.ts + permission.helper.ts | Who sees the menu item |
| 2. Page guard | ALLOWED_ROLES array in page file | Who can visit the URL |
| 3. Data permission | useCustomQuery + database roles | Who can fetch the data |

**CRITICAL:** All three must be tested for every feature.

---

## SECTION 3: PERMISSION HELPER — MAXIMUM RISK

File: `libs/shared/functions/permission.helper.ts`

### Function: exclusivePermission()

This is the sidebar filter function. It runs on every page load for every user.

**Risk level:** MAXIMUM — Community 6 in graph, coupled to AccountsController (63 edges)

### Critical Rules (from CLAUDE.md)

1. **Clone Filter Rule:**
   ```typescript
   // CORRECT — filter the CLONE
   newItem.children = newItem.children?.filter((child: any) => { ... });
   
   // WRONG — mutates the ORIGINAL (causes stale sidebar on role switch)
   newItem.children = x.children?.filter((child: any) => { ... });
   ```

2. **Grandchildren Filter Position:**
   - MUST be INSIDE the isPermitted block
   - If placed BEFORE: every role sees every menu item (silent production failure)

3. **Module-level state fix (BUG 4):**
   - `hasCourseListPermission` and `hasEverBeenRestricted` now declared INSIDE function
   - Previously at module level — caused concurrent user corruption

### Current Logic Flow

```
exclusivePermission(data, user, referredUser, agentUser)
├── Calculate hasCourseListPermission based on referredUser/agentUser roles
├── Calculate shouldRestrictCourses for USER type
├── For each menu item:
│   ├── Deep clone item (_.cloneDeep)
│   ├── Filter "Programs & Courses" if restricted
│   ├── If has children and NOT SUPER_ADMIN:
│   │   └── Filter children by permissionLevel + collection match
│   ├── Check typePermitted (permissionLevel includes user.type)
│   ├── Check rolePermitted (user.roles includes requiredRole)
│   └── Return item if permitted, else null
└── Remove nulls, strip permissionLevel from output
```

---

## SECTION 4: SIDEBAR MENU STRUCTURE

File: `libs/shared/models/sidemenu.ts`

### Current Structure (as of 26 April 2026)

```
Dashboard                  [SUPER_ADMIN, STAFF, MANAGER, TEAM_LEAD, ORG_*, AGENT]
Call Center 369            [SUPER_ADMIN, ORG_ADMIN, MANAGER] + requiredRole: CallCenter
├── Sales Dashboard        (path: /dashboard)
├── All Leads              (path: /leads)
└── + Add Lead             (path: /leads/new)
Sales CRM                  [SUPER_ADMIN, ORG_ADMIN, MANAGER] + requiredRole: SalesSetup
└── Sales Setup            (path: /page-workinprogress?status=salessetup)
Home                       [USER only]
Services                   [SUPER_ADMIN, MANAGER, ORG_ADMIN, ORG_OWNER]
├── Apartments, Ausbildungs, APS, BlockedAccounts, Courses, etc.
Services (Agent view)      [AGENT, ORG_AGENT] — /service/* paths
Service Setup              [SUPER_ADMIN, MANAGER, ORG_ADMIN, ORG_OWNER]
Email Setup                [SUPER_ADMIN, MANAGER, ORG_ADMIN, ORG_OWNER]
Applications               [SUPER_ADMIN, STAFF, MANAGER, TEAM_LEAD, ORG_*, AGENT]
Programs & Courses         [USER only] — restricted by hasCourseListPermission
Our Services               [USER only]
My Applications            [USER only]
My Documents               [USER only]
Payments                   [SUPER_ADMIN only]
Organizations              [SUPER_ADMIN only]
Manage User Accounts       [SUPER_ADMIN, ORG_*, AGENT, MANAGER, TEAM_LEAD]
Auth & Permissions         [SUPER_ADMIN only]
Partners                   [SUPER_ADMIN only]
Settings                   [All except USER]
```

### Known Issue: Sales Dashboard Path

The Sales Dashboard child uses path `/dashboard` which doesn't match any MongoDB collection.
For non-SUPER_ADMIN users, Gate 2 (collection match) fails.
**Status:** Accepted — SUPER_ADMIN sees it, others use /page-workinprogress for now.

---

## SECTION 5: CRM MODULE ANALYSIS

### Lead Entity

File: `apps/backend-nest/src/leads/entities/lead.entity.ts`

**26 fields total:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| lead_id | string | yes | Auto-generated: DA-YYYY-MM-### |
| date | Date | yes | Auto-set by backend |
| source | enum | no | Partner, Portal, WhatsApp, Instagram, Phone, Other |
| source_detail | string | no | Free text |
| agent_name | string | no | CRM agent who entered |
| full_name | string | yes | |
| place | string | no | |
| country_code | string | no | Default +91 in frontend |
| whatsapp | string | yes | Unique per active lead |
| email | string | no | |
| service | enum | no | 15 options including Private/Public University |
| assigned_to | enum | no | **EMPTY** — needs 37 agent names |
| university_interest | string | no | Text only — no routing impact |
| intake | string | no | |
| comments | array | no | { text, author, timestamp }[] |
| status | enum | no | New, Follow Up, Called 1-3, Converted, Lost |
| queue | enum | no | 369_MAIN, BCBT, ACCOMMODATION, UNROUTED |
| is_archived | boolean | no | default false |
| call_attempts | number | no | Q Intelligence — default 0 |
| last_called_at | Date | no | Q Intelligence |
| last_outcome | enum | no | no_answer, interested, not_now, wrong_lead, converted, lost |
| callback_at | Date | no | Q Intelligence |
| callback_note | string | no | Q Intelligence |

### Lead Constants

File: `libs/shared/constants/lead.constants.ts`

```typescript
enum LeadStatus { New, FollowUp, Called1, Called2, Called3, Converted, Lost }
enum LeadQueue { Main = '369_MAIN', BCBT, Accommodation, Unrouted }
enum LeadSource { Partner, Portal, WhatsApp, Instagram, Phone, Other }
enum LeadService { PrivateUniversity, PublicUniversity, Accommodation, ... (15 total) }
enum CallOutcome { NoAnswer, Interested, NotNow, WrongLead, Converted, Lost }
enum SidebarRole { CallCenter, SalesSetup }
```

### API Endpoints

File: `apps/backend-nest/src/leads/leads.controller.ts`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| GET | /v1/leads/queues | SA, OA, M, S, TL | Queue counts |
| GET | /v1/leads/stats | SA, OA, M, S, TL, A | Dashboard stats |
| GET | /v1/leads/export | SA, OA, M, S, TL | CSV export |
| POST | /v1/leads | SA, OA, M, S, TL | Create lead |
| GET | /v1/leads | SA, OA, M, S, TL | List leads |
| GET | /v1/leads/:id | SA, OA, M, S, TL | Get one lead |
| PUT | /v1/leads/:id | SA, OA, M, S, TL | Update lead |
| POST | /v1/leads/:id/comments | SA, OA, M, S, TL | Add comment |
| POST | /v1/leads/:id/call-log | SA, OA, M, S, TL, A | Log call (Q Intelligence) |
| POST | /v1/leads/:id/convert | SA, OA, M, S, TL | Convert lead |

**Note:** Static routes (queues, stats, export) are correctly registered BEFORE dynamic :id routes.

### Leads Service Logic

File: `apps/backend-nest/src/leads/leads.service.ts`

**Key behaviors:**
- `create()`: Checks for duplicate WhatsApp, auto-generates lead_id and date, routes to queue, handles initial_comment
- `update()`: Strips empty strings, re-routes if routing fields change
- `logCall()`: Increments call_attempts, sets last_called_at, auto-updates status based on outcome
- `convert()`: Sets status to Converted, archives the lead
- Uses `LeadQueue` and `LeadStatus` enums from lead.constants.ts ✅

---

## SECTION 6: DESIGN SYSTEM

File: `apps/cms-next/styles/crmTokens.ts`

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| g | #1D7A45 | Primary green |
| gd | #0d3d22 | Dark green |
| gl | #2a9458 | Green hover |
| gx | #e8f5ee | Green backgrounds |
| dk | #0d1a10 | Panel headers (darkest) |
| dk2 | #1a3d26 | Panel headers (lighter) |
| am | #c47b00 | Amber (attention) |
| cr | #F6F7F4 | Cream background |
| wh | #ffffff | White |
| t1 | #1a1a1a | Primary text |
| t3 | #888888 | Tertiary text |
| bd | #e5e5e0 | Borders |
| red | #c62828 | Destructive actions only |

### Typography

- Display: Fraunces serif, 700 weight
- Body: Outfit sans-serif, 400/600 weight
- Labels always ABOVE fields

### Semantic Color Language (LOCKED 16 April 2026)

- Green (#1D7A45) = positive, active, total counts, constructive actions
- Amber (#c47b00) = needs attention, open items, warnings
- Grey (#888888) = done, quiet, closed, inactive
- Red (#c62828) = destructive actions ONLY (Sign Out, Delete, Remove)

---

## SECTION 7: GOD NODES AND RISK REGISTRY

From graphify analysis (22 April 2026):

### MAXIMUM RISK (Latha must be present)

| File | Edges | Community | Risk |
|------|-------|-----------|------|
| AccountsController | 63 | 6 | Most connected file |
| AccountsService | 57 | 6 | Core auth system |
| permission.helper.ts | - | 6 | Coupled to AccountsController |

### HIGH RISK (test all frontend after changing)

| File | Edges | Risk |
|------|-------|------|
| leads.controller.ts | 54 | API contract changes break useCustomQuery |

### MEDIUM RISK (sidebar audit mandatory)

| File | Risk |
|------|------|
| sidemenu.ts | Role changes affect every page |
| user.types.ts | Type changes affect permissions |

### LOW RISK (build freely)

| File | Community | Notes |
|------|-----------|-------|
| lead.entity.ts | 363 | Fully isolated |
| leads.service.ts | 362 | Near zero connections |
| leads.module.ts | 362 | Fully isolated |

### ZERO RISK (new files)

| File | Notes |
|------|-------|
| lead.constants.ts | New file, no existing connections |
| Any new component not yet imported | Safe |

---

## SECTION 8: HARDCODING VIOLATIONS AUDIT

### Checked Files — NO VIOLATIONS FOUND

| File | Status |
|------|--------|
| leads/index.tsx | Uses LeadQueue from constants ✅ |
| dashboard/index.tsx | Uses LeadStatus, LeadQueue from constants ✅ |
| leads/new.tsx | Uses LeadSource, LeadService from constants ✅ |
| leads.service.ts | Imports LeadQueue, LeadStatus from constants ✅ |
| crmTokens.ts | Central token file ✅ |

### Pre-existing Hardcoding (outside CRM scope)

| Location | Issue | Owner |
|----------|-------|-------|
| Various components | MUI color values | Out of scope |
| sidemenu.ts | Collection path strings | Intentional (uses CollectionNames enum) |

---

## SECTION 9: PROTOTYPE VS PRODUCTION DISCREPANCIES

### Prototype Status

**PROTOTYPE DOES NOT EXIST**

Path checked: `~/deassists-workspace/369-brain/prototypes/deassists-platform.html`
Result: Directory does not exist

**Decision:** Production is the sole source of truth until prototype is created.

### Action Required

VEERABHADRA must create the prototype HTML file at:
`~/deassists-workspace/369-brain/prototypes/deassists-platform.html`

Until then, EAGLE operates in production-only mode.
All Mode 1 gap reports will compare against production code, not prototype.

---

## SECTION 10: PENDING BLOCKERS

| # | Issue | Owner | Priority | Status |
|---|-------|-------|----------|--------|
| 1 | assigned_to enum EMPTY | Shon | HIGH | Run =UNIQUE(K2:K9999) on Sheets |
| 2 | 4 AWS ACL errors in accounts.service.ts | Latha | MEDIUM | Pre-existing, not CRM scope |
| 3 | Stripe write-back bug | Latha | HIGH | Payment status not saved |
| 4 | Security guard bypass scope.guard.ts L79 | Latha | HIGH | Fix before production |
| 5 | JWT secrets rotation | Latha | CRITICAL | Exposed in Git history |

---

## SECTION 11: PHASE 1 COMPLETION STATUS

### Completed (25 April 2026)

| Task | Commit | Files |
|------|--------|-------|
| Design tokens | f8a28f87 | 1 |
| Entity + ID service | bee4c6b5 | 2 |
| Backend module | 4e81cbe4 | 6 |
| Frontend components | f1123638 | 8 |
| Dashboard | ebabbe9c | 1 |
| Sidebar sections | de62cd72 | 1 |
| Phase 1 polish | b0d2fdc4 | 8 |

**Total:** 16 new files, 11 modified files

### Waiting For

- Latha merge: feature/portal.shon369 → dev_v2
- Kingston QA on qa.deassists.com

---

## SECTION 12: PHASE 2 READY (Q Intelligence)

### Scope

Build CallLogModal + update LeadDetailPanel to use existing backend endpoint.

**Backend:** POST /leads/:id/call-log — ALREADY EXISTS ✅
**Frontend:** 2 files only:
1. CallLogModal.tsx (new)
2. LeadDetailPanel.tsx (modify — add Log Call button + call summary)

### Risk Assessment

- Risk level: LOW
- Files touched: 2
- Backend changes: NONE
- Permission changes: NONE
- Add-only compliant: YES

---

## SECTION 13: NEVER-TOUCH FILES

These files must NEVER be modified by EAGLE:

```
apps/cms-next/pages/universitiesd/              BCBT white-label
apps/backend-nest/src/core/entities/extendables/payment.entity.ts
apps/mui-cms-next/                               Separate app
MASTER-RUN.cjs                                   Google Sheets script (live)
Any Stripe/payment logic
scope.guard.ts                                   Security guard (blocker)
package.json / pnpm-lock.yaml                    Without Latha approval
Any file containing JWT secrets or credentials
Any file under .superpowers/ .cursor/ .compound-engineering/
```

---

## SECTION 14: VERIFICATION COMMANDS

```bash
# Check TypeScript compilation
cd ~/deassists && npm run build:all

# Backend only
pnpm nx build backend-nest

# Frontend only
pnpm nx build cms-next

# Check git status
git status --short

# Check recent commits
git log --oneline -10
```

---

## APPENDIX A: FILE INVENTORY (Key Files)

### Backend

```
apps/backend-nest/src/
├── leads/
│   ├── entities/lead.entity.ts       26 fields
│   ├── lead-id.service.ts            Auto-generates DA-YYYY-MM-###
│   ├── leads-routing.service.ts      9 routing rules
│   ├── leads.controller.ts           10 endpoints
│   ├── leads.service.ts              11 methods
│   └── leads.module.ts               Module config
├── modules/accounts-module/
│   ├── accounts.controller.ts        39KB — GOD NODE
│   ├── accounts.service.ts           69KB — GOD NODE
│   └── Accounts.Helper.ts            102KB
├── guards/
│   ├── auth.guard.ts
│   ├── roles/roles.guard.ts
│   └── scope.guard.ts                BLOCKER at L79
└── main.ts
```

### Frontend

```
apps/cms-next/
├── pages/
│   ├── leads/
│   │   ├── index.tsx                 Queue view + navigation guard
│   │   └── new.tsx                   New lead form
│   └── dashboard/index.tsx           Stats dashboard
├── components/leads/
│   ├── LeadTable.tsx                 Data table
│   ├── LeadDetailPanel.tsx           Detail panel with tabs
│   ├── LeadQueueSidebar.tsx          Queue sidebar
│   ├── CommentThread.tsx             Comments display
│   ├── StatusBadge.tsx               Status pill
│   └── QueueBadge.tsx                Queue pill
└── styles/crmTokens.ts               Design tokens
```

### Shared

```
libs/shared/
├── constants/
│   ├── user.types.ts                 10 UserTypes
│   ├── collections.ts                All MongoDB collections
│   └── lead.constants.ts             All CRM enums
├── functions/
│   └── permission.helper.ts          MAXIMUM RISK
└── models/
    └── sidemenu.ts                   Sidebar config
```

---

## APPENDIX B: GRAPH METRICS

From graphify (25 April 2026):

| Metric | Value |
|--------|-------|
| Files indexed | 1772 |
| Nodes | 3998 |
| Edges | 3849 |
| Communities | ~1400 |

---

*EAGLE BASELINE SYSTEM READOUT*
*Created: 26 April 2026*
*Mode 0 Complete*
*Production is source of truth until prototype exists*
