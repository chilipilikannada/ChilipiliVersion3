// Firebase-backed data store. Same interface as the on-device store.
import { initializeApp } from "firebase/app";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, signOut as fbSignOut, signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, collection, query, where,
  getDocs, onSnapshot,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function createFirebaseStore(config) {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const st = getStorage(app);
  const urlCache = new Map();

  const q = (col, filters = []) =>
    query(collection(db, col), ...filters.map(([f, op, v]) => where(f, op, v)));
  const rows = (snap) => snap.docs.map((d) => ({ ...d.data(), id: d.id }));

  getRedirectResult(auth).catch(() => {});

  return {
    mode: "cloud",
    onAuth(cb) {
      return onAuthStateChanged(auth, async (u) => {
        if (!u) return cb(null);
        let kid = null;
        try { kid = (await u.getIdTokenResult()).claims.kid || null; } catch {}
        cb({ uid: u.uid, name: u.displayName || "", email: (u.email || "").toLowerCase(), photo: u.photoURL || "", kid });
      });
    },
    // Grown-ups without Google: a 6-digit code emailed from the teacher's Gmail.
    async requestEmailCode(email) {
      const r = await fetch("/api/email-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send", email }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(j.error || "Couldn't send the code."), { code: j.code });
      return j;
    },
    async signInWithEmailCode(email, code) {
      const r = await fetch("/api/email-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", email, code }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.token) throw new Error(j.error || "That code didn't work.");
      await signInWithCustomToken(auth, j.token);
    },
    async remindKidNumber(email) {
      const r = await fetch("/api/kid-reminder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Couldn't send it just now.");
      return j;
    },
    // A child signs in with their own code; the server checks it and hands back a sign-in token.
    async signInKid(code) {
      const r = await fetch("/api/kid-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.token) throw new Error(j.error || "That code didn't work. Check it with a grown-up.");
      await signInWithCustomToken(auth, j.token);
    },
    async signIn() {
      const p = new GoogleAuthProvider();
      p.setCustomParameters({ prompt: "select_account" });
      try {
        await signInWithPopup(auth, p);
      } catch (e) {
        if (/popup-blocked|operation-not-supported|cancelled-popup-request/.test(e.code || "")) return signInWithRedirect(auth, p);
        throw e;
      }
    },
    signOut: () => fbSignOut(auth),
    idToken: () => (auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)),
    async get(col, id) {
      const s = await getDoc(doc(db, col, id));
      return s.exists() ? { ...s.data(), id: s.id } : null;
    },
    set: (col, id, data) => setDoc(doc(db, col, id), data),
    merge: (col, id, data) => setDoc(doc(db, col, id), data, { merge: true }),
    async add(col, data) {
      const r = await addDoc(collection(db, col), data);
      return r.id;
    },
    update: (col, id, patch) => updateDoc(doc(db, col, id), patch),
    remove: (col, id) => deleteDoc(doc(db, col, id)),
    async list(col, filters) {
      return rows(await getDocs(q(col, filters)));
    },
    watch(col, filters, cb, onError) {
      return onSnapshot(q(col, filters), (s) => cb(rows(s)), (e) => { console.error(col, e); onError && onError(e); });
    },
    watchDoc(col, id, cb) {
      return onSnapshot(doc(db, col, id), (s) => cb(s.exists() ? { ...s.data(), id: s.id } : null), (e) => { console.error(col, id, e); cb(null); });
    },
    async upload(path, file) {
      await uploadBytes(ref(st, path), file, { contentType: file.type || "application/octet-stream" });
      return path;
    },
    async url(path) {
      if (!path) return null;
      if (urlCache.has(path)) return urlCache.get(path);
      const u = await getDownloadURL(ref(st, path));
      urlCache.set(path, u);
      return u;
    },
  };
}
