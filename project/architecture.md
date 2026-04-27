# Architecture — DeAssists Portal

# Last updated: 27 April 2026

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

## FRONTEND PROXY

cms-next calls /api/v1/* which next.config.js rewrites to backend:8000

Never hardcode localhost:8000 in any frontend file.

Use /api/v1/ paths only.

Environments:

  Local dev: localhost:4002

  QA:        qa-portal.deassists.com  ← testers always test here, not localhost

  Prod:      portal.deassists.com (via develop branch)

## BACKEND PATTERNS

Entity files:  always .entity.ts — never .schema.ts

@Prop import:  from ../../types/mongoose.types — never from mongoose directly

Route order:   static routes MUST be before dynamic :id routes

  RIGHT:  GET /leads/queues  then  GET /leads/:id

  WRONG:  GET /leads/:id     then  GET /leads/queues  (breaks — "queues" treated as id)

## AUTH — HOW IT Wos-client.ts handles auth automatically.

It reads the JWT token and attaches the Authorization header to every request.

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

dev_v2                  ← development

         ↓ Latha merges

qa                      ← QA branch → qa-portal.deassists.com

         ↓ Latha merges after QA passes

develop                 ← production → live portal for all staff

## LEADS MODULE �T    /v1/leads/queues        queue counts

GET    /v1/leads/stats         dashboard stats

GET    /v1/leads/export        CSV export

POST   /v1/leads               create lead

GET    /v1/leads               list leads (paginated)

GET    /v1/leads/:id           get one lead

PUT    /v1/leads/:id           update lead

POST   /v1/leads/:id/comments  add comment

POST   /v1/leads/:id/call-log  log a call — Phase 2 uses this

POST   /v1/leads/:id/convert   convert lead
