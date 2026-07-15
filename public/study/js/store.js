// Persistence: IndexedDB ("barrules" db, stores "log" + "kv"), with a
// localStorage fallback when IDB is unavailable. The review log is append-only;
// undo appends a tombstone. Everything is namespaced under barrules.*.

import { DB_NAME, LS_PREFIX } from './constants.js';

let db = null;
let useLS = false;
let logCache = [];

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('log')) d.createObjectStore('log', { autoIncrement: true });
      if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB blocked'));
  });
}

function tx(store, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const out = fn(s);
    t.oncomplete = () => resolve(out && out.result !== undefined ? out.result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('tx aborted'));
  });
}

function idbGetAll(store) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, 'readonly');
    const req = t.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// --- localStorage fallback helpers ---
function lsRead(key, fallback) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}
function lsWrite(key, val) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch { /* full */ }
}

// --- public API ---

export async function initStore() {
  try {
    if (!('indexedDB' in window)) throw new Error('no idb');
    db = await idbOpen();
    logCache = await idbGetAll('log');
  } catch (e) {
    console.warn('IndexedDB unavailable, using localStorage fallback', e);
    useLS = true;
    logCache = lsRead('log', []);
  }
}

/** @returns {import('./types.js').LogEntry[]} the in-memory append-only log */
export function getLog() { return logCache; }

export async function appendLog(entry) {
  logCache.push(entry);
  if (useLS) { lsWrite('log', logCache); return; }
  try { await tx('log', 'readwrite', s => s.add(entry)); }
  catch (e) { console.error('log append failed', e); }
}

export async function kvGet(key, fallback) {
  if (useLS) return lsRead('kv.' + key, fallback);
  try {
    const val = await new Promise((resolve, reject) => {
      const req = db.transaction('kv', 'readonly').objectStore('kv').get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return val === undefined ? fallback : val;
  } catch { return fallback; }
}

export async function kvSet(key, val) {
  if (useLS) { lsWrite('kv.' + key, val); return; }
  try { await tx('kv', 'readwrite', s => s.put(val, key)); }
  catch (e) { console.error('kv write failed', e); }
}

/** Replace the entire store from an imported state file. */
export async function replaceAll(log, kvPairs) {
  logCache = log.slice();
  if (useLS) {
    lsWrite('log', logCache);
    for (const [k, v] of Object.entries(kvPairs)) lsWrite('kv.' + k, v);
    return;
  }
  await tx('log', 'readwrite', s => { s.clear(); for (const e of logCache) s.add(e); });
  await tx('kv', 'readwrite', s => { for (const [k, v] of Object.entries(kvPairs)) s.put(v, k); });
}

/** Danger zone: wipe all progress. */
export async function wipeAll() {
  logCache = [];
  if (useLS) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LS_PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    return;
  }
  await tx('log', 'readwrite', s => s.clear());
  await tx('kv', 'readwrite', s => s.clear());
}
