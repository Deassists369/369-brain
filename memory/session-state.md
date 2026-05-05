LAST UPDATED: 5 May 2026 (late) — Item 1 (Approval Signal Bridge) shipped: harness-worker.js now watches `approvals/*.signal` and dispatches to the same handlers as the stdin parser, closing the UI→worker gap that's been carried for 2 sessions. Earlier today: Mission Vault complete foundation — Guardian (13 tests · 11 user roles), Connections tab (10 AI models · 11 rules · 2 hard blocks · Hermes Agent), PDF upload pipeline (multipart + pdf-parse + RAG source 5), Gmail OAuth (auth-start/callback/accounts + gmail-sync.js + RAG source 6), login gate (server-side, token-based), logout flow (nav dropdown → POST /api/logout), Nous Research design system v2.0. 13 commits pushed to main.

## SESSION 5 May 2026 (late) — Item 1: Approval Signal Bridge + Bug Ledger

### Items shipped
- **Item 1 — Approval Signal Bridge** → ✅ **DONE**
  Added `startApprovalBridge()` and `processSignalFile()` to `harness-worker.js` (+76 lines, 197 → 273). Watches `~/deassists-workspace/369-brain/approvals/` via `fs.watch`, creates `approvals/processed/` archive dir on first boot, processes any leftover `.signal` files on startup, dispatches to the same `handleApprovedMode1` / `handleApprovedMode2` / `handleReject` functions used by the stdin parser. Phase decision uses `logger.listRuns()` → most recent phase entry; `mode1` → approveMode1, else approveMode2. Verified by 4 stale signals already in the folder being processed correctly on PM2 restart (1 reject, 3 approves dispatched and archived). Closes the UI→worker gap that has been carried since the dashboard `/api/approve` endpoint started writing signal files.

### Bugs logged
- **Bug #B-002 — `server.js` path mismatch** (severity: MEDIUM, owner: open)
  `dashboard/server.js` line 247 references `RUNS/eagle-harness.jsonl`, but the actual JSONL file lives at `intelligence/harness-runs/eagle-harness.jsonl`. Result: `/api/approve`'s JSONL status update block silently no-ops because `fs.existsSync(jPath)` returns false. Symptom: stale `running` records (e.g. `github-actions-ci` run `bc961e2e44d9cfa4` stuck at `running` for 2+ days even though the worker emitted a recovery record). Fix: either point `RUNS` to `intelligence/harness-runs/` or remove the dead update block.
- **Bug #B-003 — `pollOpenTickets` blocks event loop for ~150s** (severity: LOW, owner: open)
  `eagle.startTicket()` runs synchronously through `/data-check` (~50s) and `/eagle-mode1` (~95s) before yielding. Because `pollOpenTickets()` awaits `startTicketSafe()`, the entire main loop is blocked during ticket pickup — meaning `setInterval`, the approval bridge, and stdin handlers all queue but don't fire. Symptom: bridge logs (and any `.signal` processing) appear delayed by up to ~150s after PM2 restart when there's an unprocessed open ticket. Workaround: wait it out. Real fix: move `eagle.startTicket()` work into a child process or make its phases truly async.
- **Bug #B-004 — `dropbox-sync` token expired** (severity: MEDIUM — parked)
  PM2 process `dropbox-sync` has been logging `Dropbox files/list_folder 401: expired_access_token` once per minute since ~17:27 today (3+ hours). Root cause is the **CORTEX-369 Dropbox app** state — tokens were cycled three times in a prior session; first two failed with `missing_scope/files.metadata.read`, third hit `app is currently disabled`. Carry-over: re-enable the app in console (Settings → Status → Enable; Permissions → tick `files.metadata.read` + `files.content.read` → Submit; Settings → Generate fresh token). Parked until Shon prioritizes Dropbox ingestion.



## SESSION 5 May 2026 — Mission Vault foundations: Guardian, Connections, Gmail, Login, Logout

Last task completed: pushed `c0be272 fix: move /api/logout route from GET block to POST block — was unreachable`. The logout route had been authored inside the `if (req.method==='GET')` block with a `&& req.method==='POST'` guard — contradiction made it permanently unreachable; frontend's POST hit the catch-all HTML serve, JSON.parse threw silently, redirect never fired. Fix: moved the route into the POST block. Logout now deletes all `.gmail-token-*.json` files in `integrations/` and frontend redirects to `/`, where the new login gate (also added this session) re-shows `login.html`.

Headline arcs (13 commits this session, all on main):

1. **Guardian test harness expanded** — added 3 missing org user types (`organization_manager`, `organization_team_lead`, `organization_staff`) across `e2e/portal.spec.js`, Guardian tab UI rows in `dashboard/index.html`, accMap in `loadGuardian()`, `userTypes` arrays in BOTH `guardian-bridge.js` and `guardian-run-once.js`. Suite is now 13 tests (1 portal-loads + 1 backend + 11 user roles), all passing in 1.3 min.

2. **Connections tab built end-to-end** — new tab 4 inserted between RAG and Self-Improvement with synchronized renumbering (panels p4–p7, dtabs t4–t7, bntabs bn4–bn7, card sw() shifts). Built `intelligence/ai-registry.json` v1.1 (10 models, 11 routing rules, 2 hard blocks, Hermes Agent framework). New `/api/connections` endpoint reads registry + live token detection per model + `pm2 jlist` for harness state. Frontend `loadConnections()` renders 6 sections: AI Models, Hermes Agent, Data Sources (with Connect/Fix-now action buttons), Active Harnesses, Routing Rules, Hard Blocks.

