import { useEffect, useState } from "react";
import { LogOut, Save, Copy, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { notifyServer } from "../../lib/config.js";
import { useApp, useDoc } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Avatar, Btn } from "../../components/ui.jsx";
import { ResetDevice } from "../parent/Child.jsx";
import { friendlyError } from "../../App.jsx";

const ZONES = [["America/Chicago", "CT"], ["America/New_York", "ET"], ["America/Denver", "MT"], ["America/Los_Angeles", "PT"], ["Asia/Kolkata", "IST"], ["Europe/London", "UK"], ["Australia/Sydney", "AET"]];

export default function Settings({ data }) {
  const { school, say, profile } = useApp();
  const join = useDoc("settings", "join");
  const [s, setS] = useState({ schoolName: school.schoolName, contactEmail: school.contactEmail, venue: school.venue, timeZone: school.timeZone, groups: school.groups.join(", ") });
  const [code, setCode] = useState("");
  useEffect(() => { if (join && join.code) setCode(join.code); }, [join]);
  const isAdmin = profile.role === "admin";
  const open = school.openSignup !== false;
  async function setOpen(v) {
    try { await store.merge("settings", "school", { openSignup: v }); say(v ? "Anyone with the link can join and start straight away." : "Families now need the class code, or your approval."); } catch (e) { say(friendlyError(e), true); }
  }
  const invite = `ನಮಸ್ಕಾರ! Join ${school.schoolName} Kannada with Gini the parrot: ${typeof location !== "undefined" ? location.origin : ""}\nSign in with your Gmail, add your child, and start this week's packet.${!open && code ? `\nClass code: ${code}` : ""}`;

  async function saveSchool() {
    try {
      const tz = ZONES.find((z) => z[0] === s.timeZone) || [s.timeZone, ""];
      await store.merge("settings", "school", { schoolName: s.schoolName.trim() || "Chili Pili", contactEmail: s.contactEmail.trim(), venue: s.venue.trim(), timeZone: tz[0], tzLabel: tz[1], groups: s.groups.split(",").map((g) => g.trim()).filter(Boolean) });
      say("Saved.");
    } catch (e) { say(friendlyError(e), true); }
  }
  async function saveCode() {
    const c = code.trim().toUpperCase().replace(/\s+/g, "");
    if (c && !/^[A-Z0-9-]{4,20}$/.test(c)) return say("Use 4 to 20 letters or numbers.", true);
    try { await store.set("settings", "join", { code: c, at: Date.now() }); setCode(c); say(c ? `Class code is ${c}.` : "Class code turned off. New families wait for your approval."); } catch (e) { say(friendlyError(e), true); }
  }
  async function setRole(u, role) {
    try { await store.update("users", u.id, { role }); say(`${u.name} is now ${role === "parent" ? "a parent" : role === "teacher" ? "a teacher" : "an admin"}.`); } catch (e) { say(friendlyError(e), true); }
  }
  const staff = data.users.filter((u) => u.role !== "parent" || u.email === profile.email);
  const parents = data.users.filter((u) => u.role === "parent");

  return (
    <div className="stack">
      <div className="page-title"><h1>Settings</h1></div>
      <SetupCheck school={school} isAdmin={isAdmin} />
      <div className="card">
        <h3>Who can join</h3>
        <div className="choices">
          <label className="choice"><input type="radio" name="open" checked={open} onChange={() => setOpen(true)} disabled={!isAdmin} /><span>Anyone with the link starts straight away</span></label>
          <label className="choice"><input type="radio" name="open" checked={!open} onChange={() => setOpen(false)} disabled={!isAdmin} /><span>Only with a class code, or my approval</span></label>
        </div>
        <p className="muted small">Either way you get an email for every new family, and each child starts at the level their parent chose.</p>
        {!open && <div className="row"><input className="input" style={{ maxWidth: 240 }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. MKS2026" aria-label="Class code" disabled={!isAdmin} />
          {isAdmin && <Btn kind="primary" icon={Save} onClick={saveCode}>Save code</Btn>}</div>}
        <div className="stack-s">
          <span className="label">Invite for your WhatsApp group</span>
          <p className="small" style={{ background: "var(--paper)", borderRadius: 12, padding: "10px 12px", whiteSpace: "pre-wrap", userSelect: "all" }}>{invite}</p>
          <button className="btn ghost small" style={{ justifySelf: "start" }} onClick={() => { navigator.clipboard?.writeText(invite).then(() => say("Invite copied. Paste it in your WhatsApp group."), () => say("Couldn't copy; select the text instead.", true)); }}><Copy size={16} /> Copy invite</button>
        </div>
      </div>
      <div className="card">
        <h3>Your class</h3>
        <div className="grid2">
          <div className="field"><label>Name on the website</label><input value={s.schoolName} onChange={(e) => setS({ ...s, schoolName: e.target.value })} /></div>
          <div className="field"><label>Contact email (shown on the public page)</label><input type="email" value={s.contactEmail} onChange={(e) => setS({ ...s, contactEmail: e.target.value })} /></div>
          <div className="field"><label>Groups</label><input value={s.groups} onChange={(e) => setS({ ...s, groups: e.target.value })} /><span className="hint">Separate with commas, e.g. Saturday group, Sunday group</span></div>
          <div className="field"><label>Venue for in-person meets</label><input value={s.venue} onChange={(e) => setS({ ...s, venue: e.target.value })} /></div>
          <div className="field"><label>Time zone</label><select value={s.timeZone} onChange={(e) => setS({ ...s, timeZone: e.target.value })}>{ZONES.map(([z, l]) => <option key={z} value={z}>{l} · {z.replace("_", " ")}</option>)}</select></div>
        </div>
        {isAdmin && <Btn kind="primary" icon={Save} onClick={saveSchool}>Save</Btn>}
      </div>
      {isAdmin && (
        <div className="card">
          <h3>Team</h3>
          <p className="muted small">Ask a helper to sign in once, then make them a teacher here.</p>
          <ul className="list">{[...staff, ...parents].map((u) => (
            <li key={u.id}><Avatar name={u.name} size="sm" /><div className="grow"><b>{u.name}</b><div className="sub">{u.email}</div></div>
              {u.email === profile.email ? <span className="pill yellow">You · {u.role}</span> :
                <select className="input" style={{ width: "auto", minHeight: 38, padding: "6px 10px" }} value={u.role} onChange={(e) => setRole(u, e.target.value)} aria-label={`Role for ${u.name}`}><option value="parent">Parent</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select>}
            </li>
          ))}</ul>
        </div>
      )}
      <div className="card">
        <h3>Account</h3>
        <p className="muted small">{profile.name} · {profile.email}</p>
        <div className="row"><button className="btn ghost small" onClick={() => store.signOut()}><LogOut size={18} /> Sign out</button>{store.mode === "device" && <ResetDevice />}</div>
      </div>
    </div>
  );
}

// What's switched on for the live website, with the fix for anything missing.
function SetupCheck({ school, isAdmin }) {
  const { say } = useApp();
  const [st, setSt] = useState(null);
  const [busy, setBusy] = useState(false);
  const cloud = store.mode === "cloud";
  useEffect(() => {
    if (!cloud) return;
    fetch("/api/status").then((r) => (r.ok ? r.json() : null)).then(setSt, () => setSt(null));
  }, [cloud]);
  const rows = [
    ["Google sign-in and cloud saving (Firebase)", cloud, "Add the VITE_FIREBASE_ keys in Vercel, then redeploy (README step 4)."],
    ["Kid numbers on every device", cloud && st && st.serviceAccount, "Add FIREBASE_SERVICE_ACCOUNT in Vercel (README step 4b)."],
    ["Emails to parents: welcome, number, Monday note", cloud && st && st.parentEmail, "Add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel (README: Emails with Gmail)."],
    ["Emails to you: new families, Monday summary", cloud && st && st.teacherEmail && (st.gmail || st.resend), "Add TEACHER_EMAIL and Gmail in Vercel."],
    ["Monday emails run by themselves", cloud && st && st.cron, "Add CRON_SECRET in Vercel."],
    ["Sign in with a code by email", cloud && st && st.serviceAccount && st.parentEmail, "Needs FIREBASE_SERVICE_ACCOUNT and Gmail (see the step-by-step setup)."],
    ["Talk both ways: translation", cloud && st && (st.claude || st.google), "Add ANTHROPIC_API_KEY (best) or GOOGLE_API_KEY in Vercel."],
    ["Talk both ways: Kannada voice and listening on every phone", cloud && st && st.google, "Add GOOGLE_API_KEY with Text-to-Speech and Speech-to-Text turned on (README: voice translator)."],
  ];
  async function test() {
    setBusy(true);
    const r = await notifyServer({ type: "test" });
    say(r && r.sent ? "Test email sent. Check your inbox (and spam, the first time)." : `Not sent: ${(r && (r.skipped || r.error)) || "email isn't set up"}.`, !(r && r.sent));
    setBusy(false);
  }
  async function setFamilies(v) {
    try { await store.merge("settings", "school", { parentEmails: v }); say(v ? "Families get a short note every Monday." : "Monday family notes are off."); } catch (e) { say(friendlyError(e), true); }
  }
  const allOk = rows.every((r) => r[1]);
  return (
    <div className="card">
      <div className="card-head"><h3>Setup check</h3><a className="small" href="#/setup">Full step-by-step setup</a></div>
      {!cloud && <p className="small" style={{ background: "var(--yellow-soft)", padding: "10px 12px", borderRadius: 12, margin: 0 }}>This copy isn't connected to Google (Firebase), so sign-in, kid numbers and emails only work on this device. Open your live website to see its real status.</p>}
      <ul className="setup-list">{rows.map(([label, ok, fix]) => (
        <li key={label} className={ok ? "ok" : "no"}>{ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}<div><b>{label}</b>{!ok && cloud && <div className="small muted">{fix}</div>}</div></li>
      ))}</ul>
      {cloud && <div className="row">
        <button className="btn ghost small" disabled={busy} onClick={test}><Mail size={16} /> Send me a test email</button>
        {!allOk && <span className="tiny muted">After changing Vercel settings, redeploy, then reload this page.</span>}
      </div>}
      {cloud && isAdmin && <label className="choice"><input type="checkbox" checked={school.parentEmails !== false} onChange={(e) => setFamilies(e.target.checked)} /><span>Send each family a short note every Monday (stars, missions, your replies)</span></label>}
    </div>
  );
}

