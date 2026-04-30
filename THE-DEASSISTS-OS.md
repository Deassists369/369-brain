# THE DEASSISTS OPERATING SYSTEM
## Version 2.0 | Owner: Shon AJ | Brain: VEERABHADRA
### The founding document of a company built by one founder and AI.

---

# PREAMBLE — WHY THIS FILE EXISTS

This is not a manual. This is not documentation.
This is the operating system of a company.

Every AI agent that touches this project reads this file.
Every human who joins this project reads this file.
Every decision made in this company traces back to this file.

It was written by VEERABHADRA — the AI master brain
of Shon AJ, CEO of Three Sixty Nine GmbH, Berlin.
It was approved by Shon.
It is the founding document of DeAssists ERP.

If you are an AI agent — follow every instruction precisely.
If you are Shon — this is your north star.
If you are a new team member — read this before touching anything.
If you are an investor or partner — this tells you exactly
what is being built and why it will work.

Currency: verified via git log — not by any date in this file.
Evolution: this file grows as the company grows.
Never shrinks. Never loses its principles.

---

# BOOK 1 — THE SOUL

## 1.1 The Problem We Solve

Every year hundreds of thousands of students
leave India, Nigeria, Pakistan, Bangladesh
and move to Germany for university.

They face:

  Confusion about which university accepts them
  Fear about blocked accounts, visa, insurance
  Loneliness navigating a foreign system alone
  Agents who take fees and disappear
  No single trusted partner for the full journey

DeAssists solves this.
We take a student from
"I am thinking about Germany"
to
"I am living in Germany with my life sorted."

We do not redirect. We do not refer.
We do the work. End to end.

## 1.2 The Vision

DeAssists is building the operating system
for expat services and university education globally.

TODAY:
  Vertically integrated expat services operator.
  Germany. Students. 19 partner universities.
  90% revenue from admissions.
  10% from accommodation.
  Human-led. AI-assisted.

2026:
  Full ERP platform.
  BCBT University runs on our system.
  Call center runs inside the portal.
  Zero Google Sheets dependency.
  AI handles all routine operations.

2027:
  Multi-tenant SaaS.
  10 universities on the platform.
  Each sees only their own data.
  DeAssists runs the operations layer above all.
  AI agents handle 80% of routine work.

2029:
  50+ universities globally.
  Expat services in multiple countries.
  Minimal human staff per tenant.
  The platform sells itself.
  DeAssists is the infrastructure of
  international education services.

## 1.3 The Seven Principles
### These never change. Everything else can evolve.

PRINCIPLE 1 — THE STUDENT IS THE NORTH STAR

  Every decision is judged by one question:
  Does this make the student journey better?
  If yes — build it.
  If no — question it.
  If unsure — ask Shon.

PRINCIPLE 2 — AI DOES THE REPETITIVE, HUMANS DO THE MEANINGFUL

  We do not automate to remove humans.
  We automate so humans focus on what matters.
  Relationships. Judgement. Strategy. Care.
  An agent handles the form.
  A human handles the fear.

PRINCIPLE 3 — BUILD FOR 50, PROVE WITH ONE

  Every feature works for any university,
  any expat services company, any country.
  We prove it at BCBT first.
  Then we show the world.
  Never hardcode DeAssists-specific logic.
  Always configurable per tenant.

PRINCIPLE 4 — THE SYSTEM MUST WORK FOR A NON-DEVELOPER

  If Shon cannot understand a decision — it is wrong.
  If an agent cannot execute without a developer — it is wrong.
  Simplicity is not a compromise. It is the design goal.
  Every tool, every process, every rule
  must be operable by a non-technical founder.

PRINCIPLE 5 — PROTOTYPE BEFORE YOU BUILD

  Every feature starts as a visual prototype.
  Shon approves the prototype.
  Then and only then does code get written.
  The prototype is the contract.
  No prototype — no code. Ever.

