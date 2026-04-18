# CRM SYSTEM — v3.0 FINAL
Last updated: 03 April 2026 — VEERABHADRA

Platform: Google Sheets — 369 Master LEAD CRM
Spreadsheet ID: 1scKsRWiJyWZzv_e6ohysRZjT3oY8Wrw1Ip0hcfFmJkk

## Column Order (A-O) — LOCKED
A: Lead ID | B: Date | C: Source | D: Agent Name | E: Full Name
F: Place | G: Country Code | H: WhatsApp | I: Email | J: Service
K: Assigned To | L: University Interest | M: Intake | N: Comments | O: Status

## Tabs (7 working + archives — NO SRUTHI)
ACTIVE LEADS: 88 | 369 CALL CENTER: 41 | 369 CC FOLLOW UP: 11
BCBT CALL CENTER: 34 | BCBT FOLLOW UP: 16 | DON: 13
ACCOMMODATION: 1 | SAJIR: 6
COMPLETED: 242 | LOST LEADS: 106 | ALL LEADS: 453+

## Routing Rules (7 rules — LOCKED — no SRUTHI)
RULE 1: Assigned To = DON → DON
RULE 2: Service = Public University, Spouse Visa, Opportunity Card, Insurance → DON
RULE 3: Service = Accommodation → ACCOMMODATION
RULE 4: Service = FSJ, Au Pair, Ausbildung, Full/Part Time Job, Document Translation → SAJIR
RULE 5: Source = BCBT Lead OR Service = BCBT LEAD/Unimarconi Lead → BCBT CC/FU
RULE 6: Service = Private University (any source, any university) → 369 CALL CENTER
RULE 7: Everything else / blank → 369 CALL CENTER

## Key Routing Logic
- University Interest (col L) does NOT affect routing — reference only
- Source = BCBT Lead → BCBT CC regardless of university
- SRUTHI tab PERMANENTLY REMOVED — all Private University → 369 CC

## Dropdowns
All flexible (NOT STRICT) except Status (STRICT — 8 values only)
Agent list: 37 agents (updated April 2026)
Status: Active, Follow Up, Called 1, Called 2, Called 3, Hold, Completed, Lost

## Code.gs v3.0
Location: C:\deassists-workspace\scripts\crm-369-master\Code.gs
Trigger: onEditSync (1 trigger only — never add more)
Key functions: refreshAllTabs, setupAllValidation, recoverFromAuditLog,
               fixMissingAuditEntries, trimSheetsTo1000

## Future
This Google Sheet is a prototype of the Lead CRM web portal.
Same routing logic → NestJS service in Phase 1 build.
Same column structure → MongoDB schema.
