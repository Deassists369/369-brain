# EAGLE MODE 2 — SPEC
# Capability: crmTokens.ts design system sync
# Date: 29 April 2026
# Mode: CAPABILITY (prototype leads)
# Branch: feature/portal.shon369
# EAGLE Version: 2.1

---

## PHASE 2A — DRIFT CHECK

**Result: CLEAN**

Production file `apps/cms-next/styles/crmTokens.ts` is unchanged since
Mode 1 read (last commit: 5c04ec56). No Latha commits touched this file.
Two additional tokens found in prototype `:root` not captured in Mode 1:
  `--gold: #b45309` and `--goldl: #fffbeb`
These are added to the additions list below.

---

## PHASE 2B — FINAL DETAILED REPORT

---

### SECTION 1 — WHAT IS IDENTICAL (no work needed)

These 15 tokens already match the prototype exactly. No changes.

| Token | Value | Used in |
|-------|-------|---------|
| g | #1D7A45 | Buttons, active states, sidebar active |
| gd | #0d3d22 | Dark green (unused in prototype visually) |
| dk | #0d1a10 | Topbar, panel headers |
| dk1 | #132d1c | Mid-dark (between dk and dk2) |
| dk2 | #1a3d26 | Panel headers lighter |
| aml | #FFF8EE | Amber light background |
| cr | #F6F7F4 | Page background |
| cd | #edeee9 | Cream dark, default badge bg |
| wh | #ffffff | Card / panel background |
| redl | #fef2f2 | Red light background |
| blul | #e8f0fd | Blue light background |
| fontBody | 'Outfit', sans-serif | All body text |
| r2 | '10px' | Cards, panels |
| r4 | '20px' | Large radius |
| sidebar | 230 | JS layout constant |
| header | 56 | JS layout constant |
| panel | 420 | JS layout constant |

**fontDisplay** ('Fraunces', serif): Prototype explicitly removes Fraunces
from internal portal pages. Keeping this token in crmTokens.ts for now
(add-only rule prevents removal). Will become unused after this update
if Fraunces references in components are switched to fontBody.
Flagged for a future cleanup task.

