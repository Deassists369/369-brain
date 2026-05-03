# TICKET: sidebar-restructure
# Created: 3 May 2026
# Owner: Shon AJ | Brain: VEERABHADRA
# Harness: eagle-harness

## Goal
Restructure the DeAssists portal sidebar so every role sees only the
sections that match their job. The audit will replay role-by-role
(SUPER_ADMIN, ORG_ADMIN, MANAGER, TEAM_LEAD, STAFF, AGENT, ORG_OWNER)
across all three permission layers.

## Why
- Sidebar drift across recent phases left some roles seeing pages they
  cannot actually open, and some roles missing items they should see.
- AGENT must never see internal portal sections (locked decision).
- BCBT onboarding (September 2026) requires a clean role->menu map
  that other tenants will inherit.

## Scope
Brain-side spec + HTML preview only in this run. Portal code is not
changed by the harness — the Mode 3 stage will produce the change set
for Latha. Files in scope (read-only at the spec stage):
- libs/shared/models/sidemenu.ts
- libs/shared/functions/permission.helper.ts
- apps/cms-next/components — any sidebar consumers

## Workflow expectation
The eagle-harness will run, in order:
  1. /data-check       — confirm data state for sidebar config
  2. /eagle-mode1      — gap report vs current sidemenu.ts
  PAUSE for "approved mode1 sidebar-restructure"
  3. /eagle-mode2      — full spec + HTML preview saved to
     ~/deassists-workspace/369-brain/previews/sidebar-restructure.html
  PAUSE for "approved sidebar-restructure"
  4. /eagle-mode3      — risk-ordered execution stages
  5. /sidebar-audit    — three-layer audit, all roles must PASS
  6. (conditional)     — full restart sequence if sidemenu.ts or
                         permission.helper.ts changed
  7. /latha-handover   — PR package for Latha

## Acceptance criteria
- Three-layer access audit: PASS for every role.
- No AGENT sees any internal sidebar item.
- BCBT-style external tenant inherits the same map cleanly.
- Latha handover package prepared with one capability per commit.

## Notes for the harness
- This ticket touches sidemenu.ts and permission.helper.ts, so the
  orchestrator will trigger the full restart sequence after Mode 3.
- Constants must exist before components — A1 of the Constitution.
- No file in NEVER-TOUCH list is in scope.
