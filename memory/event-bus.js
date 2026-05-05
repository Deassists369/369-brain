'use strict';
// memory/event-bus.js
// Item 2 — Step 2C: EventBus (durable pub/sub on top of events.db).
//
// Combines two delivery paths under one API:
//   - Live  : in-process subscribers fire synchronously inside emit()
//   - Replay: durable catch-up via event_log + cursors for slow/restarted
//             consumers. Cursor is per (subscriber, topic), advanced on read.

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
 * EventBus — durable pub/sub backed by events.db (event_log + cursors).
 *
 * Lazy-opens events.db on first use with WAL journaling. After close(),
 * any further public method call throws (matches MemoryRouter contract).
 * Subscriber callbacks fire synchronously inside emit(); errors thrown
 * by a subscriber are caught and logged so they cannot block delivery
 * to other subscribers or the publisher itself.
 */
class EventBus {
  /** @param {{ dbDir?: string }} [opts] — dbDir defaults to ./db relative to this file. */
  constructor(opts = {}) {
    this._dbDir = opts.dbDir || path.join(__dirname, 'db');
    this._db = null;
    this._stmts = Object.create(null);
    this._subs = Object.create(null); // topic -> Array<{ subscriber, callback }>
    this._closed = false;
  }

  _checkOpen() {
    if (this._closed) throw new Error('EventBus is closed');
  }

  _ensure() {
    this._checkOpen();
    if (this._db) return this._db;
    this._db = new Database(path.join(this._dbDir, 'events.db'));
    this._db.pragma('journal_mode = WAL');
    this._db.pragma('foreign_keys = ON');
    return this._db;
  }

  _stmt(sql) {
    if (this._stmts[sql]) return this._stmts[sql];
    const db = this._ensure();
    this._stmts[sql] = db.prepare(sql);
    return this._stmts[sql];
  }

  /**
   * Publish an event. Inserts into event_log, then synchronously invokes
   * every in-process subscriber on the topic.
   * @returns {{seq:number, id:string, ts:number}}
   */
  emit(topic, publisher, payload) {
    this._checkOpen();
    if (typeof topic !== 'string' || !topic) throw new Error('emit: topic is required (string)');
    if (typeof publisher !== 'string' || !publisher) throw new Error('emit: publisher is required (string)');

    const id = crypto.randomUUID();
    const ts = Date.now();
    const payloadStr = maybeStringify(payload);

    const db = this._ensure();
    const seqStmt = this._stmt('SELECT COALESCE(MAX(seq), 0) AS m FROM event_log');
    const insertStmt = this._stmt(
      `INSERT INTO event_log (seq, id, ts, topic, publisher, payload, consumed_by)
       VALUES (?, ?, ?, ?, ?, ?, NULL)`
    );

    // MAX-then-INSERT in a transaction so concurrent writers can't collide on
    // the same seq. better-sqlite3 is synchronous so single-process Node is
    // already serialized, but the transaction is the right shape for any
    // future multi-process use.
    const txEmit = db.transaction(() => {
      const seq = ((seqStmt.get().m) || 0) + 1;
      insertStmt.run(seq, id, ts, topic, publisher, payloadStr);
      return seq;
    });
    const seq = txEmit();

    // Pass live subscribers the original payload (object-shaped) rather than
    // re-parsing what we just serialized — preserves caller intent exactly.
    const event = { seq, id, ts, topic, publisher, payload, consumed_by: null };

    const list = this._subs[topic];
    if (list && list.length) {
      // Snapshot the list so an unsubscribe inside a callback doesn't break iteration.
      const snapshot = list.slice();
      for (const { subscriber, callback } of snapshot) {
        try {
          callback(event);
        } catch (err) {
          const msg = err && err.message ? err.message : String(err);
          console.error(`[bus] subscriber "${subscriber}" on topic "${topic}" threw: ${msg}`);
        }
      }
    }
    return { seq, id, ts };
  }

  /**
   * Register a live in-process callback. Returns an unsubscribe function
   * that removes this exact subscription. Same (subscriber, topic) pair
   * subscribed twice = two callbacks fire — caller dedupes if needed.
   */
  subscribe(subscriber, topic, callback) {
    this._checkOpen();
    if (typeof subscriber !== 'string' || !subscriber) throw new Error('subscribe: subscriber is required');
    if (typeof topic !== 'string' || !topic) throw new Error('subscribe: topic is required');
    if (typeof callback !== 'function') throw new Error('subscribe: callback must be a function');

    if (!this._subs[topic]) this._subs[topic] = [];
    const entry = { subscriber, callback };
    this._subs[topic].push(entry);

    return () => {
      const list = this._subs[topic];
      if (!list) return;
      const idx = list.indexOf(entry);
      if (idx >= 0) list.splice(idx, 1);
      if (list.length === 0) delete this._subs[topic];
    };
  }

  /**
   * Catch up a subscriber from the durable log. Returns events with seq
   * greater than the subscriber's saved cursor (or all events for the topic
   * if no cursor), in monotonic order, then advances the cursor to the last
   * seq seen. last_event_id and last_ts are written for forensic use only —
   * the cursor advance and the replay query both rely on `seq` exclusively.
   * @returns {Array<object>} payload is JSON-parsed back to an object.
   */
  replay(subscriber, topic) {
    this._checkOpen();
    if (typeof subscriber !== 'string' || !subscriber) throw new Error('replay: subscriber is required');
    if (typeof topic !== 'string' || !topic) throw new Error('replay: topic is required');

    const cursor = this._stmt(
      'SELECT last_seq FROM cursors WHERE subscriber = ? AND topic = ?'
    ).get(subscriber, topic);

    const lastSeq = cursor && Number.isFinite(cursor.last_seq) ? cursor.last_seq : 0;

    const rows = this._stmt(
      `SELECT seq, id, ts, topic, publisher, payload, consumed_by
       FROM event_log
       WHERE topic = ? AND seq > ?
       ORDER BY seq ASC`
    ).all(topic, lastSeq);

    if (rows.length > 0) {
      const last = rows[rows.length - 1];
      this._stmt(
        `INSERT INTO cursors (subscriber, topic, last_seq, last_event_id, last_ts)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(subscriber, topic) DO UPDATE SET
           last_seq = excluded.last_seq,
           last_event_id = excluded.last_event_id,
           last_ts = excluded.last_ts`
      ).run(subscriber, topic, last.seq, last.id, last.ts);
    }

    return rows.map((r) => ({ ...r, payload: safeJsonParse(r.payload) }));
  }

  /** Close events.db and clear in-process subscribers. One-way; reuse not allowed. */
  close() {
    if (this._db && this._db.open) {
      try { this._db.close(); } catch { /* swallow */ }
    }
    this._db = null;
    this._stmts = Object.create(null);
    this._subs = Object.create(null);
    this._closed = true;
  }
}

module.exports = { EventBus };
