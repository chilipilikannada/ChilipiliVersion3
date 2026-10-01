import { useState } from "react";
import { CalendarPlus, MapPin, Video, Clock, Send } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Btn, Empty } from "../../components/ui.jsx";
import { Gini } from "../../components/Art.jsx";
import { childMonth } from "../../lib/plan.js";
import { fmtWhen, fmtDate } from "../../lib/time.js";
import { calendarICS, saveFile } from "../../lib/files.js";
import { friendlyError } from "../../App.jsx";

export const meetState = (x) => { const t = Date.now(), s = x.startAt, e = s + (x.duration || 60) * 60e3; return t >= s - 15 * 60e3 && t <= e ? "open" : t < s ? "soon" : "ended"; };
export const meetsFor = (meets, group) => meets.filter((x) => x.status !== "cancelled" && (x.group === group || x.group === "All groups")).sort((a, b) => a.startAt - b.startAt);
export const nextMeet = (meets, group) => meetsFor(meets, group).find((x) => meetState(x) !== "ended") || null;
export const meetWhere = (x, school) => (x.mode === "online" ? "Online video meet" : x.location || school.venue || "In person");
export const GOING = { easy: "Going well", ok: "Mostly fine", hard: "Finding it hard" };

export default function Meets({ fam }) {
  const { child, meets, notes } = fam;
  const { school, say, profile } = useApp();
  const nm = firstName(child.name);
  const list = meetsFor(meets, child.group);
  const next = list.find((x) => meetState(x) !== "ended");
  const m = childMonth(child);
  const mine = notes.filter((n) => n.childId === child.id);
  const cur = mine.find((n) => n.month === m);
  const past = mine.filter((n) => n.teacherNote || n.focus).sort((a, b) => b.month - a.month);
  const [going, setGoing] = useState(cur?.parentNote?.going || "ok");
  const [text, setText] = useState(cur?.parentNote?.text || "");

  async function saveNote() {
    const id = `${child.id}_m${m}`;
    const parentNote = { going, text: text.trim(), at: Date.now(), by: profile.name };
    try {
      if (cur) await store.update("meetNotes", id, { parentNote });
      else await store.set("meetNotes", id, { childId: child.id, parentEmails: child.parentEmails, month: m, parentNote, at: Date.now() });
      say("Sent. Your teacher will read it before the meet.");
    } catch (e) { say(friendlyError(e), true); }
  }
  async function calendar() {
    const ev = list.filter((x) => meetState(x) !== "ended").map((x) => ({ uid: x.id, start: x.startAt, minutes: x.duration || 60, title: `${nm}'s Kannada meet`, desc: x.mode === "online" ? `Join: ${x.url}` : "Bring this month's packets.", where: x.mode === "online" ? x.url : meetWhere(x, school) }));
    if (!ev.length) return say("No upcoming meets yet.");
    const r = await saveFile("chilipili-meets.ics", calendarICS(ev), "text/calendar");
    say(r === "saved" ? "Open the file to add the meets to your calendar, with a reminder an hour before." : "This preview can't save calendar files. It works on the live site.", r !== "saved");
  }

  return (
    <div className="stack">
      <div className="page-title"><h1>Month-end meets <span className="kn" style={{ fontWeight: 500 }}>ಕೂಟ</span></h1><p className="muted">Three weeks at home, then {nm} meets the teacher and the other children in week 4.</p></div>
      {next ? (
        <div className="child-hero" style={{ background: "var(--red)", color: "#fff" }}>
          <span className="label" style={{ color: "var(--yellow)" }}>{meetState(next) === "open" ? "Happening now" : "Next meet"}</span>
          <h2 style={{ fontSize: 30 }}>{fmtWhen(next.startAt, school.timeZone, school.tzLabel)}</h2>
          <p className="row">{next.mode === "online" ? <Video size={18} /> : <MapPin size={18} />} {meetWhere(next, school)} · <Clock size={18} /> {next.duration || 60} min</p>
          {next.notes && <p>{next.notes}</p>}
          <div className="row">
            {next.mode === "online" && meetState(next) === "open" && <a className="btn yellow" href={next.url} target="_blank" rel="noopener">Join the meet</a>}
            {next.mode === "online" && meetState(next) === "soon" && <span className="small">The join button appears 15 minutes before.</span>}
            <button className="btn ghost small" onClick={calendar}><CalendarPlus size={18} /> Add to my calendar</button>
          </div>
        </div>
      ) : (
        <div className="card"><Empty art={<Gini className="gini" />} title="No meet scheduled yet">The teacher will post the date here.</Empty></div>
      )}

      <div className="card">
        <h3>Before the meet</h3>
        <p className="muted small">Anything the teacher should know about month {m}? It's optional.</p>
        <div className="field"><span className="lbl">How is Kannada going at home?</span>
          <div className="choices">{Object.entries(GOING).map(([k, l]) => <label className="choice" key={k}><input type="radio" name="going" checked={going === k} onChange={() => setGoing(k)} /><span>{l}</span></label>)}</div>
        </div>
        <div className="field"><label htmlFor="mn">What {nm} enjoys, or questions for the teacher</label><textarea id="mn" value={text} onChange={(e) => setText(e.target.value)} maxLength={600} /></div>
        <Btn kind="primary" icon={Send} onClick={saveNote}>{cur?.parentNote ? "Update note" : "Send to teacher"}</Btn>
      </div>

      <div className="card">
        <h3>After each meet</h3>
        {past.length ? (
          <ul className="list">{past.map((n) => (
            <li key={n.id} style={{ alignItems: "flex-start" }}>
              <div className="grow stack-s">
                <b>Month {n.month}{n.meetAt ? ` · ${fmtDate(n.meetAt)}` : ""}</b>
                {n.teacherNote && <p>{n.teacherNote}</p>}
                {n.focus && <p style={{ background: "var(--yellow-soft)", borderRadius: 12, padding: "8px 10px" }}><b>Focus for next month:</b> {n.focus}</p>}
              </div>
            </li>
          ))}</ul>
        ) : <p className="muted">The teacher's notes from each meet appear here.</p>}
      </div>
    </div>
  );
}
