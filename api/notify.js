// POST /api/notify
//   { type: "registration", childId }  -> emails the teacher about a new family (called by the parent's app)
//   { type: "summary" }                -> emails the teacher the class summary now (called by the teacher)
import { whoIs, fsGet, fsList, sendEmail, TEACHER_EMAILS, APP_URL, schoolName } from "./_lib.js";
import { buildSummary, summaryHTML, registrationHTML } from "../src/lib/summary.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const me = await whoIs(req);
    if (!me) return res.status(401).json({ error: "Sign in first" });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const name = await schoolName(me.token);

    if (body.type === "registration") {
      // Read the child with the parent's own permissions: they can only see their own children.
      const child = await fsGet(`children/${encodeURIComponent(String(body.childId || ""))}`, me.token);
      if (!child || !(child.parentEmails || []).includes(me.email)) return res.status(403).json({ error: "Not your child" });
      if (Date.now() - (child.createdAt || 0) > 10 * 60e3) return res.status(200).json({ skipped: "old registration" });
      const r = await sendEmail({ subject: `New family: ${child.name} (age ${child.age}) joined ${name}`, html: registrationHTML({ child, parentName: me.name, parentEmail: me.email, appUrl: APP_URL, schoolName: name }) });
      return res.status(200).json(r);
    }

    if (body.type === "summary") {
      if (!TEACHER_EMAILS.includes(me.email)) return res.status(403).json({ error: "Teacher only" });
      const since = Date.now() - 7 * 864e5;
      const [children, activity, subs] = await Promise.all([fsList("children", me.token), fsList("activity", me.token, since), fsList("submissions", me.token)]);
      const s = buildSummary({ children, activity, subs });
      const r = await sendEmail({ subject: `${name}: class summary, ${s.total} children`, html: summaryHTML(s, { schoolName: name, appUrl: APP_URL }) });
      return res.status(200).json(r);
    }
    return res.status(400).json({ error: "Unknown type" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
