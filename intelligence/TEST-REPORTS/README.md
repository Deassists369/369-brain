# DeAssists — Playwright Test Reports
# Location: 369-brain/intelligence/TEST-REPORTS/
# Owner: Shon AJ | Brain: VEERABHADRA
# Created: 3 May 2026

## What goes here

One brief entry after every significant Playwright test run.
Not raw screenshots or traces — those are deleted automatically.
Just the finding and what we learned.

## Entry format

### [Date] — [Feature tested]
Result: PASS / FAIL
Key finding: [one sentence what we learned]
Action taken: [what was fixed or confirmed]

---

## Test History

### 3 May 2026 — Service Catalog Phase 2B
Result: PARTIAL — page compiles and returns HTTP 200 but automated login failed
Key finding: Playwright auth helper uses input[type="email"] selector but portal signin uses placeholder text selector
Action taken: Auth helper needs updating to use getByPlaceholder('your@email.com') instead
Status: Manual SUPER_ADMIN browser test confirmed /catalog loads correctly

### 3 May 2026 — Sidebar Permission Audit
Result: PASS — all 7 roles pass all 3 layers
Key finding: Sales Guide with requiredRole: SidebarRole.CallCenter allowed STAFF with Call Center DB role to see it
Action taken: Removed requiredRole from Sales Guide, added explicit permissionLevel to children
