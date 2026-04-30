# DeAssists — Anti-Ambiguity Checklist
# Version: 1.0 | Date: 30 April 2026
# Owner: Shon AJ | Brain: VEERABHADRA
# Location: 369-brain/patterns/anti-ambiguity.md
#
# Claude Code runs this before writing any file.
# Every question must be answered.
# If any answer is NO or UNKNOWN — STOP.
# Do not guess. Ask Shon in VEERABHADRA chat.

---

## THE ONE RULE

If you are not 100% certain of the answer
to any question below — you do not proceed.
You stop and ask.

Guessing costs two rounds of Latha review.
Asking costs two minutes.
Always ask.

---

## PART 1 — BEFORE ANY CODE SESSION

Read once at session start.
If any file is missing — read it before continuing.

  [ ] Read CLAUDE.md
  [ ] Read CODING-CONSTITUTION.md
  [ ] Read memory/session-state.md
  [ ] Read memory/decisions.md
  [ ] Read project/feature-registry.md

After reading — state clearly:
  Current position: [from session-state]
  Next task: [from feature-registry]
  Mode: MIGRATION or CAPABILITY or LIVE CHANGE

---

## PART 2 — BEFORE ANY NEW FILE
## FOR NEW FEATURES ONLY

FIRST — which path are you on?

NEW FEATURE (does not exist in production yet):
  Answer ALL questions in Part 2 below.
  Prototype MUST exist before proceeding.

LIVE CHANGE (bug fix, tweak, existing feature):
  SKIP Part 2 entirely.
  Go directly to Part 3.
  Part 2 does not apply to live changes.

Not sure which path?
  STOP. Ask Shon in VEERABHADRA chat.
  Wait for the answer. Then begin.

---

### About the feature

  [ ] What feature am I building?
      Answer: ___

  [ ] Is this in feature-registry.md?
      Answer: YES / NO
      If NO — stop. Ask Shon to add it first.

  [ ] Is this MIGRATION or CAPABILITY?
      MIGRATION = exists in production, needs sync
      CAPABILITY = new, does not exist yet
      Answer: ___

  [ ] Has Shon confirmed this in VEERABHADRA?
      Answer: YES / NO
      If NO — stop. Confirm first.

---

### About the prototype
### SKIP THIS SECTION FOR LIVE CHANGES

  [ ] Does a prototype exist for this feature?
      Answer: YES / NO
      If YES — prototype line numbers: ___
      If NO — stop. Prototype must exist first.
               Go to VEERABHADRA to build it.

  [ ] What does the prototype show exactly?
      Answer: ___

---

### About constants (hard gate)

  [ ] What enums does this feature need?
      Answer: ___

  [ ] Do ALL those enums exist in
      lead.constants.ts right now?
      Answer: YES / NO
      If NO — create the enum first.
               Do not write the component yet.

  [ ] What token values does this need?
      Answer: ___

  [ ] Do all tokens exist in crmTokens.ts?
      Answer: YES / NO
      If NO — add to crmTokens.ts first.

---

### About the API

  [ ] Does the backend endpoint exist?
      Answer: YES / NO
      Endpoint path: ___

  [ ] Does the named hook exist in
      libs/react-query/queries/{module}.ts?
      Answer: YES / NO
      Hook name: ___
      If NO — create the hook first.
               Follow the 4-layer chain.
               Never skip to the component.

  [ ] Which core hook does it use?
      Answer: useCustomQueryV2  (GET, new code)
           or useCustomQuery    (GET, legacy)
           or useCustomMutationV2 (POST/PUT)
           or useCustomDelete   (DELETE)

---

### About access and permissions

  [ ] Which UserTypes see this feature?
      Answer: ___

  [ ] Which SidebarRole gates this?
      Answer: ___

  [ ] Does that SidebarRole exist in
      lead.constants.ts?
      Answer: YES / NO
      If NO — add it first.

  [ ] Have all three access layers been planned?
      Layer 1 sidemenu.ts entry: ___
      Layer 2 ALLOWED_ROLES in page: ___
      Layer 3 data permission in hook: ___

---

### About the file

  [ ] What is the exact file path?
      Answer: ___

  [ ] Does this file already exist?
      Answer: YES / NO
      If YES — read it fully before touching it.

  [ ] What existing files does this connect to?
      Answer: ___

  [ ] Is any connected file a never-touch file?
      Answer: YES / NO
      If YES — stop. Ask Shon immediately.

---

### About tenant awareness

  [ ] Will this work for BCBT and any future
      university without a code change?
      Answer: YES / NO
      If NO — redesign before building.

  [ ] Does it hardcode any DeAssists-specific
      value (org name, queue, role, fee)?
      Answer: YES / NO
      If YES — replace with configurable value.

---

### About AI hookability

  [ ] Does every state change fire an event
      that an AI agent can act on?
      Answer: YES / NO
      If NO — add TODO comment for future hookup.

