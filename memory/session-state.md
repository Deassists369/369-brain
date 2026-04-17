# DeAssists OS — Current State

---

**Last updated:** 16 April 2026 — VEERABHADRA (Dashboard Cards Visual Redesign)

**Brain root:** `~/deassists-workspace/369-brain/`

**Export / pointer:** `design/outputs/SESSION-STATE-UPDATE-07042026.md` — short mirror + link to this file’s **07.04.2026** section.

---

## SESSION: 16.04.2026 — DASHBOARD CARDS VISUAL REDESIGN (Session 10)

### WHAT WAS DONE TODAY

**Branch:** `feature/portal-crm-phase1` (clean, pushed to origin)

#### UIUX Superman Visual Redesign — Dashboard Cards

Completed Steps 5-6 of UIUX Superman skill on dashboard card components with **zero logic changes**.

**Files Modified:**

1. **`apps/cms-next/components/Cards/CardTeamMembers.tsx`**
   - Added InputAdornment, Icon (@iconify/react) imports
   - Card: boxShadow none, 1px #e5e5e0 border, 10px radius
   - CardHeader: Outfit 14px uppercase, 0.08em letter-spacing, #1a1a1a
   - Table headers: #F6F7F4 bg, #1a1a1a text, 11px uppercase
   - Table rows: #e5e5e0 bottom border only, hover rgba(29,122,69,0.03)
   - Search container: #F6F7F4 bg, 8px radius, 12px/16px padding
   - TextField: mdi:magnify startAdornment, green focus border, placeholder only (no label)
   - Search Button: contained #1D7A45, Outfit font, no shadow
   - Clear Button: text variant, #888 color, transparent hover
   - Count numbers: #1D7A45 green, 15px, weight 700

2. **`apps/cms-next/components/Cards/CardApplicationList.tsx`**
   - Same visual changes as CardTeamMembers
   - Semantic count colours: Total #1D7A45, Open #c47b00 (amber), Closed #888888

#### Feature Audit: 29/29 PASS

All handlers, hooks, state, and data transforms confirmed intact:
- `handleSearchClick`, `handleClearClick`, `handlePageChange` — both files
- `useDashboardTeamCard`, `useModelListForUserType`, `UserTypesMapping` — CardTeamMembers
- `useDashboardApplicationCard`, `useDashboardApplicationBySearch`, `hasPermission`, `hasRole`, `flatApplications` — CardApplicationList
- `GlobalLoadingIndicator` x2, `CustomAlertBox`, `Pagination`, empty state — both files

#### Commits Pushed

- `4dc20310` — design(dashboard): UIUX Superman — visual redesign, zero logic changes
- `06e81ce8` — style: prettier formatting

### BUILD STATUS (as of 16 April 2026)

| Phase | Status |
|-------|--------|
| Phase 1 Backend (6 lead files) | COMPLETE ✅ |
| Phase 4 Queue View UI (7 files) | COMPLETE ✅ |
| Phase 5A New Lead Form | COMPLETE ✅ |
| Phase 5B Sales Dashboard | COMPLETE ✅ |
| UIUX Superman — My Queue Page | COMPLETE ✅ |
| UIUX Superman — Sidebar + Avatar | COMPLETE ✅ |
| Role-Aware Avatar Dropdown | COMPLETE ✅ |
| Dashboard Cleanup (Transactions removed) | COMPLETE ✅ |
| **Dashboard Cards Visual Redesign** | **COMPLETE ✅** |
| Q Intelligence fields | NOT STARTED |
| New sidebar structure | NOT STARTED |
| Finance Section (CardTransactions) | NOT STARTED |

### NEXT ACTION

**Latha review** of dashboard visual redesign (`4dc20310`, `06e81ce8`), then continue CRM Phase 1.

---

## SESSION: 15.04.2026 — CLAUDE.md + COMPOUND ENGINEERING SETUP (Session 7)

### WHAT WAS DONE TODAY

**Branch:** `feature/portal-crm-phase1` (clean, pushed to origin)

#### Compound Engineering v2.65.0 Installed
- Plugin installed via `/plugin marketplace add` + `/plugin install`
- `.compound-engineering/config.local.yaml` created (local settings)
- `.compound-engineering/config.local.example.yaml` created (template for team)
- `.gitignore` updated with `.compound-engineering/*.local.yaml`
- **agent-browser** installed globally (browser automation for visual testing)