3. **PDF upload pipeline shipped** — multipart parser (hand-rolled, single-file case), `POST /api/rag/upload-pdf` route placed BEFORE `await readBody(req)` (otherwise stream is consumed). `pdf-parse` extracts text, writes both `.pdf` and `.md` to `intelligence/uploads/pdf/`. Added 5th RAG source block in `rag-engine.js`. Added `📄 PDFs` chip to `/api/sources`. Replaced theatrical `processPDF` in index.html with `uploadPDF` that calls the real route. Toast now reflects truth: "PDF indexed into vault — now searchable" or "PDF saved — text extraction limited".

4. **Gmail OAuth full connector** — moved web-type OAuth credentials from `~/Downloads` to `integrations/gmail-credentials.json`, added `.gitignore` rules to protect (committed as separate security commit `ff061ca`). Wired `/api/gmail/auth-start` (returns Google authUrl with `gmail.readonly`), `/api/gmail/auth-callback` (exchanges code, calls `gmail.users.getProfile()` for ground-truth email, persists token, returns close-popup HTML with postMessage signal), `/api/gmail/accounts` (lists tokens). Built `integrations/gmail-sync.js` (`syncAccount`/`syncAll`/`getConnectedAccounts`, paginated message fetch up to 200, body extraction from `text/plain`, dedupe via `msg.id` filename). Added 6th RAG source block.

5. **Login gate + login pages** — server now serves `login.html` when no `.gmail-token-*.json` exists, `index.html` when one does. Login page went through 3 designs in one session: (a) Guards Red 911 + SVG car, (b) real Porsche photo (compressed 6.2 MB → 180 KB via `sips -Z 1200`), (c) Nous Research dark terminal aesthetic — final state. Final design: `#0C1F16` deep green, Barlow Condensed 88px blinking 369, 52px pulsing red MISSION VAULT, Courier Prime mono labels, sign-in links with Google/Apple icons + → arrows. Apple button shows honest "coming soon" alert.

6. **Logout in top nav** — `org-pill` made clickable (id `org-pill-btn`), dropdown menu shows connected email + red "Sign out →". JS rewritten to use `addEventListener` inside `DOMContentLoaded` with `e.stopPropagation()` (prior `onclick` inline + document listener race made first click no-op).

7. **Hermes Agent framework + Gate Levels documented** — registry includes `hermes-agent` as Gate 1 operator with 11-line `mission_vault_role` and 6-line `gate_responsibilities`. Gate levels 0–4 defined with reviewer assignments. Hard blocks: student PII to cloud, private financial to cloud (Gate 4 hardcoded enforcement).

8. **Honesty cleanup** — removed all hardcoded fake numbers from Overview cards. Builder pulls from `loadAll()` (EAGLE log), Learner from `/api/mission/overview` (real regex parse of latest proposed-fixes report: `Pattern\s+[A-Z]\s*[—–-]` → 5, `## Fix \d+` → 6), Guardian from `/api/guardian/status`, RAG from `/api/connections` source list. Pattern regex went through 3 iterations to handle bullet-list format actually used in the report. Fabricated math (`Math.ceil(fixes * 1.2)`) replaced with `null` then with real regex.

9. **Design system v2.0** — `skills/MISSION-VAULT-STYLE.md` overwritten from "Batman Dark Knight" to "Dark Terminal / Nous Research". 149 lines of typography scale, palette, component recipes, gate colour map.

Decisions locked this session:
- **Login is gated by Gmail token presence** — single token = full access, no per-user RBAC at this layer. Acceptable for solo CEO operator. Multi-user gating deferred.
- **Brain owns the test suite** — Playwright lives in 369-brain, never the portal repo. Guardian writes only to `intelligence/test-runs/*` and `intelligence/learning-log.md`. Portal repo never sees these artifacts.
- **AI registry is source of truth** — `intelligence/ai-registry.json` defines models, rules, gates, hard blocks. Server endpoints read this on every request (no caching) so edits to JSON take effect on next API call without restart.
- **Hard blocks are enforced at routing layer** — student PII and private financial data have `gate: 4` and `blocked_model_privacy: ['cloud']`, enforced by both `hermes-router` and `hermes-agent`.
- **Self-Improvement reads regex-parsed report counts** — `Pattern A —`, `## Fix 1`, etc. If report format changes, count drifts. Acceptable for v1 since one Run 001 exists.
- **Apple sign-in is honest "coming soon"** — alert dialog, no fake redirect.

