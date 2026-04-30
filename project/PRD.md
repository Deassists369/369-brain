# DeAssists Portal — Product Requirements Document
# Version: 1.1 | Date: 30 April 2026
# Owner: Shon AJ | Brain: VEERABHADRA
# Location: 369-brain/project/PRD.md
#
# This document defines what each module does,
# who uses it, what data it needs, and what
# success looks like per module.
#
# Read vision.md for WHY.
# Read CODING-CONSTITUTION.md for HOW.
# This document answers WHAT and WHO.

---

## CORE PHILOSOPHY — READ FIRST

DeAssists is building a full ERP with minimal
human staff. We never add new staff types to
solve operational problems.

The answer is always:
  Existing UserType + database role + AI agent

Not:
  New UserType + more staff

Every repetitive task gets an AI agent.
Every exception goes to a human.
This applies to DeAssists, BCBT, and all
future tenants without exception.

---

## HOW TO USE THIS DOCUMENT

Before building any feature:
  1. Find the module in this document
  2. Read the full module section
  3. Check data requirements
  4. Check which roles use it
  5. Open CODING-CONSTITUTION.md
  6. Follow Part B (new) or Part C (existing)

---

## ROLE SYSTEM — MASTER REFERENCE

### UserTypes (PERMANENTLY LOCKED — 10 types only)

This list never grows. No new types ever.
All operational granularity via database roles.

```
SUPER_ADMIN    Shon, Latha. Full access. No limits.

MANAGER        Don, Sruthi, Santosh.
               Operations management.
               Full portal minus auth and payments.

TEAM_LEAD      Anandhu, Midhun, Stalin, Gopika.
               Call center and process leads.
               Applications + CRM via database role.

STAFF          Internal coordinators.
               Application processing.
               Service user management.

AGENT          External DeAssists sub-agents.
               Limited access via /service/ paths.
               Sales Library if role granted.

ORG_OWNER      Partner org director level.
               BCBT CEO equivalent.
               Scoped to their org via MongoDB roles.

ORG_ADMIN      Partner org operations level.
               BCBT manager equivalent.
               Scoped to their org via MongoDB roles.

ORG_AGENT      Partner org field agents.
               BCBT coordinator equivalent.
               /service/ path access. Role-scoped.

USER           Students and applicants.
               Self-service portal only.

ALL            System marker. Not a real user type.
```

### Database Roles (unlimited — no code change needed)

These are assigned in MongoDB per user.
Adding a new role needs zero code deployment.
This is how we give any user type any capability.

```
CallCenter     Access CRM, lead queue, call tools.
               Any UserType can hold this role.

SalesSetup     Access sales configuration.

Finance        Access finance module.
               Currently SUPER_ADMIN only.
               Future: ORG_OWNER for their own org.

Vendor         Access vendor portal.
               Phase 2 — accommodation providers.

SMSAdmin       Access student management system.
               Future module.

LMSAdmin       Access learning management system.
               Future module.
```

### AI Agents (fill gaps, eliminate repetitive work)

Every repetitive task that a human does today
gets an AI agent assigned to it.
Humans handle only exceptions and relationships.

```
Lead Router        Routes new leads to correct queue.
                   Replaces manual queue assignment.

Follow-up Bot      Sends reminders after missed calls.
                   Replaces manual follow-up tracking.

Doc Checker        Checks application document completeness.
                   Flags missing docs automatically.

Status Updater     Updates application status on triggers.
                   Replaces manual status changes.

Fee Reconciler     Matches payments to fee records.
                   Replaces manual reconciliation.

Report Builder     Generates weekly performance reports.
                   Replaces manual reporting.
```

New agents added as operations are understood.
No limit. No code change needed for new agents.

### How BCBT Scoping Works

```
Current mechanism: MongoDB role-based permissions.
NOT tenant ID filtering in queries.

Every non-SUPER_ADMIN sidebar child passes
two gates:
  Gate 1: permissionLevel includes UserType
  Gate 2: user.roles has permission for
          that collection in MongoDB

BCBT staff see only what their MongoDB
organisation roles permit.
No code change needed to scope a new university.
Database configuration only.
```

### Known Permission Bug (Latha — HIGH before Sept)

