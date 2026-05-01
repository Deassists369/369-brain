# DeAssists — Coding Constitution
# Version: 1.0 | Date: 30 April 2026
# Owner: Shon AJ | Brain: VEERABHADRA
# Location: 369-brain/CODING-CONSTITUTION.md
#
# READ THIS BEFORE WRITING A SINGLE LINE OF CODE.
# NO EXCEPTIONS. NO SHORTCUTS.

---

## WHAT WE ARE BUILDING

DeAssists is an AI-first Education ERP SaaS platform.
Five layers: Student Portal, Lead & Sales, Finance,
SMS + LMS, Tax and Compliance.
Tenant-aware. AI-hookable. Sellable to 50+ universities.
BCBT is the first external tenant. September 2026 is
the hard deadline for the full ERP MVP.

Read vision.md for the full picture before any
major feature work begins.

---

## BEFORE YOU START — ANSWER THIS QUESTION

Is this a NEW FEATURE that does not exist
in production yet?
  GO TO PART B — New Feature Path

Is this a CHANGE TO EXISTING CODE?
(bug fix, tweak, style update, improvement)
  GO TO PART C — Live Change Path

Not sure which path?
  STOP. Do not guess.
  Ask Shon in VEERABHADRA chat.
  Wait for the answer. Then begin.

---

## PART A — UNIVERSAL RULES
## These apply to BOTH paths. Always. No exceptions.

---

### A1 — Constants Before Components

Every enum, status, queue, role, service name
and business value must exist as a constant
BEFORE any component references it.

NEVER:   status === 'Follow Up'
ALWAYS:  status === LeadStatus.FollowUp

NEVER:   queue === '369_MAIN'
ALWAYS:  queue === LeadQueue.Main

NEVER:   color: '#F59E0B'
ALWAYS:  color: crmTokens.am

If the constant does not exist — create it first.
Then write the component.
The constants file is a hard gate.
No component passes through without it.

---

### A2 — Four-Layer API Chain

Every API call follows exactly four layers.
Skipping any layer is a violation.

  Component
      |
  Named Hook (libs/react-query/queries/{module}.ts)
      |
  Core Hook (useCustomQueryV2 / useCustomMutationV2)
      |
  Axios Client (libs/shared/config/axios-client.ts)
      |
  Backend

Components NEVER call APIs directly.
Components NEVER use raw fetch().
Components NEVER handle auth tokens.
The axios client handles auth automatically.

---

### A3 — Three-Layer Access Audit

Every feature that involves user access
must pass all three layers:

  Layer 1 — Sidebar visibility
    sidemenu.ts + permission.helper.ts
    Who sees the menu item?

  Layer 2 — Page guard
    ALLOWED_ROLES array in page file
    Who can visit the URL?

  Layer 3 — Data permission
    useCustomQuery + database roles
    Who can fetch the data?

All three must be tested before commit.
One layer passing does not mean all pass.
Failure pattern: sidebar shows, page blocks,
agent sees Access Denied.

---

### A4 — Never Hardcode Business Values

Never hardcode any value that:
  — Appears more than once anywhere
  — Could change in the future
  — Represents a business concept
  — Is a colour, size, or spacing value

HARDCODE NEVER:
  'Follow Up', '369_MAIN', 'super_admin'
  'Call Center', '#F59E0B', 'BCBT'
  '/v1/leads', 6px, 230

HARDCODE ONLY IF:
  Appears exactly once
  Will never change
  Has no business meaning
  Example: a one-time layout wrapper class

---

### A5 — Build Before Commit

Run before every commit. Zero tolerance for
new errors introduced by our code.

  cd ~/deassists && npm run build:all

Expected result:
  shared        — Compiled
  cms-next      — Built
  website-next  — Built
  backend-nest  — Built (or pre-existing error only)

Pre-existing backend error (accounts.service.ts:1276)
is documented. Any NEW error must be fixed before
committing.

---

### A6 — Three Grep Checks

Run before every commit. All three must
return empty for CRM files.

  grep -rn "await fetch(" apps/cms-next/components/ apps/cms-next/pages/
  grep -rn "getCookie" apps/cms-next/components/ apps/cms-next/pages/
  grep -rn "Authorization.*Bearer" apps/cms-next/components/ apps/cms-next/pages/

Results in CRM files = violation = fix before commit.
Results in non-CRM legacy files = pre-existing,
document but do not block.

