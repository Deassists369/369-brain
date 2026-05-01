# DeAssists — Feature Registry
# Version: 1.0 | Date: 30 April 2026
# Owner: Shon AJ | Brain: VEERABHADRA
# Location: 369-brain/project/feature-registry.md
#
# Single source of truth for all features.
# Update status column every time a feature moves.
# Never delete rows. Only update status.

---

## HOW TO READ THIS FILE

Status values:
  LIVE       Already in production, working
  DONE       Built this session, not yet committed
  IN PROGRESS  Currently being built
  NEXT       Next task to start
  PENDING    Planned, not started
  BLOCKED    Cannot start — dependency missing
  DEFERRED   Intentionally pushed to later
  LATHA      Latha owns this item

Priority values:
  CRITICAL   Blocks everything else
  HIGH       Must do before next phase
  MEDIUM     Important but not blocking
  LOW        Nice to have, not urgent

---

## LAYER 1 — STUDENT PORTAL AND APPLICATION MANAGEMENT

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| Student account creation | LIVE | — | Latha | — | Working |
| Student application flow | LIVE | — | Latha | — | Working |
| Document upload (S3) | LIVE | — | Latha | — | Working |
| Application status tracking | LIVE | — | Latha | — | Working |
| All 11 application types | LIVE | — | Latha | — | Working |
| BCBT scoped view | LIVE | — | Latha | — | Via MongoDB roles |
| Email templates | LIVE | — | Latha | — | Working |
| JWT secrets rotation | LATHA | CRITICAL | Latha | — | Exposed in Git |
| AWS ACL TypeScript fix | LATHA | MEDIUM | Latha | — | accounts.service.ts:1276 |
| Stripe write-back fix | LATHA | HIGH | Latha | — | Payment not saved |
| Security guard fix | LATHA | HIGH | Latha | — | scope.guard.ts L79 |
| SSR permission bleed fix | LATHA | HIGH | Latha | — | Before Sept production |
| Universal Lead Capture Form | PENDING | HIGH | Shon | Phase 2A done | Works for DeAssists + BCBT |

---

## LAYER 2 — LEAD AND SALES SYSTEM

### Phase 1 — Constants (DONE)

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| crmTokens.ts token update | DONE | HIGH | Shon | — | 12 values updated, not committed |
| ServiceCategory enum | DONE | HIGH | Shon | — | Added to lead.constants.ts |
| LeadScoreBand enum | DONE | HIGH | Shon | — | Added to lead.constants.ts |
| PartnershipTier enum | DONE | MEDIUM | Shon | — | Added to lead.constants.ts |
| ProgrammeLevel enum | DONE | MEDIUM | Shon | — | Added to lead.constants.ts |
| StudentType enum | DONE | MEDIUM | Shon | — | Added to lead.constants.ts |
| AssetType enum | DONE | MEDIUM | Shon | — | Added to lead.constants.ts |
| FeeStatus enum | DONE | MEDIUM | Shon | — | Added to lead.constants.ts |
| EnrollmentStatus enum | DONE | MEDIUM | Shon | — | Added to lead.constants.ts |
| SidebarRole.Finance | DONE | MEDIUM | Shon | — | Added to lead.constants.ts |
| SidebarRole.Vendor | DONE | LOW | Shon | — | Added to lead.constants.ts |
| assigned_to enum (37 agents) | BLOCKED | HIGH | Shon | Agent list from Sheets | =UNIQUE(K2:K9999) |

### Phase 2A — Q Intelligence

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| useLogCall hook | PENDING | HIGH | Shon | Phase 1 done | Backend exists at POST /v1/leads/:id/call-log |
| CallLogModal component | PENDING | HIGH | Shon | useLogCall | Prototype lines 1555-1574 |
| Q Intelligence block in LeadDetailPanel | PENDING | HIGH | Shon | CallLogModal | Add to existing component |

### Phase 2B — Service Catalog

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| serviceRegistry data structure | PENDING | HIGH | Shon | ServiceCategory enum | New file in constants |
| Service Catalog page | PENDING | HIGH | Shon | serviceRegistry | /catalog route |
| Service tabs component | PENDING | HIGH | Shon | ServiceCategory | Reusable across pages |
| Sidebar item: Service Catalog | PENDING | HIGH | Shon | SidebarRole.CallCenter | Add to sidemenu.ts |

