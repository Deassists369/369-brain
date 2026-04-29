# EAGLE v2.1 — Mode 1 — Full Prototype Inventory
# DeAssists Portal Gap Report
# Date: 29 April 2026
# Branch: feature/portal.shon369

---

## EXECUTIVE SUMMARY

**Prototype:** 5,659 lines at `prototypes/deassists-platform.html`
**Production sidemenu.ts:** 511 lines (full structure)
**Production pages:** 53 TSX files
**Production components:** 41 component folders + 6 leads-specific

### Key Findings

| Category | Prototype | Production | Gap |
|----------|-----------|------------|-----|
| Sidebar items (CRM zone) | 14 | 4 | 10 missing |
| Pages (CRM/Sales) | 20 | 3 | 17 missing |
| UI Components (CRM) | ~25 | 6 | ~19 missing |
| Modals | 7 | 0 | 7 missing |

**Classification:**
- **MIGRATION** items: 3 (exist in production, need token/style sync)
- **CAPABILITY** items: 24 (new builds required)

---

## SECTION 1: SIDEBAR INVENTORY

### 1A. Prototype Sidebar Structure (lines 721-756)

```
ZONE: Call Center 369
├── Sales Dashboard          [STAFF+]
├── All Leads                [STAFF+]
└── Add Lead                 [STAFF+]

ZONE: Sales Guide (white-label/operator only)
├── Service Catalog          [STAFF+]
└── Sales Library            [STAFF+]

ZONE: Vendor Portal [PHASE 2]
├── Inventory                [VENDOR]
├── Bookings                 [VENDOR]
└── Payouts                  [VENDOR]

ZONE: Sales CRM [MGR badge]
├── CRM Overview             [MANAGER+]
└── Agent Network            [MANAGER+]

ZONE: Finance [ADMIN badge]
├── Commissions              [ADMIN]
├── Invoices                 [ADMIN]
└── Payments                 [ADMIN]
```

### 1B. Production sidemenu.ts (current)

```
ZONE: Call Center 369 (SidebarRole.CallCenter)
├── Sales Dashboard          /dashboard       [SA, OA, M]
├── All Leads                /leads           [SA, OA, M]
└── + Add Lead               /leads/new       [SA, OA, M]

ZONE: Sales CRM (SidebarRole.SalesSetup)
└── Sales Setup              /page-workinprogress?status=salessetup  [SA, OA, M]
```

### 1C. Sidebar Gap Analysis

| Prototype Item | Production Status | Type | UserTypes | SidebarRole | Priority |
|----------------|-------------------|------|-----------|-------------|----------|
| Sales Dashboard | EXISTS at /dashboard | MIGRATION | SA, M, TL | CallCenter | — |
| All Leads | EXISTS at /leads | MIGRATION | SA, M, TL | CallCenter | — |
| + Add Lead | EXISTS at /leads/new | MIGRATION | SA, M, TL | CallCenter | — |
| Service Catalog | MISSING | CAPABILITY | SA, M, TL, STAFF | CallCenter | HIGH |
| Sales Library | MISSING | CAPABILITY | SA, M, TL, STAFF | CallCenter | MEDIUM |
| Inventory | MISSING (Phase 2) | CAPABILITY | ORG_OWNER, ORG_ADMIN | Vendor | LOW |
| Bookings | MISSING (Phase 2) | CAPABILITY | ORG_OWNER, ORG_ADMIN | Vendor | LOW |
| Payouts | MISSING (Phase 2) | CAPABILITY | ORG_OWNER, ORG_ADMIN | Vendor | LOW |
| CRM Overview | MISSING | CAPABILITY | SA, M | SalesSetup | HIGH |
| Agent Network | MISSING | CAPABILITY | SA, M | SalesSetup | MEDIUM |
| Commissions | MISSING | CAPABILITY | SA | Finance (new) | LOW |
| Invoices | MISSING | CAPABILITY | SA | Finance (new) | LOW |
| Payments (Admin) | MISSING | CAPABILITY | SA | Finance (new) | LOW |

