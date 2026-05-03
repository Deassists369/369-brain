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

---

## MODE 1 REVIEW — ANSWERS FROM SHON (3 May 2026, 17:14 UTC+2)

These answers are LOCKED for Mode 2 spec + HTML preview generation.

### Q1 — AGENT in "Manage User Accounts"
**Decision:** Keep AGENT in `permissionLevel`. Scope is handled by backend —
agents see only users they created.
**Required code comment** above the `permissionLevel` array of "Manage User Accounts":
`// AGENT — scoped to own users only via role.permissions.`
Do NOT remove AGENT from this menu.

### Q2 — AGENT in "Applications" tree
**Decision:** Keep AGENT in `permissionLevel`. Scope is handled by backend —
agents see only applications from students they referred.
**Required code comment** above the `permissionLevel` array of "Applications":
`// AGENT — scoped to referred students only via role.permissions.`
Do NOT remove AGENT from this tree.

### Q3 — SidebarRole.Finance and SidebarRole.Vendor
**Decision:** Keep both as forward-looking constants. Do NOT remove.

### Q4 — Sales Guide
**Decision:** Sales Guide is REMOVED as a top-level section.
Service Catalog and Sales Library MOVE under "Call Center 369" as children.
This is a structural change to `SideMenu`. Add-only rule: this restructures
existing entries — Mode 3 will document the move clearly and Latha reviews.

### Q5 — TEAM_LEAD CRM access
**Decision:**
- TEAM_LEAD SEES "Call Center 369" and ALL its children including the new
  Service Catalog and Sales Library children (Q4).
- TEAM_LEAD does NOT see "Sales CRM".

### Q6 — STAFF scope
**Decision:** Confirmed correct. STAFF sees Dashboard + Applications only.

### Q7 — ORG_OWNER CRM menus
**Decision:** ORG_OWNER sees CRM menus for their own tenant — READ-ONLY.
Add ORG_OWNER to `permissionLevel` of "Call Center 369" and "Sales CRM"
(post Q4 restructure). Read-only enforcement is via backend `role.permissions`
for ORG_OWNER role; sidebar visibility is the menu gate only.

### Q8 — Split SideMenu into Internal + Student
**Decision:** Do NOT split in this ticket. Add as a future ticket in
`project/feature-registry.md` titled `sidebar-split-internal-student`.
Mode 3 will append this entry to feature-registry.md as part of execution.

### Q9 — Service Setup > Services leaves
**Decision:** YES — every leaf under "Service Setup > Services" gets an
explicit `permissionLevel` array. This decouples sidebar visibility from
`role.permissions` and prevents silent menu loss for BCBT.
Default `permissionLevel` for these 12 leaves:
`[SUPER_ADMIN, ORG_OWNER, ORG_ADMIN, MANAGER]`
(Mode 2 to confirm exact list per leaf in the spec.)

---

## APPROVAL PHRASE
`approved mode1 sidebar-restructure` — given by Shon at 3 May 2026 17:14 UTC+2.
