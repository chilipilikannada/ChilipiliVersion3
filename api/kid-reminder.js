// POST /api/kid-reminder { email } -> emails that address its children's 4-digit numbers.
// Safe to offer on the kid sign-in screen: the numbers only ever go to the parent's own inbox,
// and the reply is the same whether or not the email is registered.
import { serviceToken, fsArrayContains, sendEmail, emailSetup, rateGuard, clientIp, validEmail, schoolName, APP_URL } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    if (!validEmail(email)) return res.status(400).json({ error: "Type the grown-up's full email address." });
    if (!process.env.FIREBASE_SERVICE_ACCOUNT || !emailSetup().parents) return res.status(501).json({ error: "This isn't switched on yet. Ask your grown-up to look on their Chili Pili home page.", code: "not_configured" });
    const okMsg = { ok: true, message: "If that email is on Chili Pili, the number is on its way. Ask your grown-up to check their email." };
    if (!(await rateGuard(`remind:${email}`, 3, 60 * 60e3)) || !(await rateGuard(`remind-ip:${clientIp(req)}`, 10, 60 * 60e3))) return res.status(200).json(okMsg);
    const token = await serviceToken();
    const kids = (await fsArrayContains("children", "parentEmails", email, token)).filter((c) => !c.adult && /^\d{4}$/.test(c.kidCode || ""));
    if (kids.length) {
      const name = await schoolName(token);
      await sendEmail({ to: [email], subject: `Your child's ${name} number`, html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#2a0f0c;max-width:520px">
        <p>Someone asked for the sign-in number on the "I'm a kid" screen.</p>
        ${kids.map((c) => `<p>${String(c.name).split(" ")[0]}'s number: <b style="font-size:28px;letter-spacing:.2em;color:#1d5fa8">${c.kidCode}</b></p>`).join("")}
        <p>${APP_URL ? `Open <a href="${APP_URL}">${APP_URL.replace(/^https?:\/\//, "")}</a>, tap` : "Tap"} <b>I'm a kid</b> and type the number.</p>
        <p style="color:#7b5b52;font-size:13px">If this wasn't you, you can make a new number on your child's Profile page.</p></div>` }).catch((e) => console.error(e));
    }
    return res.status(200).json(okMsg);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