---

### A7 — Never-Touch Files

These files cannot be modified.
Under any circumstances. For any reason.

PRODUCTION REPO (deassists):
  apps/cms-next/pages/universitiesd/
  apps/backend-nest/src/core/entities/extendables/payment.entity.ts
  apps/mui-cms-next/
  MASTER-RUN.cjs
  Any Stripe or payment logic
  scope.guard.ts
  package.json and pnpm-lock.yaml (without Latha approval)
  Any file containing JWT secrets
  .env files (read only)

BRAIN REPO (369-brain):
  archive/
  code-snapshot/
  graphify-out/

If you find yourself needing to modify
a never-touch file — STOP.
Bring it to Shon in VEERABHADRA chat.

---

### A8 — Tenant-Aware by Default

Every new feature must work for any tenant.
Not just DeAssists. Not just BCBT.

NEVER:   if (user.org === 'deassists')
ALWAYS:  if (user.orgId === currentTenant.id)

NEVER:   queue: '369_MAIN' (hardcoded)
ALWAYS:  queue: tenant.defaultQueue

NEVER:   Fetch all leads for everyone
ALWAYS:  Fetch leads scoped to tenant context

---

### A9 — AI-Hookable at Every Action

Every state change must fire an event.
Design so AI agents can listen and act
without human involvement.

Every significant action should emit:
  await eventBus.emit('lead.status.changed', {
    leadId, fromStatus, toStatus,
    triggeredBy, timestamp, tenantId
  })

AI agent subscribes and acts:
  — Send follow-up WhatsApp
  — Update assignment
  — Log to activity feed
  — Trigger next workflow step

If an action does not emit an event today,
add a TODO comment marking it for
future automation hookup.

---

### A10 — Data Access Pattern — Two Hook Types

useCustomQuery (legacy):
  Returns AxiosResponse<T>
  Access actual data via: result.data.data
  Example: const leads = data?.data?.data ?? []

useCustomQueryV2 (new):
  Auto-unwraps AxiosResponse
  Access actual data via: result.data
  Example: const stats = data?.data

NEVER access result.data when using useCustomQuery
and expect the API payload — it is the Axios wrapper.
Always use result.data.data for useCustomQuery.
Always use result.data for useCustomQueryV2.
Check which hook is used before accessing data.

Root cause of Q Intelligence bug (1 May 2026):
  useLeadDetails uses useCustomQuery (legacy)
  detailedLead = leadDetailsData?.data was wrong
  detailedLead = leadDetailsData?.data?.data is correct
  The block was invisible because data was undefined.

---

### A12 — Bug Handling Protocol

When a bug is reported or found —
NEVER start fixing immediately.
Always follow this exact sequence.

STEP 1 — GATHER EVIDENCE FIRST
  Before reading a single line of code, ask:

  "Before I investigate this bug I need:
   Option A: A JAM recording of the bug
             jam.dev — record the exact steps
             Share the link here
   Option B: A screenshot showing the problem
             With browser DevTools Network tab open
   Option C: A clear description:
             - What did you do?
             - What did you expect to happen?
             - What actually happened?
             - Any error messages visible?

   Please provide one of the above.
   I will not touch any code until I have this."

  Never skip this step.
  Never assume you understand the bug without evidence.
  Evidence first. Code second. Always.

STEP 2 — READ ALL CONNECTED CODE
  After receiving evidence:
  Read every file connected to the bug.
  Not just the file that seems broken.
  Read the full chain:
    Hook → Component → Page → Constants → Types

  Produce a written summary:
    - What the code does today
    - What the evidence shows is wrong
    - Every possible failure point
    - The most likely single root cause

  Show this summary to Shon before proceeding.
  Wait for confirmation.

STEP 3 — STATE THE ROOT CAUSE IN ONE SENTENCE
  Write exactly one sentence:
  "The bug is caused by [X] in [file] at [line]
   because [reason]."

  If you cannot write this sentence clearly —
  you do not understand the bug yet.
  Go back to Step 1.

STEP 4 — PROPOSE THE MINIMUM FIX
  Write the fix in plain English first.
  Not code — words.
  "I will change [X] to [Y] in [file] at [line]."

  Ask: "Is this the minimum change needed?"
  If the fix touches more than 3 lines —
  question whether it is truly minimum.