PRINCIPLE 6 — CONSTANTS BEFORE COMPONENTS

  A value that appears twice is hardcoded once too many.
  An enum must exist before any component references it.
  Architecture decisions made in code cannot be reversed.
  Think first. Spec second. Build third. Ship fourth.

PRINCIPLE 7 — ONE SPINE, MANY MODULES

  Every service, every university, every country
  connects to the same backend spine.
  The spine never changes fundamentally.
  The modules grow around it.
  This is how we scale without rebuilding.

---

# BOOK 2 — THE COMPANY

## 2.1 What DeAssists Does Today

SERVICE                STATUS        REVENUE
University Admissions  LIVE          ~90%
  19 partner universities
  Private + public
  Lead → call center → application → enrolment

Accommodation          LIVE          ~10%
  Direct service
  Germany student housing

Blocked Account        LIVE (BCBT)   Partner
  BCBT handles the service
  DeAssists coordinates

Visa                   REDIRECT      Future
Insurance              REDIRECT      Future
APS Documentation      REDIRECT      Future
Ausbildung             REDIRECT      Future
Jobs                   REDIRECT      Future
Post-landing           REDIRECT      Future
Legal                  REDIRECT      Future

## 2.2 The Team

ROLE              PERSON        PORTAL ACCESS
CEO               Shon AJ       SUPER_ADMIN
Lead Developer    Latha         SUPER_ADMIN
Senior Manager    Don           MANAGER
BDMS / Coord      Sruthi        MANAGER
Application Lead  Santosh       MANAGER
Call Center       Anandhu       TEAM_LEAD
Call Center       Midhun        TEAM_LEAD
Call Center       Stalin        TEAM_LEAD
Operations        Gopika        TEAM_LEAD
Applications      Lenin         AGENT
Germany Intern    Sajir         AGENT
Germany Intern    Amala         AGENT

The team model is a template.
Every expat services company that uses this platform
will have a similar structure.
The platform is designed so this team
never needs to grow significantly.
AI agents handle scale.
Humans handle strategy and relationships.

## 2.3 The Customer Journey

STAGE 1 — DISCOVERY
  Student sees Instagram ad or visits deassists.com
  Lands on website-next (public site, port 4001)
  Uses Course Finder
  Fills lead capture form

STAGE 2 — LEAD (Sheets today, Portal tomorrow)
  Record created in CRM
  Auto-routed to correct queue
  AI Lead Router assigns to call center agent

STAGE 3 — QUALIFICATION
  Anandhu, Midhun, or Stalin calls
  Explains programmes, fees, eligibility
  Logs every call outcome in portal
  AI Follow-up Bot sends reminders

STAGE 4 — CONVERSION
  Student decides to use DeAssists
  Lead converts to application
  Same record — enriched, not duplicated

STAGE 5 — APPLICATION
  Student downloads mobile app
  Uploads documents
  AI Doc Checker flags missing items
  Lenin or Santosh coordinates with university

STAGE 6 — OFFER AND PAYMENT
  University responds with offer
  DeAssists guides fee payment
  Status updated — student sees in mobile app
  BCBT blocked account if needed

STAGE 7 — ARRIVAL AND POST-LANDING
  Student lands in Germany
  Sajir or Amala supports on-ground
  All services tracked in portal
  Relationship continues

## 2.4 The Partner Journey (BCBT model)

BCBT logs into cms-next with ORG credentials
Sees only their own student pipeline
Manages blocked accounts inside the portal
Updates application status in real time
DeAssists staff see partner updates instantly
Same shell — scoped data — dual mode working

This is the wrapper model. Already live.
BCBT is the proof. The next university is the sale.

## 2.5 The Five ERP Layers

LAYER 1 — STUDENT PORTAL         LIVE TODAY
  Applications, documents, status tracking
  Student self-service
  Staff application management
  BCBT scoped view working

LAYER 2 — LEAD AND SALES         BUILDING NOW
  Full CRM replacing Google Sheets
  Call center inside portal
  Sales Guide with course finder
  Universal lead capture form
  Commission tracking

