# DeAssists — Learning Mind
# What the brain learned. How it evolved.
# Owner: Shon AJ | Brain: VEERABHADRA
# Evolves: every session close

---

## PURPOSE

This file captures what VEERABHADRA
learned each session.

Not what was built.
Not what was fixed.
What was UNDERSTOOD more deeply.

Every entry makes the brain smarter.
Every entry means the next session
starts ahead of where this one ended.

---

## LEARNING TEMPLATE

SESSION: [date]
DEEPENED UNDERSTANDING:
  [What do we understand better now?]
WRONG ASSUMPTIONS CORRECTED:
  [What did we believe that was wrong?]
PATTERNS IDENTIFIED:
  [What patterns emerged in how we work?]
OPEN QUESTIONS:
  [What do we not yet understand?]
CHALLENGE FOR NEXT SESSION:
  [What should VEERABHADRA push on next time?]

---

## LEARNING — 1 MAY 2026

SESSION: 1 May 2026 — Full day CRM build

DEEPENED UNDERSTANDING:
  The call center agent workflow is more
  fragile than we thought. Every extra click,
  every unclear label, every missing context —
  multiplied by 50 calls per day per agent
  = massive friction cost.
  The portal must be zero-friction first.
  Features second.

  The Guide Layer is not UX polish.
  It is core product infrastructure.
  A portal that trains itself is worth
  significantly more to a university
  than one that needs training programs.

  Backend field additions are genuinely
  low risk when truly additive.
  We should not let fear of backend changes
  slow frontend feature development.

WRONG ASSUMPTIONS CORRECTED:
  WRONG: useCustomQuery always needs result.data.data
  RIGHT: Depends on endpoint type.
         LIST = result.data.data
         SINGLE = result.data
         Always verify with JAM first.

  WRONG: Tooltips are polish — do later
  RIGHT: Tooltips are infrastructure — do with feature
         A feature without tooltips is not done.

  WRONG: Build fast then audit
  RIGHT: Audit after every build, not at end
         Fast without audit creates rework debt

PATTERNS IDENTIFIED:
  We harden fastest when bugs are painful.
  Every bug today added a permanent rule.
  The constitution grew by 4 rules in one session.
  This is the right pace.

  Cursor agent gets better prompts
  when VEERABHADRA reads the code first.
  Prompts written without reading code
  cause cascading fixes.

OPEN QUESTIONS:
  When does the Activity tab become
  the primary view instead of Details?
  As call history grows — should tabs reorder?

  Is the current sidebar structure right
  for when we have 10+ services?
  Will it scale visually?

CHALLENGE FOR NEXT SESSION:
  Before building Phase 2B Service Catalog —
  ask: "Is a catalog page the right answer?
  Or should services be discoverable
  inline in the lead workflow?"
  Challenge the assumption before building.