```
Plain English explanation:
  The server has a sticky note from one user's
  session that bleeds into the next user's session.
  User B can get wrong menus based on User A's
  restrictions.

Technical location:
  libs/shared/functions/permission.helper.ts
  Variables: hasCourseListPermission and
             hasEverBeenRestricted
  These are module-level — they persist
  across server calls between different users.

Risk today: LOW (server restarts clear it).
Risk at scale: HIGH.
Risk for multi-tenant: CRITICAL.
Must fix before BCBT September production.
Owner: Latha.
```

---

## MODULE 1 — STUDENT PORTAL AND APPLICATION MANAGEMENT
## Status: LIVE

### What it does

Two audiences use the same platform simultaneously.

STUDENT SIDE:
  Apply for programmes and services.
  Upload required documents.
  Track application status.
  Manage journey to Germany.

STAFF AND PARTNER SIDE:
  Process applications.
  Manage student records.
  Coordinate services.
  Track progress across all applications.

### Who uses it

STUDENTS (UserType: USER)
```
Pages:  Home, Programs and Courses, Our Services,
        My Applications, My Documents,
        My Payments, My Profile
Can do: Apply, upload, track, pay, communicate
AI:     Status update bot notifies automatically
        Document checklist agent flags missing docs
```

STAFF (UserType: STAFF)
```
Pages:  Dashboard, Applications (all 11 types),
        Manage User Accounts (service users),
        My Profile
Can do: Process applications, manage service users
AI:     Document checker flags incomplete apps
        Status updater handles routine changes
```

MANAGERS (UserType: MANAGER)
```
Pages:  Dashboard, Services, Service Setup,
        Email Setup, Applications,
        Manage User Accounts, My Profile
Can do: Full application management,
        user management, service configuration
AI:     Report builder generates weekly summaries
        Lead router handles queue assignment
```

TEAM LEADS (UserType: TEAM_LEAD)
```
Pages:  Dashboard, Applications,
        Manage User Accounts (limited), My Profile
Roles:  + SidebarRole.CallCenter for CRM access
Can do: Application processing, call center ops
AI:     Follow-up bot handles missed call reminders
        Status updater handles outcome-based changes
```

INTERNAL AGENTS (UserType: AGENT)
```
Pages:  Dashboard, Services via /service/ paths,
        Applications, limited user management
Note:   Different URL prefix from internal staff
        /service/{collection} not /{collection}
Roles:  Sales Library access if granted
AI:     Sales Library search agent (future)
```

BCBT OWNER (UserType: ORG_OWNER)
```
Pages:  Same as MANAGER level
Scoped: MongoDB roles limit to BCBT data only
Can do: Full management within their org
AI:     Same agents as MANAGER, scoped to BCBT
```

BCBT ADMIN (UserType: ORG_ADMIN)
```
Pages:  Same as ORG_OWNER in sidebar
Scoped: MongoDB roles limit to BCBT data only
Roles:  Can hold CallCenter role for CRM access
        Can hold Finance role for finance access
AI:     Role-appropriate agents assigned
```

BCBT AGENTS (UserType: ORG_AGENT)
```
Pages:  Dashboard, Services via /service/ paths,
        Applications, limited user management
Scoped: MongoDB role permissions
Note:   Same /service/ path pattern as AGENT
AI:     Doc checker, follow-up bot
```

### Application types live today
```
Apartments, Ausbildungs, APS and Document
Translations, Blocked Accounts, Courses,
Insurances, Full-time Jobs, Part-time Jobs,
Legal Supports, Post Landing Services,
Visa Services
```

### Data in MongoDB (live)
```
users              Student and staff accounts
applications       All service application records
documents          Uploaded files (S3 backed)
universities       19 partner university records
courses            Course catalog
organizations      BCBT and other org records
roles              Database roles per user
permissions        Per collection per role
email_templates    Custom email templates
```

### Never-touch page
```
apps/cms-next/pages/universitiesd/
BCBT white-label universities page.
Thin ModelList wrapper. No page-level role gate.
Do not modify. Do not add guards. Do not touch.
```

### Success definition
```
Student applies without staff assistance
Staff processes without opening email
BCBT sees only their own data
Document upload works reliably
No permission bleed between users
AI handles all routine status notifications
```

---

## MODULE 2 — LEAD AND SALES SYSTEM
## Status: BUILDING NOW (feature/portal.shon369)

