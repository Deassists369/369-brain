# Sidebar Audit Skill
# Owner: VEERABHADRA | Updated: 18 April 2026

## TRIGGER
Any commit touching:
- libs/shared/models/sidemenu.ts
- libs/shared/functions/permission.helper.ts
- libs/shared/constants/user.types.ts

## WHAT IT CHECKS
- Grandchildren filter is INSIDE isPermitted block — not before it
- SUPER_ADMIN bypass exists
- Clone filter uses newItem.children not x.children
- Every role sees exactly the correct menu items
- Parent permissionLevel equals union of all child roles

## RULE
NEVER commit sidebar or permission changes without this audit passing.
Run: "run sidebar audit" in Claude Code to trigger.