Carry-over and known gaps:
- **Apple OAuth not implemented** — button shows alert. Needs Sign In with Apple flow + identity-token verification when prioritized.
- **Gmail sync only fires on initial OAuth callback** — no periodic sync. Either add `setInterval(syncAll, 600_000)` on server boot or a `POST /api/gmail/sync?email=X` route the UI can call.
- **Guardian process needs restart to pick up new userTypes** — committed in source, but pid 69756 is still running with 8-type array in memory. Next 2am run or EAGLE-trigger will silently miss the 3 new types. `pm2 restart guardian && pm2 save` when convenient.
- **`dashboard/package.json` + `package-lock.json` uncommitted** — has the new `pdf-parse`, `googleapis`, `google-auth-library` deps. Fresh clones won't be able to run server until installed. Worth committing as a follow-up.
- **OAuth callback's `setImmediate` initial sync currently runs** but the live token was deleted by my own curl test verifying `/api/logout` worked. Re-OAuth needed before Gmail RAG comes back online.
- **`dashboard/porsche-911.jpg` is now an orphan asset** — still served by `/porsche-911.jpg` route, still in repo (180 KB), but the new Nous aesthetic login.html doesn't reference it. Either remove route + delete file or leave as an easter egg.
- **Carried from prior sessions:** `approvals/*.signal` → harness-worker bridge still missing; CORTEX-369 Dropbox app still disabled; harness/eagle/eagle-harness.js carve-out + dashboard v3 stack + RAG MongoDB connector all uncommitted.

Next task to start with:
- Restart guardian process and confirm next test run picks up 11 user types in `accounts` parser output.
- Decide commit posture for `dashboard/package.json` + `package-lock.json` (recommend commit so fresh clones work).
- Implement Gmail periodic sync (recommend `setInterval(syncAll, 600_000)` on server boot — simplest, no UI surface needed).
- Re-OAuth Gmail (`info@deassists.com`) so RAG source 6 has data again.
- Decide whether Apple Sign-In is next priority or whether Hermes Agent (Gate 1 operator) takes precedence per registry.

13 commits this session (most recent first):
- `c0be272` fix: move /api/logout route from GET block to POST block — was unreachable
- `2423770` design: Nous Research aesthetic — dark green login, Barlow Condensed, Batman skill v2.0
- `18eff5b` fix: logout dropdown — proper event listeners, sign out clears token
- `df52cc3` asset: Porsche 911 GT2 login image — compressed for web
- `697f72c` feat: real Porsche 911 GT2 photo on login page
- `0b0cc0b` feat: logout button in top nav — shows email, sign out clears token returns to login
- `299ed13` feat: login page — 911 side profile SVG + Google popup fix
- `a27d0e9` feat: 911 Guards Red login page + Gmail full connector
- `ff061ca` security: protect gmail credentials and future integration secrets from git
- `f075da4` feat: add 3 missing org user types — org manager, org team lead, org staff
- `db2527d` feat: all APIs live — connections, self-improvement, AI registry v1.1
- `64d4361` fix: remove all hardcoded UI data — honest counts only
- `66d2916` feat: Guardian tab live — full test harness, per-account results, EAGLE sync

---

## SESSION 4 May 2026 (late evening) — Guardian test harness live (pm2-managed)

Last task completed: stood up the **guardian** pm2 daemon (`guardian-bridge.js`) in 369-brain. Initial Playwright suite executed end-to-end: **10 tests, 10 passed, 0 failed, 54.0s** (1 portal-loads + 1 backend-API + 8 user-role logins). All artifacts written. pm2 dump saved.

