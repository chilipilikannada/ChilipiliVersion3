import { useState } from "react";
import { ArrowLeft, CalendarPlus, MapPin, Video, X } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Avatar, Btn, Empty } from "../../components/ui.jsx";
import { Gini, STAGE_EMOJI } from "../../components/Art.jsx";
import { meetState, GOING } from "../parent/Meets.jsx";
import { SKILLS, SKILL, STAGES } from "../../lib/content.js";
import { weekStart, monthOfWeek, PLAN_WEEKS } from "../../lib/plan.js";
import { fmtWhen, zoneMs, zoneParts, isoLocal, DAY } from "../../lib/time.js";
import { friendlyError } from "../../App.jsx";

const rid = () => Math.random().toString(36).slice(2, 12);

export default function Meets({ data }) {
  const { route } = useApp();
  const m = data.meets.find((x) => x.id === route[1]);
  return m ? <WriteUp meet={m} data={data} /> : <MeetList data={data} />;
}

function MeetList({ data }) {
  const { school, say, go, profile } = useApp();
  const [f, setF] = useState({ group: school.groups[0] || "", date: isoLocal(Date.now() + 7 * DAY), time: "10:00", duration: 60, mode: "in-person", where: "", repeat: 6, notes: "" });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const live = data.meets.filter((x) => x.status !== "cancelled");
  const upcoming = live.filter((x) => meetState(x) !== "ended").sort((a, b) => a.startAt - b.startAt);
  const past = live.filter((x) => meetState(x) === "ended").sort((a, b) => b.startAt - a.startAt).slice(0, 12);

  async function schedule() {
    try {
      const online = f.mode === "online";
      if (online && f.where && !/^https:\/\//.test(f.where)) return say("Online links must start with https://", true);
      const [y, mo, d] = f.date.split("-").map(Number);
      const url = online ? (f.where || `https://meet.jit.si/ChiliPili-${f.group.replace(/[^A-Za-z0-9]/g, "")}-${rid()}`) : "";
      for (let i = 0; i < +f.repeat; i++) {
        const date = new Date(Date.UTC(y, mo - 1, d + i * 28)).toISOString().slice(0, 10);
        const startAt = zoneMs(date, f.time, school.timeZone);
        await store.add("meets", { title: "Month-end meet", group: f.group, startAt, date, time: f.time, duration: +f.duration, mode: online ? "online" : "in-person", url, location: online ? "" : f.where || school.venue || "", notes: f.notes.trim(), status: "scheduled", by: profile.uid, at: Date.now() });
      }
      say(+f.repeat > 1 ? `${f.repeat} meets scheduled, every 4 weeks.` : "Meet scheduled.");
    } catch (e) { say(friendlyError(e), true); }
  }

  return (
    <div className="stack">
      <div className="page-title"><h1>Month-end meets <span className="kn" style={{ fontWeight: 500 }}>ಕೂಟ</span></h1><p className="muted">One meet per group in week 4 of each month. Afterwards, write it up on one screen.</p></div>
      {past.filter((x) => !x.writtenUp).map((x) => (
        <div className="card yellow" key={x.id}>
          <div className="card-head"><div><span className="label">Ready to write up</span><h3>{x.group} · {fmtWhen(x.startAt, school.timeZone, school.tzLabel)}</h3></div><Btn kind="primary" onClick={() => go("meets", x.id)}>Write up</Btn></div>
        </div>
      ))}
      <div className="card">
        <h3>Upcoming</h3>
        {upcoming.length ? <ul className="list">{upcoming.map((x) => <MeetRow key={x.id} x={x} school={school} say={say} />)}</ul> : <Empty art={<Gini className="gini" />} title="Nothing scheduled">Schedule all six month-end meets at once below.</Empty>}
      </div>
      <div className="card">
        <h3>Schedule meets</h3>
        <div className="grid2">
          <div className="field"><label>Group</label><select value={f.group} onChange={(e) => set("group", e.target.value)}>{[...school.groups, "All groups"].map((g) => <option key={g}>{g}</option>)}</select></div>
          <div className="field"><label>First meet</label><input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
          <div className="field"><label>Start time ({school.tzLabel})</label><input type="time" value={f.time} onChange={(e) => set("time", e.target.value)} /></div>
          <div className="field"><label>Length</label><select value={f.duration} onChange={(e) => set("duration", e.target.value)}>{[45, 60, 90, 120].map((v) => <option key={v} value={v}>{v} minutes</option>)}</select></div>
          <div className="field"><span className="lbl">Where</span><div className="choices">{[["in-person", "In person"], ["online", "Online"]].map(([v, l]) => <label className="choice" key={v}><input type="radio" name="mode" checked={f.mode === v} onChange={() => set("mode", v)} /><span>{l}</span></label>)}</div></div>
          <div className="field"><label>{f.mode === "online" ? "Meeting link (blank = free video room)" : "Address"}</label><input value={f.where} onChange={(e) => set("where", e.target.value)} placeholder={f.mode === "online" ? "https://" : school.venue || "Venue address"} /></div>
          <div className="field"><label>Repeat every 4 weeks</label><select value={f.repeat} onChange={(e) => set("repeat", e.target.value)}>{[1, 3, 6].map((v) => <option key={v} value={v}>{v === 1 ? "Just this one" : `${v} meets`}</option>)}</select></div>
          <div className="field"><label>Note for families</label><input value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Bring this month's packets" /></div>
        </div>
        <Btn kind="primary" icon={CalendarPlus} onClick={schedule}>Schedule</Btn>
      </div>
      {past.length > 0 && (
        <div className="card">
          <h3>Past meets</h3>
          <ul className="list">{past.map((x) => <li key={x.id}><div className="grow"><b>{x.group}</b><div className="sub">{fmtWhen(x.startAt, school.timeZone, school.tzLabel)}</div></div>{x.writtenUp ? <button className="btn ghost small" onClick={() => go("meets", x.id)}>Edit notes</button> : <button className="btn primary small" onClick={() => go("meets", x.id)}>Write up</button>}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function MeetRow({ x, school, say }) {
  const [armed, setArmed] = useState(false);
  const st = meetState(x);
  return (
    <li>
      <span style={{ width: 44, height: 44, borderRadius: 12, background: "var(--yellow-soft)", color: "var(--red)", display: "grid", placeItems: "center", flex: "none" }}>{x.mode === "online" ? <Video /> : <MapPin />}</span>
      <div className="grow"><b>{fmtWhen(x.startAt, school.timeZone, school.tzLabel)}</b><div className="sub">{x.group} · {x.mode === "online" ? "online" : x.location || "in person"} · {x.duration} min</div></div>
      {x.mode === "online" && st === "open" && <a className="btn primary small" href={x.url} target="_blank" rel="noopener">Start</a>}
      <button className="btn quiet small" onClick={async () => { if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 4000); return; } await store.update("meets", x.id, { status: "cancelled" }); say("Meet cancelled."); }}><X size={16} /> {armed ? "Tap to confirm" : "Cancel"}</button>
    </li>
  );
}

function WriteUp({ meet, data }) {
  const { school, go, say, profile } = useApp();
  const kids = data.children.filter((c) => c.status === "active" && (meet.group === "All groups" || c.group === meet.group)).sort((a, b) => a.name.localeCompare(b.name));
  const monthFor = (c) => monthOfWeek(Math.max(1, Math.floor((meet.startAt - weekStart(c, 1)) / (7 * DAY)) + 1));
  const [rows, setRows] = useState(() => Object.fromEntries(kids.map((c) => {
    const n = data.notes.find((x) => x.childId === c.id && x.month === monthFor(c));
    return [c.id, { came: n ? n.attended !== false : true, stages: { ...c.stages }, note: n?.teacherNote || "", focus: n?.focus || "" }];
  })));
  const upd = (id, k, v) => setRows((r) => ({ ...r, [id]: { ...r[id], [k]: v } }));

  async function save() {
    try {
      let n = 0;
      for (const c of kids) {
        const r = rows[c.id]; const m = monthFor(c);
        await store.merge("meetNotes", `${c.id}_m${m}`, { childId: c.id, parentEmails: c.parentEmails, month: m, meetId: meet.id, meetAt: meet.startAt, attended: r.came, teacherNote: r.note.trim(), focus: r.focus.trim(), by: profile.name, at: Date.now() });
        if (r.came) {
          const changed = SKILLS.some((k) => r.stages[k] !== (c.stages || {})[k]);
          await store.update("children", c.id, { stages: r.stages, stagesConfirmed: true });
          if (changed || !c.stagesConfirmed) await store.add("stageLogs", { childId: c.id, parentEmails: c.parentEmails, stages: r.stages, source: "meet", byName: profile.name, at: meet.startAt + 3600e3 });
          n++;
        }
      }
      await store.update("meets", meet.id, { writtenUp: true });
      say(`Saved for ${n} ${n === 1 ? "child" : "children"}. Families can read your notes, and next month's packets follow the new stages.`);
      go("meets");
    } catch (e) { say(friendlyError(e), true); }
  }

  return (
    <div className="stack">
      <button className="btn quiet" style={{ justifySelf: "start" }} onClick={() => go("meets")}><ArrowLeft size={18} /> Meets</button>
      <div className="page-title"><h1>Write up the meet</h1><p className="muted">{meet.group} · {fmtWhen(meet.startAt, school.timeZone, school.tzLabel)}. Only “came” is needed; the rest is optional.</p></div>
      {kids.length === 0 && <div className="card"><p className="muted">No children in this group yet.</p></div>}
      {kids.map((c) => {
        const r = rows[c.id]; const n = data.notes.find((x) => x.childId === c.id && x.month === monthFor(c));
        return (
          <div className="card" key={c.id}>
            <div className="row"><Avatar name={c.name} /><b style={{ flex: 1 }}>{c.name}</b><label className="check"><input type="checkbox" checked={r.came} onChange={(e) => upd(c.id, "came", e.target.checked)} /><span>Came</span></label></div>
            {n && n.parentNote && <p className="small" style={{ background: "var(--yellow-soft)", borderRadius: 12, padding: "8px 10px" }}><b>Family:</b> {GOING[n.parentNote.going]}{n.parentNote.text ? ` · “${n.parentNote.text}”` : ""}</p>}
            {r.came && <div className="grid3">{SKILLS.map((k) => (
              <div className="field" key={k}><label className="tiny">{SKILL[k].en}</label><select value={r.stages[k]} onChange={(e) => upd(c.id, "stages", { ...r.stages, [k]: +e.target.value })}>{STAGES.map((s, L) => <option key={L} value={L}>{STAGE_EMOJI[L]} {s.en}</option>)}</select></div>
            ))}</div>}
            <div className="grid2">
              <div className="field"><label className="tiny">What they showed (family sees this)</label><input value={r.note} onChange={(e) => upd(c.id, "note", e.target.value)} maxLength={400} /></div>
              <div className="field"><label className="tiny">Focus for next month</label><input value={r.focus} onChange={(e) => upd(c.id, "focus", e.target.value)} maxLength={200} /></div>
            </div>
          </div>
        );
      })}
      {kids.length > 0 && <Btn kind="primary" onClick={save}>Save for all {kids.length}</Btn>}
    </div>
  );
}
