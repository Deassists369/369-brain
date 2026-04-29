# EAGLE BASELINE SYSTEM READOUT
# DeAssists Portal — Comprehensive Mode 0 Analysis
# Date: 29 April 2026
# Branch: feature/portal.shon369
# EAGLE Version: 2.1

---

## EXECUTIVE SUMMARY

This is the foundational baseline for EAGLE v2.1 operations. All Mode 1-4 work references this document.

**Codebase health:** OPERATIONAL — CRM Phase 1 complete, QA fixes merged
**Prototype status:** EXISTS — 5,659 lines at `prototypes/deassists-platform.html`
**Risk level:** MEDIUM — 5 pre-existing blockers (unchanged from prior baseline)
**Last commit:** 5c04ec56 — cleanup: remove unused getCookie import

---

## SECTION 1: API ARCHITECTURE PATTERN MAP

### a) API Client Location

**File:** `libs/shared/config/axios-client.ts`

**Base URL resolution:**
```typescript
const configuration = config();
const baseUrl = `${configuration.apiBaseUrl}/${configuration.apiPathPrefix}`;
```

Environment-specific via `config/index.ts` — resolves differently for local/QA/prod.

### b) Available Hooks

**File:** `libs/react-query/queries/leads.ts`

| Hook | Method | Endpoint | Core Hook Used |
|------|--------|----------|----------------|
| useLeadsList | GET | /v1/leads | useCustomQuery |
| useLeadDetails | GET | /v1/leads/:id | useCustomQuery |
| useLeadQueues | GET | /v1/leads/queues | useCustomQuery |
| useLeadStats | GET | /v1/leads/stats | useCustomQueryV2 |
| useCreateLead | POST | /v1/leads | useCustomMutationV2 |
| useUpdateLead | PUT | /v1/leads/:id | useCustomMutationV2 |
| useAddLeadComment | POST | /v1/leads/:id/comments | useCustomMutationV2 |

**GAP IDENTIFIED:** `useLogCall` hook does NOT exist. Backend endpoint exists at POST /v1/leads/:id/call-log but frontend hook is missing.

**Other query files:**
- `libs/react-query/queries/account.ts` — auth-related
- `libs/react-query/queries/model.ts` — generic CRUD

### c) Auth Handling

**How tokens attach to requests:**
```typescript
// axios-client.ts lines 72-78
const token = getCookie('token');
if (token) {
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
```

**Auto-refresh on 401:**
```typescript
// axios-client.ts lines 86-98
if (error?.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  const newToken = await refreshAccessToken();
  // ... retry with new token
}
```

Components NEVER handle auth tokens. The axios client does it automatically.

### d) Reusable Fetchers

**Core hooks in `libs/react-query/src/index.ts`:**

| Hook | Use For | Data Access |
|------|---------|-------------|
| useCustomQueryV2 | GET — new code | `data` directly |
| useCustomQuery | GET — legacy code | `data?.data?.data` |
| useCustomMutationV2 | POST / PUT | `{ mutate, isLoading }` |
| useCustomDelete | DELETE | `{ mutate, isLoading }` |

**Rule:** Prefer useCustomQueryV2 for all new code.

### e) Traced Example: Lead Stats Dashboard

**User action:** Dashboard page loads

**Flow:**
1. `apps/cms-next/pages/dashboard/index.tsx` renders
2. Component calls `useLeadStats()` hook
3. Hook (in `libs/react-query/queries/leads.ts`) calls `useCustomQueryV2`
4. Core hook uses `axiosClient` from `libs/shared/config/axios-client.ts`
5. axios-client attaches JWT from `getCookie('token')`
6. Request: GET `/v1/leads/stats`
7. Backend: `leads.controller.ts` → `leads.service.ts` → MongoDB
8. Response flows back through same chain
9. Data available as `data` (useCustomQueryV2 pattern)

### f) Environment Configuration

**Endpoints enum:** `libs/shared/constants/endpoints.enum.ts`
```typescript
export enum Endpoints {
  ACCOUNTS = '/users/v1',
  PAYMENT = 'v1/stripe',
  MODEL = 'v1/model',
  METATAGS = 'v1/metatags',
  PARTNERS = 'v1/partners',
  REVIEW_RATINGS = 'v1/review-ratings',
  NOTIFICATIONS = 'v1/notifications',
  LEADS = '/v1/leads',
}
```