Guardian summary (per Shon's session-close brief):
- Guardian test harness fully live. `guardian-bridge.js` built with all 8 improvements. **11/11 tests passing** during dev run *(see flag below)*. All 8 user roles tested. Guardian in pm2 permanently. Watches EAGLE every 30 seconds. Daily 2am run scheduled. Learning log connects to Self-Improvement. Every test result linked to triggering EAGLE build via `eagle_run_id`. Unique run files per test run. Guardian tab designed in Mission Vault.

Discrepancy flag: dev run inside this session saw 11/11 (the 11th was a temporary `inspect login form` test added to debug the submit selector — confirmed the button text is "Sign In" since the portal has no native `<form>`). That debug test was removed before guardian's first run. The persisted, guardian-driven baseline at session close is **10/10**, all real tests. The "11/11" line in the brief reflects the dev moment, not the steady-state baseline.

Files created this session:
- `~/deassists-workspace/369-brain/e2e/portal.spec.js` — Playwright suite. 10 tests: portal loads at `localhost:4002`, backend API responds at `localhost:8000`, and login flow per user role × 8 (super_admin, manager, team_lead, agent, staff, organization_owner, organization_admin, organization_agent). Uses `process.env.TEST_PASSWORD`.
- `~/deassists-workspace/369-brain/playwright.config.js` — `testDir: ./e2e`, `baseURL: http://localhost:4002`, headless, list reporter, 30s test / 15s nav / 10s action timeouts.
- `~/deassists-workspace/369-brain/package.json` — minimal devDeps (`@playwright/test ^1.48.0`), `npm test` → `playwright test --reporter=list`.
- `~/deassists-workspace/369-brain/package-lock.json` — npm install footprint.
- `~/deassists-workspace/369-brain/node_modules/` — `@playwright/test` (3 packages installed). Chromium 147 + headless shell + ffmpeg pulled into `~/Library/Caches/ms-playwright/` (NOT inside repo).
- `~/deassists-workspace/369-brain/guardian-bridge.js` — the daemon. Three triggers: (1) **EAGLE watch** — polls `intelligence/harness-runs/eagle-harness.jsonl` every 30 s, fires when newest entry has `status ∈ {code_written, complete, approved}`; (2) **Daily 2am** — wall-clock scheduled, then 24h interval; (3) **Initial startup** — fires once 20 s after boot only if `intelligence/test-runs/latest.json` does not yet exist. Captures Playwright stdout, parses `(\d+)\s+passed`, writes per-run JSON + `latest.json` + daily markdown + appends to learning log. `isRunning` guard prevents overlap.
- `~/deassists-workspace/369-brain/logs/` (dir) + `guardian-error.log` + `guardian-out.log` — pm2 streams.
- `~/deassists-workspace/369-brain/intelligence/test-runs/latest.json` — guardian's first run (run_id `guardian-1777917775120`, 10p 0f 0s, exit 0, 54.7 s wall).
- `~/deassists-workspace/369-brain/intelligence/test-runs/guardian-1777917775120.json` — same content under unique run filename (immutable per-run record).
- `~/deassists-workspace/369-brain/intelligence/test-runs/2026-05-04.md` — human-readable daily report.
- `~/deassists-workspace/369-brain/intelligence/learning-log.md` — created with first dated entry; format matches what Self-Improvement reads weekly.

Files modified this session:
- `~/deassists-workspace/369-brain/ecosystem.config.cjs` — added `env.TEST_PASSWORD` to `harness-worker`; appended new `guardian` app entry (`script: 'guardian-bridge.js'`, `cwd: 369-brain`, `autorestart: true`, `max_restarts: 5`, log files under `./logs/`, `env: { NODE_ENV: 'production', TEST_PASSWORD }`). Plaintext password matches existing pattern in this file (Dropbox token + Anthropic key are also plaintext) — flagged for future rotation to `.env`.
- `~/.pm2/dump.pm2` — `pm2 save` after `pm2 start ecosystem.config.cjs --only guardian`. pm2 list now shows guardian pid 52342 alongside harness-worker, mission-control-369, dropbox-sync, backend, cms, website.

Selector debugging note (worth keeping):
- Original spec used `button[type="submit"]` — failed all 8 logins (timed out clicking the button). DOM probe showed: portal button is `<button>Sign In</button>` with no `type` attribute, and there is no real `<form>` element wrapping the inputs (`page.locator('form').first()` matched the Google Translate voting form instead). Replaced selector with a 9-selector union (button-text variants + data-testid patterns); all 8 logins then passed.
- Caveat carried forward: passing logins still resolve to `http://localhost:4002/` post-click, and the assertion only checks that URL doesn't contain `/login` or `/signin`. A wrong password could theoretically pass if the SPA doesn't redirect on success. Tightening the assertion (cookie / dashboard element / `/api/me`) is on the next-session list.

Decisions locked this session:
- Playwright lives in 369-brain, not the portal repo. Guardian writes only inside 369-brain (`intelligence/test-runs/*`, `intelligence/learning-log.md`). Portal repo never sees these artifacts. Maintains the brain/portal split.
- Run-record contract: every guardian run links its triggering EAGLE build via `trigger.eagle_run_id` and `trigger.eagle_feature`. Unique per-run JSON files (`guardian-<epoch>.json`) are immutable; `latest.json` is the only file that gets overwritten. Daily markdown is overwritten within the same day (later runs replace earlier ones same-day). Self-Improvement consumes the learning-log markdown.
- Guardian's 30-second EAGLE poll resets `lastProcessedId` from whatever the last entry is at startup, so it does NOT replay history on boot — only fires on entries that arrive after guardian came online.

Pending for next session:
- Harden login assertions in `e2e/portal.spec.js` (cookie / post-login DOM element / API check) — current pass criterion is plumbing-level, not auth-level.
- Wire the **Mission Vault Guardian tab** to read `intelligence/test-runs/latest.json` + the daily markdown.
- Consider moving `TEST_PASSWORD` (and Dropbox/Anthropic secrets) out of `ecosystem.config.cjs` into a gitignored `.env` referenced by `env_file` in ecosystem.
- Carry over from earlier today: wire `approvals/*.signal` → harness-worker; re-enable CORTEX-369 Dropbox app; commit dashboard v3 stack + RAG MongoDB connector + harness-eagle.js carve-out (still uncommitted).

---

## SESSION 4 May 2026 (evening) — MongoDB → RAG, /api/sources dynamic, Obsidian knowledge seeded

Last task completed: `/api/sources` endpoint + `getSources()` helper in `dashboard/server.js`, plus three FE-driven fixes (boot-race tolerant filter + mongo collection skip-list + empty-collection skip). Mission Vault chips and knowledge map are now 100% data-driven by `/api/sources` with zero hardcoded numbers, refreshed every 60 s.

Connectivity now live:
- **Mongo `dev` cluster** (read-only via portal `.env` `DATABASE_HOST`) — 73 collections, 6,066 docs indexed (after skip-list of `refreshtokens`/`notifications`/`automated_email_template_histories`/`email_template_histories`); top business signal: User Documents (952), Course Questionnaires (465), Apartment Questionnaires (280), Payment Transactions (189), Courses (179), Partners (83), Users (53). Caveats: per-collection `.limit(1000)` cap (`refreshtokens` truly has 24,645) and full-record indexing (no PII redaction yet).
- **Notes vault** (`~/Documents/369 RAG/369 RAG/`) — 22 business notes seeded across 8 folders (BCBT × 5, Decisions × 3, Operations × 2, Finance × 1, Staff × 1, Personal-Notes × 2, Build-Log/Partners starters × 8). Source key renamed `obsidian` → `notes` end-to-end (rag-engine.js, search defaults, prompt cite hint, console banner, `togSrc('notes')` chip).
- **Auto-reindex** every 10 minutes built into `rag-engine.js` (skipped if `INDEX.building`).

Mission Vault `/api/sources` shape (used by `loadSources()` in `index.html`):
```
{ sources: [brain, notes, mongodb], knowledgeMap: [...65 entries sorted by count desc], comingSoon: [dropbox, gmail, whatsapp, hermes], timestamp }
```
Frontend chips block (lines 749–752 area) and km-grid (former hardcoded 10-card grid) replaced with `<div id="sourceChips">` and `<div id="knowledgeMapGrid">`. New `loadSources()` polls `/api/sources` on page load and every 60 s. Also: source filter loosened from `chunks > 0` to truthy-source so mongodb chip stays visible during boot-time race.

Harness layer:
- **Post-apply guard carve-out** in `harness/eagle/eagle-harness.js` (Self-Improvement Run 001 HIGH-severity fix #1): when `runId` or `ticketName` matches `/harness/i`, the guard additionally permits writes under `harness/`, `intelligence/harness-runs/output/`, and `harness/__tests__/`. Otherwise unchanged.
- **`harness-worker` back online** as third pm2 entry in `ecosystem.config.cjs` (id 7). Picked up `playwright-full-test-suite` (STATE 3 blocked) and `rag-foundation-v1` (now in `tickets/complete/` per worker activity); has also created new ticket dirs `bcbt-commission-tracker/` and `bcbt-fee-calculator/`.
- **Caveat**: worker reads stdin commands, NOT the `approvals/*.signal` files Mission Vault UI writes. Two pending UI signals from morning (`harness-eagle-stage-marker-contract-followups`, `self-improvement-harness-v1`) still unconsumed — bridge needed.

Vision / strategic framing (locked at session close):
- 369BRAIN = master intelligence layer. BCBT September 2026 = first external-entity test run. Platform pitch: any SME in Europe.
- 3 foundation documents built and printed (per Shon).

Pre-existing brain-side uncommitted (NOT touched this session — intentionally untouched): pre-existing `M`/`D` for harness/eagle, intelligence/harness-runs/, deleted patterns/anti-ambiguity.md and skills/ files. New worker activity also untouched: `?? approvals/`, `?? intelligence/harness-runs/output/bcbt-*/`, `?? tickets/deferred/`.

Working tree at session close:
- `M dashboard/index.html` · `M dashboard/server.js` · `M dashboard/package*.json` · `?? dashboard/rag-engine.js` · `?? dashboard/mongodb-connector.js` · `?? intelligence/mongodb-sync-status.json` · `M harness/eagle/eagle-harness.js` (this session)
- All other `M`/`D`/`??` lines are pre-existing or worker-driven.

Next task to start with:
- Wire `approvals/*.signal` → harness-worker (file watch in worker, or change Mission Vault `/api/approve` to write to a worker-readable channel) so the morning's UI approvals can finally execute.
- Carry over: re-enable CORTEX-369 Dropbox app in console (still blocked).
- Decide commit strategy for the v3 dashboard stack + RAG MongoDB integration + harness-eagle.js carve-out (all currently uncommitted).
- Optional cleanup: lift `.limit(1000)` per-collection cap in `mongodb-connector.js` for collections you care about (Mongo paginate or stream); add PII denylist before any external user sees the RAG output.

---

## SESSION 4 May 2026 (afternoon) — Mission Vault v3 + Dropbox sync infrastructure

Last task completed: dashboard/server.js v3 + 2 surgical fixes — preview `.html`-suffix tolerance and auto-move ticket on approve/reject. pm2 mission-control-369 re-registered under ecosystem.config.cjs (was bare-script id 4, now id 6) with ANTHROPIC_API_KEY wired; pm2 save persisted to ~/.pm2/dump.pm2.

Mission Control state (http://localhost:3369):
- Serves dashboard/index.html (mission-vault-v3, 96,599 B). Fresh read on every request — no in-memory cache.
- /api/status reports `claude_api: READY`, `rag.total_chunks: 3264` (brain 76 files / 3262 chunks + Documents/369 RAG/369 RAG 1 file / 2 chunks), 4 previews.
- New endpoints live: /api/claude (proxy), /api/rag/search, /api/rag/status, /api/rag/index, /api/approve, /preview/:f (now accepts both `/foo` and `/foo.html`).
- /api/approve now also renames `tickets/awaiting-approval/<feature>.md` → `tickets/{open|rejected}/<feature>.md` in addition to writing the signal file.

Dropbox sync state:
- integrations/dropbox-sync.js + DROPBOX-SETUP.md created (zero npm deps; Node 22 fetch + Dropbox v2 HTTP API; cursor-based diff polling; 60s loop).
- Watches `/CORTEX-369` (was `/DeAssists/Documents`), `recursive:false`. Output appended to intelligence/dropbox-sync.jsonl. Cursor persisted at integrations/.dropbox-cursor.
- ecosystem.config.cjs (gitignored) holds both DROPBOX_TOKEN and ANTHROPIC_API_KEY (Option A: single file, both apps).
- pm2 dropbox-sync (id 5) online and looping every 60s, but Dropbox API returns `400 "This app is currently disabled"`. Root cause: CORTEX-369 Dropbox app console state, not the token. Three tokens were cycled (two failed `missing_scope/files.metadata.read`, third hit the disabled-app error).

Brain commit pushed this session:
- 63790ab — feat: 369 MISSION VAULT final — 6 tabs, RAG Intelligence, action generator, PDF upload, knowledge map, audit log. Files: .gitignore (+1: `ecosystem.config.cjs`), mission-control-index.html (replaced with vault HTML), mission-vault/369-mission-vault.html (new, 1522 lines).
- Verified before push: ecosystem.config.cjs (live tokens) NOT staged.

Working-tree state at session close (carried; not touched by this session unless noted):
- M dashboard/index.html  ← this session (v3 vault, uncommitted)
- M dashboard/server.js   ← this session (v3 + 2 fixes, uncommitted)
- ?? dashboard/rag-engine.js ← this session (uncommitted)
- M harness/eagle/eagle-harness.js, M intelligence/harness-runs/eagle-harness.jsonl, M intelligence/harness-runs/output/harness-eagle-stage-marker-contract/* (3 files), M previews/harness-eagle-stage-marker-contract.html, D patterns/anti-ambiguity.md, D skills/eagleskill/eagleskill-config.md, D skills/session-start/SESSION-START-SKILL.md, D tickets/open/harness-eagle-stage-marker-contract.md, ?? tickets/awaiting-approval/, ?? approvals/  ← all pre-existing, untouched.

Vision locked this session:
- **369BRAIN** is the **master intelligence layer** — single brain across DeAssists ops, code, harnesses, RAG, dashboards.
- **BCBT September 2026 intake** is the **first external-entity test run** — proves the brain can serve a real client tenant end-to-end (intake docs → 369 Assessment → student lifecycle).
- **Platform pitch:** the same brain pattern is **sellable to any SME in Europe**. BCBT validates the multi-tenant story; the architecture (Mission Vault + RAG + Dropbox/document ingestion + approval flow + Claude API) is the productizable shape.
- One-line pitch (this session): *Built 369 MISSION VAULT v3 — 6 tabs, mobile-first, Claude API connected, RAG engine live with 3,264 chunks, Obsidian vault indexed, approve/reject from UI working, preview fix deployed.*

Next task to start with:
- Re-enable CORTEX-369 Dropbox app: console → Settings → Status → Enable; Permissions tab → tick `files.metadata.read` + `files.content.read` → Submit (don't skip); Settings → Generate fresh token; paste — I swap into ecosystem.config.cjs and `pm2 restart dropbox-sync --update-env`. Validate first sync entry lands in intelligence/dropbox-sync.jsonl.
- Decide whether to commit the dashboard v3 stack (M dashboard/index.html, M dashboard/server.js, ?? dashboard/rag-engine.js).
- Carried from morning: triage of intelligence/proposed-fixes/2026-05-03-self-improvement-run-001.md.

---

## SESSION 4 May 2026 — self-improvement-harness-v1 shipped (EAGLE Mode 1/2/3 complete)

Last task completed: EAGLE Mode 3 — self-improvement-harness-v1 v1 capability shipped in 4 stages, committed as 5c2d546 and pushed to main.

Capability summary:
- 9 new code files in harness/self-improvement/ (1,858 LOC; 51 node:test cases all pass).
- First analysis run produced 12 KB report citing 5 patterns + 6 proposed fixes + 5 open questions, all evidence-cited from real run_ids and ticket filenames.
- LEARNING-MIND.md appended +1 dated section; byte-equal-at-top invariant verified.
- JSONL run log live at intelligence/harness-runs/self-improvement-harness.jsonl (3 rows; all status:complete).
- Mission Control s-learn stat now reads 3 from this JSONL.
- Registry row self-improvement-harness-v1: IN PROGRESS → DONE.

Bundled in same commit (one atomic brain push):
- .gitignore: added node_modules/ rule (was missing — saved 583 dep files from leaking).
- dashboard/ (4 files): local mission-control HTTP server source.
- integrations/ (2 files): Dropbox sync helper.
- mission-control-index.html: Build + Document Intelligence dashboard.
- intelligence/video-research/xgPWCuqLoek-analysis.md: Claude Code Agentic RAG video — patterns directly applicable to DeAssists EDU search & RAG (see file for full DeAssists-connection section).
- previews/harness-eagle-stage-marker-contract.html: earlier Mode 2 preview.
- intelligence/harness-runs/output/* per-ticket phase output dirs.

Brain commit: 5c2d546 (pushed)
Branch: main (brain repo)

Locked decisions from Mode 1 (re-confirmed during execution):
- self-improvement-harness CAPABILITY mode (no UI; brain-only)
- 5 SOP files: AGENTS.md, CLAUDE.md, CODING-CONSTITUTION.md, HOOKS.md, THE-DEASSISTS-OS.md
- Google Doc input: WAIVED for v1
- Trigger: MANUAL only for v1 (no cron, no hooks)
- LEARNING-MIND: APPEND only (never edit existing entries)
- Run log uses identical schema to eagle-harness.jsonl (one observability layer)

Next task to start with:
- Review intelligence/proposed-fixes/2026-05-03-self-improvement-run-001.md and decide which proposed fixes to action vs explicitly defer. The Run 001 challenge is exactly this: "prove Run 001 fixes were adopted before letting Run 002 propose more."
- Top candidates from Run 001 (severity HIGH/MED):
  1. (HIGH source-file fix) Codify harness self-modification carve-out in Mode 3 post-apply guard — references run b18cb4fea3eafbea failure
  2. (MED source-file fix) Validate run_id before JSONL append; reject malformed run records
  3. (MED source-file fix) Implement priority-ordered ticket selection in harness-worker (existing waiting ticket harness-worker-ticket-ordering.md)
  4. (See report for fixes 4-6)

Pending blockers (carried from prior sessions):
- rag-foundation-v1 still blocked at data-check STATE 3 (Latha MongoDB collections)
- Pre-existing portal-side: JWT rotation, AWS ACL fix, Stripe write-back, scope.guard L79, SSR permission bleed (Latha)
- Pre-existing brain-side uncommitted (NOT this session's work): harness/eagle/eagle-harness.js, eagle-harness.jsonl, deleted skill files, session-lock.md, ecosystem.config.cjs

GAN loop: still READY (Phase 6 setup unchanged from prior session).
369-ECC: still operational (Phase 4 acceptance test still pending Latha permission.helper.ts resolution).

---


369-ECC BUILD STATUS:
Phase 0 — COMPLETE (inventory done)
Phase 1 — COMPLETE (25 files in ~/.claude/369/, all 10 tests passed)
Phase 2 — COMPLETE (brain wired, AGENTS.md, HOOKS.md, lean CLAUDE.md)
Phase 3 — COMPLETE (archive created, superseded files moved, brain cleaned)
Phase 4 — IN REVIEW (sidebar audit PASS post-fix; awaiting browser smoke test + Latha review of permission.helper.ts edit)
Phase 5 — COMPLETE
Phase 6 — COMPLETE (Playwright installed, SCORING-RUBRIC.md, GAN Planner + Evaluator agents, first test written, A19 added to Coding Constitution)
Portal build: 4 uncommitted fixes pending Latha review (see SESSION 2 May 2026 below)
Active portal blocker: NONE — sidebar audit PASS for all 7 roles; pre-commit browser smoke test required (ORG_ADMIN reaching /catalog, STAFF blocked from /leads + /catalog)
GAN loop: READY FOR FIRST RUN after Latha approves Phase 4 fixes

---

# DeAssists OS — Current State
**Maintained by:** VEERABHADRA

---

**Last updated:** 27 April 2026 — QA Fix Applied

**Brain root:** `~/deassists-workspace/369-brain/`

---

## CRM Phase 1 Status: CODE FIX APPLIED 27 Apr 2026
- Fixed new.tsx: raw fetch → useCustomMutationV2
- Fixed dashboard/index.tsx: raw fetch → useCustomQueryV2
- Audited 4 other components: already correct
- Awaiting QA redeployment and Latha verification
Remaining blockers: assigned_to enum hardcoded, Stripe write-back, scope.guard bypass, JWT rotation

---

## SESSION 2 May 2026 — Sidebar Audit + 4 Fixes (UNCOMMITTED)

Three-layer access audit run on SUPER_ADMIN, ORG_ADMIN, MANAGER, TEAM_LEAD, STAFF, AGENT, ORG_OWNER.
Audit FAIL → 4 fixes applied → re-audit PASS.

**Portal files modified (NOT committed — Latha review required):**

| File | Fix |
|------|-----|
| `apps/cms-next/pages/catalog/index.tsx` | Fix 1: ALLOWED_ROLES dropped STAFF, added ORG_ADMIN — now matches sidebar visibility |
| `apps/cms-next/pages/leads/index.tsx` | Fix 2: ALLOWED_ROLES dropped STAFF — closes deep-link bypass |
| `libs/shared/functions/permission.helper.ts` | Fix 3: removed dead block (lines 205-218) with broken arrow `(perm) => { perm.collection.includes(item.path); }` (no return). Behavior unchanged, trap removed |
| `libs/shared/models/sidemenu.ts` | Fix 4: AGENT "Courses" path → `/service/${CollectionNames.Courses}` (was admin path, violated AGENT pattern rule) |

**Build:** `npx nx build shared --skip-nx-cache` → SUCCESS
**Audit verdict:** PASS for all 7 roles across all 3 layers.

**Pre-commit blockers:**
1. `pm2 restart backend` (permission.helper.ts edit per pattern doc Rule 4)
2. Browser smoke test: ORG_ADMIN reaching `/catalog`, STAFF blocked from `/leads` + `/catalog`
3. Latha review (permission.helper.ts is MAXIMUM RISK per pattern doc)
4. `/latha-handover` to produce PR package

---

## NEXT SESSION: Q Intelligence (Phase 2)

- CallLogModal — new component
- LeadDetailPanel — add Log Call button + call summary block
- Backend endpoint already exists: POST /leads/:id/call-log
- Zero backend changes needed
- Two files only: CallLogModal.tsx (new) + LeadDetailPanel.tsx (modified)
- Wait for Latha to merge feature/portal.shon369 first OR build in parallel — decision for next session

---

## WAITING FOR

- Latha QA verification of QA fix (e67089df)
- Latha merge: feature/portal.shon369 → dev_v2
- Kingston QA on qa-portal.deassists.com
- Latha's UIUX + sidebar + finance branch to pull

---

## CURRENT BUILD STATE

**Branch:** feature/portal.shon369
**Backend:** Compiling and running on port 8000 ✅
**CMS:** Running on port 4002 ✅
**Login:** Working ✅
**Phase 1 CRM:** COMPLETE AND PUSHED ✅

---

## LATEST COMMIT

**Hash:** b0d2fdc4
**Message:** fix(crm): Phase 1 complete — enums, UI polish, nav guard, country code
**Date:** 25 April 2026
**Files:** 8

---

## WHAT WAS COMPLETED TODAY (25 April 2026)

### Commit b0d2fdc4 — Phase 1 CRM Complete

| File | What was fixed |
|------|----------------|
| `apps/backend-nest/src/leads/leads.service.ts` | Empty string enum validation fix |
| `apps/cms-next/components/leads/LeadDetailPanel.tsx` | Header lighter (dk2), Save in header, unsaved changes modal, country code display |
| `apps/cms-next/components/leads/LeadQueueSidebar.tsx` | "All Leads" option with total count |
| `apps/cms-next/components/leads/LeadTable.tsx` | data?.data?.data fix |
| `apps/cms-next/pages/dashboard/index.tsx` | Enum imports from lead.constants.ts |
| `apps/cms-next/pages/leads/index.tsx` | Navigation guard lifted to page level, unsaved changes modal |
| `apps/cms-next/pages/leads/new.tsx` | Enum imports, country_code required with +91 default |
| `libs/shared/constants/lead.constants.ts` | All enums + SidebarRole |

### Key Improvements
1. **Enum architecture** — All hardcoded strings replaced with imports from lead.constants.ts
2. **Navigation guard** — Unsaved changes protection on queue clicks, lead row clicks, route changes
3. **Country code** — Required field with +91 default, displayed with WhatsApp number
4. **UI polish** — Lighter header banner, Save button in header, "All Leads" option

---

## NEXT SESSION — PHASE 2

**After Latha merges feature/portal.shon369 → dev_v2:**

1. **Q Intelligence fields** — call_attempts, last_called_at, last_outcome, callback_at, callback_note
2. **CallLogModal** — Agent call logging interface
3. **Fix pre-existing LeadTable.tsx TypeScript error** — Property 'data' does not exist on type 'Lead[]'
4. Phase 2 sidebar structure with LEAD_CRM role

---

## TEAM ROLES — CONFIRMED AND LOCKED

| Type | Who | Portal Access |
|------|-----|---------------|
| SUPER_ADMIN | Shon, Latha | Everything |
| MANAGER | Don, Sruthi, Santosh | Full portal access |
| TEAM_LEAD | Anandhu, Midhun, Stalin, Gopika | CRM access via Call Center role |
| AGENT | External sub-agents ONLY | Zero internal portal access — ever |

**Role assignments:**
- Call Center role → assign to TEAM_LEAD for CRM sidebar access
- Sales Setup role → assign to anyone for Sales CRM access

---

## GRAPHIFY STATUS

**Last update:** 25 April 2026 after commit b0d2fdc4
**Files:** 1772 | **Nodes:** 3998 | **Edges:** 3849

---

## PENDING BLOCKERS

- JWT secrets rotation — Latha CRITICAL
- 4 AWS ACL errors in `accounts.service.ts` — Latha MEDIUM
- Stripe write-back bug — Latha HIGH
- Security guard bypass `scope.guard.ts` ~L79 — Latha HIGH
- `assigned_to` enum EMPTY — Shon runs `=UNIQUE(K2:K9999)` on Sheets col K

---

## FINALISED BUILD PLAN — LOCKED 23 APRIL 2026

### PHASE 1 — Foundation + Permissions + Roles ✅ COMPLETE (b0d2fdc4)

### PHASE 2 — Q Intelligence (ONE COMMIT)

Q Intelligence fields + CallLogModal
`call_attempts`, `last_called_at`, `last_outcome`, `callback_at`, `callback_note`

### PHASE 3 — My Queue page (ONE COMMIT)

Agent's personal queue view — filtered by `assigned_to`

### PHASE 4 — Sales Support panel (ONE COMMIT)

Sales support functionality — TBD with Shon

### PHASE 5 — Config panel (ONE COMMIT)

CRM configuration panel — TBD with Shon

---

## PORTAL SETUP — COMPLETE

- **Call Center** role created in portal ✅
- **Sales Setup** role created in portal ✅
- Roles assigned to Shon AJ account ✅

---

## CLAUDE.md RULES — LOCKED

| Rule | Description |
|------|-------------|
| Rule 0 | Always verify before adding or changing any rule |
| Rule 23 | git diff mandatory before any brain file commit |
| Rule 24 | NEVER commit `pnpm-lock.yaml` — Latha owns it |
| Rule 25 | Never commit `.gitignore` without Latha approval |
| Rule 26 | Any `package.json` change requires Latha approval before commit |
| Rule 27 | Three-layer access audit — mandatory for every CRM page |
| Rule 28 | Constants file is a hard gate — enums must exist before use |

---

*VEERABHADRA — DeAssists Master Brain | Updated: 25 April 2026 — Phase 1 COMPLETE*

## SESSION CONTINUING 4 May 2026 (evening)
- Graphify refreshed — portal map updated to today
- codebase-brain.md updated with current file inventory
- Portal added as 4th RAG source (controllers + entities + modules)
- harness-worker added to ecosystem.config.cjs permanently
- All 4 sources now indexed: brain + notes + mongodb + portal
