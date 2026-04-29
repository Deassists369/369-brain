# EAGLE MODE 1 — ROUND 1 GAP REPORT
# Task: crmTokens.ts
# Date: 29 April 2026
# Branch: feature/portal.shon369
# EAGLE Version: 2.1

---

```
═══ EAGLE STOP — BEFORE THE GAP REPORT ═══

What I found:
  The prototype (deassists-platform.html) contains systematic "skill:"
  annotations across its CSS variables. These comments say things like:
    --gl:#27964F;   /* skill: 27964F, was 2a9458 */
    --t1:#0D1A10;   /* skill: 0D1A10, was 1a1a1a */
    --bd:#E1EBE3;   /* skill: E1EBE3, was e5e5e0 */
    --r1:8px;       /* skill: 8px */
    --am:#F59E0B;   /* warning amber per skill */

  There are 8 tokens where the prototype was INTENTIONALLY updated with
  new "skill" values that differ from production. The old production
  values are preserved as "was [old]" comments.

Why I stopped:
  In MIGRATION mode, production wins ties — meaning all 8 "skill"
  discrepancies should result in the prototype being REVERTED to
  match production.

  But the "skill:" comment pattern strongly suggests VEERABHADRA
  intentionally updated these values as design improvements during
  the prototype design process. Reverting them would LOSE those
  design decisions.

  This creates a mode declaration conflict: the task was declared
  MIGRATION, but the evidence points toward CAPABILITY (prototype
  leads, production catches up).

Rule cited:
  EAGLESKILL.md — "If neither prototype nor production is right
  (rare but real), EAGLE flags the discrepancy in Mode 1 and STOPS."

  Also: "In MIGRATION mode: prototype was wrong, update prototype
  to match production. Override with explicit Shon instruction."

Options:

  A. STAY IN MIGRATION MODE
     All 8 "skill:" values revert to production values in the prototype.
     The "was [value]" comments are already the production values, so
     reversions are straightforward.
     Consequence: the design improvements in the prototype are lost.
     Use if: the "skill:" values were exploratory notes, not decisions.

  B. SWITCH TO CAPABILITY MODE for this task
     The prototype's "skill:" values are treated as approved design
     decisions. Production crmTokens.ts gets updated to match the
     prototype values via add-only update (replace old values, since
     they are constants, not logic).
     Consequence: design system gets upgraded in production.
     Use if: the "skill:" values were explicitly decided in VEERABHADRA
     chat and the prototype was updated to reflect those decisions.

  C. SPLIT THE TASK (hybrid approach)
     Group A ("skill:" annotated tokens) → CAPABILITY mode: prototype
     leads, production catches up.
     Group B (tokens that differ with no "skill:" comment) → MIGRATION
     mode: production wins, prototype is corrected.
     Consequence: more surgical, but two mode tracks on one task.
     Use if: only the annotated tokens were decided, others were drift.

What I recommend:
  Option B or C. The density and specificity of "skill:" comments (8 tokens
  across multiple categories: hover, text, border, radius, amber, red, blue,
  purple) suggests a deliberate design system decision was made in VEERABHADRA
  chat. If that's correct, CAPABILITY mode is the right track.

What I need from Shon:
  Were the "skill:" annotated token values decided in a VEERABHADRA chat
  session as approved design improvements? If yes → Option B or C.
  If the prototype was an experiment and no decision was made → Option A.

Return to VEERABHADRA chat for:
  This mode declaration decision. It determines whether the next step
  is reverting the prototype (MIGRATION) or updating crmTokens.ts
  (CAPABILITY). EAGLE will not proceed until the answer is clear.

═══════════════════════════════════════════
```

---

## ROUND 1 — GAP REPORT (all issues documented regardless of mode outcome)

**Date:** 29 April 2026
**Mode declared:** MIGRATION (pending clarification — see STOP above)
**Round:** 1 of N

### What was read this round

- `apps/cms-next/styles/crmTokens.ts` — production design token file (88 lines)
- `prototypes/deassists-platform.html` — CSS `:root` block (lines 10–58) and CSS rules (lines 60–200)
- `skills/eagleskill/eagle-baseline-system-readout.md` — Sections 5 and 6

---

## ISSUE GROUPS