STEP 5 — APPLY AND VERIFY
  Apply the fix.
  Run: pm2 stop cms && rm -rf ~/deassists/apps/cms-next/.next && pm2 start cms
  Run: npm run build:all
  Run: three grep checks
  Visual check on localhost:4002
  Record a new JAM to confirm bug is fixed.

STEP 6 — DOCUMENT THE BUG
  Add to CODING-CONSTITUTION.md Part E:
  What the bug was
  What caused it
  How it was fixed
  What rule prevents it in future

THE GOLDEN RULE OF BUG FIXING:
  Understand before you act.
  Evidence before code.
  One fix for one bug.
  Verify before moving on.
  Document so it never happens again.

---

### A13 — Self-Explaining UI (Guided UX Principle)

Every element in the portal must explain itself.
No user should ever need to ask what a button,
field, or section does.

This is not optional. This is a core product requirement.
A portal that needs external training is incomplete.

THREE LAYERS — implement in order:

LAYER 1 — TOOLTIPS (every CTA and icon)
  Every button, icon, and non-obvious element
  must have a tooltip explaining its purpose.

  Implementation:
    title="Explain what this does in plain English"

  Examples:
    Log Call button:
      title="Record the outcome of this call.
             Updates lead status automatically."

    Save button:
      title="Save changes to this lead's details"

    Queue badge:
      title="The queue this lead is assigned to.
             Change it in Update Lead below."

  Rules:
    Never use developer language in tooltips
    Write as if explaining to someone on day one
    Maximum 2 sentences per tooltip
    Always start with a verb

LAYER 2 — FIELD HELPER TEXT
  Every input field must have helper text
  explaining what goes there and why it matters.

  Empty state example:
    University Interest field:
    placeholder="e.g. SRH Berlin, BSBI London"
    Helper: "Which university is this student
             most interested in?"

  Rules:
    placeholder is NOT helper text
    Helper text appears below the field
    Explains purpose, not just format

LAYER 3 — CONTEXTUAL GUIDANCE
  Complex sections get a ? help icon
  Clicking it shows a brief explanation
  of what that section does and how to use it.

  Example:
    CALL INTELLIGENCE section ? icon:
    "This shows the history of calls made
     to this lead. Log calls using the
     Log Call button above. The AI will
     use this data to suggest next actions."

ONBOARDING RULE:
  First time a user visits any page —
  show a brief 3-step guided tour.
  After completion — never show again.
  Store completion in user preferences.

THE TEST:
  A brand new call center agent on day one
  must be able to complete their first
  call log without asking anyone for help.
  If they cannot — the UI is incomplete.

This principle applies to:
  Every page we build
  Every component we add
  Every feature we ship
  Applies equally for internal staff
  and external tenant staff (BCBT etc)

When building any new feature — ask:
  "Could a new agent use this without training?"
  If NO — add tooltips and helper text first.
  Then ship.

---

## PART B — NEW FEATURE PATH
## Use when building something that does
## not exist in production yet.

---

### B1 — Pre-Build Checklist

Answer ALL of these before writing any file.
If any answer is NO or UNKNOWN — stop and resolve.

  [ ] Have I read vision.md?
  [ ] Have I read session-state.md?
  [ ] Have I read feature-registry.md?
  [ ] Is this feature in the feature registry?
  [ ] Is this CAPABILITY mode confirmed by Shon?
  [ ] Does the prototype exist for this feature?
      (prototype line numbers: ___)
  [ ] Does the enum/constant exist?
      (file: ___, value: ___)
  [ ] Does the backend endpoint exist?
      (path: ___)
  [ ] Does the hook exist?
      (file: ___, hook name: ___)
  [ ] Which UserTypes see this?
      (___)
  [ ] Which SidebarRole gates this?
      (___)
  [ ] What is the exact file path to create?
      (___)
  [ ] Does this file already exist?
  [ ] What does this feature connect to?
      (dependencies: ___)
  [ ] Is this tenant-aware?
  [ ] Is this AI-hookable?

---

### B2 — EAGLE Modes (mandatory for new features)

