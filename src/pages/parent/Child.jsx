import { useState } from "react";
import { LogOut, UserPlus, Trash2 } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Avatar, Ladder, Btn, StageChip } from "../../components/ui.jsx";
import { SKILLS, SKILL, STAGES } from "../../lib/content.js";
import { childWeek, PLAN_WEEKS, weekStart } from "../../lib/plan.js";
import { fmtDate, DAY } from "../../lib/time.js";
import { STAGE_EMOJI } from "../../components/Art.jsx";
import { friendlyError } from "../../App.jsx";
import { easyOf, TRACKS, trackOf } from "../../lib/course.js";
import LevelPicker from "../../components/LevelPicker.jsx";
import KidCode from "../../components/KidCode.jsx";
import StrokeThumb from "../../components/StrokeThumb.jsx";
import { isAdult, UNITS, doneUnits } from "../../lib/adult.js";

export default function ChildPage({ fam }) {
  const { child, logs, activity, subs } = fam;
  const { go, profile, say } = useApp();
  const adult = isAdult(child);
  const nm = adult ? "you" : firstName(child.name);
  const Nm = adult ? "Your" : `${firstName(child.name)}'s`;
  const hist = logs.filter((l) => l.childId === child.id).sort((a, b) => b.at - a.at);
  const acts = activity.filter((a) => a.childId === child.id);
  const handins = subs.filter((s) => s.childId === child.id && s.kind === "packet").length;
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(String(child.age || ""));

  async function save() {
    try { await store.update("children", child.id, adult ? { name: name.trim() || child.name } : { name: name.trim() || child.name, age: +age || child.age }); say("Saved."); } catch (e) { say(friendlyError(e), true); }
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="row"><Avatar name={child.name} size="lg" /><div><h1 style={{ fontSize: 30 }}>{child.name}</h1><p className="muted">{adult ? "Grown-up lessons" : `Age ${child.age}`} · {child.group}{child.startDate ? ` · started ${fmtDate(child.startDate)}` : ""}</p></div></div>
        {child.status === "active" && <div className="stat-row">
          <span className="stat">Week {Math.max(1, childWeek(child))} of {PLAN_WEEKS}</span>
          <span className="stat">⭐ {child.stars || 0} stars</span>
          <span className="stat">{acts.length} activities</span>
          {adult ? <span className="stat">{UNITS.filter((u) => doneUnits(child)[u.id]).length} of {UNITS.length} lessons</span> : <span className="stat">{handins} packets handed in</span>}
        </div>}
      </div>
      {!adult && <div className="card">
        <h3>Where {nm} is, and the 6-month goal</h3>
        <Ladder now={child.stages} goal={child.goals} />
        <p className="tiny muted">{child.stagesConfirmed ? "Confirmed by the teacher." : "From your answers at sign-up. The teacher confirms at the first month-end meet."} Each bird is a stage: {STAGES.map((s, i) => `${STAGE_EMOJI[i]} ${s.en}`).join(", ")}.</p>
      </div>}
      {hist.length > 0 && (
        <div className="card">
          <h3>Along the way</h3>
          <ul className="list">{hist.map((l) => (
            <li key={l.id}><div className="grow"><b>{fmtDate(l.at)}</b> <span className="sub">· {l.source === "meet" ? "month-end meet" : "teacher update"}</span>
              <div className="row small" style={{ marginTop: 4 }}>{SKILLS.map((k) => <span key={k}>{SKILL[k].en}: {STAGE_EMOJI[l.stages[k]]} {STAGES[l.stages[k]].en}</span>)}</div></div></li>
          ))}</ul>
        </div>
      )}
      <div className="card">
        <h3>Details</h3>
        <div className="grid2">
          <div className="field"><label htmlFor="pn">Name</label><input id="pn" value={name} onChange={(e) => setName(e.target.value)} /></div>
          {!adult && <div className="field"><label htmlFor="pa">Age</label><input id="pa" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} /></div>}
        </div>
        <Btn kind="ghost" onClick={save}>Save</Btn>
        {!adult && <label className="check"><input type="checkbox" checked={easyOf(child)} onChange={async (e) => { try { await store.update("children", child.id, { easyTrace: e.target.checked }); say(e.target.checked ? "Easy dot-to-dot tracing is on." : "Easy tracing is off."); } catch (err) { say(friendlyError(err), true); } }} /><span><b>Easy dot-to-dot tracing</b>: good for beginners and young children. Letters show as dots to follow, on screen and in the PDF.</span></label>}
      </div>
      {!adult && <div className="card">
        <div className="card-head"><h3>{Nm} sign-in number</h3><span className="small muted">For any phone, iPad or computer</span></div>
        <KidCode child={child} />
      </div>}
      <div className="card" id="level">
        <div className="card-head"><h3>{Nm} level</h3><span className="small muted">Move up to explore harder work</span></div>
        <LevelPicker child={child} />
      </div>
      {(fam.activity || []).some((a) => a.childId === child.id && a.kind === "write" && a.strokes) && (
        <div className="card">
          <h3>{Nm} handwriting</h3>
          <div className="hw-grid">{fam.activity.filter((a) => a.childId === child.id && a.kind === "write" && a.strokes).sort((a, b) => b.at - a.at).slice(0, 18).map((a) => (
            <figure key={a.id} className="hw-cell"><StrokeThumb strokes={a.strokes} aspect={a.aspect || 1} size={64} /><figcaption><span className="kn">{a.item}</span> {"⭐".repeat(a.stars || 0)}</figcaption></figure>
          ))}</div>
        </div>
      )}
      <div className="card">
        <h3>Your account</h3>
        <p className="muted small">{profile.name} · {profile.email}</p>
        <div className="row">
          <button className="btn ghost small" onClick={() => go("add")}><UserPlus size={18} /> Add a learner</button>
          <button className="btn ghost small" onClick={() => store.signOut()}><LogOut size={18} /> Sign out</button>
          {store.mode === "device" && <ResetDevice />}
        </div>
      </div>
    </div>
  );
}

export function ResetDevice() {
  const [armed, setArmed] = useState(false);
  return <button className="btn quiet small" onClick={() => (armed ? store.reset() : setArmed(true))}><Trash2 size={16} /> {armed ? "Tap again to erase everything on this device" : "Start over on this device"}</button>;
}
