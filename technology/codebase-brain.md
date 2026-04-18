# DeAssists — Codebase Brain
# Owner: Shon AJ | Brain: VEERABHADRA
# Updated: 18 April 2026

## MONOREPO STRUCTURE
Root: /Users/deassists369/deassists
apps/backend-nest/     NestJS API — port 8000
apps/cms-next/         Staff portal — port 4002
apps/website-next/     Public site — port 4001
libs/shared/           Shared enums, constants, helpers
libs/shared-ui/        UI components, layouts, sidebar renderer

## CRITICAL PATTERNS

### Entity pattern (backend)
- Files are ALWAYS .entity.ts — NEVER .schema.ts
- @Prop imported from ../../types/mongoose.types — NOT mongoose directly
- Enums defined inline in @Prop decorators

### Auth pattern (cms-next frontend)
- ALWAYS: import { getCookie } from 'cookies-next'
- ALWAYS: const token = getCookie('token')
- ALWAYS: headers: { Authorization: `Bearer ${token}` }

### NestJS controller route order
- Static routes MUST be before dynamic routes
- RIGHT: GET /leads/new then GET /leads/:id
- WRONG: GET /leads/:id then GET /leads/new

### Frontend proxy
- cms-next calls /api/v1/* — next.config.js rewrites to backend:8000
- NEVER hardcode localhost:8000 in frontend

## SIDEBAR — TWO FILES
- libs/shared/models/sidemenu.ts — SideMenu array (menu structure)
- libs/shared/functions/permission.helper.ts — exclusivePermission() filter logic
- To add nav item: edit sidemenu.ts ONLY
- Both files must be read before any sidebar work

## PERMISSION HELPER — CLONE FILTER RULE (CRITICAL)
Fixed: commit af90417b — 17 April 2026
CORRECT: newItem.children = newItem.children?.filter((child: any) => {
WRONG:   newItem.children = x.children?.filter((child: any) => {
Filtering x.children mutates original SideMenu permanently in memory.
Symptoms: sidebar correct on first login — breaks on every role switch after.

## GRANDCHILDREN FILTER — POSITION RULE
Must be INSIDE isPermitted block — never before it.
If placed before: every role sees every menu item — silent production failure.

## DUAL CODEBASE WARNING
libs/shared-ui/ — PRIMARY — used by cms-next portal
apps/mui-cms-next/ — SEPARATE — never modify for portal changes

## NEXT.JS IMAGE RULE
Fixed: commit b67ce80f — 17 April 2026
All local images MUST have both width AND height props.
Missing height = Next.js renders alt text instead of image.

## PM2 SERVERS
pm2 status — check all 3 running
pm2 stop cms — graceful shutdown (NEVER use kill -9)
pm2 restart all — only if needed
Recovery: pm2 stop all && rm -rf apps/cms-next/.next && pm2 start all

## ACTIVE BUILD CONSTRAINTS
- No new npm packages in Phases 1-4
- Queue field set by routing service only — never user input
- Lead ID auto-generated on backend — never user input
- No email sent without Shon explicit approval
- university_interest does NOT affect routing — text capture only

## FILES NEVER TO TOUCH
- apps/cms-next/pages/universitiesd/ — BCBT white-label
- apps/backend-nest/src/core/entities/extendables/payment.entity.ts
- MASTER-RUN.cjs — Google Sheets CRM script still live
- Any Stripe/payment logic
