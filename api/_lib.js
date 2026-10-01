// Server helpers for the Vercel functions: verify who is calling, read Firestore, send email.
// No extra packages: plain fetch + Node crypto.
import crypto from "node:crypto";

const env = process.env;
export const PROJECT = env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID;
const API_KEY = env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY;
export const TEACHER_EMAILS = String(env.TEACHER_EMAIL || env.VITE_ADMIN_EMAILS || "").toLowerCase().split(/[,\s]+/).filter(Boolean);
export const APP_URL = env.APP_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "");

// Check a Firebase ID token by asking Firebase who it belongs to.
export async function whoIs(req) {
  const m = String(req.headers.authorization || "").match(/^Bearer (.+)$/);
  if (!m || !API_KEY) return null;
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: m[1] }),
  });
  if (!r.ok) return null;
  const u = ((await r.json()).users || [])[0];
  return u ? { uid: u.localId, email: String(u.email || "").toLowerCase(), name: u.displayName || "", token: m[1] } : null;
}

// Access token from a service account (for the weekly summary, which runs without a user).
const b64u = (b) => Buffer.from(b).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
export async function serviceToken() {
  if (!env.FIREBASE_SERVICE_ACCOUNT) return null;
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64u(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64u(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }))}`;
  const sig = b64u(crypto.sign("RSA-SHA256", Buffer.from(unsigned), sa.private_key));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  if (!r.ok) throw new Error(`Service account token failed: ${r.status}`);
  return (await r.json()).access_token;
}

// ---- Firestore REST ----
const base = () => `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
function fromValue(v) {
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return Date.parse(v.timestampValue);
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromValue);
  if ("mapValue" in v) return fromFields(v.mapValue.fields || {});
  return null;
}
const fromFields = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, fromValue(v)]));
const toDoc = (d) => ({ ...fromFields(d.fields || {}), id: d.name.split("/").pop() });

export async function fsGet(path, token) {
  const r = await fetch(`${base()}/${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Firestore get ${path}: ${r.status}`);
  return toDoc(await r.json());
}
export async function fsList(collection, token, since) {
  const structuredQuery = { from: [{ collectionId: collection }] };
  if (since) structuredQuery.where = { fieldFilter: { field: { fieldPath: "at" }, op: "GREATER_THAN_OR_EQUAL", value: { integerValue: String(since) } } };
  const r = await fetch(`${base()}:runQuery`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ structuredQuery }) });
  if (!r.ok) throw new Error(`Firestore query ${collection}: ${r.status} ${await r.text()}`);
  return (await r.json()).filter((x) => x.document).map((x) => toDoc(x.document));
}

// ---- Email via Resend (https://resend.com) ----
export async function sendEmail({ subject, html }) {
  if (!env.RESEND_API_KEY) return { skipped: "RESEND_API_KEY is not set" };
  if (!TEACHER_EMAILS.length) return { skipped: "TEACHER_EMAIL is not set" };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM || "Chili Pili <onboarding@resend.dev>", to: TEACHER_EMAILS, subject, html }),
  });
  if (!r.ok) throw new Error(`Email failed: ${r.status} ${await r.text()}`);
  return { sent: true };
}

export async function schoolName(token) {
  try { const s = await fsGet("settings/school", token); return (s && s.schoolName) || "Chili Pili"; } catch { return "Chili Pili"; }
}