**New SidebarRole needed:** `SidebarRole.Finance` for admin-only finance zone.
**New SidebarRole needed:** `SidebarRole.Vendor` for vendor portal zone.

---

## SECTION 2: PAGE INVENTORY

### 2A. Prototype Pages (20 total)

| Page ID | Title | Lines | Status |
|---------|-------|-------|--------|
| pg-sales-dash | Sales Dashboard | 761-832 | MIGRATION (exists as /dashboard) |
| pg-leads | All Leads | 835-902 | MIGRATION (exists as /leads) |
| pg-catalog | Service Catalog | 903-926 | CAPABILITY |
| pg-cf | Course Finder | 928-957 | CAPABILITY |
| pg-accom | Accommodation Finder | 959-986 | CAPABILITY (stub) |
| pg-faq | FAQ Bank | 988-1016 | CAPABILITY |
| pg-script | Call Script | 1018-1026 | CAPABILITY |
| pg-wa | WhatsApp Templates | 1028-1036 | CAPABILITY |
| pg-crm | CRM Overview | 1038-1068 | CAPABILITY |
| pg-partners | Partner Universities | 1071-1080 | CAPABILITY |
| pg-agents | Agent Network | 1082-1088 | CAPABILITY |
| pg-library | Sales Library Catalog | 1094-1120 | CAPABILITY |
| pg-library-detail | Sales Library Detail | 1122-1165 | CAPABILITY |
| pg-feelog | Fee Log | 1460-1475 | CAPABILITY |
| pg-commissions | Commissions | 1476-1495 | CAPABILITY |
| pg-invoices | Invoices | 1497-1499 | CAPABILITY (stub) |
| pg-payments | Payments | 1502-1505 | CAPABILITY (stub) |
| pg-inventory | Vendor Inventory | 1507-1521 | CAPABILITY (Phase 2 stub) |
| pg-bookings | Vendor Bookings | 1523-1535 | CAPABILITY (Phase 2 stub) |
| pg-payouts | Vendor Payouts | 1537-1551 | CAPABILITY (Phase 2 stub) |

### 2B. Production Pages (CRM-related)

| Path | File | Status |
|------|------|--------|
| /dashboard | dashboard/index.tsx | EXISTS |
| /leads | leads/index.tsx | EXISTS |
| /leads/new | leads/new.tsx | EXISTS |

### 2C. Page Gap Summary

- **MIGRATION:** 3 pages (dashboard, leads, leads/new)
- **CAPABILITY:** 17 pages (new builds)
- **Phase 2 stubs:** 3 pages (vendor portal)

---

## SECTION 3: UI COMPONENT INVENTORY

### 3A. Prototype Components (extracted from HTML/CSS)