### What it does

Full lead management from first contact to
conversion. Completely replaces Google Sheets.

LEAD CAPTURE:
  Universal contact form embeddable anywhere.
  Every submission creates a CRM lead.
  Auto-routes by source and service.
  Zero manual entry required.
  Must work for DeAssists AND BCBT.

LEAD MANAGEMENT:
  Queue-based lead view with sidebar counts.
  Lead detail panel with full call history.
  Call logging with 6 outcome types.
  Auto status update on call outcome.
  Comment threads per lead.
  Lead assignment to agents.
  CSV export.

SALES TOOLS:
  Service catalog — all services.
  Course finder with fee calculator.
  FAQ bank per service.
  Call scripts per service.
  WhatsApp templates.
  Quote generation.

SALES LIBRARY:
  Central asset store (PDFs, videos, templates).
  Send asset to student via 3 methods.
  Service-tagged filtering.
  Asset creation and management.
  Access: SUPER_ADMIN, MANAGER, STAFF by default.
  Optional: AGENT, ORG_AGENT via database role.
  Plan: After 90-day internal test, open to all
        agents as central sales resource.

COMMISSION TRACKING:
  Agent commission per conversion.
  Fee confirmation log per student.
  Payment reconciliation.

### Who uses it

CALL CENTER (UserType: TEAM_LEAD + CallCenter role)
```
Access: Lead queue, call logging, status updates,
        all sales tools, FAQ, scripts, templates
AI:     Follow-up bot handles missed call reminders
        Status updater handles outcome changes
        Lead router manages queue assignment
```

MANAGERS (UserType: MANAGER + CallCenter role)
```
Access: All above plus CRM overview,
        agent performance, queue health,
        commission overview
AI:     Report builder generates weekly summaries
        Lead router manages team assignment
```

BCBT STAFF using CRM
```
ORG_ADMIN + CallCenter database role
Same CRM access as TEAM_LEAD
Scoped to BCBT leads only via MongoDB
AI: Same agents, scoped to BCBT data
```

AGENTS accessing Sales Library
```
AGENT or ORG_AGENT + Library database role
Read-only access to approved assets
Send to student capability
No CRM or lead queue access
```

### Universal Lead Capture Form
```
Single embeddable form. Works on:
  DeAssists website (website-next)
  Public landing pages
  Partner websites
  Social media links
  WhatsApp links
  Any external platform

Must prove it works for:
  DeAssists (primary operator)
  BCBT (wrapper org proof of concept)

On submission:
  Lead created in MongoDB immediately
  Source tracked via URL parameter
  Service pre-selected via URL parameter
  Auto-routed to correct queue
  AI Lead Router assigns to agent
  Student receives confirmation
  Zero manual entry

Technical:
  Backend: POST /v1/leads (exists)
  Frontend: new embeddable component needed
```

### Data in MongoDB

Exists and live:
```
leads              26 fields, fully operational
lead_call_logs     Backend exists, frontend missing
```

Missing — build before features:
```
courses            Course catalog with fees
programmes         Per university programme list
faq_bank           FAQ per service type
call_scripts       Scripts per service type
wa_templates       WhatsApp templates per service
library_assets     Sales library files
commission_events  Commission per conversion
fee_confirmations  Fee receipt records
```

Google Sheets — temporary, to migrate:
```
369 Leads Tracker  Current live CRM
BCBT leads sheet   University-owned, separate
Course fee data    Move to MongoDB courses
```

### Missing enums (create before any component)
```
ServiceCategory    Service-tagged filtering
LeadScoreBand      Lead quality scoring
PartnershipTier    Partner university tier
ProgrammeLevel     Bachelor, Master, PhD etc
StudentType        Fresh, Transfer, Working etc
AssetType          PDF, Video, Template etc
FeeStatus          Pending, Confirmed etc
EnrollmentStatus   Applied, Enrolled etc
SidebarRole.Finance  New — finance zone
SidebarRole.Vendor   New — vendor zone Phase 2
```

### Missing hooks
```
useLogCall          POST /v1/leads/:id/call-log
                    Backend EXISTS. HIGH priority.
useProgrammes       GET /v1/programmes
useUniversities     GET /v1/universities
useFeeConfirmations GET /v1/fee-confirmations
useLibraryAssets    GET /v1/library-assets
useCommissions      GET /v1/commissions
```