LAYER 3 — FINANCE                NEXT (early 2027)
  Fee tracking and reconciliation
  Commission management
  Invoice generation
  DATEV integration foundation
  Built for BCBT and Accommodation first

LAYER 4 — SMS AND LMS            FUTURE (BCBT first)
  Student Management System
  Attendance, timetables, exams
  Learning Management System
  Course content, assessments, certificates
  Target: BCBT September 2026 intake

LAYER 5 — TAX AND COMPLIANCE     FUTURE
  DATEV integration
  German tax compliance
  Per-tenant financial reporting
  Audit trail for all transactions

---

# BOOK 3 — THE SYSTEM

## 3.1 The Two Repositories — Never Mix

369-BRAIN (company brain)
  Path:    ~/deassists-workspace/369-brain/
  GitHub:  github.com/Deassists369/369-brain
  Branch:  main only
  Who commits: Shon directly, AI agents
  Contains: memory, skills, patterns,
            vision, PRD, decisions, prototypes
  Latha NEVER sees this repo.

DEASSISTS PORTAL (production code)
  Path:    ~/deassists-workspace/deassists/
  GitHub:  github.com/Deassists369/deassists
  Branch:  feature/portal.shon369 (active)
  Who commits: GitHub Desktop, Latha reviews
  Contains: Next.js, NestJS, shared libs
  Shon NEVER commits here directly.

HARD STOP: Never mix in one commit. Ever.
HARD STOP: Never git add . or git add -A
HARD STOP: Never commit to main or dev_v2 directly

## 3.2 The Three Applications

cms-next      Port 4002    Staff and partner portal
              PRIMARY — all portal work happens here

backend-nest  Port 8000    NestJS API
              Serves cms-next, website-next, mobile

website-next  Port 4001    Public site
              Course Finder, marketing, lead capture

mui-cms-next  SEPARATE APP — NEVER TOUCH

## 3.3 The AI Agent Hierarchy

LEVEL 0 — VEERABHADRA (claude.ai)
  Master brain. Plans everything.
  Approves all decisions.
  Never touches files directly.
  Drafts all prototypes and prompts.

LEVEL 1 — EXECUTION AGENTS (Mac Mini)
  Claude Code, Cursor Agent, or any future AI tool.
  Reads brain files. Writes code. Commits brain.
  Never commits portal code directly.
  Never merges branches.
  Follows CLAUDE.md boot sequence exactly.

LEVEL 2 — TASK AGENTS (future, 2026-2027)
  Lead Router      Routes leads automatically
  Follow-up Bot    Sends reminders
  Doc Checker      Flags missing documents
  Status Updater   Updates on triggers
  Fee Reconciler   Matches payments
  Report Builder   Generates reports
  Each agent is single-purpose.
  Each agent writes OPEN/IDLE to session-lock.
  Each agent has a heartbeat every 15 minutes.

LEVEL 3 — ORCHESTRATOR (future, 2027+)
  Coordinates Level 2 agents.
  Alerts Shon for exceptions only.
  This becomes OpenClaw.

LEVEL 4 — CEO LAYER (future, 2027+)
  Aggregates all operations.
  Single dashboard for Shon.
  This becomes Paperclip.

## 3.4 The Session Integrity System

Every session — human or agent — follows this:

START:
  Read memory/session-lock.md
  STATUS: IDLE → write OPEN, proceed
  STATUS: OPEN → hard stop, alert Shon
  File missing → treat as OPEN, hard stop

DURING:
  AI agents update LAST_HEARTBEAT every 15 min
  Human sessions update session-state when task completes

END:
  Update session-state.md
  Append activity-log.md
  Commit brain files
  Write STATUS: IDLE to session-lock.md
  This is the FINAL step. Always.
  Cannot be skipped. Cannot be combined.
  Without IDLE — next session is blocked.

## 3.5 The Feature Build Process
### Every single feature. Every single time.