#### CLAUDE.md Created (149 lines)
Comprehensive codebase intelligence file committed as `35954f85`:
- **Team roles:** Shon (CEO), Latha (backend reviewer), VEERABHADRA (plans/prompts)
- **Monorepo structure:** backend-nest, cms-next, website-next, libs
- **Critical patterns:** Entity imports from mongoose.types, auth via getCookie, NestJS static-before-dynamic routes, sidebar in permission.helper.ts
- **Files never to touch:** BCBT white-label, payment.entity.ts, MASTER-RUN.cjs, Stripe
- **Skills:** Sidebar Audit (mandatory), UIUX Superman (mandatory for visual), Brainstorming
- **Dual codebase warning:** `libs/shared-ui/` is PRIMARY, not `apps/mui-cms-next/`
- **CE workflow:** 8-step feature build process
- **Build status:** Phase 1-5 complete, UIUX Superman Step 2 complete
- **4 pending blockers** documented

#### Git Sync
- `git pull` synced 129 commits from origin (fast-forward)
- 2 commits pushed:
  - `ba7f92d0` — chore: add CLAUDE.md codebase intelligence + CE gitignore rule
  - `35954f85` — chore: update CLAUDE.md — skills, dual codebase, build status 15 Apr

### BUILD STATUS (as of 15 April 2026)

| Phase | Status |
|-------|--------|
| Phase 1 Backend (6 lead files) | COMPLETE ✅ |
| Phase 4 Queue View UI (7 files) | COMPLETE ✅ |
| Phase 5A New Lead Form | COMPLETE ✅ |
| Phase 5B Sales Dashboard | COMPLETE ✅ |
| UIUX Superman — Step 2 Feature Inventory | COMPLETE ✅ |
| UIUX Superman — Step 3 Design Interview | PENDING |
| Q Intelligence fields | NOT STARTED |
| New sidebar structure | NOT STARTED |
| My Queue page | NOT STARTED |
| CallLogModal | NOT STARTED |

### DUAL CODEBASE — CRITICAL DISCOVERY

Two parallel UI codebases exist:
- `libs/shared-ui/` ← **PRIMARY** — used by cms-next portal
- `apps/mui-cms-next/` ← SEPARATE app with duplicate components

**Rule:** For ALL portal work, ONLY modify `libs/shared-ui/`. Never modify `apps/mui-cms-next/` for portal changes.

### NEXT ACTION

**UIUX Superman Step 3: Design Interview** — Collect design preferences for CRM pages before HTML preview generation.

---

## SESSION: 12.04.2026 — PHASE 5 CRM COMPLETE + BUG FIXES (Sessions 1-4)

### WHAT WAS BUILT TODAY

**Branch:** `feature/portal-crm-phase1`

#### Phase 5 Features Complete

1. **Dashboard** (`/dashboard`) — Stats overview with total active, by-status grid, by-queue grid
2. **New Lead Form** (`/leads/new`) — 4-card form with duplicate detection modal and success confirmation

#### Files Created/Modified

**Session 1 — Queue View Visual Overhaul (9 commits):**
- `apps/cms-next/styles/crmTokens.ts` — Design tokens from prototype
- `apps/cms-next/components/leads/StatusBadge.tsx` — Pill badges, 11px/700 weight
- `apps/cms-next/components/leads/QueueBadge.tsx` — Green tint, 6px radius
- `apps/cms-next/components/leads/LeadQueueSidebar.tsx` — 230px, left border accent
- `apps/cms-next/components/leads/LeadTable.tsx` — Sticky header, monospace IDs
- `apps/cms-next/components/leads/LeadDetailPanel.tsx` — Dark header, Fraunces font
- `apps/cms-next/components/leads/CommentThread.tsx` — Avatar circles, cream bubbles
- `apps/cms-next/pages/leads/index.tsx` — Full layout shell with cream background

**Session 2 — Phase 5 Implementation (17 commits):**
- `apps/cms-next/pages/dashboard/index.tsx` — Stats dashboard
- `apps/cms-next/pages/leads/new.tsx` — 4-card new lead form

**Session 3 — Bug Fixes (4 commits):**
- Fixed MUI color crash ("Unsupported 50, 71, 92 color") by replacing Alert/Button/Dialog with Box-based components
- Added API rewrite proxy: `/api/*` → `localhost:8000/api/*`
- Added ORG_ADMIN and AGENT to stats endpoint roles

