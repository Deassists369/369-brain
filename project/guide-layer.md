# DeAssists — The Guide Layer
# Design System for Self-Explaining UI
# Owner: Shon AJ | Brain: VEERABHADRA
# Location: 369-brain/project/guide-layer.md
#
# This document defines how DeAssists portal
# teaches itself to every user automatically.
# No training required. No manuals needed.
# The portal explains itself.

---

## THE IDEA

Most SaaS portals have tooltips.
DeAssists has a Guide Layer.

The difference:
  Tooltips are static text added as afterthought.
  The Guide Layer is a living intelligence layer
  that adapts to who is using the portal
  and how experienced they are.

This is our product differentiator.
When selling to universities we say:
  "Your staff never need training on our software.
   The portal trains them automatically from day one."

---

## THE THREE MODES

### MODE 1 — LEARNING (day 1 to day 7)
  Who:    New user, first week
  Signal: User has visited this page fewer than 5 times
  Shows:  Full help text visible everywhere
            Outcome explanations before actions
            Process position indicators
            Green helper cards on first visit
  Goal:   Zero confusion on day one

### MODE 2 — WORKING (day 7 to day 30)
  Who:    Familiar user, building habits
  Signal: User has visited this page 5 to 20 times
  Shows:  Help text collapsed to ⓘ icons
            Tooltips on hover only
            Hints appear only when user is stuck
  Goal:   Efficient without overwhelming

### MODE 3 — EXPERT (day 30 and beyond)
  Who:    Experienced user, knows the system
  Signal: User has visited this page more than 20 times
  Shows:  Maximum information density
            Zero visible help text
            One ? per section for reference
            Everything else hidden
  Goal:   Speed and power for expert users

Implementation note for now:
  Build MODE 1 first for all features.
  MODE 2 and MODE 3 come after BCBT launch.
  Today: all users see MODE 1.
  Future: detect experience level and adapt.

---

## THE FIVE GUIDE ELEMENTS

### ELEMENT 1 — TOOLTIP
  When:   On every button, icon, badge, CTA
  How:    title attribute or custom hover element
  Rules:
    Start with a verb
    Say what happens as a result
    Maximum 2 sentences
    Never use technical words
    Write for someone on day one

  Examples:
    Log Call button:
      "Record what happened in your call.
       Updates this lead's status automatically."

    Save button:
      "Save changes to this lead's details."

    Queue badge:
      "The team queue this lead belongs to.
       Change it in the Update Lead section below."

    Status badge:
      "Where this lead is in the sales journey.
       Tap Log Call to update it after each call."

### ELEMENT 2 — FIELD HELPER TEXT
  When:   Below every input field
  How:    Small grey text 11px below the input
  Rules:
    Explains WHY this field matters
    Not just what format to use
    Disappears after user has filled it
    Returns if field is cleared

  Examples:
    University Interest field:
      "Which university is this student most
       interested in? Helps route to the right coordinator."

    Callback note field:
      "e.g. Call after 6pm, wants IELTS info.
       Saved with this call for your reference."

    Quick note field:
      "Private note about this call.
       Only you and managers can see this."

### ELEMENT 3 — SECTION HEADER HELP
  When:   On complex sections with multiple fields
  How:    ⓘ icon after section title
          Hover or click shows explanation card
  Rules:
    Explains the whole section purpose
    Explains what to do in it
    Written in plain English
    Dismissable with Got it

  Examples:
    CALL INTELLIGENCE ⓘ:
      "This tracks every call you make to this lead
       automatically. After each call, click Log Call
       and choose what happened. The AI uses this
       data to suggest the best next action."

    UPDATE LEAD ⓘ:
      "Change this lead's status and queue here.
       Status reflects where they are in the journey.
       Queue determines which team works on them."

### ELEMENT 4 — PROCESS INDICATOR
  When:   At top of any multi-step workflow
  How:    Subtle breadcrumb showing position
  Rules:
    Never more than 5 steps shown
    Current step highlighted in green
    Plain English step names

  Examples:
    Log Call flow:
      1 Choose outcome → 2 Add details → 3 Log it

    Lead journey:
      New → Called → Interested → Converted

### ELEMENT 5 — FIRST VISIT CARD
  When:   First time user visits a page or section
  How:    Green tinted card slides in
          Plain English explanation
          One Got it button
          Never appears again after dismissed
  Rules:
    Maximum 3 sentences
    One clear action to dismiss
    Store dismissal in user preferences
    Role-specific content

  Examples:
    First visit to Leads page (call center role):
      "Welcome to your lead queue.
       Every lead here is a student who needs your help.
       Click any lead to see their details and log your calls."
      [Got it →]

    First time opening CallLogModal:
      "After every call — log what happened here.
       Choose an outcome and the system updates
       everything automatically. Takes 10 seconds."
      [Got it →]

