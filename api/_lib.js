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
const svc = new Map(); // scope -> { token, exp }, cached for the life of the server instance
const SCOPES = {
  data: "https://www.googleapis.com/auth/datastore",
  auth: "https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform",
};
export async function serviceToken(kind = "data") {
  if (!env.FIREBASE_SERVICE_ACCOUNT) return null;
  const hit = svc.get(kind);
  if (hit && hit.exp > Date.now() + 60e3) return hit.token;
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64u(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64u(JSON.stringify({ iss: sa.client_email, scope: SCOPES[kind] || SCOPES.data, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }))}`;
  const sig = b64u(crypto.sign("RSA-SHA256", Buffer.from(unsigned), sa.private_key));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  if (!r.ok) throw new Error(`Service account token failed: ${r.status}`);
  const token = (await r.json()).access_token;
  svc.set(kind, { token, exp: Date.now() + 50 * 60e3 });
  return token;
}

// A Firebase sign-in token (signInWithCustomToken on the device).
export function customToken(uid, claims) {
  if (!env.FIREBASE_SERVICE_ACCOUNT) return null;
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email, sub: sa.client_email,
    aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    iat: now, exp: now + 3600, uid: String(uid).slice(0, 128), ...(claims ? { claims } : {}),
  };
  const unsigned = `${b64u(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64u(JSON.stringify(payload))}`;
  return `${unsigned}.${b64u(crypto.sign("RSA-SHA256", Buffer.from(unsigned), sa.private_key))}`;
}
// A child's own code: they reach only their own space.
export const kidCustomToken = (childId) => customToken(`kid_${childId}`, { kid: childId });

// The Firebase account for an email: the existing one (e.g. from Google sign-in) or a new one,
// so the same person always lands in the same account however they sign in.
export async function accountForEmail(email) {
  const token = await serviceToken("auth");
  const api = `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT}`;
  const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const look = await fetch(`${api}/accounts:lookup`, { method: "POST", headers: H, body: JSON.stringify({ email: [email] }) });
  if (!look.ok) throw new Error(`Account lookup failed: ${look.status}`);
  const found = ((await look.json()).users || [])[0];
  if (found) return found.localId;
  const localId = "e_" + crypto.createHash("sha256").update(email).digest("hex").slice(0, 26);
  const make = await fetch(`${api}/accounts`, { method: "POST", headers: H, body: JSON.stringify({ localId, email, emailVerified: true }) });
  if (!make.ok) throw new Error(`Account create failed: ${make.status} ${await make.text()}`);
  return (await make.json()).localId || localId;
}

// Firestore query: documents where an array field contains a value (e.g. children of a parent email).
export async function fsArrayContains(collection, field, value, token) {
  const structuredQuery = { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: field }, op: "ARRAY_CONTAINS", value: { stringValue: value } } } };
  const r = await fetch(`${base()}:runQuery`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ structuredQuery }) });
  if (!r.ok) throw new Error(`Firestore query ${collection}: ${r.status}`);
  return (await r.json()).filter((x) => x.document).map((x) => toDoc(x.document));
}
export const validEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e);

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
const toValue = (v) => typeof v === "number" ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : typeof v === "boolean" ? { booleanValue: v } : { stringValue: String(v) };
export async function fsSet(path, data, token) {
  const fields = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toValue(v)]));
  const r = await fetch(`${base()}/${path}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ fields }) });
  if (!r.ok) throw new Error(`Firestore set ${path}: ${r.status}`);
}
export async function fsList(collection, token, since) {
  const structuredQuery = { from: [{ collectionId: collection }] };
  if (since) structuredQuery.where = { fieldFilter: { field: { fieldPath: "at" }, op: "GREATER_THAN_OR_EQUAL", value: { integerValue: String(since) } } };
  const r = await fetch(`${base()}:runQuery`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ structuredQuery }) });
  if (!r.ok) throw new Error(`Firestore query ${collection}: ${r.status} ${await r.text()}`);
  return (await r.json()).filter((x) => x.document).map((x) => toDoc(x.document));
}

