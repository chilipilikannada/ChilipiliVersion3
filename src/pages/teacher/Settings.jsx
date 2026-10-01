import { useEffect, useState } from "react";
import { LogOut, Save, Copy } from "lucide-react";
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
          <div className="field"><label>School name</label><input value={s.schoolName} onChange={(e) => setS({ ...s, schoolName: e.target.value })} /></div>
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
