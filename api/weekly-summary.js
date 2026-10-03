// GET /api/weekly-summary: run by Vercel Cron every Monday (see vercel.json).
// Needs FIREBASE_SERVICE_ACCOUNT (to read the class without a signed-in user) and Gmail (or Resend for the teacher only).
import { serviceToken, fsList, fsGet, sendEmail, emailSetup, APP_URL, schoolName } from "./_lib.js";
import { buildSummary, summaryHTML, parentWeekHTML } from "../src/lib/summary.js";

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).end("Unauthorized");
  try {
    const token = await serviceToken();
    if (!token) return res.status(200).json({ skipped: "FIREBASE_SERVICE_ACCOUNT is not set" });
    const since = Date.now() - 7 * 864e5;
    const [children, activity, subs] = await Promise.all([fsList("children", token), fsList("activity", token, since), fsList("submissions", token)]);
    const s = buildSummary({ children, activity, subs });
    const name = await schoolName(token);
    const r = await sendEmail({ subject: `${name}: this week, ${s.weekActs} ${s.weekActs === 1 ? "activity" : "activities"} from ${s.total} ${s.total === 1 ? "child" : "children"}`, html: summaryHTML(s, { schoolName: name, appUrl: APP_URL }) });
    // A short Monday note to each family (needs Gmail; the teacher can switch it off in Settings).
    let families = { skipped: "parent emails need Gmail" };
    const school = await fsGet("settings/school", token).catch(() => null);
    if (emailSetup().parents && !(school && school.parentEmails === false)) {
      families = { sent: 0, failed: 0 };
      for (const row of s.rows) {
        if (!row.parentEmails.length) continue;
        try { await sendEmail({ to: row.parentEmails, subject: row.adult ? `Your Kannada week: ${row.weekStars} stars, ${row.lessons} lessons done` : `${row.name.split(" ")[0]}'s Kannada week: ${row.weekStars} stars, ${row.missions} of 6 missions`, html: parentWeekHTML(row, { schoolName: name, appUrl: APP_URL }) }); families.sent++; }
        catch (e) { console.error(e); families.failed++; }
      }
    }
    return res.status(200).json({ teacher: r, families });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
