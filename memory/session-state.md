# DeAssists OS — Current State
**Maintained by:** VEERABHADRA

---

**Last updated:** 22 April 2026 — Session close

**Brain root:** `~/deassists-workspace/369-brain/`

---

## CURRENT BUILD STATE

**Branch:** feature/portal.shon369
**Last commit to portal:** 26d8957e — feat(crm): CRM Phase 1 complete
**Status:** Staged files only — no new portal commits yet

---

## WHAT WAS COMPLETED TODAY (22 Apr)

1. **Graphify installed and knowledge graph built**
   - 1771 files, 3983 nodes, 3827 edges, 1366 communities
   - Moved output to `~/deassists-workspace/369-brain/graphify-out/`
   - Cursor and Claude Code integration complete
   - Full graphify commit checklist added to CLAUDE.md

2. **Full CRM code audit** — 12 files — score 4.5 / 10

3. **Full permission system audit** — all roles mapped

4. **Full risk registry built** from graphify graph analysis

5. **Role architecture finalised:**
   - LEAD_CRM and SALES_SETUP removed as user Types
   - Call Center and Sales Setup = database Roles
   - Any Type + role = CRM access

6. **Zero Mistakes Protocol locked** in CLAUDE.md

7. **Rules 15–22 locked permanently** in CLAUDE.md

8. **Rule 14 updated** — tester ready standard:
   - Only commit when ready for qa.deassists.com
   - Stage freely during build
   - One commit when Shon says "ready for tester"

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

1. Type `/graphify .` in agent panel
2. Attach `memory/session-state.md` + `memory/activity-log.md` from GitHub
3. Run Zero Mistakes Protocol — steps 1–3 before writing any code
4. Begin Phase A — stage only, never commit
5. Shon confirms each step before moving to the next

---

*VEERABHADRA — DeAssists Master Brain | Updated: 22 April 2026 — Session close*
