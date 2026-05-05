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
   * Allocates a monotonic `seq` inside a transaction so multiple writers
   * cannot collide (same pattern as EventBus.emit — see B-006).
   * @param {{kind:string, agent:string, run_id?:string, feature?:string, status?:string, summary?:string, payload?:any, id?:string, ts?:number}} episode
   * @returns {{seq:number, id:string, ts:number}}
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
    const params = {
      id,
      ts,
      kind,
      agent,
      run_id: episode.run_id || null,
      feature: episode.feature || null,
      status: episode.status || null,
      summary: episode.summary || null,
      payload: maybeStringify(episode.payload),
    };

    const db = this._ensure('episodes');
    const seqStmt = this._stmt('episodes', 'SELECT COALESCE(MAX(seq), 0) AS m FROM episodes');
    const insertStmt = this._stmt(
      'episodes',
      `INSERT INTO episodes (seq, id, ts, kind, agent, run_id, feature, status, summary, payload)
       VALUES (@seq, @id, @ts, @kind, @agent, @run_id, @feature, @status, @summary, @payload)`
    );

    const txEmit = db.transaction(() => {
      const seq = ((seqStmt.get().m) || 0) + 1;
      insertStmt.run({ seq, ...params });
      return seq;
    });
    const seq = txEmit();
    return { seq, id, ts };
  }

  /**
   * Query episodes with optional filters; payload is JSON-parsed back to an object when possible.
   *
   * Filters: agent, kind, feature, since (ts >=), until (ts <=), sinceSeq (seq >).
   * Ordering: 'ASC' / 'DESC' (legacy, sorts by ts) OR 'seq ASC' / 'seq DESC'
   *           (monotonic — preferred when paginating with sinceSeq).
   * Default order stays `ts DESC` for backward compatibility.
   * @param {{agent?:string, kind?:string, feature?:string, since?:number, until?:number, sinceSeq?:number, limit?:number, order?:string}} [filter]
   * @returns {Array<object>}
   */
  query(filter = {}) {
    this._checkOpen();
    const where = [];
    const params = {};
    if (filter.agent)   { where.push('agent = @agent');     params.agent = filter.agent; }
    if (filter.kind)    { where.push('kind = @kind');       params.kind = filter.kind; }
    if (filter.feature) { where.push('feature = @feature'); params.feature = filter.feature; }
    if (Number.isFinite(filter.since))    { where.push('ts >= @since');    params.since = filter.since; }
    if (Number.isFinite(filter.until))    { where.push('ts <= @until');    params.until = filter.until; }
    if (Number.isFinite(filter.sinceSeq)) { where.push('seq > @sinceSeq'); params.sinceSeq = filter.sinceSeq; }

    // order accepts 'ASC' / 'DESC' (sort by ts — legacy) or 'seq ASC' / 'seq DESC'.
    let orderClause;
    switch (filter.order) {
      case 'ASC':       orderClause = 'ts ASC';  break;
      case 'seq ASC':   orderClause = 'seq ASC'; break;
      case 'seq DESC':  orderClause = 'seq DESC'; break;
      case 'DESC':
      default:          orderClause = 'ts DESC';
    }
    const limit = Number.isFinite(filter.limit) && filter.limit > 0 ? Math.floor(filter.limit) : 100;

    // orderClause/limit are server-controlled literals (validated above);
    // user values bind through @params, never concatenated.
    const sql = `SELECT seq, id, ts, kind, agent, run_id, feature, status, summary, payload
                 FROM episodes
                 ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY ${orderClause}
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
