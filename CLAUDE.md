# CLAUDE.md — DeAssists Codebase Intelligence

# Read this before every session. No exceptions.

# Last updated: 17 April 2026

---

## WHO OWNS WHAT

- Shon AJ — CEO, decision maker, builds with Claude Code
- Latha — developer, reviews ALL code before any commit. No merge without Latha sign-off. Role: SUPER_ADMIN.
- VEERABHADRA — master brain in Claude.ai project. Plans all features. Writes all prompts.
- Never commit directly to main or dev_v2. Always branch → Latha reviews → merge.

---

## MONOREPO STRUCTURE

```
Root: /Users/deassists369/deassists
apps/backend-nest/     NestJS API — port 8000
apps/cms-next/         Staff portal — port 4002
apps/website-next/     Public site — port 4001
libs/shared/           Shared enums, constants, helpers
libs/shared-ui/        UI components, layouts, sidebar renderer
```

---

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
- WRONG: GET /leads/:id then GET /leads/new (breaks routing — "new" treated as an ID)

### Frontend proxy

- cms-next calls /api/v1/\* which next.config.js rewrites to backend:8000
- Never hardcode localhost:8000 in frontend code

---

## SIDEBAR — TWO FILES, TWO DIFFERENT JOBS

## CORRECTED 17 Apr — previous version wrongly said menu lives in permission.helper.ts

The sidebar uses TWO files. Never confuse them:

- libs/shared/models/sidemenu.ts
  The SideMenu array — menu structure, titles, paths, icons, permissionLevel per item
  TO ADD OR CHANGE A NAV ITEM — edit this file only

- libs/shared/functions/permission.helper.ts
  The exclusivePermission() function — filters the menu by role at runtime
  TO CHANGE FILTERING LOGIC — edit this file, with extreme caution

Both files must be read before any sidebar work.
Sidebar audit skill must run before any commit touching either file.
UserTypes enum is in libs/shared/constants/user.types.ts — this is the role source of truth.
The sidebar is NOT a React component. It is a static config array filtered by role at runtime.

---

## PERMISSION HELPER — CLONE FILTER RULE (CRITICAL)

## ADDED 17 Apr — fix from commit af90417b was not documented

Fixed: commit af90417b — 17 April 2026

In permission.helper.ts the children filter MUST run on newItem.children
NEVER on x.children.