**Environments:**
- Local dev: localhost:4002 → localhost:8000
- QA: qa-portal.deassists.com
- Prod: portal.deassists.com (via develop branch)

---

## SECTION 2: REPOSITORY STRUCTURE

### Production Repository: ~/deassists/

```
apps/
├── backend-nest/           NestJS API — port 8000
├── cms-next/               Staff portal — port 4002 (PRIMARY)
├── website-next/           Public site — port 4001
└── mui-cms-next/           SEPARATE app — NEVER TOUCH

libs/
├── shared/
│   ├── constants/          user.types.ts, collections.ts, lead.constants.ts, endpoints.enum.ts
│   ├── functions/          permission.helper.ts (MAXIMUM RISK)
│   ├── models/             sidemenu.ts (MEDIUM RISK)
│   ├── config/             axios-client.ts (auth handling)
│   └── interfaces/         All shared interfaces
├── shared-ui/              UI components, layouts, sidebar renderer
└── react-query/
    ├── queries/            Named hook files per module
    └── src/index.ts        Core hooks: useCustomQueryV2, useCustomMutationV2
```

### Brain Repository: ~/deassists-workspace/369-brain/

```
memory/                     Session state, activity log, decisions
patterns/                   api-patterns, permission-patterns, git-workflow
project/                    architecture, never-touch, design-system
skills/eagleskill/          EAGLE skill and outputs
prototypes/                 deassists-platform.html (5,659 lines)
change-logs/                Branch change logs
```

---

## SECTION 3: ROLE AND PERMISSION SYSTEM

### User Types (10 total)

**File:** `libs/shared/constants/user.types.ts`

```typescript
enum UserTypes {
  SUPER_ADMIN = 'super_admin',      // Shon, Latha — everything
  ORG_OWNER = 'organization_owner', // External org owners
  ORG_ADMIN = 'organization_admin', // External org admins
  MANAGER = 'manager',              // Don, Sruthi, Santosh
  TEAM_LEAD = 'team_lead',          // Anandhu, Midhun, Stalin, Gopika
  STAFF = 'staff',                  // Internal staff
  AGENT = 'agent',                  // External sub-agents — ZERO portal access
  ORG_AGENT = 'organization_agent', // Org-level agents
  USER = 'user',                    // Students/public
  ALL = 'all',                      // Special marker
}
```

### Sidebar Roles

**File:** `libs/shared/constants/lead.constants.ts`

```typescript
enum SidebarRole {
  CallCenter = 'Call Center',
  SalesSetup = 'Sales Setup',
}
```

### Three-Layer Access Model (Rule 27)

| Layer | File | Controls |
|-------|------|----------|
| 1. Sidebar visibility | sidemenu.ts + permission.helper.ts | Who sees menu item |
| 2. Page guard | ALLOWED_ROLES in page file | Who can visit URL |
| 3. Data permission | useCustomQuery + DB roles | Who can fetch data |

**ALL THREE must be tested for every feature.**

---

## SECTION 4: CRM MODULE ANALYSIS

### Lead Entity Fields (26 total)

