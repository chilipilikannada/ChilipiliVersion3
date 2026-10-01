// GET /api/weekly-summary: run by Vercel Cron every Monday (see vercel.json).
// Needs FIREBASE_SERVICE_ACCOUNT (to read the class without a signed-in user) and RESEND_API_KEY.
import { serviceToken, fsList, sendEmail, APP_URL, schoolName } from "./_lib.js";
import { buildSummary, summaryHTML } from "../src/lib/summary.js";

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
    return res.status(200).json(r);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