STEP 1 — IDEA IN VEERABHADRA CHAT
  Shon describes feature in plain English.
  VEERABHADRA asks clarifying questions.
  Decision: is this MIGRATION or CAPABILITY?

  MIGRATION = feature exists in production,
              needs syncing or improving
  CAPABILITY = new feature, does not exist yet

STEP 2 — PROTOTYPE IN CLAUDE.AI
  VEERABHADRA builds HTML prototype as artifact.
  Shon reviews. Iterates. Approves.
  No prototype approval = no proceeding.
  The prototype is the contract.

STEP 3 — PROTOTYPE TO BRAIN
  Approved prototype saved to:
  369-brain/prototypes/[feature-name].html
  Committed and pushed to 369-brain/main.

STEP 4 — FEATURE REGISTRY UPDATE
  Feature added to project/feature-registry.md
  Status: NEXT
  Dependencies documented.

STEP 5 — EAGLE MODE 1 (gap report)
  EAGLE reads prototype vs production.
  Produces gap report.
  STOP — Shon reviews in VEERABHADRA.

STEP 6 — EAGLE MODE 2 (spec)
  EAGLE produces written spec.
  HTML preview generated.
  STOP — Shon types "approved" to proceed.

STEP 7 — EAGLE MODE 3 (execute)
  Code written only after "approved".
  Risk-ordered stages.
  Stage report after each stage.

STEP 8 — VERIFY
  npm run build:all — zero new errors
  Three grep checks — all empty for CRM
  Visual check on localhost:4002
  Three-layer access audit if permissions touched

STEP 9 — COMMIT AND HANDOVER
  Change log entry written FIRST
  git add [specific files only]
  git commit with structured message
  GitHub Desktop pushes
  Latha reviews PR
  WhatsApp Latha with PR link and summary

STEP 10 — BRAIN UPDATE
  feature-registry.md status set to DONE
  Graphify updated
  Session-state updated
  Brain committed

## 3.6 The Role System — Permanent

USERTYPES — LOCKED AT 10. NEVER ADD MORE.

SUPER_ADMIN    Shon, Latha. Everything.
MANAGER        Don, Sruthi, Santosh. Operations.
TEAM_LEAD      Anandhu, Midhun, Stalin, Gopika. Call center.
STAFF          Internal coordinators.
AGENT          External DeAssists sub-agents.
ORG_OWNER      Partner org director (BCBT CEO level).
ORG_ADMIN      Partner org operations (BCBT manager level).
ORG_AGENT      Partner org field agents (BCBT coordinators).
USER           Students and applicants.
ALL            System marker only.

For finer granularity — use DATABASE ROLES.
Never add a new UserType. Never.

DATABASE ROLES — unlimited, no code change needed:
  CallCenter     CRM and call tools access
  SalesSetup     Sales configuration access
  Finance        Finance module access
  Vendor         Vendor portal access
  SMSAdmin       Student management access
  LMSAdmin       Learning management access
  Add any future role via database config only

## 3.7 The Data Flow — End to End

LEAD ENTERS:
  Universal form on any platform
    → POST /v1/leads (backend)
    → MongoDB leads collection
    → AI Lead Router assigns queue
    → Call center agent sees in portal

CALL LOGGED:
  Agent logs outcome in CallLogModal
    → POST /v1/leads/:id/call-log
    → logCall() state machine updates status
    → AI Follow-up Bot triggers if needed
    → Lead stays in queue or moves forward

CONVERTS:
  Agent marks converted
    → Lead becomes application record
    → Student gets portal account
    → Documents collected via portal
    → Coordinator submits to university
    → University responds
    → Student sees status in mobile app

ENROLLED:
  Application confirmed
    → Commission calculated automatically
    → Fee logged in finance module
    → Post-landing services activated
    → BCBT blocked account if needed
    → Student arrives in Germany

## 3.8 The API Pattern — Four Layers Always

