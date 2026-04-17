# CLAUDE.md — DeAssists Codebase Intelligence

# Read this before every compound plan. No exceptions.

## WHO OWNS WHAT

- Shon AJ — CEO, decision maker, builds with Claude Code
- Latha — backend developer, reviews ALL code before any commit. No merge without Latha sign-off.
- VEERABHADRA — master brain in Claude.ai project. Plans all features. Writes all prompts.
- Never commit directly to main or dev_v2. Always branch → Latha reviews → merge.

## MONOREPO STRUCTURE

Root: /Users/deassists369/deassists
apps/backend-nest/ NestJS API — port 8000
apps/cms-next/ Staff portal — port 4002
apps/website-next/ Public site — port 4001
libs/shared/ Shared enums, constants, helpers
libs/shared-ui/ UI components, layouts, sidebar renderer

## CRITICAL PATTERNS — READ BEFORE WRITING ANY FILE

### Entity pattern (backend)

- Files are ALWAYS .entity.ts — NEVER .schema.ts
- @Prop is imported from ../../types/mongoose.types — NOT from mongoose directly
- Example: import { Prop, Schema, SchemaFactory } from '../../types/mongoose.types'
- Enums are defined inline in @Prop decorators — no separate enums file in backend

### Auth pattern (cms-next frontend)

- ALWAYS: import { getCookie } from 'cookies-next'
- ALWAYS: const token = getCookie('token')
- ALWAYS: headers: { Authorization: `Bearer ${token}` }
- NEVER use session cookies or context for auth

### NestJS controller route order — CRITICAL

- Static routes MUST be registered BEFORE dynamic routes
- RIGHT: GET /leads/new then GET /leads/:id
- WRONG: GET /leads/:id then GET /leads/new (breaks routing)

### Sidebar — NOT a React component

- Sidebar is a static config array in libs/shared/functions/permission.helper.ts
- Filtered by exclusivePermission(data, user) — not in any JSX file
- To add a nav item: edit SideMenu array in permission.helper.ts ONLY
- UserTypes enum is in libs/shared/constants/user.types.ts — this is the role source

### Frontend proxy

- cms-next calls /api/v1/\* which next.config.js rewrites to backend:8000
- Never hardcode localhost:8000 in frontend code

## FILES THAT MUST NEVER BE TOUCHED

- apps/cms-next/pages/universitiesd/ — BCBT white-label (separate client)
- apps/backend-nest/src/core/entities/extendables/payment.entity.ts
- MASTER-RUN.cjs — Google Sheets CRM script, still live
- Any Stripe/payment logic

## CURRENT BRANCH

feature/portal-crm-phase1 — active build branch
Do NOT switch branches mid-session without Shon explicit instruction.

## BUILD STATUS AS OF 13 APRIL 2026

Phase 1 Backend (6 lead files) — COMPLETE
Phase 4 Queue View UI (7 files) — COMPLETE  
Phase 5A New Lead Form — COMPLETE
Phase 5B Sales Dashboard — COMPLETE
Next: Q Intelligence fields + CallLogModal + new sidebar structure

## PENDING BLOCKERS (do not ignore)

1. assigned_to enum is EMPTY — needs 37 agent names from Google Sheets col K
2. 4 AWS ACL errors in accounts.service.ts and 3 other files — Latha to fix
3. Stripe write-back bug — payment status never saved to MongoDB
4. Security guard bypass at scope.guard.ts ~L79 — fix before production

## LEAD ENTITY LOCATION

apps/backend-nest/src/leads/entities/lead.entity.ts
Collection: leads (CollectionNames.Leads)
Queue values: 369_CALL_CENTER | 369_CALL_CENTER_FU | BCBT_CALL_CENTER | BCBT_FOLLOW_UP | DON | ACCOMMODATION | SAJIR | UNROUTED

## PM2 SERVERS (Mac Mini — do not restart unless something is broken)

pm2 status — check all 3
pm2 logs — live logs
pm2 restart all — only if needed

## END OF SESSION — MANDATORY

When session ends, always run:
"Session ending. 1. List all files created/modified today with full paths. 2. Update memory/session-state.md and memory/activity-log.md. 3. Show me what was updated."
Brain files location: ~/deassists-workspace/369-brain/memory/

## SKILLS — MUST USE AT CORRECT MOMENTS

### Sidebar Audit Skill (MANDATORY)

Run BEFORE every commit touching:

- libs/shared/models/sidemenu.ts
- libs/shared/functions/permission.helper.ts
- libs/shared/constants/user.types.ts
  Trigger in Claude Code: "run sidebar audit"
  Checks: 4 runtime logic checks + 11 role verifications + gate chains
  NEVER commit sidebar/permission changes without this passing.

### UIUX Superman Skill (MANDATORY for visual redesigns)