### Phase 2C — Course Finder

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| useProgrammes hook | PENDING | HIGH | Shon | Phase 2B done | GET /v1/programmes |
| CourseCard component | PENDING | HIGH | Shon | useProgrammes | Prototype .cc class |
| CalculatorPanel component | PENDING | HIGH | Shon | CourseCard | Fee calculator |
| QuoteModal component | PENDING | HIGH | Shon | CalculatorPanel | WhatsApp copy |
| Course Finder page | PENDING | HIGH | Shon | All above | /sales-guide/courses |
| CourseFinderDrawer | PENDING | MEDIUM | Shon | CourseCard | Overlay variant |

### Phase 2D — Sales Tools

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| FAQ Bank page | PENDING | MEDIUM | Shon | ServiceCategory | /sales-guide/faq |
| FAQCard component | PENDING | MEDIUM | Shon | FAQ Bank page | Per service FAQ |
| Call Script page | PENDING | MEDIUM | Shon | ServiceCategory | /sales-guide/script |
| ScriptSteps component | PENDING | MEDIUM | Shon | Call Script page | Step display |
| WhatsApp Templates page | PENDING | MEDIUM | Shon | ServiceCategory | /sales-guide/wa |
| WATemplateCard component | PENDING | MEDIUM | Shon | WA Templates page | Copy to clipboard |

### Phase 2E — Sales Library

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| AssetType enum | PENDING | MEDIUM | Shon | Phase 1 done | In lead.constants.ts |
| useLibraryAssets hook | PENDING | MEDIUM | Shon | AssetType | GET /v1/library-assets |
| Sales Library catalog page | PENDING | MEDIUM | Shon | useLibraryAssets | /library |
| Sales Library detail page | PENDING | MEDIUM | Shon | Catalog page | /library/:id |
| SalesLibraryCard component | PENDING | MEDIUM | Shon | Library pages | Asset display |
| SendAssetModal | PENDING | MEDIUM | Shon | Library pages | 3 send methods |
| AssetWizardModal | PENDING | MEDIUM | Shon | Library pages | 9 field creation |
| AssetEditModal | PENDING | MEDIUM | Shon | Library pages | Edit metadata |
| AssetArchiveModal | PENDING | MEDIUM | Shon | Library pages | Archive confirm |
| Agent library access (role) | PENDING | LOW | Shon | Library live | After 90 day test |

### Phase 3 — CRM Admin (DEFERRED)

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| KPIMetricCard component | DEFERRED | MEDIUM | Shon | Phase 2 done | — |
| CRM Overview page | DEFERRED | MEDIUM | Shon | All Phase 2 | /crm-overview |
| Partner Universities page | DEFERRED | MEDIUM | Shon | Phase 2 done | /partners |
| PartnerTable component | DEFERRED | MEDIUM | Shon | Partners page | — |
| Agent Network page | DEFERRED | MEDIUM | Shon | Phase 2 done | /agents |
| AgentCard component | DEFERRED | MEDIUM | Shon | Agent page | — |
| KanbanBoard component | DEFERRED | LOW | Shon | Phase 2 done | 5 column board |
| Sidebar: CRM Overview | DEFERRED | MEDIUM | Shon | CRM page | SidebarRole.SalesSetup |
| Sidebar: Agent Network | DEFERRED | MEDIUM | Shon | Agent page | SidebarRole.SalesSetup |

---

## LAYER 3 — FINANCE MODULE (DEFERRED — early 2027)

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| BCBT fee structure audit | DEFERRED | HIGH | Shon | Phase 2 done | Understand before building |
| Accommodation fee audit | DEFERRED | HIGH | Shon | Phase 2 done | Understand before building |
| Finance architecture doc | DEFERRED | HIGH | Shon | Both audits | Design for any service |
| fee_confirmations collection | DEFERRED | HIGH | Latha | Architecture | MongoDB |
| invoices collection | DEFERRED | HIGH | Latha | Architecture | MongoDB |
| payments collection | DEFERRED | HIGH | Latha | Architecture | MongoDB |
| commission_events collection | DEFERRED | HIGH | Latha | Architecture | MongoDB |
| FeeLogTable component | DEFERRED | MEDIUM | Shon | Collections | — |
| CommissionTable component | DEFERRED | MEDIUM | Shon | Collections | — |
| Fee Log page | DEFERRED | MEDIUM | Shon | Collections | /finance/fees |
| Commissions page | DEFERRED | MEDIUM | Shon | Collections | /finance/commissions |
| Invoices page | DEFERRED | MEDIUM | Shon | Collections | /finance/invoices |
| Payments page | DEFERRED | MEDIUM | Shon | Collections | /finance/payments |
| SidebarRole.Finance | DEFERRED | MEDIUM | Shon | Finance pages | Add to constants |
| AI Fee Reconciler agent | DEFERRED | HIGH | Shon | Finance live | Automates matching |
| DATEV integration | DEFERRED | MEDIUM | Shon | Finance stable | German tax |

