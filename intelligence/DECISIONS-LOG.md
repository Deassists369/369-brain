# DeAssists — Decisions Log
# Every significant decision. Permanently recorded.
# Owner: Shon AJ | Brain: VEERABHADRA

---

## HOW TO USE THIS FILE

Every time a significant decision is made:
  Architecture choice
  Feature direction
  Technology selection
  Business model decision
  Design philosophy lock

Add an entry using the template below.
Never delete entries.
Only add.

---

## DECISION TEMPLATE

DATE: [date]
DECISION: [what was decided in one sentence]
CONTEXT: [what problem were we solving]
OPTIONS CONSIDERED:
  A) [option] — [why rejected or chosen]
  B) [option] — [why rejected or chosen]
CHOSEN: [which option and why]
RISKS ACCEPTED: [what could go wrong]
REVIEW DATE: [when to check if this still holds]
LESSON: [what this taught us]

---

## DECISIONS — 1 MAY 2026

DATE: 1 May 2026
DECISION: Add call_log array to backend additively
CONTEXT: Activity tab needs per-call history
         but backend only stored aggregate fields
OPTIONS CONSIDERED:
  A) Wait for Latha to add — rejected
     Too slow, blocks Activity tab
  B) Build frontend with placeholder — partial
     Done as interim, but not sufficient
  C) Add call_log array additively — chosen
     Zero risk to existing data
     Immediately enables Activity tab
CHOSEN: C — additive backend field
RISKS ACCEPTED: Latha must review on PR
REVIEW DATE: 1 June 2026
LESSON: Additive backend changes are low risk
        when they do not touch existing fields

---

DATE: 1 May 2026
DECISION: Q Intelligence block lives above tabs permanently
CONTEXT: Where to place call intelligence data
         in the lead detail panel
OPTIONS CONSIDERED:
  A) Inside Details tab — rejected
     Requires tab click, adds friction
     Multiplied by 50 calls per agent per day
  B) Above tabs — chosen
     Always visible, zero friction
     Scalable for AI recommendations
CHOSEN: B — permanently above tabs
RISKS ACCEPTED: Takes vertical space in panel
REVIEW DATE: When AI layer is added
LESSON: High-frequency information must be
        zero-click accessible always