**Session 4 — Auth + Styling Fixes (4 commits):**
- Added JWT Authorization header to dashboard and new lead form (using `getCookie(‘token’)` from `cookies-next`)
- Fixed card headers to match prototype: cream background, dark text, 14px padding
- Fixed card overflow clipping with `overflow: hidden`
- Renamed "Place / Country" to "Current Residence / Country" with ℹ️ tooltip
- Fixed focus loss in text fields with `useCallback` for handlers

### AUTH PATTERN LOCKED

Backend uses `Authorization: Bearer <token>` header, NOT cookies. All frontend API calls must:
1. Import `getCookie` from `cookies-next`
2. Get token: `const token = getCookie(‘token’)`
3. Add header: `Authorization: \`Bearer ${token}\``

### ROLES CORRECTED

- **Valid UserTypes:** SUPER_ADMIN, ORG_OWNER, ORG_ADMIN, MANAGER, TEAM_LEAD, STAFF, AGENT, ORG_AGENT, USER, ALL
- **NO DATA_ENTRY** — map to AGENT (Gopika’s role)
- Dashboard: SUPER_ADMIN, ORG_ADMIN, MANAGER, STAFF, AGENT
- New Lead Form: SUPER_ADMIN, ORG_ADMIN, MANAGER, AGENT

### COMMITS TODAY (34 total)

**Session 4:**
- `2e52e42c` — fix(crm): fix 4 issues in new lead form
- `05a7f937` — fix(crm): add overflow hidden to form cards
- `4ccd54e4` — style(crm): fix card headers to match prototype
- `f12cbe66` — fix(crm): add Authorization header to dashboard stats fetch

**Session 3:**
- `bd28b946` — fix(leads): add ORG_ADMIN and AGENT roles to stats endpoint
- `b71e5958` — fix(cms): add API rewrite to proxy requests to backend
- `69956afb` — fix(crm): replace MUI Button/Dialog/Alert with Box-based
- `1a47c9e3` — refactor(crm): replace MUI Alert with custom error box

**Session 2:** 17 commits for Phase 5 features
**Session 1:** 9 commits for Queue View visual overhaul

---

## SESSION: 07.04.2026 — PHASE 1 PORTAL CRM — FULLY LOCKED

### WHO BUILDS

- **VEERABHADRA (Claude) + Shon** write all code together in Cursor  
- **Latha** reviews every file before commit — never self-merges  
- **No exceptions to this rule**

### WHAT IS LOCKED TODAY

#### DOCUMENT SET — ALL FINAL

| Document | File | Status |
|----------|------|--------|
| Functional Specification | DEASSISTS-CRM-Phase1-Functional-Specification-v5.docx | LOCKED |
| Master Build Plan | DEASSISTS-MASTER-BUILD-PLAN-PHASE1-CRM-FINAL-v5.docx | LOCKED |
| Rollout Plan | DEASSISTS-CRM-Phase1-Rollout-Plan-FINAL.docx | ALIGNED |
| Lead Sources Connection | DEASSISTS-Lead-Sources-CRM-Connection-Plan-FINAL.docx | ALIGNED |
| Lead Source Implementation | DEASSISTS-Lead-Source-Implementation-Plan-FINAL.docx | ALIGNED |
| Portal CRM HTML Prototype | DEASSISTS-Portal-CRM-Phase1-Prototype-LOCKED-v2.html | LOCKED |

All documents saved in **Shon’s Downloads** folder. Upload **Master Build Plan v5** + **Prototype LOCKED v2** to **Claude Project files** for VEERABHADRA to read directly each session.

---

### PHASE 1 ARCHITECTURE — LOCKED

**Schema — 21 fields:**  
`lead_id`, `date`, `source` (6 enum), `source_detail` (free text), `agent_name`, `full_name`, `place`, `country_code`, `whatsapp`, `email`, `service` (15 enum), `assigned_to`, `university_interest`, `intake`, `comments` `[{text, author, timestamp}]`, `status` (8 enum), `queue` (8 enum), `is_archived`, `created_at`, `updated_at`

**Status (8):** Active \| Follow Up \| Called 1 \| Called 2 \| Called 3 \| Hold \| Completed \| Lost  

**Queue (8):** `369_CALL_CENTER` \| `369_CALL_CENTER_FU` \| `BCBT_CALL_CENTER` \| `BCBT_FOLLOW_UP` \| `DON` \| `ACCOMMODATION` \| `SAJIR` \| `UNROUTED`  

**Source (6):** Partner \| Portal \| WhatsApp \| Instagram \| Phone \| Other  

**Source Detail:** free text, optional, no enum. **BCBT** = Source: Partner + Source Detail: `"BCBT"`