Component
  imports named hook only
    → Named Hook
       libs/react-query/queries/{module}.ts
    → Core Hook
       useCustomQueryV2 or useCustomMutationV2
    → Axios Client
       libs/shared/config/axios-client.ts
       handles auth automatically
    → Backend
       NestJS controller → service → MongoDB

NEVER:
  Raw fetch() in components
  getCookie in components
  Authorization header set manually
  Inline useCustomQuery with raw URLs
  Any layer skipped for any reason

## 3.9 The Three-Layer Access Rule
### Every feature. Every time. All three.

LAYER 1 — SIDEBAR VISIBILITY
  sidemenu.ts + permission.helper.ts
  Who sees the menu item?

LAYER 2 — PAGE GUARD
  ALLOWED_ROLES array in page file
  Who can visit the URL?

LAYER 3 — DATA PERMISSION
  useCustomQuery + MongoDB roles
  Who can fetch the data?

All three must pass.
One passing does not mean all pass.
Test minimum two roles before every commit.

---

# BOOK 4 — THE GROWTH PLAN

## 4.1 The Next 30-75 Days

PRIORITY 1 — COMPLETE THE ERP FOUNDATION
  All 8 migration tasks done
  Phase 1 constants — missing enums added
  Phase 2A — Q Intelligence (CallLogModal)
  Phase 2B — Service Catalog
  Phase 2C — Course Finder
  Phase 2D — Sales Tools
  Phase 2E — Sales Library
  Universal lead capture form live
  Zero Google Sheets dependency

PRIORITY 2 — BCBT SEPTEMBER PROOF
  Full portal ready for BCBT September intake
  Every BCBT student onboarded through platform
  BCBT staff trained and using portal daily
  SMS prototype reviewed and approved

PRIORITY 3 — AI AGENTS FIRST WAVE
  Lead Router live — zero manual queue assignment
  Follow-up Bot live — zero manual reminders
  Doc Checker live — zero manual document chasing
  Status Updater live — zero manual status changes

## 4.2 The Next 6 Months

MONTH 1-2:  ERP MVP complete. BCBT live.
MONTH 3:    Finance module architecture and prototype.
MONTH 4:    SMS prototype built and reviewed with BCBT.
MONTH 5:    SMS build begins. Second university in pipeline.
MONTH 6:    Second university onboarded.
            BCBT as reference case for sales.
            Finance module live for BCBT.

## 4.3 The Next 12 Months

Q1 2027:  3 universities on platform.
           SMS live for BCBT.
           LMS prototype approved.
           DATEV integration researched.

Q2 2027:  LMS build begins.
           Finance module for all tenants.
           AI agents handling 60% of routine work.
           OpenClaw evaluation begins.

Q3 2027:  LMS live for BCBT.
           5 universities on platform.
           DATEV integration live for BCBT.
           Paperclip CEO dashboard prototype.

Q4 2027:  10 universities on platform.
           Full AI automation of routine operations.
           DeAssists sellable as standalone SaaS.
           International expansion research begins.

## 4.4 How We Scale Without Breaking

RULE 1 — New university = configuration, not code
  New tenant configured in MongoDB.
  No code deployment needed.
  Roles, permissions, services all configurable.

RULE 2 — New service = new module, not new spine
  Every new service is a module.
  Connects to the same backend.
  Same permission system. Same student record.

RULE 3 — New country = new data, same platform
  German-specific data is configuration.
  The platform works for any country.
  Regulations and partners are data.
  The code is universal.

RULE 4 — New staff = new role assignment, not new code
  Any user type gets any database role.
  No code change needed to give someone new access.
  All granularity via MongoDB roles.

RULE 5 — New AI agent = new subscriber, not new architecture
  Every state change fires an event.
  New agents subscribe to events.
  No existing code changes needed.
  Agents plug in — the system keeps running.

## 4.5 The Failure Mode Playbook

FAILURE: A key developer leaves
  Recovery: CLAUDE.md + OS gives full context in 2 hours
  New developer reads brain files before touching code
  No tribal knowledge required
  The system runs because it is documented

