# DeAssists OS — Current State
**Maintained by:** VEERABHADRA

---

**Last updated:** 22 April 2026 — 3-day sync: audit + role decisions + graphify

**Brain root:** `~/deassists-workspace/369-brain/`

---

## SESSION HISTORY — 20–22 APRIL 2026

### 20 APRIL 2026 — QA Testing + Sales Intelligence PRD

- Latha pushed CRM Phase 1 to QA — qa.deassists.com
- Kingston tested — network error found (pm2 restart needed)
- Root cause: Kingston was logged into Arden org, not DeAssists
- Tester guide created and sent to Kingston
- LATHA-SERVICES-FIELD-ADDITIONS.docx created
- DEASSISTS-SALES-INTELLIGENCE-MASTER-PRD.docx created
- Decision locked: Shon + VEERABHADRA do UIUX redesign — not Latha

### 21 APRIL 2026 — Full CRM Code Audit + Rules Locked

- 12 CRM files audited, senior dev analysis
- Audit score: 4.5 / 10 — foundation correct, 3 critical bugs found
- Rules 15–18 locked in CLAUDE.md
- Architecture decisions locked (see below)

### 22 APRIL 2026 — Graphify + Permission Audit + Role Architecture

- Graphify installed — knowledge graph built
  * 1771 files, 3983 nodes, 3827 edges, 1366 communities
  * Location: ~/deassists/graphify-out/
  * Cursor integration installed, PreToolUse hook registered
- Full permission system audit completed
- Role architecture confirmed by Shon

---

## CURRENT BUILD STATE

**Branch:** feature/portal.shon369
**Commit pushed:** 26d8957e — feat(crm): CRM Phase 1 complete
**Status:** Waiting for Latha to merge to dev_v2

### BUILD STATUS TABLE

| Area                                      | Status         |
| ----------------------------------------- | -------------- |
| Phase 1 Backend (6 lead files)            | COMPLETE ✅    |
| Phase 4 Queue View UI (7 files)           | COMPLETE ✅    |
| Phase 5A New Lead Form                    | COMPLETE ✅    |
| Phase 5B Sales Dashboard                  | COMPLETE ✅    |
| Design Tokens (crmTokens.ts)              | COMPLETE ✅    |
| Sidebar — Call Center 369 + Sales CRM    | COMPLETE ✅    |
| CE Installation + CLAUDE.md               | COMPLETE ✅    |
| UIUX Superman — Sidebar + Avatar          | COMPLETE ✅    |
| Role-Aware Avatar Dropdown                | COMPLETE ✅    |
| Dashboard Cards Visual Redesign           | COMPLETE ✅    |
| Git hygiene + security audit              | COMPLETE ✅    |
| Karpathy principles merged into CLAUDE.md | COMPLETE ✅    |
| Pre-commit hook removed                   | COMPLETE ✅    |
| Rule 14 locked (one phase one commit)     | COMPLETE ✅    |
| Rules 15–18 locked (code standards)      | COMPLETE ✅    |
| Graphify installed + indexed              | COMPLETE ✅    |
| lead.constants.ts                         | NOT STARTED 🔴 |
| Fix BUG 1: queue name mismatch            | NOT STARTED 🔴 |
| Fix BUG 2: status 'Completed' invalid     | NOT STARTED 🔴 |
| Fix BUG 3: initial comment dropped        | NOT STARTED 🔴 |
| Permission system — role-based access     | NOT STARTED 🔴 |
| Q Intelligence fields + CallLogModal      | NOT STARTED 🔴 |
| My Queue page                             | NOT STARTED 🔴 |
| Finance Section (CardTransactions)        | NOT STARTED 🔴 |
| Phase 6 Migration Script                  | NOT STARTED 🔴 |
| UIUX redesign                             | NOT STARTED 🔴 |
| MARP installation on Mac Mini             | NOT STARTED 🔴 |
| Sales data files (universities, courses)  | NOT STARTED 🔴 |