Issues are grouped to aid decision-making after the STOP above.
Group A = "skill:" annotated tokens (mode decision required).
Group B = tokens that differ with no annotation (MIGRATION wins these regardless).
Group C = naming/structure mismatches.
Group D = tokens in production but absent from prototype.
Group E = design/architecture divergences.
Group F = hardcoding violations (flag only — cannot modify existing code in MIGRATION).

---

### GROUP A — "SKILL:" ANNOTATED TOKENS (Mode decision required)

These 8 tokens were intentionally updated in the prototype. Their old (production)
values are preserved in "was [value]" comments.

| # | Token | Production | Prototype | Prototype note | Category | Risk |
|---|-------|-----------|-----------|----------------|----------|------|
| A1 | gl | #2a9458 | #27964F | "skill: 27964F, was 2a9458" | Cat 3 — Visual | MEDIUM |
| A2 | am | #c47b00 | #F59E0B | "warning amber per skill" | Cat 3 — Visual | MEDIUM |
| A3 | t1 | #1a1a1a | #0D1A10 | "skill: 0D1A10, was 1a1a1a" | Cat 3 — Visual | MEDIUM |
| A4 | t2 | #4a4a4a | #364039 | "skill: 364039, was 4a4a4a" | Cat 3 — Visual | MEDIUM |
| A5 | t3 | #888888 | #6E7F72 | "skill: 6E7F72, was 888888" | Cat 3 — Visual | MEDIUM |
| A6 | bd | #e5e5e0 | #E1EBE3 | "skill: E1EBE3, was e5e5e0" | Cat 3 — Visual | MEDIUM |
| A7 | r1 | '6px' | 8px | "skill: 8px" | Cat 3 — Visual | MEDIUM |
| A8 | r3 | '14px' | 12px | "skill: 12px, was 14px" | Cat 3 — Visual | MEDIUM |