FAILURE: A university asks for custom feature
  Decision rule: does it work for ANY tenant?
  YES → build it properly for all tenants
  NO → configure it, do not code it
  Who decides: Shon + VEERABHADRA only

FAILURE: An AI agent makes wrong decision
  Recovery: session-lock.md shows state
  Audit: activity-log.md shows what happened
  Fix: decisions.md gets a new rule
  Never patch without documenting why

FAILURE: Two agents conflict on same task
  Prevention: session-lock.md blocks second agent
  Recovery: FORCE_CLEAN protocol
  Rule: one agent per brain file at a time

FAILURE: Commit breaks production
  Rule: never commit to main directly
  Recovery: revert via git — not patch forward
  Prevention: build:all gate before every commit

FAILURE: Session ends without close protocol
  Result: session-lock stays OPEN
  Next session: finds OPEN, raises warning
  Recovery: Shon types FORCE_CLEAN
  Prevention: "stop for today" triggers auto-close

FAILURE: Feature built without prototype
  Rule: revert the feature
  Build the prototype first
  Then rebuild correctly
  No exceptions. Ever.

FAILURE: Platform outgrows current architecture
  Sign: feature requires touching 10+ files
  Action: STOP — bring to VEERABHADRA
  Never patch architecture into code
  Redesign first — build after approval

---

# BOOK 5 — THE OPERATING MANUAL

## 5.1 How Every Session Starts

ON MAC MINI TERMINAL:
  cd ~/deassists-workspace/369-brain && git pull
  cd ~/deassists-workspace/deassists && git pull
  pm2 status   — all three must be online

IN CLAUDE CODE:
  "Run session-start skill"
  Reads session-lock.md first
  If IDLE → writes OPEN → continues
  If OPEN → hard stop → alert Shon
  Reports current position and next task
  Then waits for Shon instruction

IN VEERABHADRA (claude.ai):
  Tell VEERABHADRA what we are working on today
  VEERABHADRA confirms context is current
  Session begins

## 5.2 How Every Decision Gets Made

STEP 1 — Is this decision already locked?
  Read memory/decisions.md
  If YES → follow the locked decision. No discussion.
  If NO → go to Step 2.

STEP 2 — Is this a technical decision?
  YES → VEERABHADRA proposes options
        Shon chooses
        Decision goes to decisions.md immediately

STEP 3 — Is this a product decision?
  YES → Shon decides based on the seven principles
        Does it serve the student?
        Does it work for 50 universities?
        Does it support AI-first operations?
        Decision goes to decisions.md immediately

STEP 4 — Is this a business decision?
  YES → Shon decides
        VEERABHADRA documents implications
        Decision goes to decisions.md immediately

RULE: Every significant decision goes into
decisions.md before the next session starts.
If it is not written — it did not happen.

## 5.3 How Every New Person or Agent Onboards

FOR A NEW HUMAN (developer, partner, team member):
  Step 1: Read this file (THE-DEASSISTS-OS.md)
  Step 2: Read project/vision.md
  Step 3: Read CODING-CONSTITUTION.md
  Step 4: Read project/PRD.md
  Step 5: Read project/feature-registry.md
  Step 6: Read patterns/anti-ambiguity.md
  Step 7: Shadow one full feature cycle before touching code
  Time required: one full day
  No exceptions.

FOR A NEW AI AGENT:
  Step 1: Read CLAUDE.md (boot file)
  Step 2: Follow boot sequence exactly
  Step 3: Run session-start skill
  Step 4: Report position and await instruction
  Time required: under 90 seconds
  No exceptions.

FOR A NEW UNIVERSITY TENANT:
  Step 1: Create org record in MongoDB
  Step 2: Assign ORG_OWNER credentials
  Step 3: Configure database roles for their team
  Step 4: Scope their data via permission system
  Step 5: Train their ORG_ADMIN on portal
  No code deployment needed. Configuration only.