// ---- Email ----
// Gmail (GMAIL_USER + GMAIL_APP_PASSWORD) sends to anyone: the teacher and the parents.
// Resend (RESEND_API_KEY) without your own domain can only reach the teacher, so parent emails are skipped then.
export const emailSetup = () => ({
  gmail: !!(env.GMAIL_USER && env.GMAIL_APP_PASSWORD),
  resend: !!env.RESEND_API_KEY,
  teacher: TEACHER_EMAILS.length > 0,
  parents: !!(env.GMAIL_USER && env.GMAIL_APP_PASSWORD) || !!(env.RESEND_API_KEY && env.EMAIL_FROM),
});
let mailer = null;
async function gmail() {
  if (!mailer) {
    const nodemailer = (await import("nodemailer")).default;
    mailer = env.MAIL_DRY_RUN ? nodemailer.createTransport({ jsonTransport: true }) : nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: env.GMAIL_USER, pass: String(env.GMAIL_APP_PASSWORD).replace(/\s/g, "") } });
  }
  return mailer;
}
// to: omitted = the teacher. replyTo defaults to the teacher so parents' replies reach you.
export async function sendEmail({ subject, html, to }) {
  const toParents = !!to;
  const list = [].concat(to || TEACHER_EMAILS).map((x) => String(x).trim()).filter(Boolean);
  if (!list.length) return { skipped: toParents ? "no parent email" : "TEACHER_EMAIL is not set" };
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    const m = await gmail();
    const info = await m.sendMail({ from: `"${env.EMAIL_NAME || "Chili Pili Kannada"}" <${env.GMAIL_USER}>`, to: list.join(", "), replyTo: TEACHER_EMAILS[0] || env.GMAIL_USER, subject, html });
    if (env.MAIL_DRY_RUN) (globalThis.__sentMail ||= []).push(JSON.parse(info.message));
    return { sent: true, via: "gmail" };
  }
  if (!env.RESEND_API_KEY) return { skipped: "No email set up (add GMAIL_USER and GMAIL_APP_PASSWORD)" };
  if (toParents && !env.EMAIL_FROM) return { skipped: "Parent emails need Gmail (GMAIL_USER and GMAIL_APP_PASSWORD)" };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM || "Chili Pili <onboarding@resend.dev>", to: list, reply_to: TEACHER_EMAILS[0], subject, html }),
  });
  if (!r.ok) throw new Error(`Email failed: ${r.status} ${await r.text()}`);
  return { sent: true, via: "resend" };
}

export async function schoolName(token) {
  try { const s = await fsGet("settings/school", token); return (s && s.schoolName) || "Chili Pili Kannada Kali"; } catch { return "Chili Pili Kannada Kali"; }
}

// ---- Rate limits for the public demo and the voice tools ----
// Counted in memory, and in Firestore when the service account is set (so it holds across instances).
const memHits = new Map();
export const clientIp = (req) => String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "local";
export async function rateGuard(key, limit, windowMs, memoryOnly = false) {
  const now = Date.now();
  const list = (memHits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= limit) return false;
  list.push(now); memHits.set(key, list);
  if (memoryOnly || !env.FIREBASE_SERVICE_ACCOUNT || env.RATE_MEMORY_ONLY) return true;
  try {
    const token = await serviceToken();
    const path = `loginGuard/rl_${crypto.createHash("sha256").update(key).digest("hex").slice(0, 24)}`;
    const g = (await fsGet(path, token)) || {};
    const fresh = !g.since || now - g.since > windowMs;
    const n = fresh ? 0 : g.n || 0;
    if (n >= limit) return false;
    await fsSet(path, { n: n + 1, since: fresh ? now : g.since }, token);
  } catch { /* never block on the counter itself */ }
  return true;
}
// Signed-in users get generous limits; visitors trying the front-page demo get a few goes.
export async function voiceAccess(req, kind) {
  const me = await whoIs(req);
  if (me) return (await rateGuard(`${kind}:u:${me.uid}`, 60, 10 * 60e3, true)) ? { me } : { error: 429 };
  const ip = clientIp(req);
  const ok = (await rateGuard(`${kind}:demo:${ip}`, 15, 60 * 60e3)) && (await rateGuard(`${kind}:demo:site`, 500, 24 * 60 * 60e3));
  return ok ? { me: null, demo: true } : { error: 429 };
}
