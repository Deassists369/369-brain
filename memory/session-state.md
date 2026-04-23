# DeAssists OS — Current State
**Maintained by:** VEERABHADRA

---

**Last updated:** 24 April 2026 — Session close

**Brain root:** `~/deassists-workspace/369-brain/`

---

## CURRENT BUILD STATE

**Branch:** feature/portal.shon369
**Last commit to portal:** d6f47912 — fix(crm): Phase 1 complete — enum architecture + bug fixes + role-based access
**Status:** COMMITTED — 11 files — Phase 1 fix complete

---

## PENDING BLOCKER — ACTIVE

**Google OAuth signin broken locally**
Latha's recent commits require `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in local `.env`
Local signin page is broken until this value is added
Waiting for Latha to provide the value

**Next steps:**
1. Get `NEXT_PUBLIC_GOOGLE_CLIENT_ID` from Latha
2. Add to local `.env` — test signin locally
3. Kingston tests on qa.deassists.com after Latha merges the branch

---

## WHAT WAS COMPLETED (23–24 Apr)

1. **Phase 1 CRM fix — COMPLETE AND COMMITTED**
   - Commit: `d6f47912`
   - Branch: `feature/portal.shon369`
   - 11 files — browser tested by Shon before commit

2. **A1 — `lead.constants.ts` created**
   - LeadStatus, LeadQueue, LeadSource, LeadService, CallOutcome, SidebarRole enums

3. **A2 — Queue name mismatch fixed**
   - `getQueueCounts()` and `getStats()` now use `LeadQueue` enum

4. **A3 — `Completed` → `Converted` fixed**
   - `convert()` uses `LeadStatus.Converted`

5. **A4 — Initial comment silently dropped — fixed**
   - `create()` calls `addComment()` when `initial_comment` present

6. **A5 — LEAD_CRM and SALES_SETUP removed from ALLOWED_ROLES**
   - All 3 frontend pages cleaned

7. **A6 — Module-level mutable state fixed**
   - `hasCourseListPermission` and `hasEverBeenRestricted` moved inside `exclusivePermission()`

8. **B1 — LEAD_CRM and SALES_SETUP removed from `user.types.ts`**

9. **B2 — `requiredRole` field added to `permission.interface.ts`**

10. **B3 — `permission.helper.ts` updated**
    - `rolePermitted` check for parent visibility
    - Collection bypass for children with no collection match

11. **B4 — `sidemenu.ts` restructured**
    - Sales Dashboard moved to Call Center 369 children
    - Sales Setup placeholder added to Sales CRM children
    - `requiredRole: SidebarRole.CallCenter` and `SidebarRole.SalesSetup` added

12. **Staff brain corrected**
    - Gopika, Anandhu, Midhun, Stalin → Portal role: `TEAM_LEAD`
    - CRM access: Assign Call Center role in portal
    - AGENT type clarified: external sub-agents only, zero CRM access

13. **Two lead creation bugs fixed**
    - `date` always set by backend (`new Date()`) — never relies on frontend
    - `last_outcome` `default: null` removed — no longer conflicts with enum validation

---

## CRITICAL BUGS — STATUS

All 5 Phase 1 bugs FIXED in commit d6f47912.

~~BUG 1~~ ✅ Queue name mismatch — fixed (A2)
~~BUG 2~~ ✅ Status 'Completed' — fixed (A3)
~~BUG 3~~ ✅ Initial comment dropped — fixed (A4)
~~BUG 4~~ ✅ Module-level mutable state — fixed (A6)
~~BUG 5~~ ✅ /dashboard path bypass — fixed (B3)

**ADDITIONAL BUGS FOUND AND FIXED (23 Apr)**
~~BUG 6~~ ✅ `date` required — backend now always sets `new Date()`
~~BUG 7~~ ✅ `last_outcome: null` invalid enum — `default: null` removed from entity

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

## FINALISED BUILD PLAN — LOCKED 23 APRIL 2026

### PHASE 1 — Foundation + Permissions + Roles (ONE COMMIT)

All items below must be complete and tested before the single Phase 1 commit.

| Step | Task |
|---|---|
| A1 | `lead.constants.ts` created — LeadStatus, LeadQueue, LeadSource, LeadService, CallOutcome, SidebarRole, CRM_ALLOWED_ROLES |
| A2 | Queue name mismatch fixed — entity, service, routing service, dashboard all aligned |
| A3 | `'Completed'` → `'Converted'` fixed everywhere using LeadStatus enum |
| A4 | Initial comment silently dropped — fixed in `create()` |
| A5 | `CRM_ALLOWED_ROLES` imported everywhere it is used |
| A6 | Module-level mutable state fixed — moved inside `exclusivePermission()` |
| B1 | LEAD_CRM and SALES_SETUP removed as Types from `user.types.ts` |
| B2 | SidebarRole enum + `requiredRole` field added to sidemenu items |
| B3 | `/dashboard` path bypass fixed in `permission.helper.ts` |
| B4 | `sidemenu.ts` updated — Sales Dashboard to Call Center 369, Sales Setup placeholder in Sales CRM |
| B5 | Sidebar audit passed for all roles |
| C1 | **Call Center** role created in portal by Latha |
| C2 | **Sales Setup** role created in portal by Latha |
| C3 | Roles assigned to test users — Kingston + test agents |

→ **ONE commit when everything above is done and tested locally**
→ ONE push → ONE graphify update

### PHASE 2 — Q Intelligence (ONE COMMIT)

Q Intelligence fields + CallLogModal
call_attempts, last_called_at, last_outcome, callback_at, callback_note

### PHASE 3 — My Queue page (ONE COMMIT)

Agent's personal queue view — filtered by assigned_to

### PHASE 4 — Sales Support panel (ONE COMMIT)

Sales support functionality — TBD with Shon

### PHASE 5 — Config panel (ONE COMMIT)

CRM configuration panel — TBD with Shon

---

## PREVIOUS BUILD PLAN (superseded 23 Apr)

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

1. Get `NEXT_PUBLIC_GOOGLE_CLIENT_ID` from Latha — add to local `.env`
2. Test signin locally — confirm portal loads correctly
3. Latha merges `feature/portal.shon369` → dev_v2
4. Kingston tests on qa.deassists.com
5. Begin Phase 2 — Q Intelligence fields + CallLogModal

---

*VEERABHADRA — DeAssists Master Brain | Updated: 24 April 2026 — Session close*
