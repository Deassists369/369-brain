'use strict';
// memory/router.js
// Item 2 — Step 2B: MemoryRouter (the librarian).
// Single entry point for read/write across episodes.db, events.db, working.db.
// Step 2B exposes: emit(), query(), setWorking(), getWorking(), close().
// (Step 2C will add subscribe()/publish() for the event_log + cursors path.)

const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

function safeJsonParse(text) {
  if (text == null) return null;
  if (typeof text !== 'string') return text;
  try { return JSON.parse(text); }
  catch { return text; }
}

function maybeStringify(v) {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

/**
 * MemoryRouter — single librarian for the three brain databases.
 *
 * Lazy-opens episodes.db, events.db, working.db on first use.
 * Each db is opened with WAL journaling and foreign keys ON.
 * After close(), any further public method call throws — by design,
 * a closed router is dead. Callers create a new instance to resume.
 */
class MemoryRouter {
  /**
   * @param {{ dbDir?: string }} [opts] — dbDir defaults to ./db relative to this file.
   */
  constructor(opts = {}) {
    this._dbDir = opts.dbDir || path.join(__dirname, 'db');
    this._dbs = { episodes: null, events: null, working: null };
    this._stmts = Object.create(null);
    this._closed = false;
  }

  _checkOpen() {
    if (this._closed) throw new Error('MemoryRouter is closed');
  }

  _ensure(name) {
    this._checkOpen();
    if (this._dbs[name]) return this._dbs[name];
    const file = path.join(this._dbDir, `${name}.db`);
    const db = new Database(file);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    this._dbs[name] = db;
    return db;
  }

  _stmt(name, sql) {
    if (this._stmts[sql]) return this._stmts[sql];
    const db = this._ensure(name);
    this._stmts[sql] = db.prepare(sql);
    return this._stmts[sql];
  }

  /**
   * Append an immutable episode (agent history record).
   * @param {{kind:string, agent:string, run_id?:string, feature?:string, status?:string, summary?:string, payload?:any, id?:string, ts?:number}} episode
   * @returns {{id:string, ts:number}}
   * @throws if kind or agent are missing.
   */
  emit(episode) {
    this._checkOpen();
    if (!episode || typeof episode !== 'object') {
      throw new Error('emit: episode must be an object');
    }
    const { kind, agent } = episode;
    if (typeof kind !== 'string' || !kind) throw new Error('emit: kind is required (string)');
    if (typeof agent !== 'string' || !agent) throw new Error('emit: agent is required (string)');

    const id = episode.id || crypto.randomUUID();
    const ts = Number.isFinite(episode.ts) ? episode.ts : Date.now();

    this._stmt(
      'episodes',
      `INSERT INTO episodes (id, ts, kind, agent, run_id, feature, status, summary, payload)
       VALUES (@id, @ts, @kind, @agent, @run_id, @feature, @status, @summary, @payload)`
    ).run({
      id,
      ts,
      kind,
      agent,
      run_id: episode.run_id || null,
      feature: episode.feature || null,
      status: episode.status || null,
      summary: episode.summary || null,
      payload: maybeStringify(episode.payload),
    });
    return { id, ts };
  }

  /**
   * Query episodes with optional filters; payload is JSON-parsed back to an object when possible.
   * @param {{agent?:string, kind?:string, feature?:string, since?:number, until?:number, limit?:number, order?:'ASC'|'DESC'}} [filter]
   * @returns {Array<object>}
   */
  query(filter = {}) {
    this._checkOpen();
    const where = [];
    const params = {};
    if (filter.agent)   { where.push('agent = @agent');     params.agent = filter.agent; }
    if (filter.kind)    { where.push('kind = @kind');       params.kind = filter.kind; }
    if (filter.feature) { where.push('feature = @feature'); params.feature = filter.feature; }
    if (Number.isFinite(filter.since)) { where.push('ts >= @since'); params.since = filter.since; }
    if (Number.isFinite(filter.until)) { where.push('ts <= @until'); params.until = filter.until; }

    const order = filter.order === 'ASC' ? 'ASC' : 'DESC';
    const limit = Number.isFinite(filter.limit) && filter.limit > 0 ? Math.floor(filter.limit) : 100;

    // order/limit are server-controlled literals (validated above); user values
    // bind through @params, never concatenated.
    const sql = `SELECT id, ts, kind, agent, run_id, feature, status, summary, payload
                 FROM episodes
                 ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY ts ${order}
                 LIMIT ${limit}`;
    const rows = this._stmt('episodes', sql).all(params);
    return rows.map((r) => ({ ...r, payload: safeJsonParse(r.payload) }));
  }

  /**
   * Upsert a working-memory cell. Object values auto-stringify to JSON.
   * @returns {{agent:string, key:string, updated_at:number}}
   */
  setWorking(agent, key, value) {
    this._checkOpen();
    if (typeof agent !== 'string' || !agent) throw new Error('setWorking: agent is required');
    if (typeof key !== 'string' || !key) throw new Error('setWorking: key is required');
    const updated_at = Date.now();
    this._stmt(
      'working',
      `INSERT INTO working_memory (agent, key, value, updated_at)
       VALUES (@agent, @key, @value, @updated_at)
       ON CONFLICT (agent, key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`
    ).run({ agent, key, value: maybeStringify(value), updated_at });
    return { agent, key, updated_at };
  }

  /**
   * Read a working-memory cell. Returns parsed value, or null if not present.
   */
  getWorking(agent, key) {
    this._checkOpen();
    const row = this._stmt(
      'working',
      'SELECT value FROM working_memory WHERE agent = ? AND key = ?'
    ).get(agent, key);
    if (!row) return null;
    return safeJsonParse(row.value);
  }

  /** Close all open db connections. After close(), the instance is unusable. */
  close() {
    for (const name of Object.keys(this._dbs)) {
      const db = this._dbs[name];
      if (db && db.open) {
        try { db.close(); } catch { /* swallow */ }
      }
      this._dbs[name] = null;
    }
    this._stmts = Object.create(null);
    this._closed = true;
  }
}

module.exports = { MemoryRouter };