**Pattern observed:** The t1/t2/t3 updates move from neutral-grey text (#1a1a1a,
#4a4a4a, #888888) to green-tinted-dark text (#0D1A10, #364039, #6E7F72). This is
a deliberate brand-consistency decision — body text becomes subtly green-tinted.
The am update shifts from dull gold to bright Tailwind amber (#F59E0B).
The bd update shifts from warm-grey border to green-tinted border (#E1EBE3).

**Matched test if Group A resolves as CAPABILITY:**
  Cat 3 — Visual/UX: browser preview comparing old vs new colour palette.
  Since all 8 are color/radius constants, they trigger a SINGLE visual test
  (open prototype or localhost with new values applied).

---

### GROUP B — UNDOCUMENTED VALUE MISMATCHES (production wins in MIGRATION)

These differ between prototype and production, but the prototype has no "skill:" comment
indicating intentional change. In MIGRATION mode, production values stand; prototype
corrects to match.

| # | Token | Production | Prototype | Notes | Category | Risk |
|---|-------|-----------|-----------|-------|----------|------|
| B1 | gx | #e8f5ee | #EAF5EE | Small real difference (R: 0xE8 vs 0xEA) | Cat 3 — Visual | LOW |
| B2 | gxx | #d0ecda | #c5e8d1 | Different deeper green tint | Cat 3 — Visual | LOW |
| B3 | amx | #fff0d0 | #FDE9B0 | Different amber light | Cat 3 — Visual | LOW |
| B4 | t4 | #bbbbbb | #B0BDB4 | Text disabled / icon | Cat 3 — Visual | LOW |
| B5 | red | #c62828 | #EF4444 | Dark red vs Tailwind red-500 | Cat 3 — Visual | MEDIUM |
| B6 | blu | #1565c0 | #3B82F6 | Dark blue vs Tailwind blue-500 | Cat 3 — Visual | MEDIUM |
| B7 | pur | #6a1b9a | #6d28d9 | Dark purple vs Tailwind violet-700 | Cat 3 — Visual | LOW |
| B8 | purl | #f3e5f5 | #f5f3ff | Purple light — different tint | Cat 3 — Visual | LOW |

**Note on B5/B6/B7:** red, blu, pur in the prototype are Tailwind standard palette values
(red-500, blue-500, violet-700). This matches the same pattern as the Group A "skill:"
updates. It is possible these WERE intended as "skill:" updates but the comment was not
added. Worth asking Shon: were the semantic colors (red, blu, pur) also part of the
approved design update?

**MIGRATION correction for Group B:** Prototype `:root` values for gx, gxx, amx,
t4, red, blu, pur, purl should be updated to match production values.

---

### GROUP C — SHADOW SYSTEM NAMING + VALUE MISMATCH

| # | Element | Production | Prototype | Category | Risk |
|---|---------|-----------|-----------|----------|------|
| C1 | Shadow 1 | s1: '0 1px 3px rgba(0,0,0,.08)' | --sh1: 0 1px 3px rgba(0,0,0,0.06) | Cat 1 — Naming | MEDIUM |
| C2 | Shadow 2 | s2: '0 4px 16px rgba(0,0,0,.10)' | --sh2: 0 4px 18px rgba(0,0,0,0.08) | Cat 1 — Naming | MEDIUM |
| C3 | Shadow 3 | s3: '0 8px 32px rgba(0,0,0,.16)' | --sh-modal: 0 10px 36px rgba(0,0,0,0.11) | Cat 1 — Naming | MEDIUM |

**Three problems here:**
1. **Naming:** production uses s1/s2/s3, prototype uses --sh1/--sh2/--sh-modal. Different key names.
2. **Values differ:** opacity differs (production stronger: 0.08/0.10/0.16 vs prototype softer: 0.06/0.08/0.11).
3. **Semantic meaning of s3:** production s3 is generic "large shadow"; prototype --sh-modal is modal-specific.

**In MIGRATION mode:** production names (s1/s2/s3) and values win. Prototype needs to rename
--sh1→s1, --sh2→s2, --sh-modal→s3 AND update to production opacity values.

**However:** if Group A resolves as CAPABILITY, shadow values should be considered too —
the lighter opacity in the prototype may be intentional (consistent with lighter, more
modern feel of the other "skill:" updates).

---

### GROUP D — TOKENS IN PRODUCTION NOT IN PROTOTYPE

These tokens exist in crmTokens.ts but have no CSS variable in the prototype.
In MIGRATION mode: they should be added to the prototype `:root` block.

| # | Token | Production value | Notes | Category | Risk |
|---|-------|----------------|-------|----------|------|
| D1 | gd | #0d3d22 | Dark green — not used visually in prototype? | Cat 1 — Naming | LOW |
| D2 | dk1 | #132d1c | Mid dark — between dk and dk2 | Cat 1 — Naming | LOW |
| D3 | bdd | #d0d0c8 | Dark border — not seen in prototype CSS | Cat 1 — Naming | LOW |
| D4 | r4 | '20px' | Large radius — not in prototype CSS vars | Cat 1 — Naming | LOW |

**Correction for MIGRATION mode:** Add these 4 vars to prototype `:root` with production values.

---

### GROUP E — DESIGN / ARCHITECTURE DIVERGENCES

These are not simple token value mismatches — they represent design decisions.

| # | Element | Production | Prototype | Category | Risk |
|---|---------|-----------|-----------|----------|------|
| E1 | fontDisplay | 'Fraunces', serif | NOT in prototype | Cat 3 — Visual | MEDIUM |
| E2 | sidebar width | 230 (JS constant) | 208px (hardcoded CSS) | Cat 3 — Visual | MEDIUM |
| E3 | header height | 56 (JS constant) | 48px (hardcoded CSS) | Cat 3 — Visual | MEDIUM |

**E1 — Fraunces:**
Prototype comment (line 148): "PAGE HEADER — clean, no Fraunces (skill: Outfit only on internal pages)"
Prototype comment (line 172): "KPI CARDS — skill: Outfit only, no Fraunces"
Prototype explicitly overrides Fraunces with Outfit on internal portal pages.
This is an intentional prototype decision, not an omission.
In MIGRATION mode, production (which has `fontDisplay: 'Fraunces'`) wins.
But this appears to be a deliberate scope decision: Fraunces belongs on the public
website, not the internal portal. This may need discussion.

**E2/E3 — Layout dimensions:**
Production: `sidebar: 230`, `header: 56` as JS numeric constants.
Prototype: hardcodes `width:208px` in `.sidebar{}` and `height:48px` in `.topbar{}`.
The prototype layout is slightly more compact (208 vs 230 sidebar, 48 vs 56 header).
These are not CSS variable tokens in the prototype — they're in the layout CSS rules.
The JS constants in crmTokens.ts are used in TypeScript component inline styles.

---

### GROUP F — HARDCODING VIOLATIONS IN EXISTING FILE (MIGRATION: FLAG ONLY)

Cannot be corrected in MIGRATION mode (add-only rule prohibits modifying existing code).
Surfacing for VEERABHADRA discussion and future CAPABILITY task planning.

**F1: statusBadgeColors uses hardcoded hex values**
```typescript
// In crmTokens.ts, lines 72-84:
export const statusBadgeColors = {
  New:         { bg: '#e8f5ee', color: '#1D7A45' },   // should be crmTokens.gx, crmTokens.g
  'Follow Up': { bg: '#fff8ee', color: '#c47b00' },   // should be crmTokens.aml, crmTokens.am
  'Called 1':  { bg: '#e8f0fd', color: '#1565c0' },   // should be crmTokens.blul, crmTokens.blu
  'Called 2':  { bg: '#e8f0fd', color: '#1565c0' },   // same as Called 1
  'Called 3':  { bg: '#e8f0fd', color: '#1565c0' },   // same as Called 1
  Converted:   { bg: '#ecfdf5', color: '#065f46' },   // NO crmTokens equivalent ← new tokens needed
  Lost:        { bg: '#fef2f2', color: '#c62828' },   // should be crmTokens.redl, crmTokens.red
};
```
Two missing tokens in crmTokens: '#ecfdf5' (Converted bg) and '#065f46' (Converted text).
These should be named (e.g., `gcv: '#ecfdf5'` and `gcvt: '#065f46'`) and added to the
main crmTokens object if/when this file is updated.

**F2: countBadgeVariants.hot.bg is hardcoded**
```typescript
hot: { bg: '#fee2e2', color: crmTokens.red },
```
'#fee2e2' is a red tint not in crmTokens. Should be a named token (e.g., `redd: '#fee2e2'`).

**F3: statusBadgeColors uses string keys instead of LeadStatus enum**
Keys 'New', 'Follow Up', 'Called 1', etc. are hardcoded strings, not references
to LeadStatus enum values. Violates the no-hardcoding rule (Decision: 25 Apr 2026).

---

## CONVERGENCE DELTA

N/A — Round 1.

---

## RISK SUMMARY

| Risk level | Issue count | Groups |
|------------|-------------|--------|
| BLOCKED | 0 | — |
| HIGH | 0 | — |
| MEDIUM | 11 | A1-A8, C1-C3, E1-E3 |
| LOW | 12 | B1-B8, D1-D4 |
| FLAG ONLY | 3 | F1-F3 |

---

## ISSUES BY RESOLUTION PATH

**Requires mode decision (STOP above) before proceeding:**
  A1, A2, A3, A4, A5, A6, A7, A8 — the "skill:" tokens

**Resolved by MIGRATION regardless of STOP outcome:**
  B1, B2, B3, B4, B5*, B6*, B7, B8 — prototype reverts to production values
  (* B5/B6 may belong to Group A — see note above)

**Requires VEERABHADRA discussion beyond token values:**
  C1-C3 (shadow naming + semantic)
  E1 (Fraunces decision — architectural, not just a value)
  E2-E3 (layout dimensions — compact vs standard)
  F1-F3 (hardcoding violations — future CAPABILITY task)

---

## MATCHED TESTS QUEUED

Once STOP is resolved and corrections begin:

| Issue group | Test category | Test |
|-------------|--------------|------|
| Group A (if CAPABILITY) | Cat 3 — Visual | Browser preview, old vs new palette side by side |
| Group B | Cat 3 — Visual | Re-read prototype :root block, verify exact string match |
| Group C | Cat 1 — Naming | Re-read crmTokens.ts and prototype :root, verify name alignment |
| Group D | Cat 1 — Naming | Re-read prototype :root, confirm 4 tokens present with correct values |
| Group E1 | Cat 3 — Visual | Open prototype in browser, verify Fraunces vs Outfit rendering |
| Group E2-E3 | Cat 3 — Visual | Open prototype in browser, verify layout dimensions |

---

## WHAT EAGLE WILL NOT DO UNTIL STOP IS RESOLVED

- Write or modify any production file
- Write or modify the prototype file
- Move to Round 2
- Move to Mode 2

---

*EAGLE Mode 1 — Round 1 — crmTokens*
*Date: 29 April 2026*
*Status: STOPPED — awaiting Shon mode decision*
*26 issues documented (23 actionable + 3 flag-only)*
*Next action: Shon answers STOP question in VEERABHADRA chat*