---

## THE LANGUAGE RULES

These apply to every word written in the Guide Layer.

### NEVER use technical language
  NEVER:  Submit, Mutation, Cache, Entity, Query
  ALWAYS: Save, Update, Refresh, Lead, Search

### ALWAYS explain the outcome
  NEVER:  "Click Log Call"
  ALWAYS: "Click Log Call to save this call and
            update the lead's status automatically"

### ALWAYS use we and you
  NEVER:  "The system will process the request"
  ALWAYS: "We will update this lead for you"

### ALWAYS write for day one
  Test: Would a 20-year-old on their first day
        understand this without asking anyone?
  If NO — rewrite it.

### MAXIMUM LENGTH
  Tooltip:        2 sentences, max 20 words each
  Helper text:    1 sentence, max 15 words
  Section help:   3 sentences, max
  First visit card: 3 sentences, max

---

## THE VISUAL DESIGN

All Guide Layer elements use this visual system.
Never deviate from these styles.

### COLORS (from crmTokens)
  Background:   crmTokens.gx  (#e8f5ee)
  Border:       crmTokens.gxx (#d0ecda)
  Icon color:   crmTokens.g   (#1D7A45)
  Text:         crmTokens.t3  (muted grey)
  Heading:      crmTokens.t1  (primary dark)

### TYPOGRAPHY
  Helper text:  11px, Outfit, crmTokens.t3
  Section help: 12px, Outfit, crmTokens.t2
  Card text:    13px, Outfit, crmTokens.t1
  Always Outfit — never Fraunces in guide elements

### SPACING
  Helper text margin-top: 4px
  Section help margin-left: 6px
  First visit card padding: 16px
  Always tight — never bulky

### ICONS
  Information: ⓘ
  Success:     ✓
  Process:     →
  Warning:     ⚠️
  Never use custom icon libraries for guide elements
  Use these Unicode symbols only

---

## IMPLEMENTATION ORDER

Build guide elements in this order per feature.
Never ship a feature without at least Layer 1.

LAYER 1 — Tooltips (ship with every feature)
  Every CTA gets a title attribute.
  Every icon gets a title attribute.
  Takes 10 minutes per component.
  No excuse to skip this.

LAYER 2 — Helper text (ship with every feature)
  Every input field gets helper text below.
  Every empty state gets guidance text.
  Takes 20 minutes per component.
  Required before Latha PR.

LAYER 3 — Section help ⓘ (ship with complex sections)
  Any section with 3 or more fields.
  Any section that confused a user in testing.
  Takes 30 minutes per section.

LAYER 4 — First visit cards (Phase 2 priority)
  Every page gets one for call center role.
  Every page gets one for ORG role (BCBT etc).
  Requires user preference storage.
  Build after BCBT onboarding in September.

LAYER 5 — Mode switching (Phase 3)
  Experience detection via visit count.
  Progressive disclosure of help.
  Build after 3 months of real usage data.

---

## THE DAY ONE TEST

Before shipping any feature ask:

  "A new call center agent joins today.
   They have never seen this portal.
   No one has time to train them.
   Can they complete this task alone?"

If the answer is NO — the feature is not done.
Add guide layer elements until the answer is YES.

This test applies to:
  Every page
  Every modal
  Every form
  Every status update
  Every workflow step

---

## ROLE-SPECIFIC GUIDANCE

Different roles get different help text.
Always write for the specific role.

TEAM_LEAD (call center):
  Language: Fast, action-oriented
  Focus: What to do next, call outcomes
  Example: "Log every call. Even if no answer.
            The system tracks patterns for you."

MANAGER:
  Language: Strategic, overview-focused
  Focus: What the data means, trends
  Example: "This shows team performance this week.
            Click any metric to see the detail."

ORG_ADMIN (BCBT etc):
  Language: Clear, welcoming, non-technical
  Focus: Their students, their pipeline
  Example: "These are your students who have
            applied through DeAssists this month."

SUPER_ADMIN:
  Language: Technical, complete
  Focus: Full system capabilities
  Example: All guide elements visible but compact.

---

## GUIDE LAYER CHECKLIST
## Run before every Latha PR

  [ ] Every button has a title tooltip
  [ ] Every icon has a title tooltip
  [ ] Every input has helper text below
  [ ] Every empty state has guidance
  [ ] Every complex section has ⓘ icon
  [ ] Language passes the day one test
  [ ] Colors match guide layer visual system
  [ ] No technical language anywhere
  [ ] Role-appropriate content confirmed

---

*The Guide Layer — DeAssists Portal Design System*
*Owner: Shon AJ | Brain: VEERABHADRA*
*Location: 369-brain/project/guide-layer.md*
*Philosophy: The portal trains itself.*
*The best interface is one that needs no manual.*