7-step process: Read → Inventory → Design Interview → HTML Preview →
Implement → Verify → Handoff
ONLY touches visual files in libs/shared-ui/
NEVER touches permission.helper.ts, sidemenu.ts, user.types.ts
Feature audit at Step 6 confirms zero features removed.

### Brainstorming (before complex features)

Use /brainstorm before writing any CE compound prompt for features
that involve architectural decisions or multiple possible approaches.

## DUAL CODEBASE WARNING — CRITICAL

Two parallel UI codebases exist:
libs/shared-ui/ ← PRIMARY — used by cms-next portal
apps/mui-cms-next/ ← SEPARATE app with duplicate components
For ALL portal work: ONLY modify libs/shared-ui/
Never modify apps/mui-cms-next/ for portal changes.

## BUILD STATUS (as of 15 April 2026)

Phase 1 Backend (6 lead files) COMPLETE ✅
Phase 4 Queue View UI (7 files) COMPLETE ✅  
Phase 5A New Lead Form COMPLETE ✅
Phase 5B Sales Dashboard COMPLETE ✅
UIUX Superman Sidebar — Step 2 COMPLETE ✅ (Step 3 pending)
Q Intelligence fields NOT STARTED 🔴
New sidebar structure NOT STARTED 🔴
My Queue page NOT STARTED 🔴
CallLogModal NOT STARTED 🔴
Migration script Phase 6 NOT STARTED 🔴

## CE WORKFLOW — HOW WE BUILD EVERY FEATURE

1. VEERABHADRA plans in Claude.ai
2. /ce:compound in Claude Code — CE reads CLAUDE.md automatically
3. Plan reviewed by Shon + VEERABHADRA before any execution
4. Superpowers enforces read-before-write at each step
5. Sidebar audit runs if any permission file touched
6. Browser check after any frontend page built
7. Session-end protocol — update brain files
8. Latha gets plan + diff — reviews → commits

## DESIGN SYSTEM — LOCKED (all cms-next portal pages)

### Typography

- Page titles: Fraunces serif, 28px, weight 700, #0d1a10
- Section labels: Outfit, 11px, weight 600, UPPERCASE, letter-spacing 0.08em
- Body/inputs/labels: Outfit, 14px
- Helper text: Outfit, 12px
- Labels always ABOVE fields — never placeholder-only

### Colour tokens (always use crmTokens.ts — never hardcode hex)

- Primary green: #1D7A45 (crmTokens.g)
- Green hover: #2a9458 (crmTokens.gl)
- Green light bg: #e8f5ee (crmTokens.gx)
- Page bg: #F6F7F4 (crmTokens.cr)
- Card/panel bg: #ffffff (crmTokens.wh)
- Text primary: #1a1a1a (crmTokens.t1)
- Border: #e5e5e0 (crmTokens.bd)
- NEVER use #0D1A10 as active state background
- NEVER use #F6F7F4 for pill or badge backgrounds

### Icons

- Library: mdi: ONLY — no emojis, no unicode, no other libraries
- 18px inline, 20px section headers, 24px page actions

### 4 data states — every component must handle ALL FOUR

- Loading: skeleton or spinner
- Empty: message + icon + CTA
- Error: visible failure message — never blank screen
- Populated: normal data

## GIT RULES

- Never amend a commit that has already been pushed
- After push: always create a new commit
- Never commit to main or dev_v2 directly
- Latha gets: CE plan + diff + explanation — plan reviewed first

## BACKEND RULES

- Every list endpoint must have pagination — never return unlimited records
- No raw MongoDB queries in controllers — always through service layer
- pm2 restart backend required after any change to permission.helper.ts
- Every write operation wrapped in try/catch with meaningful error message

## MOBILE APP WARNING

- The mobile app will consume the same NestJS API
- Any API contract change (endpoint URL, request/response shape) affects mobile
- Never change an existing API contract without checking mobile impact
- New endpoints are safe — modifications to existing ones are not

## SIDEBAR FILES — BOTH MUST BE KNOWN

The sidebar uses TWO files — not one:

- libs/shared/models/sidemenu.ts ← SideMenu array (menu structure + permissionLevel)
- libs/shared/functions/permission.helper.ts ← exclusivePermission() gate logic

Both files must be read before any sidebar work.
Sidebar audit skill reads BOTH — run it before every commit touching either file.

## GRANDCHILDREN FILTER — MOST CRITICAL RULE IN CODEBASE

The grandchildren filter in permission.helper.ts MUST be INSIDE the isPermitted block.
If placed BEFORE isPermitted → every role sees every menu item → silent failure in production.
This is the single most dangerous structural mistake possible in this codebase.
CE must verify this position is correct after any edit to permission.helper.ts.