## 5.4 How Every Feature Gets Prioritised

PRIORITY FRAMEWORK — in order:

1. BLOCKING (do immediately)
   Anything that stops the portal working for users
   Security vulnerabilities
   Data loss risks
   BCBT September deadline items

2. HIGH (do this sprint)
   Missing enums before new components
   Features in current EAGLE phase
   AI agent hookup for live features

3. MEDIUM (do next sprint)
   Sales Library
   Admin and finance views
   CRM Overview

4. LOW (do when ready)
   Vendor Portal
   Kanban Board
   Advanced reporting

5. DEFERRED (future phases)
   SMS, LMS, DATEV
   Mobile app new features
   Multi-country expansion

RULE: Never start a LOW while a HIGH is NEXT.
RULE: Never start new feature while a blocker is open.
RULE: Latha blockers are always priority 1.

## 5.5 How Every Session Ends

TRIGGER: Shon says "stop for today" or "session ending"

MANDATORY SEQUENCE — all steps required:

E1  List all files created or modified today.
    Full paths. Brain and portal separate.

E2  Update memory/session-state.md
    Current position, last task, next task,
    any new blockers found today.

E3  Append memory/activity-log.md
    Date, session number, what was done,
    commits made with hashes,
    decisions locked today.

E4  Show Shon the updates.
    Wait for confirmation before committing.

E5  Commit brain files to 369-brain/main
    Specific files only — never git add .
    Confirm commit hash.

E6  Write IDLE to memory/session-lock.md
    STATUS: IDLE
    LAST_CLOSED_BY: [who]
    LAST_CLOSED_AT: [timestamp]
    LAST_TASK_COMPLETED: [task]
    NEXT_TASK: [what comes next]

    FINAL STEP. ALWAYS LAST.
    CANNOT BE SKIPPED.
    CANNOT BE COMBINED WITH OTHER STEPS.
    WITHOUT THIS — NEXT SESSION IS BLOCKED.

## 5.6 The Brain File Map — Complete

369-brain/
  CLAUDE.md                    Mission control boot file
  CODING-CONSTITUTION.md       All coding rules
  THE-DEASSISTS-OS.md          This file — company OS
  VEERABHADRA.md               Company identity

  project/
    vision.md                  ERP vision — founding document
    PRD.md                     Module requirements per module
    feature-registry.md        All features — status and priority
    architecture.md            Where code lives
    design-system.md           Tokens and visual rules
    never-touch.md             Files that cannot be modified

  memory/
    session-lock.md            Session integrity gate
    session-state.md           Current build position
    decisions.md               Locked decisions — append only
    activity-log.md            Session history — append only

  patterns/
    api-patterns.md            4-layer chain and hooks
    permission-patterns.md     Sidebar and access rules
    git-workflow.md            Git discipline
    anti-ambiguity.md          Pre-code checklist

  skills/
    eagleskill/                EAGLE bridge skill v2.1
    session-start/             Session start skill
    uiux-superman/             UI redesign skill
    salesdocskill/             Sales document skill
    deassists-sidebar-audit/   Permission audit skill

  prototypes/
    deassists-platform.html    Master prototype 5659 lines
    [feature-name].html        One prototype per feature

  change-logs/
    BRANCH-CHANGE-LOG-portal.shon369.md

  company/
    staff-brain.md             Full team details
    partners-brain.md          University partners

  archive/                     Superseded files — read only

## 5.7 The Never-Touch List

PORTAL REPO — READ PERMITTED, MODIFY NEVER:
  apps/cms-next/pages/universitiesd/
  apps/backend-nest/src/core/entities/
    extendables/payment.entity.ts
  apps/mui-cms-next/
  MASTER-RUN.cjs
  scope.guard.ts
  Any .env file
  package.json and pnpm-lock.yaml
    without Latha approval
  Any file with JWT or AWS credentials

BRAIN REPO — READ PERMITTED, MODIFY NEVER:
  archive/
  code-snapshot/
  graphify-out/