| Component | Prototype Location | Production Status | Type |
|-----------|-------------------|-------------------|------|
| StatusBadge | .badge, statusBadgeColors | EXISTS | MIGRATION |
| QueueBadge | .qs-c | EXISTS | MIGRATION |
| LeadTable | table in pg-leads | EXISTS | MIGRATION |
| LeadQueueSidebar | .q-sb | EXISTS | MIGRATION |
| LeadDetailPanel | .dp | EXISTS | MIGRATION |
| CommentThread | #comment-list | EXISTS | MIGRATION |
| CallLogModal | #mo-call | MISSING | CAPABILITY |
| QuoteModal | #mo-quote | MISSING | CAPABILITY |
| CourseFinderDrawer | #cfd | MISSING | CAPABILITY |
| ServiceCatalogGrid | .catalog-grid | MISSING | CAPABILITY |
| CourseCard | .cc | MISSING | CAPABILITY |
| CalculatorPanel | .calc | MISSING | CAPABILITY |
| KPIMetricCard | .mc | MISSING | CAPABILITY |
| FAQCard | .card (FAQ variant) | MISSING | CAPABILITY |
| QuickFindDropdown | .qf-wrap | MISSING | CAPABILITY |
| ScriptSteps | #script-steps | MISSING | CAPABILITY |
| WATemplateCard | (in pg-wa) | MISSING | CAPABILITY |
| KanbanBoard | .kanban | MISSING | CAPABILITY |
| KanbanColumn | .kc | MISSING | CAPABILITY |
| KanbanLeadCard | .kl | MISSING | CAPABILITY |
| SalesLibraryCard | .lib-card | MISSING | CAPABILITY |
| SendAssetModal | #mo-send-asset | MISSING | CAPABILITY |
| AssetWizardModal | #mo-asset-wizard | MISSING | CAPABILITY |
| PartnerTable | (in pg-partners) | MISSING | CAPABILITY |
| AgentCard | (in pg-agents) | MISSING | CAPABILITY |
| FeeLogTable | (in pg-feelog) | MISSING | CAPABILITY |
| CommissionTable | (in pg-commissions) | MISSING | CAPABILITY |
| VendorInventoryTable | (in pg-inventory) | MISSING | CAPABILITY |
| VendorBookingsTable | (in pg-bookings) | MISSING | CAPABILITY |
| VendorPayoutsTable | (in pg-payouts) | MISSING | CAPABILITY |

### 3B. Production Components (leads folder)

```
apps/cms-next/components/leads/
├── CommentThread.tsx       ← EXISTS
├── LeadQueueSidebar.tsx    ← EXISTS
├── LeadDetailPanel.tsx     ← EXISTS
├── QueueBadge.tsx          ← EXISTS
├── LeadTable.tsx           ← EXISTS
└── StatusBadge.tsx         ← EXISTS
```

### 3C. Component Gap Summary

- **MIGRATION:** 6 components (style sync needed)
- **CAPABILITY:** ~24 components (new builds)

---

## SECTION 4: MODAL INVENTORY

| Modal ID | Purpose | Prototype Lines | Production Status |
|----------|---------|-----------------|-------------------|
| mo-call | Log a Call (6 outcomes) | 1555-1574 | MISSING |
| mo-quote | Quote Ready (WhatsApp copy) | 1576-1581 | MISSING |
| mo-send-asset | Send Asset (3 methods) | 1167-1204 | MISSING |
| mo-asset-wizard | New Asset (9 fields) | 1206-1340 | MISSING |
| mo-asset-edit | Edit Asset metadata | 1342-1437 | MISSING |
| mo-asset-archive | Archive confirmation | 1440-1459 | MISSING |
| cf-drawer | Course Finder (overlay) | 1583-1597 | MISSING |

**All modals are CAPABILITY** — none exist in production.

---

## SECTION 5: DATA MODEL INVENTORY

### 5A. Prototype Enums/Constants (JavaScript)

| Enum | Location | Production Equivalent | Status |
|------|----------|----------------------|--------|
| LeadStatus | line 1807 | LeadStatus in lead.constants.ts | EXISTS |
| LeadScoreBand | line 1827 | MISSING | CAPABILITY |
| CallOutcome | line 1836 | CallOutcome in lead.constants.ts | EXISTS |
| PartnershipTier | line 1618 | MISSING | CAPABILITY |
| ProgrammeLevel | line 1619 | MISSING | CAPABILITY |
| StudentType | line 1620 | MISSING | CAPABILITY |
| PaymentMethod | line 1621 | MISSING | CAPABILITY |
| TransferSource | line 1622 | MISSING | CAPABILITY |
| FeeMode | line 1623 | MISSING | CAPABILITY |
| DataStatus | line 1624 | MISSING | CAPABILITY |
| ServiceCategory | line 1630 | MISSING | CAPABILITY |
| TenantType | line 1677 | MISSING | CAPABILITY |
| TenantModel | line 1682 | MISSING | CAPABILITY |
| UserRole | line 1725 | Similar to UserTypes | MIGRATION |
| FeeStatus | line 2163 | MISSING | CAPABILITY |
| EnrollmentStatus | line 2173 | MISSING | CAPABILITY |
| CommissionType | line 2180 | MISSING | CAPABILITY |
| CommissionStatus | line 2181 | MISSING | CAPABILITY |
| RoomStatus | line 2220 | MISSING | CAPABILITY |
| BookingStatus | line 2230 | MISSING | CAPABILITY |
| PayoutStatus | line 2237 | MISSING | CAPABILITY |
| AssetType | line 2446 | MISSING | CAPABILITY |