CORRECT: newItem.children = newItem.children?.filter((child: any) => {
WRONG: newItem.children = x.children?.filter((child: any) => {

Why: newItem is a deep clone of x. x is the original SideMenu array.
Filtering x.children permanently mutates the original array in memory.
Every role login after the first reads corrupted data. Gets worse with each role switch.
Symptoms: sidebar correct on first login — breaks on every subsequent role switch.
Tested fix: SUPER_ADMIN → MANAGER → AGENT → SUPER_ADMIN — all pass.

CE must verify this exact line after ANY edit to permission.helper.ts.

---

## GRANDCHILDREN FILTER — POSITION RULE (CRITICAL)

The grandchildren filter in permission.helper.ts MUST be INSIDE the isPermitted block.
If placed BEFORE isPermitted → every role sees every menu item → silent failure in production.
This is the single most dangerous structural mistake possible in this codebase.
CE must verify this position is correct after any edit to permission.helper.ts.

---

## NEXT.JS IMAGE RULE (CRITICAL)

## ADDED 17 Apr — fix from commit b67ce80f was not documented

Fixed: commit b67ce80f — 17 April 2026

All Next.js <Image> components for local images MUST have both width AND height props.

CORRECT: <Image width={230} height={60} src={desImage} alt={'logo'} />
WRONG: <Image width={230} src={desImage} alt={'logo'} />

Without height, Next.js cannot calculate aspect ratio and renders the alt text string instead.
This caused the sidebar logo to display as the word "logo" to every user.

---

## SECURITY — JWT SECRETS (ACTION STILL REQUIRED)

## ADDED 17 Apr — security fix from commit f5a9dc5c was not documented

Fixed: commit f5a9dc5c — 17 April 2026

apps/mui-cms-next/.env was committed to Git history and has been untracked.
Two secrets were exposed:
NEXT_PUBLIC_JWT_SECRET
NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET

.env is now in .gitignore. NEVER commit any .env file to Git ever again.

ACTION STILL REQUIRED: Latha must rotate both JWT secrets on the live server.
Old values are compromised until rotation is complete. HIGH priority.

---

## FILES THAT MUST NEVER BE TOUCHED

- apps/cms-next/pages/universitiesd/ — BCBT white-label (separate client)
- apps/backend-nest/src/core/entities/extendables/payment.entity.ts
- MASTER-RUN.cjs — Google Sheets CRM script, still live
- Any Stripe/payment logic
- apps/mui-cms-next/ — separate app, never modify for portal work

---

## CURRENT BRANCH

feature/portal.shon369 — active build branch
Do NOT switch branches mid-session without Shon explicit instruction.

---

## BUILD STATUS — 17 APRIL 2026

## CORRECTED 17 Apr — removed duplicate 13 Apr block and 15 Apr block. One block only. Always update this one.

| Area                                     | Status         |
| ---------------------------------------- | -------------- |
| Phase 1 Backend (6 lead files)           | COMPLETE ✅    |
| Phase 4 Queue View UI (7 files)          | COMPLETE ✅    |
| Phase 5A New Lead Form                   | COMPLETE ✅    |
| Phase 5B Sales Dashboard                 | COMPLETE ✅    |
| CE Installation + CLAUDE.md              | COMPLETE ✅    |
| UIUX Superman — Sidebar + Avatar         | COMPLETE ✅    |
| Role-Aware Avatar Dropdown               | COMPLETE ✅    |
| Dashboard Cleanup (Transactions removed) | COMPLETE ✅    |
| Dashboard Cards Visual Redesign          | COMPLETE ✅    |
| Git hygiene + security audit (7 commits) | COMPLETE ✅    |
| Q Intelligence fields + CallLogModal     | NOT STARTED 🔴 |
| New sidebar structure (LEAD_CRM role)    | NOT STARTED 🔴 |
| My Queue page                            | NOT STARTED 🔴 |
| Finance Section (CardTransactions)       | NOT STARTED 🔴 |
| Phase 6 Migration Script                 | NOT STARTED 🔴 |

---

## PENDING BLOCKERS — DO NOT IGNORE

1. assigned_to enum is EMPTY — needs 37 agent names from Google Sheets col K (=UNIQUE(K2:K9999))
2. 4 AWS ACL errors in accounts.service.ts and 3 other files — Latha to fix
3. Stripe write-back bug — payment status never saved to MongoDB
4. Security guard bypass at scope.guard.ts ~L79 — fix before production
5. JWT secrets must be rotated by Latha on live server — HIGH priority (see Security section)
6. LEAD_CRM + SALES_SETUP roles not yet in codebase

---

## LEAD ENTITY LOCATION

apps/backend-nest/src/leads/entities/lead.entity.ts
Collection: leads (CollectionNames.Leads)
Queue values: 369_CALL_CENTER | 369_CALL_CENTER_FU | BCBT_CALL_CENTER | BCBT_FOLLOW_UP | DON | ACCOMMODATION | SAJIR | UNROUTED

### Q Intelligence fields — to be added in next build session

## ADDED 17 Apr — field names locked here so Claude Code uses exact correct names when building

call_attempts: number — how many times this lead has been called
last_called_at: Date — timestamp of most recent call
last_outcome: string — no_answer | interested | not_now | converted | lost | wrong_lead
callback_at: Date — scheduled callback datetime (mandatory when outcome = interested or not_now)
callback_note: string — agent note about the callback

---

## TOOLS AND SETUP

### PM2 SERVERS (Mac Mini — do not restart unless something is broken)

pm2 status — check all 3 are running
pm2 logs — live logs
pm2 restart all — only if needed

### GRAPHIFY — KNOWLEDGE GRAPH

## ADDED 22 Apr — graphify installed and indexed

After every commit:
  cd ~/deassists && /opt/homebrew/bin/graphify update . --output ~/deassists-workspace/369-brain/graphify-out/

Start of every session in agent panel:
  /graphify .

Location: ~/deassists-workspace/369-brain/graphify-out/
Built: 22 April 2026
Files: 1771 | Nodes: 3983 | Edges: 3827

Graph lives in 369-brain — never inside the deassists portal repo.
VEERABHADRA reads GRAPH_REPORT.md from here every session.

### GRAPHIFY — UPDATE RULE (MANDATORY)

## ADDED 22 Apr

After EVERY commit to the deassists portal — run this immediately:

  cd ~/deassists && /opt/homebrew/bin/graphify update . --output ~/deassists-workspace/369-brain/graphify-out/

This is NOT optional. The knowledge graph must always match the current code.
If the graph is stale — Claude Code gives wrong answers about the codebase.

THE COMMIT CHECKLIST — in this exact order:
  1. git add [specific files]
  2. git diff --staged --name-only
  3. git commit -m "type(area): description"
  4. git push origin feature/portal.shon369
  5. /opt/homebrew/bin/graphify update . --output ~/deassists-workspace/369-brain/graphify-out/   ← ALWAYS LAST

At start of every Claude Code session — type in agent panel:
  /graphify .

---

## END OF SESSION — MANDATORY PROTOCOL

## UPDATED 17 Apr — added step 3: CLAUDE.md must be updated same session as any fix. Never later.

When session ends, run in Claude Code terminal:
"Session ending.

1. List all files created or modified today with full paths.
2. Update memory/session-state.md and memory/activity-log.md.
3. If any bug was fixed or any new rule discovered today — add it to CLAUDE.md now before closing.
4. Show me what was updated."

Brain files: ~/deassists-workspace/369-brain/memory/
CLAUDE.md: ~/deassists/CLAUDE.md

CLAUDE.md must be updated the same session any fix is made. Never later. Never next session.

---

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

7-step process: Read → Inventory → Design Interview → HTML Preview → Implement → Verify → Handoff
ONLY touches visual files in libs/shared-ui/
NEVER touches permission.helper.ts, sidemenu.ts, user.types.ts
Feature audit at Step 6 confirms zero features removed.

### Brainstorming (before complex features)

Use /brainstorm before writing any CE compound prompt for features
that involve architectural decisions or multiple possible approaches.

---

## DUAL CODEBASE WARNING — CRITICAL

Two parallel UI codebases exist:
libs/shared-ui/ ← PRIMARY — used by cms-next portal
apps/mui-cms-next/ ← SEPARATE app with duplicate components

For ALL portal work: ONLY modify libs/shared-ui/
Never modify apps/mui-cms-next/ for portal changes.

---

## CE WORKFLOW — HOW WE BUILD EVERY FEATURE

1. VEERABHADRA plans in Claude.ai
2. /ce:compound in Claude Code — CE reads CLAUDE.md automatically
3. Plan reviewed by Shon + VEERABHADRA before any execution
4. Superpowers enforces read-before-write at each step
5. Sidebar audit runs if any permission file touched
6. Browser check after any frontend page built — localhost:4002
7. Session-end protocol — update brain files AND CLAUDE.md
8. Latha gets plan + diff — reviews → commits

---

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

### Semantic colour language — LOCKED 16 April 2026

## ADDED 17 Apr — was missing from design system

- Green (#1D7A45) = positive, active, total counts, constructive actions
- Amber (#c47b00) = needs attention, open items, warnings
- Grey (#888888) = done, quiet, closed items, inactive
- Red (#c62828) = destructive actions only — Sign Out, Delete, Remove

### Cards — LOCKED 16 April 2026

- No box shadow — flat design only
- 1px border, colour #e5e5e0
- Border radius: 10px
- Table rows: bottom border only, hover rgba(29,122,69,0.03)

### Icons

- Library: mdi: ONLY — no emojis, no unicode, no other libraries
- 18px inline, 20px section headers, 24px page actions

### 4 data states — every component must handle ALL FOUR

- Loading: skeleton or spinner
- Empty: message + icon + CTA
- Error: visible failure message — never blank screen
- Populated: normal data

---

## GIT WORKFLOW RULES — LOCKED 17 APRIL 2026

These rules are permanent. Never break them.

### RULE 1 — Never use git add .

Always name specific files only.
CORRECT: git add apps/cms-next/components/Cards/CardTeamMembers.tsx
WRONG: git add .

### RULE 2 — Always verify staged files before committing

Run this before every single commit:
git diff --staged --name-only
Read every file on that list. If anything unintended is there — remove it:
git restore --staged [filename]

### RULE 3 — Never run Prettier on the whole codebase

CORRECT: npx prettier --write [specific file only]
WRONG: npx prettier --write .
WRONG: npx prettier --write apps/
The 06e81ce8 commit was a 1000+ file disaster caused by blanket Prettier. Never again.

### RULE 4 — Never push without Latha on a call

Build locally. Test locally. Commit locally.
Do not push until Latha is on a call and has reviewed the diff.
She is a reviewer, not a tester. Testing is our job before it reaches her.

### RULE 5 — Always test at localhost:4002 before committing

Every feature must be visually verified in the browser before any commit.
Check every role that should see the feature. Check nothing else broke.

### RULE 6 — One feature = one commit

Do not bundle unrelated changes into one commit.
One thing built → one thing committed → one clean message.

### RULE 7 — Commit message format

Always use this format:
type(area): what it does in plain English

Types: fix / design / feat / chore / style / security

## UPDATED 17 Apr — added security type

Examples:
fix(permissions): filter cloned children not original — fixes stale sidebar on role switch
design(dashboard): UIUX Superman card redesign — zero logic changes
feat(leads): add call log endpoint POST /leads/:id/call-log
security(env): untrack .env file — JWT secrets removed from Git

### RULE 8 — Latha handover message before every push

Send this on WhatsApp before pushing:

"Latha — pushing now.
Files changed:

1. [filename] — [one sentence what it does]
2. [filename] — [one sentence what it does]
   What to check: [specific thing to verify in browser]
   Branch: feature/portal.shon369
   Safe to pull."

### RULE 9 — Check git status at the start of every session

Before writing a single line of code, run:
git status
Understand every file sitting modified before touching anything.

### RULE 10 — Never commit the deassists submodule

The deassists submodule will always show as modified. Ignore it.
Never stage it. Never commit it.

### RULE 11 — Pre-commit hook is permanently removed

## ADDED 17 Apr — documents removal from commit be7aef2e

Removed: commit be7aef2e — 17 April 2026
The .husky/pre-commit hook was automatically running prettier --write . on every commit.
This caused the 1000+ file formatting disaster (commit 06e81ce8).
Deleted permanently. NEVER reinstall it or any blanket formatting hook.

### RULE 12 — CLAUDE.md is local only — never commit to Git

## ADDED 17 Apr — documents decision from commit be7aef2e

Untracked: commit be7aef2e — 17 April 2026
CLAUDE.md is a local tool file for Claude Code on the Mac Mini.
Latha does not need it. It must never appear in her diff.
It is now in .gitignore. Keep it there forever.

### RULE 13 — Never run Prettier under any circumstance

Never run npx prettier on any file for any reason.
Never format files that are not part of the current task.
This applies even if the file looks unformatted.
If Prettier output appears anywhere — run git restore . immediately.
Every prompt must start with "Read CLAUDE.md first" — this is what loads all rules.

### RULE 14 — One phase = one commit. Always confirm before committing.

## ADDED 19 Apr

Before making ANY commit — always ask Shon this question first:
"Is this feature/phase complete and fully tested in the browser?"

If Shon says YES → commit and push.
If Shon says NO → stage the files only. Never commit incomplete work.

git add = staging = safe, can always be undone
git commit = locking it = only when feature is 100% complete and tested

One feature or phase = exactly one commit. Never multiple commits for the same feature.
A complete phase (backend + frontend + sidebar) goes in one single commit.

Examples:
CORRECT: feat(crm): CRM Phase 1 complete — leads management system
WRONG: 6 separate commits for the same feature

The only exception: hotfixes approved by Latha get their own commit.

---

## CODE STANDARDS — LOCKED 21 APRIL 2026

### RULE 15 — Enums are non-negotiable

## ADDED 21 Apr — from CRM audit finding

Every repeated string value must be an enum.
Never use magic strings in any file.
If a value appears in more than one file — it belongs in a shared enum.
Lead enums location: libs/shared/constants/lead.constants.ts

Required enums before Phase 2 starts:
- LeadStatus — 'New' | 'Follow Up' | 'Called 1' | 'Called 2' | 'Called 3' | 'Converted' | 'Lost'
- LeadQueue — '369_MAIN' | 'BCBT' | 'ACCOMMODATION' | 'UNROUTED' (aligned across entity, service, dashboard)
- LeadSource — 'Partner' | 'Portal' | 'WhatsApp' | 'Instagram' | 'Phone' | 'Other'
- LeadService — service line enum (BCBT, 369, Accommodation etc)
- CallOutcome — 'no_answer' | 'interested' | 'not_now' | 'wrong_lead' | 'converted' | 'lost'
- SidebarRole — 'Call Center' | 'Sales Setup' — no magic strings in sidemenu.ts or permission.helper.ts
- CRM_ALLOWED_ROLES — replace repeated role arrays across all CRM controller endpoints

### RULE 16 — Read before writing

## ADDED 21 Apr — from CRM audit finding

Before writing any new file — read the existing files in that domain.
Match the patterns already in use.
Do not introduce new patterns unless the existing ones are broken.

### RULE 17 — Minimal changes only

## ADDED 21 Apr — from CRM audit finding

Fix only what is broken. Do not refactor working code in the same commit as a bug fix.
One concern per commit.

### RULE 18 — Never change behaviour, only organisation

## ADDED 21 Apr — from CRM audit finding

Extracting strings to enums, moving components to shared files, extracting constants — these are organisation changes.
They must never change what the code does.

---

## BACKEND RULES

- Every list endpoint must have pagination — never return unlimited records
- No raw MongoDB queries in controllers — always through service layer
- pm2 restart backend required after any change to permission.helper.ts
- Every write operation wrapped in try/catch with meaningful error message

---

## MOBILE APP WARNING

- The mobile app will consume the same NestJS API
- Any API contract change (endpoint URL, request/response shape) affects mobile
- Never change an existing API contract without checking mobile impact
- New endpoints are safe — modifications to existing ones are not

---

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

---

## ROLES TO ADD (next sidebar session)

Add to libs/shared/constants/user.types.ts:
LEAD_CRM = 'lead_crm'
SALES_SETUP = 'sales_setup'
Add both to UserTypesMapping after adding to enum.
Run sidebar audit after adding → pm2 restart backend → fresh login test per role.

---

## ACTIVE BUILD CONSTRAINTS

- No new npm packages in Phases 1–4 — use only existing monorepo packages
- Queue field is output of routing service only — never accepted as user input
- Lead ID is auto-generated on backend — never accepted as user input
- No email sent to any person without Shon explicit approval
- university_interest field does NOT affect routing — text capture only

---

## FILES AND FOLDERS THAT MUST NEVER BE COMMITTED TO GIT

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
CLAUDE.md ← local only — untracked 17 April 2026
_.local.yaml
.env (any directory)
env-format.env
Any _.html prototype or preview file
Any file in docs/superpowers/previews/

BEFORE EVERY COMMIT — RUN THIS CHECK:
git diff --staged --name-only
Read every file on that list.
If ANY tool folder or .env file appears — do NOT commit.
Remove from staging: git restore --staged [filename]

LATHA RULE:
If a diff contains more than 20 files — STOP.
Something has gone wrong with staging.
Come back to VEERABHADRA before pushing.

---

## SESSION END — ALWAYS SAVE TO 369-BRAIN

No matter which repo Cursor is open in — deassists or 369-brain —
brain files always go to one place only:
~/deassists-workspace/369-brain

### AT END OF EVERY SESSION — RUN THIS

Step 1 — Switch to 369-brain regardless of current directory:
cd ~/deassists-workspace/369-brain

Step 2 — Update brain files:
"Session ending.

1. List all files created or modified today with full paths.
2. Update memory/session-state.md — current build position, what was done, what is next.
3. Update memory/activity-log.md — full session summary with date, branch, files, decisions.
4. Update memory/decisions.md — any new decisions locked today.
5. If any service, technology, company or skills brain file changed today — update those too.
6. Show me every file that was updated."

Step 3 — Stage and commit only brain files:
git add memory/session-state.md
git add memory/activity-log.md
git add memory/decisions.md
git add [any other brain file that changed today]
git diff --staged --name-only
git commit -m "brain: session close DD Mon — [what changed in one line]"
git push origin main

Step 4 — Switch back to portal if needed:
cd ~/deassists

### THE ONE RULE

369-brain is the single destination for all session saves.
No exceptions. No matter where you are working.
Full save map: memory/session-workflow.md

---

## KARPATHY PRINCIPLES — MERGED 19 APRIL 2026

## SOURCE: Andrej Karpathy observations on LLM coding pitfalls

## These apply to every build task in this codebase without exception

### PRINCIPLE 1 — Think Before Coding

Never assume silently. Before writing any file or any line of code:

- State your interpretation of the task explicitly
- If multiple approaches exist — list them and ask which to use
- If anything is unclear — stop and ask before writing one line
- Never pick an interpretation silently and run with it
- If the request conflicts with any rule in this file — flag it immediately

### PRINCIPLE 2 — Simplicity First

Minimum code that solves the problem. Nothing speculative. Nothing extra.

- No files beyond what the task requires
- No abstractions for single-use code
- No extra fields, endpoints, or components that were not asked for
- No flexibility or configurability that was not requested
- If sidemenu.ts alone solves it — never touch permission.helper.ts
- If leads.controller.ts alone solves it — never create a new module
- If a feature can be built in 50 lines — never write 200
- Ask yourself: would a senior engineer say this is overcomplicated? If yes — simplify.

### PRINCIPLE 3 — Surgical Changes

Touch only what the task requires. Nothing more.

- Never improve, reformat, or reorganise adjacent code during a build task
- Never refactor files that are not part of the current task
- Never add or remove comments in files you were not asked to touch
- Never delete dead code unless explicitly instructed
- Never clean up unrelated imports or variables
- Every changed line must trace directly to the task at hand
- If you notice something broken nearby — report it to Shon, do not fix it silently
- This rule exists because silent adjacent changes have caused major disasters in this codebase

### PRINCIPLE 4 — Goal-Driven Execution

State a plan before acting. Never start executing without confirmation.
For every multi-step task, output this format before writing any code:

PLAN:
Step 1: [what I will do] → verify: [how we confirm it worked]
Step 2: [what I will do] → verify: [how we confirm it worked]
Step 3: [what I will do] → verify: [how we confirm it worked]

Wait for Shon to say "confirmed" or "proceed" before executing any step.
This is not optional. A plan without confirmation is not a plan.

---

## ZERO MISTAKES PROTOCOL — ADDED 22 APRIL 2026

## ADDED 22 Apr — applies to every task, every size

### WHEN THIS PROTOCOL RUNS

Every single time. No exceptions. This applies to:
- New feature builds
- Bug fixes
- Small changes
- Permission fixes
- Sidebar changes
- Any file touch at all

Bug fixes are MORE dangerous than new builds because
existing code already depends on the broken files.
Fix one place without reading all places = bug still exists
somewhere else.

The protocol adapts to the situation:
- New build: all 8 steps in full
- Bug fix: steps 1-3 are critical — find ALL locations first
- Small change: minimum steps 1, 2, 4, 7 always
