# DeAssists — Data Readiness Pattern
# Version: 1.0 | Date: 2 May 2026
# Owner: Shon AJ | Brain: VEERABHADRA
# Location: 369-brain/patterns/DATA-READINESS.md
#
# READ THIS IN EAGLE MODE 1 BEFORE WRITING ANY SPEC.
# EVERY FEATURE THAT DISPLAYS DATA MUST PASS THIS CHECK.

---

## PURPOSE

Every feature in the DeAssists portal either displays data,
accepts data, or both. Before any feature is specced or built,
the data behind it must be classified into one of four states.

This classification happens in EAGLE Mode 1 — after the gap
report, before the spec is written.

Getting this wrong costs days. A feature built for data that
does not exist wastes a full build cycle. A feature built
without an entry path for its data is useless on day one.

This file prevents both mistakes.

---

## THE FOUR DATA STATES

---

### STATE 1 — DATA READY

The data exists right now. Either as a TypeScript constant
in the codebase or as a live MongoDB collection with a
working endpoint.

Action: Build the full feature. Connect to data in the
same build cycle. No waiting. No empty state needed.

Signs this is State 1:
  - Data is a TypeScript constant (enum, registry, config)
  - Collection exists in collections.ts
  - Endpoint exists in the backend controller
  - Hook exists or can be created immediately

DeAssists examples:
  Service Catalog — serviceRegistry is a TypeScript constant.
  Leads page — Leads collection exists, endpoint exists.
  Dashboard stats — aggregation endpoints exist.

---

### STATE 2A — DATA PENDING, SELF-SERVE

The data does not exist yet in the database, but we own
it and can create it ourselves. A manager or admin can
log into the portal and start entering or uploading data
from day one without any external dependency.

Action:
  - Build the full display page
  - Build the data entry path (upload modal, form, wizard)
  - Design a clear empty state with a CTA to add first item
  - Raise a Latha task to create the backend collection
    and endpoints in parallel
  - When Latha's backend is ready, connect the hook
  - Page comes alive automatically

Empty state pattern:
  "No [items] yet. [Role] can add the first one using
   the [button] above."

DeAssists examples:
  Sales Library — brochures, templates, forms are our own
  content. A manager uploads them. We build the full page
  including the AssetWizardModal. Latha builds the
  library-assets collection in parallel.

---

### STATE 2B — DATA PENDING, EXTERNAL OR STRUCTURED

The data exists somewhere — in Google Sheets, in an
existing MongoDB collection, in partner systems, or in
operational records — but it is not yet connected to
the portal. We cannot enter it through a simple form.
It needs a data pipeline, a Latha task to structure it,
or an import from existing sources.

Action:
  - Build the full display page and all components
  - Design a clear empty state that explains what will
    appear here and when
  - Do NOT build a data entry form (the data comes from
    elsewhere, not user input)
  - Raise a specific Latha data task:
    what collection, what fields, what source
  - After build is complete, connect as a separate step
    when Latha confirms data is ready
  - Page comes alive when connection is made

Empty state pattern:
  "No [items] loaded yet. Data is being connected.
   This page will populate automatically."

DeAssists examples:
  Course Finder — courses, universities, programmes,
  fees already exist in Latha's DB (CollectionNames.Courses,
  CollectionNames.University). We build the display page
  and components. Then connect to the existing endpoints
  as a separate step. If endpoints do not exist yet,
  we raise a specific Latha task.

  Agent Network — agent data comes from existing user
  records filtered by UserType.AGENT. We build the display
  page. Connect to the existing users endpoint filtered
  by role.

---

### STATE 3 — DATA BLOCKED

No data exists anywhere. No collection. No endpoint.
No sheet. No external source. The feature cannot display
or collect meaningful data until a backend foundation
is built first by Latha.

Action:
  - Do NOT build the frontend yet
  - Mark feature as BLOCKED in feature-registry.md
  - Raise a specific Latha task with exact requirements:
    collection name, fields, endpoints needed
  - Return to this feature only after Latha confirms
    the backend is complete and tested
  - Only then begin EAGLE Mode 1 for this feature

DeAssists examples:
  Finance module — fee_confirmations, invoices, payments,
  commission_events collections do not exist.
  Blocked until Latha builds them.

  DATEV integration — no integration layer exists.
  Blocked until architecture is decided.

---

## THE CHECKLIST — RUN IN EAGLE MODE 1

For every feature in scope, answer these questions in order:

QUESTION 1 — What data does this feature display?
  List every data field the feature needs to show.
  Example: course name, university, fee, intake, duration

QUESTION 2 — Where does that data live today?
  Option A: TypeScript constant in the codebase
  Option B: MongoDB collection (name it)
  Option C: Google Sheets or external source
  Option D: Does not exist anywhere

QUESTION 3 — Is there a working endpoint today?
  Check: apps/backend-nest/src/[module]/[module].controller.ts
  If yes — name the endpoint
  If no — proceed to Question 4

QUESTION 4 — Can we enter this data ourselves?
  If yes — State 2A. Build with entry path.
  If no, data comes from external source — State 2B.
  If no data exists anywhere — State 3. Block.

QUESTION 5 — What is the Latha task?
  State 1: No Latha task needed.
  State 2A: Create [collection], [fields], [endpoints].
             We build frontend in parallel.
  State 2B: Connect [existing collection] to new endpoint.
             Or structure data from [source].
             We build frontend first, connect after.
  State 3: Build [collection], [fields], [endpoints].
            We wait. Do not start frontend.

---

## THE EMPTY STATE DESIGN RULE

Every page that depends on data that does not yet exist
must have a designed empty state. A blank screen is never
acceptable.

Empty state must contain:
  1. An icon or illustration (relevant to the content)
  2. A clear headline: what this page will show
  3. A one-line explanation: why it is empty right now
  4. A CTA: what action populates this page

State 2A empty state example:
  [icon: upload]
  No assets in this service yet
  Ask a manager to upload the first brochure or template.
  [+ New Asset button — visible to MANAGER only]

State 2B empty state example:
  [icon: database/sync]
  Course data is being connected
  This page will populate automatically once the
  course database is linked.
  [No CTA — data comes from system, not user action]

State 3 is never shown to users — feature is not built yet.

---

## HOW THIS CONNECTS TO EAGLE

EAGLE Mode 0 — baseline scan of codebase.
  After Mode 0, EAGLE reads this file and runs the
  checklist for every feature in the upcoming phase.

EAGLE Mode 1 — gap report.
  Gap report must include a DATA STATE DECLARATION section:
  | Feature | Data State | Data Source | Latha Task |
  This section appears before the build plan.
  Shon reviews and confirms before Mode 2 begins.

EAGLE Mode 2 — spec and HTML preview.
  State 1: spec shows real data connected.
  State 2A: spec includes entry path and empty state.
  State 2B: spec includes empty state. Entry path deferred.
  State 3: feature not specced. Latha task written instead.

EAGLE Mode 3 — execute.
  State 2A and 2B: empty state is built as part of the
  feature. It is not a placeholder — it is a designed,
  permanent UI state that displays until data exists.

---

## VERSION HISTORY

v1.0 — 2 May 2026 — initial pattern
  Created from real mistakes on Phase 2B and Phase 2E.
  Sales Library (State 2A) and Course Finder (State 2B)
  were the defining examples that shaped this pattern.

---

*Data Readiness Pattern — DeAssists*
*Owner: Shon AJ | Brain: VEERABHADRA*
*Created: 2 May 2026*
*Referenced by: EAGLESKILL.md Mode 1, eagleskill-config.md Tier 2*