### Missing components
```
CallLogModal        6 outcomes, callback fields
QuoteModal          WhatsApp copy, quote ready
CourseFinderDrawer  Overlay with fee calculator
ServiceCatalogGrid  All services grid view
CourseCard          Per course display
CalculatorPanel     Fee calculator
KPIMetricCard       Metric display
FAQCard             FAQ per service
ScriptSteps         Call script display
WATemplateCard      Template display and copy
KanbanBoard         5 column status board
SalesLibraryCard    Asset display card
SendAssetModal      3 send methods
AssetWizardModal    9 field asset creation
AssetEditModal      Edit asset metadata
AssetArchiveModal   Archive confirmation
PartnerTable        Partner university list
AgentCard           Agent profile card
FeeLogTable         Fee log table
CommissionTable     Commission records
```

### Missing pages
```
/catalog              Service Catalog
/sales-guide/courses  Course Finder
/sales-guide/faq      FAQ Bank
/sales-guide/script   Call Script
/sales-guide/wa       WhatsApp Templates
/crm-overview         CRM Overview admin
/partners             Partner Universities
/agents               Agent Network
/library              Sales Library Catalog
/library/:id          Sales Library Detail
/finance/fees         Fee Log
/finance/commissions  Commissions
/finance/invoices     Invoices
/finance/payments     Payments
/vendor/inventory     Phase 2
/vendor/bookings      Phase 2
/vendor/payouts       Phase 2
```

### Build order
```
Phase 1   Missing enums in lead.constants.ts
Phase 2A  Q Intelligence (CallLogModal + hook)
Phase 2B  Service Catalog foundation
Phase 2C  Course Finder
Phase 2D  Sales Tools (FAQ, Script, WA)
Phase 2E  Sales Library
Phase 3   Admin and Finance deferred
Phase 4   Vendor Portal deferred
```

### Success definition
```
Call center never opens Google Sheets
Every call logged with outcome and AI follow-up
Lead status always reflects last call
Course fee found in under 30 seconds
Quote generated without leaving portal
Universal form creates leads from any source
BCBT can use all features as wrapped org
AI handles all routine lead management tasks
```

---

## MODULE 3 — FINANCE MODULE
## Status: NEXT — estimated early 2027

### What it does

Fee tracking, invoice management, commission
reconciliation and payment confirmation.
Foundation for DATEV connection.

Built first for BCBT and Accommodation as
two proof-of-concept service types.
If it works for both, it works for any
university or service provider.

### Why BCBT and Accommodation first
```
BCBT           University admissions fees,
               application fees, service charges.
               Most complex education fee structure.
               Proves module works for education orgs.

Accommodation  Direct service fees, deposits,
               monthly charges.
               Proves module works for service orgs.

Together they cover both tenant types.
Every future service and university is
a configuration of one of these two patterns.
```

### Who uses it
```
SUPER_ADMIN              Full finance access
                         All tenants, all fees

ORG_OWNER + Finance role Their own org finance only
                         Scoped by MongoDB roles
                         BCBT sees BCBT fees only

AI Fee Reconciler        Matches payments automatically
                         Flags mismatches for human review
                         Human handles exceptions only
```

### Commission structure
```
Internal:
  Agent commission per converted lead
  Calculated automatically on conversion
  Staff read-only view

Partner:
  BCBT commission per enrolled student
  Accommodation commission per booking
  Each org sees only their own commissions

AI reconciler:
  Matches payment receipts to records
  Flags discrepancies automatically
  Finance admin reviews exceptions only
```

### Data needed
```
fee_confirmations    Fee receipts per student
invoices             Invoice records per org
payments             Payment confirmations
commission_events    Commission per conversion
```

### Build approach
```
Step 1  Understand BCBT fee structure.
        Shadow their current manual process.
Step 2  Understand Accommodation fee structure.
Step 3  Architecture document.
        Design for any service — not just two.
Step 4  Prototype for both service types.
Step 5  UI/UX review against existing portal.
Step 6  BCBT approval.
Step 7  Build for BCBT and Accommodation.
Step 8  Extend to all other services.
```

### Success definition
```
Zero manual fee tracking in spreadsheets
Every commission calculated automatically
BCBT finance team runs reports independently
Accommodation provider sees their earnings
AI reconciler handles routine matching
Human reviews exceptions only
DATEV export ready
```

