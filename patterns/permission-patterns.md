# Permission + Sidebar Patterns — DeAssists Portal

# Last updated: 27 April 2026

## TWO FILES, TWO JOBS — NEVER CONFUSE THEM

libs/shared/models/sidemenu.ts

  Menu structure: titles, paths, icons, permissionLevel per item

  TO ADD OR CHANGE A NAV ITEM: edit this file only

libs/shared/functions/permission.helper.ts

  exclusivePermission() function: filters menu by role at runtime

  TO CHANGE FILTER LOGIC: edit with extreme caution (see risk below)

## BEFORE ANY SIDEBAR WORK — MANDATORY

1. Read both files completely before touching either

2. Run sidebar audit after any change: type "run sidebar audit" in Claude Code

3. Sidebar audit must pass before commit — no exceptions

4. pm2 restart backend after any change to permission.helper.ts

5. Test minimum 2 roles in browser before committing

## RISK LEVELS

permission.helper.ts  MAXIMUM RISK — Latha must be present on call before push

sidemenu.ts           MEDIUM RISK — sidebar audit mandatory, test all affected roles

user.types.ts         MEDIUM RISK — role changes affect every page and every guard

## THE CLONE FILTER RULE — CRITICAL (fixed commit af90417b, 17 Apr)

CORRECT — filter the deep clone:

  newItem.children = newItem.children?.filter((child: any) => { ... });

WRONG — mutates original SideMenu in memory, corrupts all users on role switch:

  newItem.children = x.children?.filter((child: any) => { ... });

Symptom of wrong version: sidebar correct on first login, broken on every role switch after.

This is the single most dangerous line in the codebase.

## GRANDCHILDREN FILTER POSITION RULE

The grandchildren filter MUST be INSIDE the isPermitted block.

If placed before isPermitted: every role sees every menu item — silent production failure.

CE must verify this position after any edit to permission.helper.ts.

## THREE-LAYER ACCESS MODEL — ALL 3 REQUIRED (Rule 27)

Every CRM page has three separate access layers. All three must pass before feature complete.

Layer 1: Sidebar visibility

  Files: sidemenu.ts + permission.helper.ts

  Question: who sees the sidebar item?

Layer 2: Page guard

  Location: ALLOWED_ROLES array inside each page file

  Question: who can visit the URL?

Layer 3: Data permission

  Mechanism: useCustomQuery requires collection role assigned in database

  Question: who can fetch the actual data?

  Note: SUPER_ADMIN does not bypass data permissions automatically

## ROLE VISIBILITY — WHAT EACH ROLE SEES

SUPER_ADMIN   Everything

MANAGER       Dashboard, Call Center 369, Sales CRM, Services, Applications, Settings

STAFF         Dashboard + Applications only

AGENT         Services (/service/* paths) + Applications — never admin paths

TEAM_LEAD     CRM access via Call Center database role

USER          Student items only — zero admin items ever

## ADDING A NEW SIDEBAR ITEM — CHECKLIST

1. Edit sidemenu.ts only — add item with correct permissionLevel array

2. Run sidebar audit

3. Test every role that should see the item

4. Test every role that should NOT see the item

5. Verify parent permissionLevel includes all roles that children need

6. Run pm2 restart backend

7. Fresh login test per affected role

8. Commit only after all roles pass