---

## ARCHITECTURE DECISIONS LOCKED

### Role Architecture (confirmed by Shon 22 Apr)

- Any user Type + **Call Center** role = CRM access (Call Center 369 section visible)
- Any user Type + **Sales Setup** role = Sales CRM access (Sales CRM section visible)
- SUPER_ADMIN and MANAGER bypass role check — visible by Type alone
- No new hiring categories needed — lean and flexible approach
- LEAD_CRM and SALES_SETUP REMOVED as user Types (replaced by role-based access)

### Sidebar Restructure (locked 21 Apr)

- Sales Dashboard moves to **Call Center 369** children (agents need dashboard in same section)
- Sales CRM children: **Sales Setup** placeholder only
- SidebarRole enum approach — no hardcoded role name strings anywhere

### lead.constants.ts (to be created)

Single source of truth for all CRM string values:
- LeadStatus, LeadQueue, LeadSource, LeadService
- CallOutcome, SidebarRole, CRM_ALLOWED_ROLES

---

## CRITICAL BUGS — MUST FIX BEFORE PHASE 2

**BUG 1 — Queue name mismatch (CRITICAL — data bug live now)**
Entity enum: `'369_MAIN'`, `'BCBT'`, `'ACCOMMODATION'`, `'UNROUTED'`
getQueueCounts() looks for: `'369_CALL_CENTER'`, `'369_CALL_CENTER_FU'`, `'BCBT_CALL_CENTER'` etc.
Result: all queue counts show 0 — queue sidebar is entirely broken
Fix: create LeadQueue enum, align across entity + service + dashboard

**BUG 2 — Status 'Completed' does not exist in entity enum (CRITICAL)**
Entity allows: `'Converted'` — convert() sets: `'Completed'` — getStats() filters: `{ $ne: 'Completed' }`
Result: convert endpoint broken, stats counts wrong, converted leads stay in active view
Fix: replace `'Completed'` with `'Converted'` everywhere using LeadStatus enum

**BUG 3 — Initial comment silently dropped**
Frontend sends: `initial_comment` — backend create() ignores it (not on entity)
Result: agent notes never saved to database, zero error shown
Fix: handle `initial_comment` in create() — push as first comment if present

**BUG 4 — permission.helper.ts module-level mutable state (CRITICAL)**
`permittedMenu` declared at module level — mutated every call
Result: concurrent requests corrupt each other's sidebar data
Fix: declare permittedMenu inside exclusivePermission() function

**BUG 5 — /dashboard path never matches any collection (SALES DASHBOARD INVISIBLE)**
Child filter Gate 2 requires path to match a collection name
`/dashboard` matches nothing → Sales Dashboard invisible to MANAGER even when parent is visible
Fix: add path bypass for `/dashboard` in child filter

---

## PENDING BLOCKERS

- JWT secrets rotation — Latha CRITICAL
- 4 AWS ACL errors in accounts.service.ts — Latha MEDIUM (pre-existing)
- Stripe write-back bug — Latha HIGH
- Security guard bypass scope.guard.ts ~L79 — Latha HIGH
- assigned_to enum EMPTY — Shon runs =UNIQUE(K2:K9999) on Sheets col K
- Latha needs to create **Call Center** and **Sales Setup** Roles in portal before testing

---

## NEXT SESSION MUST START WITH

1. Open new chat in VEERABHADRA project
2. Attach memory/session-state.md + memory/activity-log.md from GitHub
3. Confirm Latha has merged feature/portal.shon369 → dev_v2
4. Priority order for Phase 2:
   A — Create lead.constants.ts + fix 3 critical bugs (BUG 1, 2, 3)
   B — Fix permission system (BUG 4, 5) + role-based access
   C — Q Intelligence fields + CallLogModal
   D — UIUX redesign pass

---

*VEERABHADRA — DeAssists Master Brain | Updated: 22 April 2026 — 3-day sync complete*