**File:** `apps/backend-nest/src/leads/entities/lead.entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| lead_id | string | Auto: DA-YYYY-MM-### |
| date | Date | Auto-set |
| source | enum | Partner, Portal, WhatsApp, Instagram, Phone, Other |
| source_detail | string | Free text |
| agent_name | string | CRM agent who entered |
| full_name | string | Required |
| place | string | |
| country_code | string | Default +91 |
| whatsapp | string | Required, unique per active lead |
| email | string | |
| service | enum | 15 options |
| assigned_to | enum | **EMPTY — needs 37 agent names** |
| university_interest | string | |
| intake | string | |
| comments | array | `{ text, author, timestamp }[]` |
| status | enum | New, Follow Up, Called 1-3, Converted, Lost |
| queue | enum | 369_MAIN, BCBT, ACCOMMODATION, UNROUTED |
| is_archived | boolean | default false |
| call_attempts | number | Q Intelligence field |
| last_called_at | Date | Q Intelligence field |
| last_outcome | enum | Q Intelligence field |
| callback_at | Date | Q Intelligence field |
| callback_note | string | Q Intelligence field |

### Lead Constants

**File:** `libs/shared/constants/lead.constants.ts`

```typescript
enum LeadStatus { New, FollowUp, Called1, Called2, Called3, Converted, Lost }
enum LeadQueue { Main = '369_MAIN', BCBT, Accommodation, Unrouted }
enum LeadSource { Partner, Portal, WhatsApp, Instagram, Phone, Other }
enum LeadService { PrivateUniversity, PublicUniversity, Accommodation, ... (15 total) }
enum CallOutcome { NoAnswer, Interested, NotNow, WrongLead, Converted, Lost }
enum SidebarRole { CallCenter, SalesSetup }
```

### Backend logCall() State Machine

**File:** `apps/backend-nest/src/leads/leads.service.ts` (lines 219-265)

```typescript
async logCall(id, body: { outcome, callback_at?, callback_note? }) {
  lead.call_attempts = (lead.call_attempts || 0) + 1;
  lead.last_called_at = new Date();
  lead.last_outcome = body.outcome;
  
  // Auto-update status based on outcome:
  switch (body.outcome) {
    case 'no_answer':
      // Called 1 → Called 2 → Called 3 based on attempts
    case 'interested':
    case 'not_now':
      lead.status = 'Follow Up';
    case 'converted':
      lead.status = 'Converted'; lead.is_archived = true;
    case 'lost':
      lead.status = 'Lost'; lead.is_archived = true;
    case 'wrong_lead':
      // Keep status, just log it
  }
}
```

---

## SECTION 5: DESIGN SYSTEM

**File:** `apps/cms-next/styles/crmTokens.ts`

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| g | #1D7A45 | Primary green |
| gl | #2a9458 | Green hover |
| gx | #e8f5ee | Green backgrounds |
| dk | #0d1a10 | Panel headers (darkest) |
| dk2 | #1a3d26 | Panel headers (lighter) |
| am | #c47b00 | Amber (attention) |
| cr | #F6F7F4 | Cream background |
| wh | #ffffff | White |
| t1-t4 | various | Text hierarchy |
| bd | #e5e5e0 | Borders |
| red | #c62828 | Destructive actions only |

### Semantic Color Language (LOCKED 16 April 2026)

- **Green** = positive, active, total counts, constructive
- **Amber** = needs attention, open items, warnings
- **Grey** = done, quiet, closed, inactive
- **Red** = destructive actions ONLY (Sign Out, Delete, Remove)

---

## SECTION 6: PROTOTYPE ANALYSIS

**File:** `~/deassists-workspace/369-brain/prototypes/deassists-platform.html`
**Size:** 5,659 lines, 361KB

### CSS Variables Match

Prototype uses same token naming:
- `--g:#1D7A45` matches `crmTokens.g`
- `--gl:#27964F` slightly differs from `crmTokens.gl` (#2a9458)
- `--gx:#EAF5EE` matches `crmTokens.gx`
- `--cr:#F6F7F4` matches `crmTokens.cr`

**MINOR DISCREPANCY:** Prototype `--gl` is #27964F, production crmTokens.gl is #2a9458. Both are valid green hovers — not a blocker.

### Components Present in Prototype

Based on initial scan (lines 1-100):
- Service catalog grid
- Breadcrumb navigation
- Service-scoped tab strip
- Scope pill for tenant indicators
- Card patterns with hover states

---

## SECTION 7: SIDEBAR STRUCTURE

**File:** `libs/shared/models/sidemenu.ts`

```
Dashboard                  [SA, STAFF, M, TL, ORG_*, AGENT]
Call Center 369            [SA, OA, M] + requiredRole: CallCenter
├── Sales Dashboard        (path: /dashboard)
├── All Leads              (path: /leads)
└── + Add Lead             (path: /leads/new)
Sales CRM                  [SA, OA, M] + requiredRole: SalesSetup
└── Sales Setup            (path: /page-workinprogress?status=salessetup)
Home                       [USER only]
Services                   [SA, M, OA, ORG_OWNER]
├── Apartments, Ausbildungs, APS, BlockedAccounts, etc.
...
```

---

## SECTION 8: HARDCODING AUDIT

### No New Violations Found

| File | Status |
|------|--------|
| leads/index.tsx | Uses LeadQueue from constants ✅ |
| dashboard/index.tsx | Uses LeadStatus, LeadQueue from constants ✅ |
| leads/new.tsx | Uses LeadSource, LeadService from constants ✅ |
| leads.service.ts | Imports LeadQueue, LeadStatus from constants ✅ |
| crmTokens.ts | Central token file ✅ |

---

## SECTION 9: PENDING BLOCKERS (PRE-EXISTING)

| # | Issue | Owner | Priority | Status |
|---|-------|-------|----------|--------|
| 1 | JWT secrets must be rotated | Latha | CRITICAL | Exposed in Git history |
| 2 | 4 AWS ACL errors in accounts.service.ts | Latha | MEDIUM | Pre-existing |
| 3 | Stripe write-back bug | Latha | HIGH | Payment status not saved |
| 4 | Security guard bypass scope.guard.ts L79 | Latha | HIGH | Fix before production |
| 5 | assigned_to enum EMPTY | Shon | HIGH | Needs 37 agent names from Sheets |

**EAGLE does NOT fix these.** They go through normal workflow.

---

## SECTION 10: LOCKED DECISIONS CROSS-REFERENCE

Key decisions affecting EAGLE work:

| Date | Decision | Impact |
|------|----------|--------|
| 27 Apr | API Pattern Discipline locked | All new code must use 4-layer chain |
| 25 Apr | Constants file is hard gate | Enums must exist before code references them |
| 25 Apr | npm run build:all mandatory | Before every commit |
| 24 Apr | TEAM_LEAD is call center Type | Anandhu, Midhun, Stalin, Gopika |
| 21 Apr | SidebarRole enum in lead.constants.ts | No magic strings |
| 29 Apr | EAGLE 5 modes | Baseline / Reconcile / Spec / Execute / Postmortem |
| 29 Apr | One prototype = one capability = one commit | Capability is unit of review |

---

## SECTION 11: NEVER-TOUCH FILES

Per `eagleskill-config.md`:

```
PRODUCTION REPO:
  apps/cms-next/pages/universitiesd/              BCBT white-label
  apps/backend-nest/src/core/entities/extendables/payment.entity.ts
  apps/mui-cms-next/                              Separate app
  MASTER-RUN.cjs                                  Google Sheets script (live)
  Any Stripe/payment logic
  scope.guard.ts                                  Security guard (blocker)
  package.json / pnpm-lock.yaml                   Without Latha approval
  Any file containing JWT secrets

BRAIN REPO:
  archive/                                        Historical files
  code-snapshot/                                  Reference code
  graphify-out/                                   Knowledge graph output
```

---

## SECTION 12: VERIFICATION COMMANDS

```bash
# TypeScript compilation
cd ~/deassists && npm run build:all

# Backend only
pnpm nx build backend-nest

# Frontend only
pnpm nx build cms-next

# Three grep checks (pre-commit)
grep -rn "await fetch(" apps/cms-next/components/ apps/cms-next/pages/
grep -rn "getCookie" apps/cms-next/components/ apps/cms-next/pages/
grep -rn "Authorization.*Bearer" apps/cms-next/components/ apps/cms-next/pages/

# Git status
git status --short
git log --oneline -10
```

---

## SECTION 13: GAP SUMMARY

### Missing Frontend Hook

**Backend exists:** POST /v1/leads/:id/call-log (leads.service.ts logCall method)
**Frontend missing:** useLogCall hook in libs/react-query/queries/leads.ts

This is the primary gap for any call-logging feature work.

### Prototype vs Production Token Discrepancy

| Token | Prototype | Production | Impact |
|-------|-----------|------------|--------|
| gl (green hover) | #27964F | #2a9458 | Minor — both valid |

---

## APPENDIX: RECENT COMMITS

```
5c04ec56 cleanup: remove unused getCookie import from leads/index.tsx
49121b19 refactor: create leads.ts query file + refactor all CRM components to use named hooks
656f7ef0 fix: replace raw fetch with React Query hooks — fixes QA 404s
179cddbd chore: sync pnpm-lock.yaml with google auth deps
1d7c0762 merge: resolve LeadTable.tsx conflict — keep useCustomQuery<any> fix
d48f44b1 fix(crm): LeadTable type error — useCustomQuery<any> fixes build:all
a5997810 build issue fixed
b0d2fdc4 fix(crm): Phase 1 complete — enums, UI polish, nav guard, country code
```

---

*EAGLE BASELINE SYSTEM READOUT*
*Created: 29 April 2026*
*EAGLE v2.1 — Mode 0 Complete*
*Awaiting Shon's review before proceeding*