New features go through all EAGLE modes.
No shortcuts. No skipping modes.

  Mode 0 — Baseline (run once per major refactor)
    Full codebase scan
    Produces baseline document

  Mode 1 — Reconcile
    Compare prototype vs production
    Produce gap report
    Declare MIGRATION or CAPABILITY
    STOP — wait for Shon review

  Mode 2 — Spec + HTML Preview
    Write spec document
    Produce working HTML preview
    STOP — wait for Shon approval phrase

  Mode 3 — Execute
    Write code only after "approved"
    Risk-ordered stages:
      Stage 1: Pure additions (new files only)
      Stage 2: Isolated new files
      Stage 3: Wiring and integration
    Produce stage report after each stage

  Mode 4 — Postmortem (when bugs found)
    Document what went wrong
    Update EAGLE skill if discipline failed
    Update CODING-CONSTITUTION if rule missing

---

### B3 — Approval Phrases

Nothing proceeds without the exact phrase.

  "approved"
    Proceed to next EAGLE mode

  "not approved"
    Return to previous mode

  "I have a doubt: [question]"
    Answer the doubt, then wait again

Any other phrase = wait. Do not interpret.
Do not assume. Do not proceed.

---

### B4 — After Build

  [ ] npm run build:all — zero new errors
  [ ] Three grep checks — clean for CRM files
  [ ] Visual check on localhost:4002
  [ ] Three-layer access audit passed
  [ ] Sidebar audit run if sidemenu touched
  [ ] Graphify updated:
      /opt/homebrew/bin/graphify update .
      --output ~/deassists-workspace/369-brain/graphify-out/
  [ ] feature-registry.md updated
  [ ] Change log entry written
  [ ] Stage report produced

---

## PART C — LIVE CHANGE PATH
## Use when changing existing production code.
## Bug fix, tweak, style update, improvement.

---

### C1 — Pre-Change Checklist (Bug Fix Protocol)

  BEFORE TOUCHING ANY CODE:
  [ ] Have I received a JAM link, screenshot,
      or clear written description of the bug?
      If NO — ask for it. Do not proceed.

  [ ] Have I read ALL connected files fully?
      Not just the broken file.
      The full chain: hook, component, page,
      constants, types.
      If NO — read them now.

  [ ] Can I state the root cause in one sentence?
      "The bug is caused by ___ in ___ at ___
       because ___."
      If NO — I do not understand the bug yet.
      Go back and read more.

  [ ] Is my proposed fix the minimum change?
      Less than 5 lines ideally.
      If more — question whether it is truly minimum.

  [ ] Have I confirmed the exact API response shape
      using JAM before changing any data access?
      If NO — record a JAM first.

  EXISTING CHECKS:
  [ ] Have I read the FULL file I am changing?
  [ ] Is this the minimum possible change?
  [ ] Could this break anything else?
  [ ] Is this a never-touch file?

---

### C2 — Change Discipline

Make only the minimum change needed.
One issue, one element, one fix.
Do not refactor while fixing.
Do not improve adjacent code while fixing.
Do not change anything not directly related
to the bug or improvement.

If you see a problem while fixing —
document it as a separate issue.
Do not fix it now.

---

### C3 — After Change

  [ ] npm run build:all — zero new errors
  [ ] pm2 restart cms (Mac Mini only)
      After any cms-next file change:
      pm2 stop cms
      rm -rf ~/deassists/apps/cms-next/.next
      pm2 start cms
      Wait 30 seconds
      Cmd+Shift+R in browser
      This is mandatory — build:all compiles
      but pm2 serves old bundle until restarted
  [ ] Three grep checks — clean
  [ ] Visual check on localhost:4002
  [ ] If permissions changed:
      Three-layer access audit
      Test minimum 2 roles in browser
  [ ] If sidemenu changed:
      Run sidebar audit
  [ ] Graphify updated
  [ ] Change log entry written

---

## PART D — COMMIT RULES
## Applies to both paths.

---

### D1 — What Goes in a Commit

ONE capability or fix per commit.
Never mix brain files and portal files.
Never mix unrelated changes.

Portal commits go to:
  feature/portal.shon369
  Via GitHub Desktop
  Latha reviews before merge

Brain commits go to:
  369-brain/main
  Shon commits directly
  No review needed

---

### D2 — Commit Message Format

  type(scope): description — context

Types:
  feat     — new feature
  fix      — bug fix
  refactor — restructure, no logic change
  style    — visual only, no logic change
  docs     — documentation
  chore    — maintenance

Examples:
  feat(crm): add CallLogModal — EAGLE v2.1 Phase 2A
  fix(leads): correct queue filter — Latha QA feedback
  style(design): sync crmTokens.ts — EAGLE Task 1
  docs(brain): add vision.md and coding constitution