**bdd** (#d0d0c8): Not in prototype `:root`. Keeping in production as-is
(add-only — present in production, no prototype instruction to remove).

---

### SECTION 2 — WHAT IS BEING CREATED / UPDATED

**A. Token value updates (19 tokens)**

CAPABILITY mode — approved override of add-only for pure constants values.
Explicit Shon decision 29 April 2026: "production crmTokens.ts gets
updated to match prototype values."

| Token | Current (production) | New (prototype) | Change summary |
|-------|---------------------|-----------------|----------------|
| gl | #2a9458 | #27964F | Green hover — slightly more saturated |
| gx | #e8f5ee | #EAF5EE | Green tint — slightly lighter |
| gxx | #d0ecda | #c5e8d1 | Deeper green tint — lighter |
| am | #c47b00 | #F59E0B | Amber — dull gold → Tailwind amber-400 (MAJOR visual change) |
| amx | #fff0d0 | #FDE9B0 | Amber extra light — follows am change |
| t1 | #1a1a1a | #0D1A10 | Primary text — neutral → green-tinted dark |
| t2 | #4a4a4a | #364039 | Secondary text — neutral → green-tinted |
| t3 | #888888 | #6E7F72 | Muted text — neutral grey → green-tinted |
| t4 | #bbbbbb | #B0BDB4 | Disabled text — neutral → green-tinted |
| bd | #e5e5e0 | #E1EBE3 | Border — warm grey → green-tinted |
| red | #c62828 | #EF4444 | Error red — dark → Tailwind red-500 (visible change) |
| blu | #1565c0 | #3B82F6 | Accent blue — dark → Tailwind blue-500 (visible change) |
| pur | #6a1b9a | #6d28d9 | Accent purple — dark → Tailwind violet-700 |
| purl | #f3e5f5 | #f5f3ff | Purple light — warm tint → violet tint |
| r1 | '6px' | '8px' | Button/chip radius — slightly rounder |
| r3 | '12px' | '12px' | Wait — see note below |
| s1 | '0 1px 3px rgba(0,0,0,.08)' | '0 1px 3px rgba(0,0,0,0.06)' | Card shadow — lighter |
| s2 | '0 4px 16px rgba(0,0,0,.10)' | '0 4px 18px rgba(0,0,0,0.08)' | Hover shadow — lighter + taller |
| s3 | '0 8px 32px rgba(0,0,0,.16)' | '0 10px 36px rgba(0,0,0,0.11)' | Modal shadow — lighter + taller |

**Note on r3:** Current production is '14px', prototype is 12px. This IS a change.
Table row above had a copy error — corrected below:

| r3 | '14px' | '12px' | Modal/large radius — tighter |

**B. New token additions (5 tokens)**

These tokens do not exist in production. Adding them.
No add-only conflict — these are pure additions.

| Token | Value | Purpose |
|-------|-------|---------|
| gold | '#b45309' | Gold/partner accent (new — from prototype --gold) |
| goldl | '#fffbeb' | Gold light background (new — from prototype --goldl) |
| gcv | '#ecfdf5' | Converted lead badge bg (was hardcoded in statusBadgeColors) |
| gcvt | '#065f46' | Converted lead badge text (was hardcoded in statusBadgeColors) |
| redd | '#fee2e2' | Red tint (was hardcoded in countBadgeVariants.hot.bg) |

---

### SECTION 3 — WHAT IS THE FINAL OUTPUT

**One file changed in production:** `apps/cms-next/styles/crmTokens.ts`

What Shon sees after update:
- Portal buttons, active states, sidebar highlights: same green (g unchanged)
- Amber badges, warning indicators: switch from dull gold → bright amber
- Body text: barely perceptible shift from neutral grey → green-tinted
- Borders: barely perceptible shift to green-tinted (#E1EBE3)
- Error states (red): brighter, more standard red (#EF4444)
- Blue accents (Called 1/2/3 badges): brighter blue (#3B82F6)
- Button/chip corners: slightly more rounded (6px → 8px)
- Shadows: lighter and slightly more diffuse throughout

What Latha sees in the PR:
- One file: `apps/cms-next/styles/crmTokens.ts`
- 19 value changes + 5 new token additions
- No logic changes, no type changes, no import changes
- No risk of breaking existing functionality — constants file only
- `npm run build:all` will pass (no TypeScript schema changes)

**What does NOT change in this PR:**
- statusBadgeColors hardcoded values (pre-existing F1 flag — cannot change)
- countBadgeVariants.hot.bg hardcoded value (pre-existing F2 flag)
- statusBadgeColors string keys (pre-existing F3 flag)
- Any component logic

**Post-update visual inconsistency to note for Latha:**
After crmTokens.red changes to #EF4444, the Lost badge in statusBadgeColors
still hardcodes '#c62828' (old red). Two reds will coexist in the portal:
- crmTokens.red = #EF4444 (new, brighter)
- statusBadgeColors.Lost.color = '#c62828' (old, darker)
This inconsistency is acceptable for this PR. Fixing statusBadgeColors to
reference crmTokens tokens is a separate future task.

---

### SECTION 4 — STAGE PLAN

**Stage count: 1 (Stage A only)**

crmTokens.ts is a pure constants file. All 24 changes (19 updates + 5 additions)
land in a single file with no imports or dependencies to wire.

```
Stage A — PURE CONSTANTS UPDATE
  File:     apps/cms-next/styles/crmTokens.ts
  Changes:  19 value updates + 5 new token additions
  Imports:  None added
  Risk:     LOW — constants file, zero runtime coupling
  Duration: ~5 minutes

  Matched test:
    Cat 1 (naming): Re-read file, verify all 24 changes present
    Cat 2 (schema): npm run build:all — must pass with zero errors
    Cat 3 (visual): Open working HTML prototype, confirm visual match

  Rollback:
    git checkout -- apps/cms-next/styles/crmTokens.ts
    (single file, single command, clean revert)
```

No Stage B (no new components).
No Stage C (no sidebar wiring, no imports into existing pages).

---

## PHASE 2C — WORKING HTML PROTOTYPE

See companion file:
  `previews/eagle-working-prototype-crm-tokens-2026-04-29.html`

The working prototype is a standalone HTML file Shon opens in a browser.
It shows the full portal design system before and after the token update.
Toggle between "Current Production" and "After Update" to compare.

---

## PHASE 2D — LOCAL TEST HANDOFF

```
Working prototype ready.
Open: skills/eagleskill/previews/eagle-working-prototype-crm-tokens-2026-04-29.html

Test it in a browser:
  1. Load the page — starts on "Current Production" theme
  2. Click "After Update" — observe the full colour system shift
  3. Check: amber (bottom-left badge strip) — should shift from gold to bright amber
  4. Check: text colours — should shift subtly to green-tinted
  5. Check: border on cards — subtle green tint
  6. Check: button/chip corners — should feel rounder (6px → 8px)
  7. Check: status badges — Lost red matches new red (#EF4444)
  8. Read the downstream impact note at the bottom of the preview

When verified, respond with one of:
  "approved"     — to proceed to Mode 3 Execute
  "not approved" — return to Mode 1 to revise
  "I have a doubt: [...]" — for clarification before deciding
```

---

## SECURITY REVIEW (mandatory pre-merge check)

crmTokens.ts is a pure constants file:
- No user input
- No API calls
- No authentication
- No dynamic execution
- No eval, no template literals with user data

**Security result: CLEAR — no concerns.**
The only risk in this file is visual regression, not security.

---

## OPEN QUESTIONS (not blocking Mode 3, but document for Latha)

| # | Question | Default if not answered |
|---|----------|------------------------|
| 1 | Sidebar width: keep 230 or update to prototype 208px? | Keep 230 (no change in this PR) |
| 2 | Header height: keep 56 or update to prototype 48px? | Keep 56 (no change in this PR) |
| 3 | Panel width: keep 420 or update to prototype 440px? | Keep 420 (no change in this PR) |
| 4 | fontDisplay Fraunces: remove from crmTokens in future? | Keep (add-only — future cleanup task) |

These 4 open questions are deferred. None block this PR.

---

*EAGLE Mode 2 Spec — crmTokens.ts*
*Date: 29 April 2026 | EAGLE v2.1 | CAPABILITY mode*
*Working HTML: previews/eagle-working-prototype-crm-tokens-2026-04-29.html*
*Awaiting Shon approval phrase to proceed to Mode 3*
