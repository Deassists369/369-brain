# DeAssists OS — Current State
**Maintained by:** VEERABHADRA

---

**Last updated:** 23 April 2026 — Session close

**Brain root:** `~/deassists-workspace/369-brain/`

---

## CURRENT BUILD STATE

**Branch:** feature/portal.shon369
**Last commit to portal:** 26d8957e — feat(crm): CRM Phase 1 complete
**Status:** No new portal commits — brain and documentation session only

---

## WHAT WAS COMPLETED TODAY (23 Apr)

1. **staff-brain.md created**
   - Full team documented: 12 people across 2 offices
   - Germany office: Shon AJ (CEO), Sajir (intern), Amala (intern)
   - India office: Latha, Don, Sruthi, Santosh, Lenin, Gopika, Anandhu, Midhun, Stalin
   - Escalation paths documented
   - Systems and migration status documented
   - Known gaps and growth path documented

2. **VEERABHADRA.md updated**
   - Full team reference added
   - Rule 23 strengthened

3. **CLAUDE.md Rule 23 added**
   - git diff --staged mandatory before any brain file commit
   - Prevents silent deletions (incident 22 April 2026)
   - Applies to all 369-brain files

4. **3 commits pushed to 369-brain**
   - 22ba7b0 — staff-brain created
   - e7c8cc2 — VEERABHADRA updated
   - a0efccf — Rule 23 added

---

## CRITICAL BUGS — MUST FIX BEFORE PHASE 2

**BUG 1 — Queue name mismatch (CRITICAL)**
Entity uses `'369_MAIN'`, service looks for `'369_CALL_CENTER'`
Result: all queue counts = 0
Files: `lead.entity.ts`, `leads.service.ts`, `leads-routing.service.ts`, `dashboard/index.tsx`

**BUG 2 — Status 'Completed' does not exist (CRITICAL)**
`convert()` sets `'Completed'`, entity only allows `'Converted'`
Result: converts fail silently, stats wrong
Files: `leads.service.ts`, `dashboard/index.tsx`

**BUG 3 — Initial comment silently dropped**
Frontend sends `initial_comment`, backend ignores it
Result: agent notes never saved to database
Files: `leads.service.ts`

**BUG 4 — Module-level mutable state in permission.helper.ts (CRITICAL)**
`hasCourseListPermission` and `hasEverBeenRestricted` are module-level
Result: cross-request contamination in production
Files: `permission.helper.ts`

**BUG 5 — /dashboard path never matches any collection**
MANAGER, ORG_ADMIN cannot see Sales Dashboard child
Result: Sales Dashboard invisible to non-SUPER_ADMIN roles
Files: `permission.helper.ts`, `sidemenu.ts`

---

## GRAPHIFY RISK REGISTRY

| Risk | Files | Notes |
|---|---|---|
| MAXIMUM | `permission.helper.ts` | Community 6 — coupled to AccountsController (63 edges) — Latha must be present |
| HIGH | `leads.controller.ts` | API contract change breaks useCustomQuery (54 edges) |
| MEDIUM | `sidemenu.ts`, `user.types.ts` | Sidebar audit mandatory |
| LOW | `lead.entity.ts`, `leads.service.ts`, `leads.module.ts` | Isolated communities |
| ZERO | `lead.constants.ts` | New file — no existing connections |

---

## BUILD PLAN — NEXT SESSION

### Phase A — Safe, build freely, no Latha needed

| Step | Task | Risk |
|---|---|---|
| A1 | Create `lead.constants.ts` — LeadStatus, LeadQueue, LeadSource, LeadService, CallOutcome, SidebarRole, CRM_ALLOWED_ROLES | ZERO |
| A2 | Fix Bug 1: align queue names using LeadQueue enum | LOW |
| A3 | Fix Bug 2: replace `'Completed'` → `'Converted'` using LeadStatus enum | LOW |
| A4 | Fix Bug 3: handle `initial_comment` in `create()` | LOW |
| A5 | Fix Bug 4: move module-level state inside `exclusivePermission()` | MEDIUM |

### Phase B — Latha must be present

| Step | Task | Risk |
|---|---|---|
| B1 | Remove LEAD_CRM and SALES_SETUP as Types from `user.types.ts` | MEDIUM |
| B2 | Add SidebarRole enum + fix `permission.helper.ts` role-based access | MAXIMUM |
| B3 | Update `sidemenu.ts` — new sidebar structure | MEDIUM |

### Phase C — After A and B pass local testing

- ONE commit when Shon says ready for tester
- Push to GitHub — Latha deploys to qa.deassists.com
- Kingston tests on qa.deassists.com

---

## PENDING BLOCKERS

- JWT secrets rotation — Latha CRITICAL
- 4 AWS ACL errors in accounts.service.ts — Latha MEDIUM
- Stripe write-back bug — Latha HIGH
- Security guard bypass scope.guard.ts ~L79 — Latha HIGH
- assigned_to enum EMPTY — Shon runs =UNIQUE(K2:K9999) on Sheets col K
- Latha must create **Call Center** and **Sales Setup** Roles in portal before testing

---

## NEXT SESSION MUST START WITH

1. Attach `memory/session-state.md` + `memory/activity-log.md` from GitHub
2. Graphify knowledge graph is now in git — VEERABHADRA reads directly from repo (no /graphify . needed)
3. Run Zero Mistakes Protocol — steps 1–3 before writing any code
4. Begin Phase A — stage only, never commit
5. Shon confirms each step before moving to the next

Note: Graphify committed to 369-brain on 23 April 2026 (commit bdae182).
Smart workflow: always rebuild after portal commits, only commit if graph changed.

---

*VEERABHADRA — DeAssists Master Brain | Updated: 23 April 2026 — Session close*
