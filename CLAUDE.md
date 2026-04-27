# DeAssists Portal — Claude Code Brain
# Read this FIRST. Every session. No exceptions.
# Last updated: 27 April 2026 | Branch: feature/portal.shon369

---

## WHO OWNS WHAT
- Shon AJ — CEO, tests everything, approves before Latha sees it
- Latha — reviews ALL code, commits to GitHub, merges branches
- VEERABHADRA — plans in Claude.ai, writes all prompts, never commits
- Never commit to main or dev_v2 directly. Always branch → Latha → merge.

---

## THE GOLDEN RULE
Before writing ANY new code:
  1. Find the closest existing working feature in this codebase
  2. Trace its full data flow: component → hook → axios → backend → UI
  3. Copy that pattern exactly. Zero improvisation.
If you cannot point to an existing file using this exact pattern — STOP.
Return to VEERABHADRA and ask for the reference file.

---

## STRUCTURED PROMPT FORMAT
Every prompt from VEERABHADRA follows this exact structure.
If a prompt arrives without this format — stop and ask VEERABHADRA to resend.

  READ FIRST:      [specific file path to read before writing anything]
  PATTERN TO COPY: [exact file + function name to copy]
  TASK:            [plain English — what to build]
  FILES TO CREATE: [exact full paths]
  FILES TO MODIFY: [exact full paths + what to add only]
  NEVER TOUCH:     [list of files not to open]
  VERIFY WITH:     [exact terminal commands to run]
  REPORT BACK:     files created + line counts + any deviation from plan

---

## SKILL SELECTOR — PICK BY TASK TYPE

| Task type | Tier | Skill | Read first |
|-----------|------|-------|------------|
| New component or hook (1-3 files) | 1 | Pre-build checklist | patterns/api-patterns.md |
| New full module (4+ files) | 2 | EAGLESKILL Mode 1→3 | patterns/api-patterns.md |
| Sidebar or permission change | 3 | sidebar-audit (mandatory) | patterns/permission-patterns.md |
| Visual reduperman | project/design-system.md |
| Architectural decision or new service | 5 | STOP → return to VEERABHADRA | — |
| Sales document, deck, brochure | — | Sales Output Engine | skills/sales-design/Salesdocskill.md |
| Any git operation | — | — | patterns/git-workflow.md |
| Unsure what files to touch | — | — | project/architecture.md |
| What never to modify | — | — | project/never-touch.md |

---

## TIER RULES

### Tier 1 — Small build (1-3 files, known pattern)
1. Read patterns/api-patterns.md
2. Read the reference file from the table
3. Run checklists/pre-build-checklist.md before writing
4. Build following the pattern exactly
5. npm run build:all
6. Three grep checks
7. git add [specific files] → commit

### Tier 2 — New module (4+ files)
1. Read patterns/api-patterns.md
2. EAGLESKILL Mode 1 — gap report
3. EAGLESKILL Mode 2 — plan (wait for VEERABHADRA approval)
4. EAGLESKILL Mode 2.5 — HTML preview (wait for "approved")
5. EAGLESKILL Mode 3 — execute only after exact phrase "approved"
6. npm run build:all → three grep checks → commit

### Tier 3 — Sidebar or permission (any size)
1. Read patterns/permission-patterns.md completely
2. Read both sidemenu.ts AND permission.helper.ts before touching either
3. Build the change
4. Run sidebar audit: type "run sidebar audit" in Claude Code
5. Audit must pass — no exceptions
6. pm2 restart backend
7. Test minimum 2 roles in browser
8. Commit only after all roles verified

### Tier 4 — Visual redesign
1. UIUX Superman 7-step process — no shortcuts
2. Never touches logic files
3. Never removes any feature
4. HTML preview approved by Shon before any implementation
5. Feature audit at Step 6 must pass before commit

### Tier 5 — Architectural decision
STOP. Do not write any code.
Return to VEERABHADRA in Claude.ai.
Brainstorm happens there. Decision is made there.
Only then does a structured prompt come back to Claude Code.

---

## BEFORE ANY COMMIT — THREE HARD GATES

Gate 1: npm run build:all — zero new errors
Gate 2: git diff --staged --name-only — read every file
Gate 3: Three grep checks — any result = fix first, then commit:
  grep -rn "await fetch(" apps/cms-next/components/ apps/cms-next/pages/
  grep -rn "getCookie" apps/cms-next/components/ apps/cms-next/pages/
  grep -rn "Authorization.*Bearer" apps/cms-next/components/ apps/cms-next/pages/

Never: git add . or git add -A

---

## AFTER EVERY PORTAL COMMIT — MANDATORY
cd ~/deassists && /opt/homebrew/bin/graphify update . \
  --output ~/deassists-workspace/369-brain/graphify-out/

---

## CURRENT BUILD STATE
Branch: feature/portal.shon369 (base: dev_v2)
Phase 1 CRM: COMPLETE (b0d2fdc4, 25 Apr 2026)
QA Fix: COMPLETE (49121b19, 27 Apr 2026)
Next: Phase 2 — Q Intelligence (CallLogModal + LeadDetailPanel)
  Backend endpoint exists: POST /v1/leads/:id/call-log
  Hook exists: useLogCall in libs/react-query/queries/leads.ts
  Reference file: apps/cms-next/components/leads/CommentThread.tsx