**Routing (9 rules, first match wins):**

1. Service = Accommodation → `ACCOMMODATION`  
2. Service = FSJ / Au Pair / Ausbildung / Jobs / Doc Translation → `SAJIR`  
3. `assigned_to` = DON → `DON`  
4. Service = Opportunity Card / Spouse Visa / Visa Services / Insurance → `DON`  
5a. Source = Partner + Source Detail = BCBT + Status = Active → `BCBT_CALL_CENTER`  
5b. Source = Partner + Source Detail = BCBT + Status = FU / Called / Hold → `BCBT_FOLLOW_UP`  
6. Service = University + Status = Active → `369_CALL_CENTER`  
7. Service = University + Status = FU / Called / Hold → `369_CALL_CENTER_FU`  
8. Everything else → `369_CALL_CENTER` (default)  

**API Endpoints (10 total):**

- `POST /v1/leads` — create  
- `GET /v1/leads` — list/filter (queue, status, service, search, page, limit — **AND** logic)  
- `GET /v1/leads/:id` — single lead  
- `PUT /v1/leads/:id` — update + re-route  
- `POST /v1/leads/:id/comments` — append only  
- `GET /v1/leads/queues` — counts per queue  
- `POST /v1/leads/:id/convert` — **STUB** Phase 1 (mark Completed + archived only)  
- `GET /v1/leads/export` — CSV, filter-aware, MANAGER / SUPER_ADMIN only  
- `GET /v1/leads/stats` — total + by_status + by_queue, role-scoped  
- **`GET /v1/leads/stats` route MUST be placed BEFORE `GET /v1/leads/:id` in controller**

**Roles (4):** `SUPER_ADMIN` \| `MANAGER` \| `STAFF` \| `DATA_ENTRY`

**Files to create (22):**

- **Backend new (10):** `lead.schema.ts`, `lead-id.service.ts`, `leads-routing.service.ts`, `leads.module.ts`, `leads.controller.ts`, `leads.service.ts`, `dto/create-lead.dto.ts`, `dto/update-lead.dto.ts`, `dto/add-comment.dto.ts`, `dto/query-leads.dto.ts`  
- **Backend updated (1):** `app.module.ts`  
- **Frontend new (10):** `pages/leads/index.tsx`, `pages/leads/new.tsx`, `pages/dashboard/index.tsx`, `components/leads/LeadQueueSidebar.tsx`, `LeadTable.tsx`, `LeadDetailPanel.tsx`, `StatusBadge.tsx`, `QueueBadge.tsx`, `CommentThread.tsx`, `Sidebar.tsx` (updated)  
- **Migration script (1):** `scripts/migrate-leads.cjs`  

**Build phases:**

- **Phase 0:** Branch `feature/portal-crm-phase1` from `dev_v2`  
- **Phase 1:** `lead.schema.ts` (1–2 days)  
- **Phase 2:** `lead-id.service.ts` + `leads-routing.service.ts` (2–3 days)  
- **Phase 3:** All 10 API endpoints (3–5 days)  
- **Phase 4:** Queue View UI `/leads` (5–8 days)  
- **Phase 5:** New Lead Form `/leads/new` (8–9 days)  
- **Phase 5B:** Base Dashboard `/dashboard` (after Phase 5)  
- **Phase 6:** Data migration from Google Sheets (9–12 days)  
- **Phase 7:** Verification + go-live (12–14 days)  

---

### DECISIONS LOCKED TODAY

- **Roles:** Build Phase 1 with **4 CRM roles** as defined. Align with existing portal staff system **post-launch** — small task, 1–2 days Latha. **Do not do mid-build.**  
- **Applications sidebar:** Existing portal context only. **Not** Phase 1 CRM. Stays greyed out.  
- **Source in panel header:** **NOT** shown. Source + Source Detail visible in **detail panel body** only.  
- **Builder model:** VEERABHADRA (Claude) + Shon write code. Latha reviews + commits. **Locked.**  
- **Phase 2A — first sales module:** Programs / Course Finder / Private Admissions **only**. Activates after Phase 1 is **live and stable**. All other service tools **deferred**.  
- **Sales tab in prototype:** Visible **placeholder** in lead detail panel. Non-functional. **Zero** backend work. Locks UI structure for Phase 2A.  
- **Convert endpoint:** Phase 1 **stub** only — marks Completed + archived. **Phase 2A** adds: signed portal URL, Application pre-fill from lead data, `lead_id` on Application document.  
- **CRITICAL Phase 1 action for Latha:** Add `lead_id: { type: String, default: null }` to the existing **Application** schema in the portal. **One line.** Zero cost. Prevents migration pain in Phase 2A.  