If a task requires touching these:
  Hard stop. Do not open the file.
  Alert Shon immediately. Wait.

---

# APPENDIX A — GLOSSARY

VEERABHADRA      Master brain in claude.ai.
                 Plans everything.
                 Digital twin of Shon AJ.

Execution Agent  Any AI tool running CLAUDE.md boot file.
                 Claude Code, Cursor Agent, or future AI.
                 The rules apply regardless of which tool.

EAGLE            Discipline skill bridging prototype to production.
                 4 modes. Add-only enforcement.
                 HTML preview mandatory before any code.

session-lock     File that controls whether a session can start.
                 STATUS: IDLE = safe to start.
                 STATUS: OPEN = blocked.

cms-next         Staff and partner portal. Port 4002.
                 Primary application. All portal work here.

feature/portal
.shon369         Active build branch.
                 All 8 migration tasks land here.

MIGRATION        Feature exists in production. Needs syncing.
                 Production wins ties in reconciliation.

CAPABILITY       Feature does not exist yet.
                 Prototype leads. Production catches up.

dev_v2           Integration branch.
                 Latha merges features here.

BCBT             First external university tenant.
                 Already live on platform today.
                 September 2026 MVP target.

OpenClaw         Future orchestrator agent. Concept only.
                 Comes after operations layer is stable.

Paperclip        Future CEO dashboard layer. Concept only.
                 Sits above all operations. Shon's view.

Two-repo rule    369-brain and deassists never mix in one commit.
                 Latha never sees 369-brain.

Add-only rule    EAGLE never modifies existing logic.
                 Only adds new code alongside existing.

Four-layer chain Component then Named Hook then Core Hook
                 then Axios Client then Backend.
                 No exceptions.

Three-layer audit Sidebar plus Page guard plus Data permission.
                 All three must pass for every feature.

Prototype-first  Every feature needs an approved HTML prototype
                 before any code is written.
                 No exceptions. Ever.

---

# APPENDIX B — QUICK REFERENCE COMMANDS

SESSION START:
  cd ~/deassists-workspace/369-brain && git pull
  cd ~/deassists-workspace/deassists && git pull
  pm2 status

BUILD CHECK:
  cd ~/deassists && npm run build:all

THREE GREP CHECKS:
  grep -rn "await fetch(" apps/cms-next/components/ apps/cms-next/pages/
  grep -rn "getCookie" apps/cms-next/components/ apps/cms-next/pages/
  grep -rn "Authorization.*Bearer" apps/cms-next/components/ apps/cms-next/pages/

GRAPHIFY UPDATE (after portal commit):
  cd ~/deassists && \
  /opt/homebrew/bin/graphify update . \
  --output ~/deassists-workspace/369-brain/graphify-out/

PM2:
  pm2 status
  pm2 stop cms
  pm2 restart all

RECOVERY (if portal crashes):
  pm2 stop all && \
  rm -rf apps/cms-next/.next && \
  pm2 start all

GIT BRAIN COMMIT:
  cd ~/deassists-workspace/369-brain
  git add [specific files]
  git commit -m "brain: [what changed]"
  git push origin main

---

# CLOSING STATEMENT

This document was written by VEERABHADRA
on behalf of Shon AJ, CEO of Three Sixty Nine GmbH.

It is the founding operating system of DeAssists —
a company built by one non-developer founder
and an AI system working in complete alignment.

What makes this historically significant is not
the technology. It is the discipline.

The same principles that make a great company
make a great codebase make a great AI system.
Write everything down. Build for the long term.
Never hardcode assumptions. Make it work for anyone.

This file will outlive every tool used to build it.
The principles do not expire.
The seven principles never change.
Everything else evolves correctly around them.

---

*THE DEASSISTS OPERATING SYSTEM v2.0*
*Owner: Shon AJ — Three Sixty Nine GmbH — Berlin*
*Brain: VEERABHADRA — Claude.ai*
*Built with discipline, not just code.*