## ROLE VISIBILITY — WHAT EACH ROLE SEES

SUPER_ADMIN → everything
MANAGER → Dashboard, Call Center 369, Sales CRM, Services, Applications, Settings
ORG_ADMIN → Dashboard, Call Center 369, Sales CRM, Services, Applications, Settings
STAFF → Dashboard + Applications ONLY — zero settings, zero user management
AGENT → Services (/service/\* paths only) + Applications — never admin paths
LEAD_CRM → Call Center 369 ONLY — nothing else (role to be added)
SALES_SETUP → Sales CRM ONLY — nothing else (role to be added)
USER → Student items ONLY — zero admin items ever

Parent permissionLevel MUST always equal union of ALL child role arrays.
If a child is visible to MANAGER but parent excludes MANAGER — entire section hidden.

## ROLES TO ADD (next sidebar session)

Add to libs/shared/constants/user.types.ts:
LEAD_CRM = 'lead_crm'
SALES_SETUP = 'sales_setup'
Add both to UserTypesMapping after adding to enum.
Run sidebar audit after adding — then pm2 restart backend — then fresh login test.

## ACTIVE BUILD CONSTRAINTS

- No new npm packages in Phases 1-4 — use only existing monorepo packages
- Queue field is output of routing service only — never accepted as user input
- Lead ID is auto-generated on backend — never accepted as user input
- No email sent to any person without Shon explicit approval

## FILES AND FOLDERS THAT MUST NEVER BE COMMITTED TO GIT

These are tool-generated local files. They must NEVER be staged, 
committed, or pushed to any branch. Ever.

TOOL FOLDERS — NEVER COMMIT:
  docs/superpowers/
  .superpowers/
  .cursor/
  .compound-engineering/
  previews/
  specs/
  plans/
  tmp/

FILES — NEVER COMMIT:
  *.local.yaml
  env-format.env
  Any *.html prototype or preview file
  Any file in docs/superpowers/previews/

BEFORE EVERY COMMIT — RUN THIS CHECK:
  git status
  Read every file listed under "Changes to be staged"
  If ANY tool folder appears — do NOT stage it
  Only stage files that are actual codebase changes

SAFE FILES TO COMMIT (examples):
  apps/backend-nest/src/**
  apps/cms-next/pages/**
  apps/cms-next/components/**
  libs/shared/**
  libs/shared-ui/**
  CLAUDE.md
  .gitignore

LATHA RULE:
  If a diff contains more than 20 files — STOP
  Something has gone wrong with staging
  Come back to VEERABHADRA before pushing
---

## GIT WORKFLOW RULES — LOCKED 16 APRIL 2026

These rules are permanent. Never break them.

### RULE 1 — Never use git add .
Always name specific files only.
CORRECT: git add apps/cms-next/components/Cards/CardTeamMembers.tsx
WRONG: git add .

### RULE 2 — Always verify staged files before committing
Run this before every single commit:
git diff --staged --name-only
Read every file on that list. If anything is there that you did not intentionally change — remove it before committing.
To remove a file from staging: git restore --staged [filename]

### RULE 3 — Never run Prettier on the whole codebase
If formatting is needed, run it only on specific files we worked on:
CORRECT: npx prettier --write [specific file]
WRONG: npx prettier --write .
WRONG: npx prettier --write apps/
The 06e81ce8 commit was a 1000+ file disaster caused by blanket Prettier. Never again.

### RULE 4 — Never push without Latha on a call
Build locally. Test locally. Commit locally. Do not push until Latha is on a call and has reviewed the diff. She is a reviewer, not a tester. Testing is our job before it reaches her.

### RULE 5 — Always test at localhost:4002 before committing
Every feature must be visually verified in the browser before a commit is made. Check every role that should see the feature. Check nothing else broke.

### RULE 6 — One feature = one commit
Do not bundle unrelated changes into one commit. One thing built, one thing committed, one clean message.

### RULE 7 — Commit message format
Always use this format:
type(area): what it does in plain English

Types: fix / design / feat / chore / style
Examples:
fix(permissions): reset stale state in exclusivePermission
design(dashboard): UIUX Superman card redesign — zero logic changes
feat(leads): add call log endpoint POST /leads/:id/call-log

### RULE 8 — Latha handover message before every push
Send this on WhatsApp before pushing:

"Latha — pushing now.
Files changed:
1. [filename] — [one sentence what it does]
2. [filename] — [one sentence what it does]
What to check: [specific thing to verify in browser]
Branch: feature/portal-crm-phase1
Safe to pull."

### RULE 9 — Check git status at the start of every session
Before writing a single line of code, run git status. Understand every file that is sitting modified before touching anything.

### RULE 10 — Never commit the deassists submodule
The deassists submodule will always show as modified. Ignore it. Never stage it. Never commit it.