---

## MODULE 4 — STUDENT MANAGEMENT SYSTEM
## Status: FUTURE — BCBT September 2026

### What it does

University internal operations.
Runs daily university work with minimal staff.
AI handles all routine tasks.

```
Attendance     Tracking, reminders, reporting
Timetables     Rooms, instructors, schedules
Exams          Paper setting, results entry
Results        Automated publication to students
Certificates   Auto-generated on completion
Progress       Academic tracking per student
```

### Who uses it
```
ORG_OWNER, ORG_ADMIN   Full SMS management
ORG_AGENT + SMS role   Attendance, timetables
Educator role TBD      Results, content
USER (students)        Read-only their own record

AI agents:
  Attendance bot       Sends reminders automatically
  Absent flag          Notifies coordinator instantly
  Results publisher    Publishes without manual trigger
  Certificate bot      Generates on pass confirmation
  Progress reporter    Weekly reports automatically
```

### Build approach
```
Step 1  Go into BCBT. Shadow operations fully.
        Map every manual workflow.
Step 2  Architecture. Design for any university.
Step 3  Prototype. Full SMS UI.
Step 4  Review against existing portal UI/UX.
Step 5  BCBT staff approval.
Step 6  Build.
Step 7  Run September 2026 intake on SMS.
Step 8  Postmortem. Fix. Sell to next university.
```

### Success definition
```
BCBT runs September 2026 intake on platform
Attendance tracked without paper or Excel
Results published through system automatically
Students see their own academic record
50 percent reduction in admin staff time
AI handles all routine university admin
```

---

## MODULE 5 — LEARNING MANAGEMENT SYSTEM
## Status: FUTURE — after SMS is live

### What it does
```
Course content delivery
Assessments and assignments
Progress tracking per student
Certificates on completion
Instructor content management
```

Connected directly to SMS student records.
Same student. No duplicate data entry.

### Who uses it
```
Educators         Upload content, grade work
Students          Learn, submit, track progress
University admin  Monitor, report, certify

AI agents:
  Submission checker   Flags late submissions
  Progress tracker     Alerts on student at risk
  Certificate bot      Auto-generates on completion
```

### Success definition
```
Students complete full courses inside platform
Certificates automatically generated
No third-party LMS needed
Progress visible to all stakeholders automatically
```

---

## MODULE 6 — TAX AND COMPLIANCE
## Status: FUTURE — after Finance module stable

### What it does
```
DATEV integration for German tax compliance
Financial reporting for university finance
Audit trail for all financial transactions
Makes platform compliant for any German
education or expat services business
```

### Build approach
```
Step 1  Understand BCBT tax requirements
Step 2  Understand DATEV API and format
Step 3  Architecture document
Step 4  Prototype data flow
Step 5  Build integration
Step 6  Test with BCBT finance team
Step 7  Extend to all tenants
```

### Success definition
```
Zero manual tax export
DATEV receives correct data automatically
Complete audit trail exportable
Each tenant gets their own DATEV output
```

---

## OPEN BLOCKERS — PRE-EXISTING

### Latha owns
```
1. JWT secrets rotation             CRITICAL
   All secrets exposed in Git history.
   Must rotate before any production use.

2. AWS ACL TypeScript error         MEDIUM
   accounts.service.ts line 1276.
   Type string not assignable to ObjectCannedACL.

3. Stripe write-back bug            HIGH
   Payment status never saved to MongoDB.
   Fix before finance module.

4. Security guard bypass            HIGH
   scope.guard.ts approximately line 79.
   Fix before production.

5. Permission SSR bleed bug         HIGH
   permission.helper.ts module-level variables.
   hasCourseListPermission and
   hasEverBeenRestricted persist between users.
   Fix before BCBT September production.
```

### Shon owns
```
6. assigned_to enum EMPTY           HIGH
   Needs 37 agent names from Google Sheets.
   Column K formula: =UNIQUE(K2:K9999)
```

---

*DeAssists Portal PRD v1.1*
*Owner: Shon AJ | Brain: VEERABHADRA*
*Created: 30 April 2026*
*Location: 369-brain/project/PRD.md*
*Update when new module is specced or*
*requirements change significantly*
