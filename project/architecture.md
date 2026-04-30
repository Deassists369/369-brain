# Architecture — DeAssists Portal
# Currency verified via git log — not by date in this file

## MONOREPO STRUCTURE
Root: ~/deassists/
apps/backend-nest/    NestJS API — port 8000
apps/cms-next/        Staff portal — port 4002  ← all portal work happens here
apps/website-next/    Public site — port 4001
apps/mui-cms-next/    SEPARATE app — NEVER touch for portal work

libs/shared/
  constants/          user.types.ts, collections.ts, lead.constants.ts, endpoints.enum.ts
  functions/          permission.helper.ts (MAXIMUM RISK)
  models/             sidemenu.ts
  interfaces/         all shared interfaces
libs/shared-ui/       UI components, layouts, sidebar renderer — PRIMARY for portal UI
libs/react-query/
  queries/            named hook files per module (leads.ts, account.ts, model.ts)
  src/index.ts        core hooks: useCustomQueryV2, useCustomMutationV2, useCustomDelete

## WHERE NEW CODE GOES
New page:             apps/cms-next/pages/[section]/[page].tsx
New component:        apps/cms-next/components/[section]/[Component].tsx
New API hooks:        libs/react-query/queries/[module].ts then export from queries/index.ts
New shared UI:        libs/shared-ui/src/
New backend module:   apps/backend-nest/src/[module]/ (entity + service + controller + module)
New enum or constant: libs/shared/constants/[file].ts
New endpoint:         libs/shared/constants/endpoints.enum.ts

## BRAIN REPOSITORY STRUCTURE
Root: ~/deassists-workspace/369-brain/

  CLAUDE.md                    Mission control — read first every session
  CODING-CONSTITUTION.md       All coding rules — read before any code

  project/
    vision.md                  ERP vision — what we are building and why
    PRD.md                     Module requirements — what each module does
    feature-registry.md        All features — status, priority, dependencies
    architecture.md            This file — where code lives
    design-system.md           Tokens and visual rules
    never-touch.md             Files that cannot be modified

  memory/
    session-lock.md            Session integrity — check before starting
    session-state.md           Current build position — updated every session
    decisions.md               Locked decisions — append only
    activity-log.md            Session history — append only

  patterns/
    api-patterns.md            4-layer chain and hook patterns
    permission-patterns.md     Sidebar and access patterns
    git-workflow.md            Git discipline rules
    anti-ambiguity.md          Pre-code checklist

  skills/
    eagleskill/                EAGLE prototype-to-production bridge
    session-start/             Session start skill and boot sequence
    uiux-superman/             UI redesign skill
    salesdocskill/             Sales document skill
    deassists-sidebar-audit/   Sidebar permission audit

  prototypes/
    deassists-platform.html    Source prototype — 5659 lines

  change-logs/
    BRANCH-CHANGE-LOG-portal.shon369.md   Per-task change log for Latha

## FRONTEND PROXY
cms-next calls /api/v1/* which next.config.js rewrites to backend:8000
Never hardcode localhost:8000 in any frontend file.
Use /api/v1/ paths only.

Environments:
  Local dev: localhost:4002
  QA:        qa-portal.deassists.com
  Prod:      portal.deassists.com (via develop branch)

## BACKEND PATTERNS
Entity files:  always .entity.ts — never .schema.ts
@Prop import:  from ../../types/mongoose.types — never from mongoose directly
Route order:   static routes MUST be before dynamic :id routes
  RIGHT:  GET /leads/queues  then  GET /leads/:id
  WRONG:  GET /leads/:id     then  GET /leads/queues  (breaks — queues treated as id)

## AUTH
axios-client.ts handles auth automatically.
It reads the JWT token and attaches Authorization header to every request.
Components never handle tokens. Named hooks never handle tokens.
Just call the hook — auth is automatic.

## STARTING SERVERS
npm run cms:serve
npm run website:serve
npm run backend:serve
All three must be running. Never start only one or two.

## PM2 COMMANDS (Mac Mini)
pm2 status          check all 3 running
pm2 stop cms        graceful shutdown — NEVER use kill -9
pm2 restart all     only if needed

Recovery if portal crashes:
  pm2 stop all && rm -rf apps/cms-next/.next && pm2 start all

## BRANCH FLOW
feature/portal.shon369  ← active build branch (Shon + VEERABHADRA)
         ↓ Latha reviews and merges
dev_v2                  ← development integration branch
         ↓ Latha merges
qa                      ← QA branch → qa-portal.deassists.com
         ↓ Latha merges after QA passes
develop                 ← production → live portal for all staff

## LEADS MODULE — BACKEND ENDPOINTS
GET    /v1/leads/queues        queue counts
GET    /v1/leads/stats         dashboard stats
GET    /v1/leads/export        CSV export
POST   /v1/leads               create lead
GET    /v1/leads               list leads (paginated)
GET    /v1/leads/:id           get one lead
PUT    /v1/leads/:id           update lead
POST   /v1/leads/:id/comments  add comment
POST   /v1/leads/:id/call-log  log a call — Phase 2A uses this
POST   /v1/leads/:id/convert   convert lead

## KNOWN BACKEND ISSUE
Backend running from dist/apps/backend-nest/main.js
nx serve crashes on TS2769 error in accounts.service.ts:1276
This is pre-existing Blocker 2 — Latha owns the fix.
Do not attempt to fix this via nx serve workaround.