---

## LAYER 4 — SMS (DEFERRED — September 2026 target)

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| BCBT operations audit | DEFERRED | HIGH | Shon | Finance done | Shadow before building |
| SMS architecture doc | DEFERRED | HIGH | Shon | Audit done | Design for any university |
| Attendance tracking | DEFERRED | HIGH | Shon | Architecture | — |
| Timetable management | DEFERRED | HIGH | Shon | Architecture | — |
| Exam management | DEFERRED | HIGH | Shon | Architecture | — |
| Results publication | DEFERRED | HIGH | Shon | Exams | Auto to student portal |
| Certificate generation | DEFERRED | HIGH | Shon | Results | Auto on completion |
| AI Attendance bot | DEFERRED | HIGH | Shon | Attendance live | Reminders and flags |
| AI Certificate bot | DEFERRED | MEDIUM | Shon | Certs live | Auto-generates |

---

## LAYER 5 — LMS (DEFERRED — after SMS)

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| LMS architecture doc | DEFERRED | HIGH | Shon | SMS live | Connects to SMS records |
| Course content delivery | DEFERRED | HIGH | Shon | Architecture | — |
| Assessment system | DEFERRED | HIGH | Shon | Content | — |
| Certificate generation | DEFERRED | HIGH | Shon | Assessments | — |
| AI Progress tracker | DEFERRED | MEDIUM | Shon | LMS live | Flags at-risk students |

---

## LAYER 6 — TAX AND COMPLIANCE (DEFERRED — after Finance)

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| DATEV API research | DEFERRED | HIGH | Shon | Finance stable | — |
| DATEV architecture doc | DEFERRED | HIGH | Shon | Research done | — |
| DATEV integration | DEFERRED | HIGH | Latha | Architecture | — |
| Per-tenant DATEV output | DEFERRED | MEDIUM | Shon | Integration | — |

---

## BRAIN AND INFRASTRUCTURE

| Feature | Status | Priority | Owner | Depends On | Notes |
|---------|--------|----------|-------|------------|-------|
| vision.md | DONE | HIGH | Shon | — | Saved 30 April 2026 |
| CODING-CONSTITUTION.md | DONE | HIGH | Shon | — | Saved 30 April 2026 |
| PRD.md | DONE | HIGH | Shon | — | Saved 30 April 2026 |
| feature-registry.md | DONE | HIGH | Shon | — | This file |
| anti-ambiguity.md | NEXT | HIGH | Shon | — | Patterns folder |
| SESSION-START skill | NEXT | HIGH | Shon | — | Skills folder |
| decisions.md update | NEXT | HIGH | Shon | — | Append today's locks |
| CLAUDE.md update | NEXT | MEDIUM | Shon | — | Add new file references |
| THE-DEASSISTS-OS.md update | NEXT | MEDIUM | Shon | — | Add ERP vision layers |
| change-log Task 1 entry | NEXT | HIGH | Shon | — | crmTokens.ts done |
| architecture.md review | NEXT | MEDIUM | Shon | — | Confirm if current |
| design-system.md update | NEXT | MEDIUM | Shon | — | Reflect token changes |
| graphify update | NEXT | HIGH | Shon | — | After portal commit |
| Final brain commit | NEXT | HIGH | Shon | All files done | One commit everything |

---

## AI AGENTS REGISTRY

| Agent | Status | Replaces | Priority | Notes |
|-------|--------|----------|----------|-------|
| Lead Router | PENDING | Manual queue assignment | HIGH | Phase 2A |
| Follow-up Bot | PENDING | Manual follow-up tracking | HIGH | Phase 2A |
| Doc Checker | PENDING | Manual document review | HIGH | Phase 2B |
| Status Updater | PENDING | Manual status changes | MEDIUM | Phase 2A |
| Fee Reconciler | DEFERRED | Manual payment matching | HIGH | Finance module |
| Report Builder | DEFERRED | Manual weekly reports | MEDIUM | Phase 3 |
| Attendance Bot | DEFERRED | Manual attendance tracking | HIGH | SMS module |
| Certificate Bot | DEFERRED | Manual certificate generation | MEDIUM | SMS/LMS |
| Progress Tracker | DEFERRED | Manual student monitoring | MEDIUM | LMS module |

---

*DeAssists Feature Registry v1.0*
*Owner: Shon AJ | Brain: VEERABHADRA*
*Created: 30 April 2026*
*Location: 369-brain/project/feature-registry.md*
*Update: every time a feature status changes*
*Never delete rows — only update status*