### 5B. Prototype Data Structures

| Structure | Purpose | Production Equivalent |
|-----------|---------|----------------------|
| serviceRegistry | Service metadata | MISSING |
| tenantRegistry | Multi-tenant config | MISSING |
| personaRegistry | Role personas | UserTypes (partial) |
| queueRegistry | Lead queues | LeadQueue enum (partial) |
| universities | Partner unis | MISSING |
| programmes | Course catalog | MISSING (external sheet) |
| feeConfirmations | Fee log | MISSING |
| enrollments | Conversion records | MISSING |
| commissionEvents | Money records | MISSING |
| rooms | Vendor inventory | MISSING |
| bookings | Vendor sales | MISSING |
| payouts | Vendor earnings | MISSING |
| referralLinks | Attribution | MISSING |
| libraryAssets | Sales library | MISSING |

---

## SECTION 6: CAPABILITY DEPENDENCIES

### Dependency Graph

```
LEVEL 0 — No dependencies (build first)
├── ServiceCategory enum
├── TenantType enum
├── PartnershipTier enum
├── FeeStatus enum
└── AssetType enum

LEVEL 1 — Depends on Level 0
├── serviceRegistry (needs ServiceCategory)
├── tenantRegistry (needs TenantType)
├── queueRegistry (needs ServiceCategory)
└── CallLogModal (needs CallOutcome — EXISTS)

LEVEL 2 — Depends on Level 1
├── Service Catalog page (needs serviceRegistry)
├── Course Finder (needs serviceRegistry, programmes)
├── FAQ Bank (needs ServiceCategory filter)
└── Sales Library (needs AssetType, serviceRegistry)

LEVEL 3 — Depends on Level 2
├── CRM Overview (needs all domain data)
├── Commissions (needs commissionEvents)
└── Vendor Portal (needs rooms, bookings, payouts)
```

---

## SECTION 7: RISK ASSESSMENT

| Item | Risk Level | Reason |
|------|------------|--------|
| CallLogModal | LOW | Backend exists, just frontend |
| Course Finder | HIGH | Complex fee calc, Sheet data |
| Service Catalog | MEDIUM | New page, simple grid |
| Sales Library | MEDIUM | New CRUD, file upload |
| CRM Overview | HIGH | Admin view, multi-metric |
| Vendor Portal | HIGH | New tenant model, Phase 2 |
| Commissions | HIGH | Finance, audit trail |
| Multi-tenant | CRITICAL | Architectural change |

---

## SECTION 8: RECOMMENDED BUILD ORDER

### Phase 2A — Q Intelligence (Current)
1. **CallLogModal** — missing frontend hook exists, modal needed
2. **LeadDetailPanel Q Intelligence block** — UI only, data exists

### Phase 2B — Sales Guide Foundation
3. **ServiceCategory enum** — add to lead.constants.ts
4. **serviceRegistry** — new file or extend lead.constants.ts
5. **Service Catalog page** — /catalog route
6. **Service tabs component** — reusable

### Phase 2C — Course Finder
7. **PartnershipTier, ProgrammeLevel enums**
8. **Course Finder page** — /sales-guide/courses
9. **CourseCard component**
10. **CalculatorPanel component**
11. **QuoteModal**

