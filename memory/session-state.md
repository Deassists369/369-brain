# DeAssists OS — Current State
**Maintained by:** VEERABHADRA

---

**Last updated:** 25 April 2026 — Session close

**Brain root:** `~/deassists-workspace/369-brain/`

---

## CURRENT BUILD STATE

**Branch:** feature/portal.shon369
**Backend:** Compiling and running on port 8000 ✅
**CMS:** Running on port 4002 ✅
**Login:** Working ✅

---

## STAGED FILES (NOT YET COMMITTED)

All changes staged locally — waiting for one single commit when complete:

| File | What was fixed |
|------|----------------|
| `apps/cms-next/components/leads/LeadTable.tsx` | `data?.data?.data` fix — table now shows leads |
| `apps/cms-next/components/leads/LeadQueueSidebar.tsx` | Queue shape fix — sidebar counts work |
| `apps/cms-next/components/leads/LeadDetailPanel.tsx` | Tab switching wired up |
| `apps/cms-next/pages/leads/index.tsx` | STATUS_OPTIONS and QUEUE_OPTIONS replaced with enum imports |
| `apps/cms-next/pages/leads/new.tsx` | Enum imports added |
| `apps/cms-next/pages/dashboard/index.tsx` | Enum imports added |
| `apps/backend-nest/src/leads/leads.service.ts` | Empty string enum validation fix |
| `libs/shared/constants/lead.constants.ts` | All shared enums including SidebarRole added |
| `CLAUDE.md` | Rules 0, 23, 27, 28 added |

---

## WHAT WAS FIXED THIS SESSION (25 April 2026)

1. **cms-next .env.local symlink created**
   - `ln -s ~/deassists/.env ~/deassists/apps/cms-next/.env.local`
   - Google OAuth now loads — login works

2. **SidebarRole enum added to lead.constants.ts**
   - Backend was failing to compile — sidemenu.ts was importing SidebarRole
   - Added `SidebarRole` enum with `CallCenter` and `SalesSetup` values
   - Backend now compiles successfully

3. **Both servers verified running**
   - Backend: port 8000, PID 37079
   - CMS: port 4002, env loaded from .env.local symlink

---

## STILL TO DO NEXT SESSION

1. Fix hardcoded values in `new.tsx` and `dashboard/index.tsx`
2. Verify Comments tab works in browser
3. Browser test all roles at localhost:4002
4. Run sidebar audit
5. **Then ONE SINGLE COMMIT for everything**

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

**Login:** Working locally ✅ (env symlink fixed Google OAuth)
**Backend:** Compiling and running ✅
**CMS:** Running and loading env ✅

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

---

## NEXT SESSION

1. Fix remaining hardcoded values
2. Browser test all roles
3. Sidebar audit
4. One single commit for all staged changes
5. Latha merges `feature/portal.shon369` → `dev_v2`
6. Kingston tests on `qa-portal.deassists.com`

---

## FINALISED BUILD PLAN — LOCKED 23 APRIL 2026

### PHASE 1 — Foundation + Permissions + Roles ✅ IN PROGRESS (staged, not committed)

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

| Rule | Description |
|------|-------------|
| Rule 0 | Always verify before adding or changing any rule |
| Rule 23 | git diff mandatory before any brain file commit |
| Rule 24 | NEVER commit `pnpm-lock.yaml` — Latha owns it |
| Rule 25 | Never commit `.gitignore` without Latha approval |
| Rule 26 | Any `package.json` change requires Latha approval before commit |
| Rule 27 | Three-layer access audit — mandatory for every CRM page |
| Rule 28 | Constants file is a hard gate — enums must exist before use |

---

*VEERABHADRA — DeAssists Master Brain | Updated: 25 April 2026 — Session close*