---

### PROTOTYPE — WHAT IS IN IT

**File:** `DEASSISTS-Portal-CRM-Phase1-Prototype-LOCKED-v2.html`  

**Pages:** Dashboard, `/leads` (no lead), `/leads` (lead open), `/leads` (comments), `/leads/new` (clean), `/leads/new` (duplicate), `/leads/new` (success), UI States  

**Features:** Collapsible sidebar (all pages), Status + Service filter dropdowns (AND logic), Sales tab placeholder (Details \| Comments \| Sales), dynamic Source Detail placeholder, routing preview, role comparison table, all 8 status badges, export demo  

---

### TOMORROW — FIRST TASKS (08.04.2026)

1. Confirm with **Latha:** role names match portal (`SUPER_ADMIN`, `MANAGER`, `STAFF`, `DATA_ENTRY`)  
2. **Latha** adds `lead_id: { type: String, default: null }` to Application schema  
3. Open Cursor → VEERABHADRA writes **Phase 0:** branch `feature/portal-crm-phase1` from `dev_v2`  
4. **Phase 1 starts:** `lead.schema.ts` — VEERABHADRA writes, Latha reviews, Latha commits  

**Reference document for build:** `DEASSISTS-MASTER-BUILD-PLAN-PHASE1-CRM-FINAL-v5.docx`

---

### PENDING / OPEN (not from today, carried forward)

- CMS login — backend must run simultaneously (from 31.03 session)  
- MongoDB seed — pending backend confirmation  
- Mobile app: second developer receiving JSX files and Postman collections  
- OpenClaw email pipeline — OpenClaw-dependent  
- Mac Mini M4 setup — when arrived  
- WATI webhook → CRM (Phase 2 connection)  

---

## BUILD EXECUTION MODEL — **LOCKED** (refined 06 April 2026)

