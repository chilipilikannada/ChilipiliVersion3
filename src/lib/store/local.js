// On-device store: used when no Firebase project is connected yet.
// Starts empty. Data lives in this browser only (localStorage + IndexedDB for files).
const KEY = "chilipili-device-v1";
const USER_KEY = "chilipili-device-user";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { console.warn("Could not save on this device", e); }
}
const clone = (o) => JSON.parse(JSON.stringify(o));
const match = (d, filters = []) =>
  filters.every(([f, op, v]) =>
    op === "==" ? d[f] === v :
    op === "array-contains" ? Array.isArray(d[f]) && d[f].includes(v) :
    op === "in" ? v.includes(d[f]) : true);

// ---- tiny IndexedDB wrapper for files, with an in-memory fallback ----
const memFiles = new Map();
function idb() {
  return new Promise((res) => {
    try {
      const r = indexedDB.open("chilipili-files", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("files");
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
    } catch { res(null); }
  });
}
async function putFile(path, blob) {
  memFiles.set(path, blob);
  const db = await idb(); if (!db) return;
  await new Promise((res) => { const tx = db.transaction("files", "readwrite"); tx.objectStore("files").put(blob, path); tx.oncomplete = res; tx.onerror = res; });
}
async function getFile(path) {
  if (memFiles.has(path)) return memFiles.get(path);
  const db = await idb(); if (!db) return null;
  return new Promise((res) => { const tx = db.transaction("files", "readonly"); const g = tx.objectStore("files").get(path); g.onsuccess = () => res(g.result || null); g.onerror = () => res(null); });
}

export function createLocalStore() {
  let db = load();
  const subs = new Set();
  const authSubs = new Set();
  const urls = new Map();
  let user = null;
  try { user = JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch {}

  const col = (c) => (db[c] = db[c] || {});
  const changed = (c) => { save(db); subs.forEach((s) => s.col === c && s.fire()); };
  let n = Date.now() % 100000;
  const newId = () => (Date.now().toString(36) + (n++).toString(36) + Math.random().toString(36).slice(2, 6));

  return {
    mode: "device",
    onAuth(cb) { authSubs.add(cb); setTimeout(() => cb(user), 0); return () => authSubs.delete(cb); },
    // On this device there is no Google sign-in: the person types their name and email.
    async signIn(profile) {
      if (!profile || !profile.email) throw new Error("Enter your name and email to continue.");
      user = { uid: "u_" + profile.email.toLowerCase().replace(/[^a-z0-9]/g, "_"), name: profile.name || "", email: profile.email.toLowerCase(), photo: "" };
      try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
      authSubs.forEach((cb) => cb(user));
    },
    async signInKid(code) {
      const c = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const hit = Object.entries(col("children")).find(([, d]) => String(d.kidCode || "").toUpperCase().replace(/[^A-Z0-9]/g, "") === c && c.length >= 4);
      if (!hit) throw new Error("That number didn't work. Check it with a grown-up.");
      user = { uid: "kid_" + hit[0], name: hit[1].name || "", email: "", photo: "", kid: hit[0] };
      try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
      authSubs.forEach((cb) => cb(user));
    },
    // Preview copy: no email is sent; the code step is skipped.
    async requestEmailCode() { return { preview: true }; },
    async signInWithEmailCode(email) { return this.signIn({ name: email.split("@")[0], email }); },
    async remindKidNumber() { return { ok: true, message: "On the live website, the number is emailed to the grown-up." }; },
    async signOut() {
      user = null; try { localStorage.removeItem(USER_KEY); } catch {}
      authSubs.forEach((cb) => cb(null));
    },
    async get(c, id) { const d = col(c)[id]; return d ? { ...clone(d), id } : null; },
    async set(c, id, data) { col(c)[id] = clone(data); changed(c); },
    async merge(c, id, data) { col(c)[id] = { ...(col(c)[id] || {}), ...clone(data) }; changed(c); },
    async add(c, data) { const id = newId(); col(c)[id] = clone(data); changed(c); return id; },
    async update(c, id, patch) { if (!col(c)[id]) throw new Error("Not found"); Object.assign(col(c)[id], clone(patch)); changed(c); },
    async remove(c, id) { delete col(c)[id]; changed(c); },
    async list(c, filters) { return Object.entries(col(c)).map(([id, d]) => ({ ...clone(d), id })).filter((d) => match(d, filters)); },
    watch(c, filters, cb) {
      const s = { col: c, fire: () => cb(Object.entries(col(c)).map(([id, d]) => ({ ...clone(d), id })).filter((d) => match(d, filters))) };
      subs.add(s); setTimeout(s.fire, 0);
      return () => subs.delete(s);
    },
    watchDoc(c, id, cb) {
      const s = { col: c, fire: () => cb(col(c)[id] ? { ...clone(col(c)[id]), id } : null) };
      subs.add(s); setTimeout(s.fire, 0);
      return () => subs.delete(s);
    },
    async upload(path, file) { await putFile(path, file); return path; },
    async url(path) {
      if (!path) return null;
      if (urls.has(path)) return urls.get(path);
      const b = await getFile(path); if (!b) return null;
      const u = URL.createObjectURL(b); urls.set(path, u); return u;
    },
    // Start over on this device.
    async reset() { db = {}; save(db); try { indexedDB.deleteDatabase("chilipili-files"); } catch {} memFiles.clear(); location.reload(); },
  };
}