---

## PART 3 — BEFORE ANY CHANGE TO EXISTING CODE
## FOR LIVE CHANGES, BUG FIXES, TWEAKS

  [ ] Have I read the FULL file I am changing?
      Not just the relevant section.
      The complete file top to bottom.
      Answer: YES / NO
      If NO — read it now before continuing.

  [ ] What does every function in this file do?
      Answer: ___

  [ ] What is the minimum change needed?
      Answer: ___

  [ ] Could this change break anything else?
      Answer: YES / NO / UNSURE
      If UNSURE — check all connected files first.

  [ ] Am I touching a never-touch file?
      Answer: YES / NO
      If YES — stop immediately. Ask Shon.

  [ ] Am I touching permission.helper.ts?
      Answer: YES / NO
      If YES — read it fully first.
               Run sidebar audit after change.
               Test minimum 2 roles in browser.

  [ ] Am I touching sidemenu.ts?
      Answer: YES / NO
      If YES — run sidebar audit after change.

  [ ] Am I touching lead.constants.ts?
      Answer: YES / NO
      If YES — check every file that imports it.

---

## PART 4 — BEFORE EVERY COMMIT
## APPLIES TO BOTH PATHS

  [ ] npm run build:all
      Result must be zero NEW errors.
      Pre-existing backend error is documented.
      Any new error — fix before committing.

  [ ] Three grep checks — all empty for CRM files:
      grep -rn "await fetch(" apps/cms-next/components/ apps/cms-next/pages/
      grep -rn "getCookie" apps/cms-next/components/ apps/cms-next/pages/
      grep -rn "Authorization.*Bearer" apps/cms-next/components/ apps/cms-next/pages/

  [ ] Visual check on localhost:4002
      Does it look right?
      Does it work for the correct roles?

  [ ] git status --short
      Any unexpected files? Remove them.

  [ ] git diff --staged --name-only
      Read every file in the diff.
      Nothing unexpected should be there.

  [ ] Stage specific files only:
      Never: git add .
      Never: git add -A
      Always: git add [exact file path]

  [ ] Change log entry written for Latha

  [ ] feature-registry.md status updated

  [ ] Graphify updated after portal commit:
      /opt/homebrew/bin/graphify update . \
      --output ~/deassists-workspace/369-brain/graphify-out/

---

## PART 5 — THE HARDCODING TEST

Before writing any value in code — ask:

  QUESTION 1:
  Does this value appear more than once?
    YES — must be a constant or enum

  QUESTION 2:
  Could this value change in the future?
    YES — must be a constant or enum

  QUESTION 3:
  Does this represent a business concept?
  (status, queue, role, service, fee, colour)
    YES — must be a constant or enum

  QUESTION 4:
  Is this DeAssists-specific and would not
  make sense for BCBT or another university?
    YES — must be configurable per tenant

  If ALL FOUR answers are NO:
    Safe to hardcode.
    Add a comment explaining why.

  If ANY answer is YES:
    Do not hardcode.
    Add to constants file first.
    Then reference the constant.

---

## PART 6 — COMMON VIOLATIONS

Things that always get caught in Latha review.
Never do these.

  VIOLATION 1 — Raw fetch
    await fetch('/v1/leads/...')
    FIX: Use named hook from react-query

  VIOLATION 2 — Magic string status
    status === 'Follow Up'
    FIX: status === LeadStatus.FollowUp

  VIOLATION 3 — Magic string queue
    queue === '369_MAIN'
    FIX: queue === LeadQueue.Main

  VIOLATION 4 — Inline auth token
    headers: { Authorization: `Bearer ${getCookie('token')}` }
    FIX: Remove entirely. Axios client handles this.

  VIOLATION 5 — Hardcoded colour
    color: '#F59E0B'
    FIX: color: crmTokens.am

  VIOLATION 6 — Inline useCustomQuery
    useCustomQuery(['key'], '/v1/leads', ...)
    FIX: Import useLeadsList from named hook file

  VIOLATION 7 — Wrong files staged
    git add . (stages everything)
    FIX: git add apps/cms-next/components/leads/CallLogModal.tsx

---

## IF ANYTHING IS UNCLEAR

One answer only: stop and ask.

Go to VEERABHADRA chat.
Describe exactly what is unclear.
Wait for the answer.
Then proceed.

Never guess. Never assume.
Never proceed with uncertainty.

The cost of asking: 2 minutes.
The cost of guessing wrong: 2 Latha review
rounds and a broken feature in QA.

---

*DeAssists Anti-Ambiguity Checklist v1.0*
*Owner: Shon AJ | Brain: VEERABHADRA*
*Created: 30 April 2026*
*Location: 369-brain/patterns/anti-ambiguity.md*
*Add new violations to Part 6 when mistakes happen.*