- **BUILDERS:** **Shon + Claude** — **all implementation** is done by **Shon + Claude** using **Cursor** (code repo, e.g. `C:\deassists\`, per `workspace-guide.md`).  
- **Latha:** **reviews code before every commit and deploy** — does not build.  
- **All other team members:** provide **data and feedback only** — they do **not** build and do **not** decide product/technical direction.  
- **Decisions:** **no one else decides** — **Shon** owns decisions; Claude executes in Cursor under Shon’s direction.  
- **Timeline:** Phase 1 CRM / portal target **3–4 weeks**.  
- **Approach:** **One step at a time** — **test** after each step before the next.

---

## BRAIN ALIGNMENT — 06.04.2026 — Company Structure **Sector 01**

- **File:** `369-brain/memory/company-structure-sector-01.md` — what DeAssists is, live services (admissions ~90% revenue, accommodation early), revenue flow (~€630–€1,260 net/student model), team (~12), **Latha ↔ mobile developer handoff gap** (must fix before go-live), systems in use, current vs target operating model, bottlenecks, dependencies, 12-month success criteria
- **Sector 02 — CRM:** `369-brain/memory/crm-sector-02.md` (full alignment: Sheets reality, routing, daily use, portal Phase 1 checklist)  
- **Sector 03 — Sales Support:** `369-brain/memory/sales-support-sector-03.md` (full doc: CMS single source + 3 views, conversion flows, application sheet replacement plan)  
- **Sector 04 — Web Portal:** `369-brain/memory/portal-sector-04.md` (full: **dev_v2** codebase truth, island problem, critical bugs, P1–P5)  
- **Sector 05 — Mobile App:** `369-brain/memory/mobile-sector-05.md` (Expo RN, locked prototype, MVP/nav, deliverables, risks, build order portal-first)  
- **Sector 06 — Documentation:** `369-brain/memory/documentation-sector-06.md` (two-track reality, Operations Guide gap, staff vs brain, ownership rules, doc backlog P1–P3)  
- **Sector 07 — Automation & build order:** `369-brain/memory/automation-sector-07.md` (locked phases 1–5, Phase 1 portal CRM day-by-day: schema, routing service, lead ID, API, UI, migration, verification checklist + local dev confirmed)  
- **Sector 08 — OpenClaw & orchestration:** `369-brain/memory/openclaw-sector-08.md` (**CORE MODEL** — Claude / OpenClaw / Paperclip / Shon layers; **nothing skips a layer**)  
- **Sector 09 — Paperclip:** `369-brain/memory/paperclip-sector-09.md` (company OS, CEO dashboard sections, phases, OpenClaw under Paperclip, 4-phase timeline incl. **~Apr 10** Mac Mini)  
- **Sector 10 — Shon control layer:** `369-brain/memory/shon-control-layer-sector-10.md` (CEO touchpoints, daily rhythm, filter rules, build sequence 0–3)  
- **Sector 11 — Storage & connections:** `369-brain/memory/storage-connections-sector-11.md` (master map: MongoDB, S3, Sheets retire path, Gmail, workspaces, Mac Mini, connection matrix, GDPR notes)  
- **Sector 12 — MCP:** `369-brain/memory/mcp-sector-12.md` (GitHub, Gmail, Drive, Sheets, future Portal MCP; priority list; MCP ↔ OpenClaw loop) — **end of 12-sector arc**

---

## SESSION: 05.04.2026 — VEERABHADRA / Mobile App Sprint

### LOCKED BASELINE (public pages)
- **`deassists-mobile-prototype.html`** — final locked file (**public pages only**), 05 April 2026
- **Source (Shon):** `Downloads\MOBILE 369_Deassists\deassists-mobile-prototype.html`
- **Repo:** `design/outputs/deassists-mobile-prototype.html` — synced; single source of truth for public UI
- All future mobile build work for **public** flows references this file only

### LOCKED BASELINE (auth)
- **`deassists-auth-mobile-preview.html`** — reference for **mobile auth UI** (Sign In, Sign Up, reset flow, email sent, session expiry)
- **Source (Shon):** `Downloads\MOBILE 369_Deassists\deassists-auth-mobile-preview.html`
- **Repo:** `design/outputs/deassists-auth-mobile-preview.html` — synced
- **Note:** distinct from the public shell prototype; use for **auth-related** JSX only. Full **logged-in portal / journey** screens = separate when locked

### QUEUED — internal logged-in user (**not started**)
- **Next phase (when Shon says go):** **internal** screens for the **logged-in** user (e.g. journey / applications / document areas — exact scope TBD)
- **No lock yet:** there is **no** canonical HTML for this layer today; first step when we start = agree scope + lock a prototype (or extend repo with a named file)
- **Reference for that work:** `design/outputs/deassists-mobile-prototype.html` (public shell + tokens), `design/outputs/deassists-auth-mobile-preview.html` (auth patterns), plus **portal / journey** product brain (`369-brain/memory/portal.md` etc.) when relevant
- **Status:** deferred on purpose — only pick up when Shon starts this thread

### COMPLETED TODAY
- MVP scope classified into 3 tiers (Core 13 screens / Supporting 5 / Later 7)
- 4 user journeys mapped with weak points and missing product states identified
- Home page updated — browse-first CTA, admissions-focused subtitle, pathways replaced with trust section
- `deassists-rn.zip` delivered — 24 React Native screen files + AppNavigator + tokens.js
- `deassists-latha-api-guide.docx` delivered — Swagger setup steps, all 25 API endpoints, mobile dev guide

### FILES DELIVERED TO TEAM
- `deassists-mobile-prototype.html` → Latha (public UI reference)
- `deassists-auth-mobile-preview.html` → Latha + mobile dev (auth UI reference)
- `deassists-rn.zip` → Latha + mobile developer (24 JSX screen files)
- `deassists-latha-api-guide.docx` → Latha + mobile developer (backend + API handoff doc)

### NEXT SESSION — WHEN SHON RETURNS
- Latha: install Swagger in NestJS backend, export swagger.json + Postman collection
- Mobile developer: wire ProgramsScreen + AccommodationScreen to API using Postman collection
- Shon: confirm mobile developer onboarded and has received all files

### SHON STATUS
- Taking break to study Git, GitHub, AI tools, and automation theory

---

## SESSION CLOSE — 05.04.2026 — VEERABHADRA / Mobile HTML **LOCKED v11** (canonical **LOCKED**)

**Date:** 05.04.2026

### COMPLETED
- **Shot 1:** `deassists-mobile-complete.html` v2 — logo embedded, emails fixed
- **Shot 2:** `deassists-mobile-shot2.html` — interim canonical (superseded)
- **LOCKED v11:** `deassists-mobile-LOCKED 11.html` — copied to repo as `deassists-mobile-LOCKED-v11.html` (**historical**; superseded by **prototype**)
- **Code.gs:** no changes

### CANONICAL FILE (LOCKED) — public pages
- **`deassists-mobile-prototype.html`** — locked 05.04.2026 — single source of truth (**public pages**)

---

## SESSION CLOSE — 30.03.2026 (evening handoff to Shon)

**VEERABHADRA — what we did across this arc:**
- **Logo / drafts:** Stopped using wrong Next.js `des-logo.*` URL; pivoted to **Gmail sendAs `signature` as single source of truth** — scripts append only what the API returns; removed custom signature blocks and `email-brand.cjs`; added `gmail-signature.cjs` + wired `create-goeasy-draft-multipart.cjs`, `fix-goeasy-draft-and-signature.cjs`, `update-draft-append-signature.cjs`, `save-goeasy-reply-draft.cjs`.
- **Tokens:** `get-token.cjs` requires `refresh_token`; `gmail-api.cjs` **persists refreshed access token** to `deassists-token.json`; Gmail **never** uses `token.json`.
- **OAuth client alignment:** `gmail-api.cjs` **`OAUTH_PATH`** set to **`oauth-desktop-info.json`** (same as `get-token.cjs`) — fixes `unauthorized_client` on refresh/drafts.
- **Architecture:** **12 brains** in `MASTER-BRAIN-ARCHITECTURE.md`; new folders **`369-brain/legal/`**, **`brand/`**, **`developer/`** each with **`BRAIN.md`**; Legal vs Brand vs Finance boundaries documented.
- **Pre-test:** Confirmed token file has refresh token; draft script uses sendAs list; auto-refresh lives in **`gmail-api.cjs`** (not at top of each draft file).
- **Live check:** Test draft to **Don** (`don@deassists.com` per TEAM-HANDBOOK) — **draft id `r-7654518888444326004`**, not sent.

**Still open / next session:** Logo PNG on site `public/assets/email/deassists-logo-email.png` (Latha); optional tidy duplicate Gmail drafts from tests.

---

## SESSION: 30.03.2026 — VEERABHADRA (brain architecture)

- VEERABHADRA brain architecture finalised: **12 brains** (orchestrator VEERABHADRA + **eleven** domain sub-brains)
- **Three new sub-brains** created with `BRAIN.md`: **Legal** (`369-brain/legal/`), **Brand & Commercial** (`369-brain/brand/`), **Developer** (`369-brain/developer/`)
- **Legal Brain** owns: contracts, compliance, GDPR, **agreements** (client, partner, university, accommodation), **invoices** (formal company documents), legal templates, formal company documents
- **Brand & Commercial Brain** owns: **proposals** and **quotations** (sales-facing), posters, marketing materials, pitch decks, video editing pipeline, visual brand assets — **not** agreements or invoices (→ Legal)
- **Developer Brain** owns: code review, portal dev planning, Excel/Sheets tools and sheets architecture; reads **System**, **Product**, and **Automation** brains; human counterpart **Latha**; collaborates with all brains
- **Agreements** and **invoices** moved from Brand scope to **Legal** (Finance retains operational payment tracking / tools; Legal owns formal invoice documents — see `MASTER-BRAIN-ARCHITECTURE.md`)
- **Email signature** finalised in Gmail — **sendAs** is source of truth; scripts never inject custom signature HTML
- **Rafael / GoEasyBerlin** email scheduled manually; further draft automation follow-up next session as needed
- **Logo PNG** pending — Latha to deploy to `public/assets/email/deassists-logo-email.png` on the Next.js site
- **Draft scripts:** all future drafts fetch existing Gmail signature via **sendAs API** (default identity), never build signature from scratch

---

## SESSION: 28.03.2026 — VEERABHADRA (email draft + token policy)

- Rafael email sent (scheduled) ✅
- Draft script issue diagnosed: was building signature from scratch instead of fetching from Gmail sendAs API
- **Decision:** All future draft scripts must fetch the existing Gmail signature via sendAs API (`GET .../users/me/settings/sendAs`, row with `isDefault: true`), never build custom signature HTML in repo
- Logo PNG not yet deployed — Latha to add `/public/assets/email/deassists-logo-email.png` to Next.js site (for hosted images inside the Gmail-composed signature if needed)
- **Gmail signature in settings is the single source of truth** — scripts do not PATCH sendAs or inject alternate signature blocks; if sendAs `signature` is empty, append nothing
- `deassists-token.json`: `get-token.cjs` verifies `refresh_token` after OAuth; `gmail-api.cjs` persists refreshed access tokens automatically (Gmail automation must not use `token.json`)

---

## SESSION: 30.03.2026 — Communication Brain

### COMPLETED TODAY

#### GMAIL LABELS
- Full label system live in Gmail
- Flat list with colors — Gmail API limitation for true nesting
- Colors set via `set-label-colors.cjs`
- `Partners/GoEasyBerlin` created
- `Universities/GUS-BSBI` live
- `Germany/Tax-Marlies` deleted (duplicate)
- `Partners/BCBT-Portal` deleted (duplicate)
- `__migr` label cleaned up

#### INBOX LOGIC — LIVE
- `inbox-label-router.cjs` built
- `start-inbox-router.cjs` built
- `email-label-rules.cjs` built
- Runs every 30 minutes
- Logic: Email arrives INBOX → read → label applies
- **STAYS** in inbox: URGENT, ACTION-REQUIRED, WAITING-ON, Partners, Team, STARRED
- **LEAVES** inbox: AutoArchive, Tech, BizDev, Finance/Invoices, LexOffice, Revolut
- Logs to `logs/inbox-router.log`
- Needs token refresh to activate: `node scripts\email-system\get-token.cjs`

#### SCRIPTS BUILT TODAY
- `scripts/email-system/inbox-label-router.cjs`
- `scripts/email-system/start-inbox-router.cjs`
- `scripts/email-system/email-label-rules.cjs`
- `scripts/email-system/gmail-rebuild-label-hierarchy.cjs`
- `scripts/email-system/set-label-colors.cjs`
- `scripts/email-system/save-goeasy-reply-draft.cjs` (Gmail draft via API)

#### EMAIL DRAFTED — 30.03.2026
- Rafael/GoEasyBerlin partnership email drafted
- Saved to Gmail **Drafts** — awaiting Shon review and send (not sent by automation)
- **To:** rafael@goeasyberlin.de
- **Cc:** renan@goeasyberlin.de, contact@goeasyberlin.de
- **Subject:** Re: Our Collaboration — Next Steps & Proposal Framework
- **Key points:** DeAssists handles admissions; GoEasy handles on-ground Berlin services; cross-selling both channels; revenue share to be discussed after they share service list

### FUTURE AUTOMATION — OPENCLAW EMAIL PIPELINE
*When OpenClaw agent is ready, build this workflow (replaces manual drafting end-to-end):*

1. Shon sends short prompt from mobile (e.g. *"draft reply to Rafael about pilot dates"*)
2. OpenClaw reads `369-brain` for context
3. OpenClaw reads Gmail thread via `deassists-token.json`
4. Drafts email using Claude API
5. Saves to Gmail Drafts automatically
6. Shon reviews on phone → sends

**Dependency:** OpenClaw agent ready. Until then: rule *no email sent without Shon approval* stays; drafts-only API pattern as in `save-goeasy-reply-draft.cjs`.

### COMMUNICATION BRAIN STATUS — 30.03.2026
- **Gmail labels:** fixed, colored, live
- **Inbox logic:** `inbox-label-router.cjs` running every 30 mins
- **Rafael email:** drafted and in Gmail Drafts
- **Email auto-drafter:** architecture defined above; **OpenClaw-dependent**
- **Next:** process **Priority/URGENT** emails (**5** unread)

### PENDING NEXT
1. Token refresh → run inbox-label-router dry run → activate (if needed)
2. ~~Rafael/GoEasyBerlin thread — summarise + draft reply~~ → **done** (draft in Gmail)
3. Process Priority/URGENT (5 emails)
4. Process Priority/ACTION-REQUIRED
5. **OpenClaw email pipeline** (see above) — supersedes standalone "Claude API drafter" once agent exists
6. Daily digest script
7. Instagram ad form fix (Meta)
8. WhatsApp CTA fix on ads
9. WATI template Meta approval check (submitted 29.03)
10. Webhook WATI → CRM

### WATI STATUS (from yesterday 29.03)
- 3 flows published: University, Accommodation, Germany Services
- VEERABHADRA chatbot live
- Rule switched to VEERABHADRA
- 3 templates submitted for Meta approval
- Webhook pending

### KEY RULES
- Gmail token: `deassists-token.json` only (auto-refresh on API use; never `token.json` for Gmail)
- CRM token: `token.json` (never change)
- `MASTER-RUN.cjs` only for CRM
- `inbox-label-router` every 30 mins
- No email sent without Shon approval
- Save brain after every task block
- Every Cursor prompt must start with conflict check
