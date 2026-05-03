# Dropbox Sync — Setup

`integrations/dropbox-sync.js` polls a Dropbox folder every 60 seconds and
appends every new or modified file to
`~/deassists-workspace/369-brain/intelligence/dropbox-sync.jsonl`.

No npm packages required. Uses Node 18+ built-in `fetch` and the Dropbox v2
HTTP API directly.

---

## 1. Get a Dropbox access token

DeAssists owns the Dropbox account, so use a **scoped app** with a generated
access token (not OAuth — this is a backend daemon).

1. Sign in at <https://www.dropbox.com/developers/apps>.
2. Click **Create app**.
3. Choose:
   - API: **Scoped access**
   - Access type: **App folder** (recommended — gives the app its own
     `/Apps/<AppName>/` folder, fully isolated) **or** **Full Dropbox** if you
     need to read an existing folder like `/DeAssists/Documents`.
   - Name: e.g. `deassists-doc-sync`
4. On the new app's page, **Permissions** tab — enable:
   - `files.metadata.read`
   - `files.content.read`
5. Click **Submit** at the bottom.
6. **Settings** tab → scroll to **OAuth 2** → **Generated access token** →
   click **Generate**.
7. Copy the token. **Treat it like a password** — never commit it.

> Note: generated tokens are short-lived in some app modes. If the daemon
> starts logging `expired_access_token`, regenerate (or move to refresh-token
> flow when we have time).

---

## 2. Set the `DROPBOX_TOKEN` environment variable

### Option A — pm2 ecosystem file (recommended)

Edit (or create) `~/deassists-workspace/369-brain/ecosystem.config.cjs`:

```js
module.exports = {
  apps: [
    {
      name: 'dropbox-sync',
      script: './integrations/dropbox-sync.js',
      cwd: '/Users/deassists369/deassists-workspace/369-brain',
      env: {
        DROPBOX_TOKEN: 'sl.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        DROPBOX_FOLDER: '/DeAssists/Documents',
        DROPBOX_POLL_MS: '60000',
      },
      restart_delay: 5000,
      max_restarts: 20,
    },
  ],
};
```

### Option B — shell environment

```bash
export DROPBOX_TOKEN='sl.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
export DROPBOX_FOLDER='/DeAssists/Documents'   # optional, default shown
export DROPBOX_POLL_MS='60000'                 # optional, default shown
```

Persist by adding the same lines to `~/.zshrc`.

---

## 3. Start the sync with pm2

```bash
# First time — register and start
cd ~/deassists-workspace/369-brain
pm2 start ecosystem.config.cjs --only dropbox-sync
pm2 save

# Or, if using shell env (Option B):
pm2 start integrations/dropbox-sync.js --name dropbox-sync \
  --update-env

# Inspect
pm2 logs dropbox-sync --lines 50
pm2 show dropbox-sync
```

You should see:

```
[dropbox-sync] watching /DeAssists/Documents every 60s
[dropbox-sync] log: /Users/deassists369/deassists-workspace/369-brain/intelligence/dropbox-sync.jsonl
Synced: passport-anita-sharma.pdf at 2026-05-03T19:14:02.118Z
Synced: bank-statement-q1.pdf  at 2026-05-03T19:14:02.221Z
```

Stop, restart, or remove:

```bash
pm2 restart dropbox-sync
pm2 stop dropbox-sync
pm2 delete dropbox-sync
```

---

## 4. Expected folder structure

The daemon watches **one** folder, recursively. Default:
`/DeAssists/Documents/`. Suggested layout for BCBT September 2026 intake:

```
/DeAssists/Documents/
├── students/
│   ├── 2026-09-bcbt/
│   │   ├── <surname>-<firstname>/
│   │   │   ├── passport.pdf
│   │   │   ├── bank-statement.pdf
│   │   │   ├── academic-cert.pdf
│   │   │   ├── language-cert.pdf
│   │   │   ├── motivation-letter.pdf
│   │   │   ├── visa-docs/
│   │   │   └── blocked-account.pdf
│   │   └── ...
│   └── ...
└── shared/
    ├── templates/
    └── reference/
```

The daemon does not care about the names — it logs every `file` entry it
sees. Folder names become useful when downstream classification (369
Assessment) starts running over the JSONL log.

---

## 5. What the daemon writes

- **JSONL log** — one line per file, appended:
  `~/deassists-workspace/369-brain/intelligence/dropbox-sync.jsonl`

  ```json
  {"synced_at":"2026-05-03T19:14:02.118Z","name":"passport-anita-sharma.pdf","path":"/DeAssists/Documents/students/2026-09-bcbt/sharma-anita/passport.pdf","size":482113,"modified":"2026-05-03T18:42:11Z","content_hash":"abc123…"}
  ```

- **Cursor file** — `integrations/.dropbox-cursor`. Persists pagination state
  so restarts don't re-sync everything. Delete it if you want a full re-scan.

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `DROPBOX_TOKEN is not set` | env var missing | re-export, then `pm2 restart dropbox-sync --update-env` |
| `expired_access_token` | token rotated or expired | regenerate in the Dropbox app console, update env |
| `path/not_found` | folder doesn't exist on Dropbox | create it in the Dropbox UI or change `DROPBOX_FOLDER` |
| `insufficient_scope` | app permissions weren't saved | re-check **Permissions** tab → click Submit → regenerate token |
| Re-sync everything | want a clean run | `rm integrations/.dropbox-cursor && pm2 restart dropbox-sync` |
