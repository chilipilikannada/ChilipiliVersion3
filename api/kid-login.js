// POST /api/kid-login { code } -> { token, name }
// A child types their 4-digit number on any device and signs in to their own space only.
// Wrong guesses are limited per network (8 an hour, kept in Firestore so it holds across
// server instances) and for the whole site (300 an hour), so nobody can try all 9,000 numbers.
import crypto from "node:crypto";
import { serviceToken, fsGet, fsSet, kidCustomToken } from "./_lib.js";

const tries = new Map(); // ip -> timestamps (quick per-instance limit)
const clean = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const HOUR = 60 * 60e3, PER_IP = 8, SITE = 300;
const BUSY = "Too many tries. Ask a grown-up to check the number, then try again in an hour.";

async function guard(path, token) {
  const g = (await fsGet(path, token).catch(() => null)) || {};
  const fresh = !g.since || Date.now() - g.since > HOUR;
  return { path, fails: fresh ? 0 : g.fails || 0, since: fresh ? Date.now() : g.since };
}
const miss = (g, token) => fsSet(g.path, { fails: g.fails + 1, since: g.since }, token).catch(() => {});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "local";
    const now = Date.now(), list = (tries.get(ip) || []).filter((t) => now - t < 15 * 60e3);
    list.push(now); tries.set(ip, list);
    if (list.length > 20) return res.status(429).json({ error: BUSY });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const code = clean(body.code);
    if (code.length < 4) return res.status(400).json({ error: "Type your 4 numbers." });
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) return res.status(501).json({ error: "Kid numbers aren't switched on yet. Ask your teacher.", code: "not_configured" });
    const token = await serviceToken();
    const ipKey = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 24);
    const [gIp, gAll] = await Promise.all([guard(`loginGuard/ip_${ipKey}`, token), guard("loginGuard/site", token)]);
    if (gIp.fails >= PER_IP || gAll.fails >= SITE) return res.status(429).json({ error: BUSY });
    const bad = async () => { await Promise.all([miss(gIp, token), miss(gAll, token)]); return res.status(404).json({ error: "That number didn't work. Check it with a grown-up." }); };
    const entry = await fsGet(`kidCodes/${code}`, token);
    if (!entry || !entry.childId) return bad();
    const child = await fsGet(`children/${encodeURIComponent(entry.childId)}`, token);
    if (!child || clean(child.kidCode) !== code) return bad();
    return res.status(200).json({ token: kidCustomToken(entry.childId), name: child.name || "" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
