// GET /api/status            -> which settings are present (true/false only, never the values)
// GET /api/status?deep=1     -> also tries each connection for real: the service account, account
//                               admin (for email codes), Gmail login and the Google voice key.
import { emailSetup, TEACHER_EMAILS, serviceToken, fsGet, PROJECT, rateGuard, clientIp } from "./_lib.js";

let cache = null; // { at, deep }
async function deepChecks() {
  const e = process.env, out = {};
  const tryIt = async (k, fn) => { try { await fn(); out[k] = { ok: true }; } catch (err) { out[k] = { ok: false, why: String(err.message || err).slice(0, 160) }; } };
  await tryIt("database", async () => { if (!e.FIREBASE_SERVICE_ACCOUNT) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set"); const t = await serviceToken(); await fsGet("settings/school", t); });
  await tryIt("accounts", async () => {
    if (!e.FIREBASE_SERVICE_ACCOUNT) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
    const t = await serviceToken("auth");
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts:lookup`, { method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ email: [TEACHER_EMAILS[0] || "nobody@example.com"] }) });
    if (!r.ok) throw new Error(`Firebase accounts: ${r.status}`);
  });
  await tryIt("gmail", async () => {
    if (!(e.GMAIL_USER && e.GMAIL_APP_PASSWORD)) throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD are not set");
    const nodemailer = (await import("nodemailer")).default;
    try { await nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: e.GMAIL_USER, pass: String(e.GMAIL_APP_PASSWORD).replace(/\s/g, "") } }).verify(); }
    catch (err) { throw new Error(/535|Username and Password|BadCredentials/i.test(String(err.message)) ? "Gmail didn't accept the password. Use the 16-letter app password (not your normal Gmail password), and check GMAIL_USER is the same Gmail." : String(err.message)); }
  });
  await tryIt("voice", async () => {
    if (!e.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is not set");
    const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${e.GOOGLE_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: { text: "ನಮಸ್ಕಾರ" }, voice: { languageCode: "kn-IN" }, audioConfig: { audioEncoding: "MP3" } }) });
    if (!r.ok) throw new Error(`Text-to-Speech: ${r.status} (is the API enabled for this key?)`);
  });
  return out;
}

export default async function handler(req, res) {
  const e = process.env, m = emailSetup();
  res.setHeader("Cache-Control", "no-store");
  const basic = {
    project: !!PROJECT, serviceAccount: !!e.FIREBASE_SERVICE_ACCOUNT,
    gmail: m.gmail, resend: m.resend, parentEmail: m.parents, teacherEmail: TEACHER_EMAILS.length > 0, teacherEmails: TEACHER_EMAILS.length ? TEACHER_EMAILS.map((x) => x.replace(/^(.).*(@.*)$/, "$1…$2")) : [],
    cron: !!e.CRON_SECRET, claude: !!e.ANTHROPIC_API_KEY, google: !!e.GOOGLE_API_KEY,
  };
  const wantDeep = (req.query && String(req.query.deep) === "1") || /[?&]deep=1/.test(req.url || "");
  if (!wantDeep) return res.status(200).json(basic);
  const fresh = cache && Date.now() - cache.at < 5 * 60e3;
  if (!fresh && (await rateGuard(`status:${clientIp(req)}`, 6, 10 * 60e3, true))) cache = { at: Date.now(), deep: await deepChecks() };
  return res.status(200).json({ ...basic, deep: cache ? cache.deep : null, checkedAt: cache ? cache.at : null });
}