### Phase 2D — Sales Tools
12. **FAQ Bank page** — /sales-guide/faq
13. **Call Script page** — /sales-guide/script
14. **WA Templates page** — /sales-guide/wa

### Phase 2E — Sales Library
15. **AssetType enum**
16. **Sales Library catalog page**
17. **Sales Library detail page**
18. **SalesLibraryCard component**
19. **Asset modals (send, wizard, edit, archive)**

### Phase 3 — Admin/Finance (deferred)
20. CRM Overview
21. Agent Network
22. Partner Universities
23. Fee Log
24. Commissions

### Phase 4 — Vendor Portal (deferred)
25. Vendor tenant model
26. Inventory
27. Bookings
28. Payouts

---

## SECTION 9: TOKEN DISCREPANCIES

| Token | Prototype | Production crmTokens.ts | Action |
|-------|-----------|------------------------|--------|
| --gl | #27964F | #2a9458 | SYNC to prototype |
| --t1 | #0D1A10 | #1a1a1a | SYNC to prototype |
| --t2 | #364039 | #4a4a4a | SYNC to prototype |
| --t3 | #6E7F72 | #888888 | SYNC to prototype |
| --bd | #E1EBE3 | #e5e5e0 | SYNC to prototype |
| --r1 | 8px | 6px | SYNC to prototype |

**Recommendation:** Update crmTokens.ts to match prototype values. This is a MIGRATION task affecting all existing CRM components.

---

## SECTION 10: HOOKS INVENTORY

### Existing Hooks (libs/react-query/queries/leads.ts)

| Hook | Endpoint | Status |
|------|----------|--------|
| useLeadsList | GET /v1/leads | EXISTS |
| useLeadDetails | GET /v1/leads/:id | EXISTS |
| useLeadQueues | GET /v1/leads/queues | EXISTS |
| useLeadStats | GET /v1/leads/stats | EXISTS |
| useCreateLead | POST /v1/leads | EXISTS |
| useUpdateLead | PUT /v1/leads/:id | EXISTS |
| useAddLeadComment | POST /v1/leads/:id/comments | EXISTS |

### Missing Hooks

| Hook | Endpoint | Backend Status | Priority |
|------|----------|----------------|----------|
| useLogCall | POST /v1/leads/:id/call-log | EXISTS | HIGH |
| useProgrammes | GET /v1/programmes | MISSING | MEDIUM |
| useUniversities | GET /v1/universities | MISSING | MEDIUM |
| useFeeConfirmations | GET /v1/fee-confirmations | MISSING | MEDIUM |
| useLibraryAssets | GET /v1/library-assets | MISSING | MEDIUM |
| useCommissions | GET /v1/commissions | MISSING | LOW |

---

## APPENDIX A: FILE COUNTS

```
PROTOTYPE
  Total lines: 5,659
  CSS: ~675 lines (styles block)
  HTML: ~925 lines (page structure)
  JavaScript: ~4,059 lines (data + logic)

PRODUCTION (CRM-related)
  leads/: 6 components
  dashboard/: 1 page
  pages/leads/: 2 pages
  crmTokens.ts: 88 lines
  lead.constants.ts: ~50 lines
```

---

## APPENDIX B: QUICK REFERENCE — WHAT TO BUILD NEXT

**Immediate (Q Intelligence):**
- [ ] useLogCall hook in leads.ts
- [ ] CallLogModal component
- [ ] Q Intelligence block in LeadDetailPanel

**Short-term (Sales Guide):**
- [ ] ServiceCategory enum
- [ ] Service Catalog page (/catalog)
- [ ] Service tabs component

**Medium-term (Course Finder):**
- [ ] Course Finder page
- [ ] Fee calculator logic
- [ ] Quote generation

---

*EAGLE v2.1 — Mode 1 — Full Inventory Complete*
*Created: 29 April 2026*
*Awaiting Shon's review before proceeding to Mode 2*
