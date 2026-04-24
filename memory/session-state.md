# DeAssists OS — Current State
**Maintained by:** VEERABHADRA

---

**Last updated:** 24 April 2026 — Session close (final, Rules 24–26 locked)

**Brain root:** `~/deassists-workspace/369-brain/`

---

## CURRENT BUILD STATE

**Branch:** feature/portal.shon369
**Phase 1 CRM Fix:** COMPLETE AND PUSHED ✅
**MUI Colour Fix:** COMPLETE AND PUSHED ✅

**Commits pushed today:**
- `d6f47912` — fix(crm): Phase 1 complete — enum architecture + bug fixes + role-based access (11 files)
- `dffced7d` — chore: update pnpm lockfile + gitignore
- `eb716e2b` — chore: revert pnpm-lock.yaml — lockfile reverted, Latha owns this file
- `856a9f25` — fix(theme): MUI colour error — replace raw RGB strings with hex in palette
- `e370bb1f` — chore: add Rule 26 — package.json needs Latha approval (CLAUDE.md)

---

## WHAT WAS BUILT AND FIXED

| Step | Task | Status |
|------|------|--------|
| A1 | `lead.constants.ts` created — new shared enums file | ✅ |
| A2 | Queue name mismatch fixed — counts now work | ✅ |
| A3 | `Completed` → `Converted` fixed | ✅ |
| A4 | Initial comment now saved | ✅ |
| A5 | ALLOWED_ROLES cleaned in 3 pages | ✅ |
| A6 | Module-level mutable state fixed | ✅ |
| B1 | LEAD_CRM and SALES_SETUP removed as Types | ✅ |
| B2 | `requiredRole` field added to permission interface | ✅ |
| B3 | Permission helper fixed — role-based access working | ✅ |
| B4 | `sidemenu.ts` updated — new structure | ✅ |
| B5 | Sidebar audit passed all 9 checks | ✅ |

**Additional bugs found and fixed (lead creation):**
- `date` always set by backend — never relies on frontend
- `last_outcome: null` invalid enum — `default: null` removed from entity

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

## LOCAL DEVELOPMENT — STATUS

**Login:** Working locally ✅ (was blocked earlier this session — now resolved)
**Logout-on-save bug:** Latha's auth changes cause logout after saving a user record — local `.env` issue only. QA (`qa.deassists.com`) unaffected. Waiting for Latha to merge `feature/portal.shon369` → `dev_v2` and deploy.

---

## GRAPHIFY RISK REGISTRY

| Risk | Files | Notes |
|------|-------|-------|
| MAXIMUM | `permission.helper.ts` | Community 6 — coupled to AccountsController (63 edges) — Latha must be present |
| HIGH | `leads.controller.ts` | API contract change breaks useCustomQuery (54 edges) |
| MEDIUM | `sidemenu.ts`, `user.types.ts` | Sidebar audit mandatory |
| LOW | `lead.entity.ts`, `leads.service.ts`, `leads.module.ts` | Isolated communities |
| ZERO | `lead.constants.ts` | New file — no existing connections |

---

## PENDING BLOCKERS

- JWT secrets rotation — Latha CRITICAL
- 4 AWS ACL errors in `accounts.service.ts` — Latha MEDIUM
- Stripe write-back bug — Latha HIGH
- Security guard bypass `scope.guard.ts` ~L79 — Latha HIGH
- `assigned_to` enum EMPTY — Shon runs `=UNIQUE(K2:K9999)` on Sheets col K
- Latha auth/logout-on-save bug — local `.env` only — QA unaffected ✅ CONFIRMED

---

## NEXT SESSION

1. Latha merges `feature/portal.shon369` → `dev_v2`
2. Kingston tests on `qa-portal.deassists.com`
3. Fix any issues found in testing
4. Begin Phase 2 — Q Intelligence fields + CallLogModal

---

## FINALISED BUILD PLAN — LOCKED 23 APRIL 2026

### PHASE 1 — Foundation + Permissions + Roles ✅ COMPLETE

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

## CLAUDE.md RULES — LOCKED 24 APRIL 2026

| Rule | Description |
|------|-------------|
| Rule 24 | NEVER commit `pnpm-lock.yaml` — Latha owns it |
| Rule 25 | Never commit `.gitignore` without Latha approval |
| Rule 26 | Any `package.json` change requires Latha approval before commit |

Both portal (`deassists`) and brain (`369-brain`) CLAUDE.md updated and committed.

---

*VEERABHADRA — DeAssists Master Brain | Updated: 24 April 2026 — Session close (final, Rules 24–26 locked)*