---

### D3 — What to Stage

ALWAYS:
  git add [specific files only]
  Never: git add .
  Never: git add -A

BEFORE STAGING:
  git status --short
  git diff --staged --name-only
  Read every file in the diff.
  If anything unexpected appears — remove it.

---

## PART E — LESSONS FROM PHASE 1 MISTAKES
## These mistakes cost two QA review rounds.
## Never repeat them.

---

### E1 — Raw fetch() Violation

What happened: Components called fetch() directly.
Why it failed: Auth headers not attached,
QA returned 404 on every request.
The fix: Replace with named hooks in leads.ts.
Two rounds of Latha feedback wasted.

Rule: Components never call fetch() directly.
Check: grep -rn "await fetch(" on CRM files.

---

### E2 — Inline Hook Violation

What happened: useCustomQuery called inline
inside components with raw URL strings.
Why it failed: No dedicated query file,
no reusability, QA rejected pattern.

Rule: All hooks live in
libs/react-query/queries/{module}.ts.
Components import named hooks only.

---

### E3 — Magic String Violation

What happened: Queue names and status values
typed as raw strings across multiple files.
Why it failed: One typo caused all queue
counts to show zero. Silent failure.
Three critical bugs traced to string drift.

Rule: lead.constants.ts is the single source
of truth. Every string value goes through
an enum. No exceptions.

---

### E4 — Committed Wrong Files

What happened: .env backup files,
.claude/settings.json, tsconfig.tsbuildinfo
appeared in GitHub Desktop alongside
crmTokens.ts.
Why it happened: git add . instead of
specific file staging.

Rule: Always git add [specific file].
Always read git status before committing.
Always discard non-code files before commit.

---

## PART F — CORRECT PATTERNS

---

### F1 — Correct Hook Pattern

  // libs/react-query/queries/leads.ts

  import { useCustomMutationV2 } from '../src/index';
  import { Endpoints } from '@deassists/shared/constants/endpoints.enum';

  export const useLogCall = (leadId: string) =>
    useCustomMutationV2(
      `${Endpoints.LEADS}/${leadId}/call-log`
    );

---

### F2 — Correct Component Import Pattern

  // apps/cms-next/components/leads/CallLogModal.tsx

  import { useLogCall } from '@deassists/react-query/queries/leads';
  import { CallOutcome } from '@deassists/shared/constants/lead.constants';
  import { crmTokens } from '../../styles/crmTokens';

  NEVER:
    import { useCustomMutationV2 } from '...'  (wrong layer)
    const res = await fetch('/v1/leads/...')   (raw fetch)
    outcome === 'no_answer'                    (magic string)

---

### F3 — Correct Enum Addition Pattern

  // libs/shared/constants/lead.constants.ts
  // Add here FIRST. Before writing any component.

  export enum ServiceCategory {
    UniversityAdmissions = 'university_admissions',
    Accommodation = 'accommodation',
    BlockedAccount = 'blocked_account',
    Visa = 'visa',
    Insurance = 'insurance',
    Ausbildung = 'ausbildung',
    Jobs = 'jobs',
    PostLanding = 'post_landing',
    Legal = 'legal',
    APS = 'aps',
  }

---

### F4 — Correct Sidebar Addition Pattern

  // libs/shared/models/sidemenu.ts
  // Three things always together:

  {
    name: 'Service Catalog',
    path: '/catalog',
    allowedRoles: [
      UserTypes.SUPER_ADMIN,
      UserTypes.MANAGER,
      UserTypes.TEAM_LEAD,
      UserTypes.STAFF,
    ],
    requiredRole: SidebarRole.CallCenter,
  }

  // Then in the page file:
  const ALLOWED_ROLES = [
    UserTypes.SUPER_ADMIN,
    UserTypes.MANAGER,
    UserTypes.TEAM_LEAD,
    UserTypes.STAFF,
  ];

  // Then verify data permission in the hook.
  // All three layers. Always.

---

*DeAssists Coding Constitution v1.0*
*Owner: Shon AJ | Brain: VEERABHADRA*
*Created: 30 April 2026*
*Lives at: 369-brain/CODING-CONSTITUTION.md*
*Updates: only via VEERABHADRA session*
*Lessons added: every time a mistake is made*
