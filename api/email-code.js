// POST /api/email-code
//   { action: "send", email }          -> emails a 6-digit sign-in code from your Gmail
//   { action: "verify", email, code }  -> { token } for signInWithCustomToken
// No Google account or password needed. The same email always opens the same account,
// whether the person signs in with Google or with a code.
import crypto from "node:crypto";
import { serviceToken, fsGet, fsSet, customToken, accountForEmail, sendEmail, emailSetup, rateGuard, clientIp, validEmail, schoolName } from "./_lib.js";

const TEN_MIN = 10 * 60e3, HOUR = 60 * 60e3;
const keyOf = (email) => "c_" + crypto.createHash("sha256").update(email).digest("hex").slice(0, 32);
const hashOf = (email, code) => crypto.createHash("sha256").update(`${email}:${code}:${process.env.FIREBASE_SERVICE_ACCOUNT ? "s" : ""}`).digest("hex");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    if (!validEmail(email)) return res.status(400).json({ error: "Type your full email address." });
    if (!process.env.FIREBASE_SERVICE_ACCOUNT || !emailSetup().parents) return res.status(501).json({ error: "Sign-in codes aren't switched on yet. Use Continue with Google for now.", code: "not_configured" });
    const ip = clientIp(req);
    const token = await serviceToken();
    const path = `loginCodes/${keyOf(email)}`;

    if (body.action === "send") {
      if (!(await rateGuard(`code:${email}`, 5, HOUR)) || !(await rateGuard(`code-ip:${ip}`, 20, HOUR))) return res.status(429).json({ error: "Lots of codes asked for. Please wait a while and try again." });
      const code = String(crypto.randomInt(100000, 1000000));
      await fsSet(path, { h: hashOf(email, code), exp: Date.now() + TEN_MIN, tries: 0 }, token);
      const name = await schoolName(token);
      const r = await sendEmail({ to: [email], subject: `${code} is your ${name} sign-in code`, html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#2a0f0c;max-width:520px">
        <div style="background:#c8102e;color:#fff;padding:14px 18px;border-radius:12px 12px 0 0;font-weight:bold">${name} · ಚಿಲಿಪಿಲಿ ಕನ್ನಡ ಕಲಿ</div>
        <div style="padding:16px 18px;border:1px solid #f0dfbb;border-top:0;border-radius:0 0 12px 12px">
          <p>Your sign-in code is:</p>
          <p style="font-size:36px;font-weight:bold;letter-spacing:.25em;color:#1d5fa8;margin:6px 0">${code}</p>
          <p>Type it on the sign-in page. It works for 10 minutes.</p>
          <p style="color:#7b5b52;font-size:13px">Didn't ask for this? You can ignore this email; nobody can sign in without the code.</p>
        </div></div>` });
      if (!r.sent) return res.status(502).json({ error: "Couldn't send the email just now. Try again, or use Continue with Google." });
      return res.status(200).json({ sent: true });
    }

    if (body.action === "verify") {
      if (!(await rateGuard(`verify-ip:${ip}`, 30, HOUR))) return res.status(429).json({ error: "Too many tries. Please wait a while." });
      const code = String(body.code || "").replace(/\D/g, "");
      const rec = await fsGet(path, token);
      if (!rec || !rec.exp || rec.exp < Date.now()) return res.status(400).json({ error: "That code has expired. Ask for a new one." });
      if ((rec.tries || 0) >= 5) return res.status(429).json({ error: "Too many wrong tries. Ask for a new code." });
      const ok = rec.h && code.length === 6 && crypto.timingSafeEqual(Buffer.from(rec.h), Buffer.from(hashOf(email, code)));
      if (!ok) { await fsSet(path, { h: rec.h, exp: rec.exp, tries: (rec.tries || 0) + 1 }, token); return res.status(400).json({ error: "That code isn't right. Check the email and try again." }); }
      await fsSet(path, { h: "", exp: 0, tries: 0 }, token); // one use only
      const uid = await accountForEmail(email);
      return res.status(200).json({ token: customToken(uid) });
    }
    return res.status(400).json({ error: "Unknown action" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
