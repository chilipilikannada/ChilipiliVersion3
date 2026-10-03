import { useMemo, useState } from "react";
import { ArrowLeft, Check, Search, UserPlus } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Avatar, Btn, Empty, Ladder } from "../../components/ui.jsx";
import { Gini, STAGE_EMOJI } from "../../components/Art.jsx";
import { SKILLS, SKILL, STAGES, SELF_CHECK, suggestGoals } from "../../lib/content.js";
import { childWeek, PLAN_WEEKS } from "../../lib/plan.js";
import { fmtDate, isoLocal, ago } from "../../lib/time.js";
import Thread from "../../components/Thread.jsx";
import { Submitted } from "../../components/HandIn.jsx";
import StrokeThumb from "../../components/StrokeThumb.jsx";
import { journeyOf, JOURNEY_DAYS, SECTIONS } from "../../lib/journey.js";
import { friendlyError } from "../../App.jsx";
import { TRACKS, TRACK_KEYS, trackOf, PACES, PACE_KEYS, paceOf, UNDERSTAND, SPEAK, easyOf, LEVELS, levelOf } from "../../lib/course.js";
import LevelPicker from "../../components/LevelPicker.jsx";
import KidCode from "../../components/KidCode.jsx";

export default function Families({ data }) {
  const { route } = useApp();
  const child = data.children.find((c) => c.id === route[1]);
  return child ? <ChildDetail child={child} data={data} /> : <ChildList data={data} />;
}

function ChildList({ data }) {
  const { go, school, say } = useApp();
  const [q, setQ] = useState("");
  const pending = data.children.filter((c) => c.status === "pending");
  const active = data.children.filter((c) => c.status === "active" && c.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  const groups = [...new Set(active.map((c) => c.group || "No group"))];

  return (
    <div className="stack">
      <div className="page-title"><h1>Children</h1><p className="muted">Everyone in your class. Tap a child for their progress, hand-ins and messages.</p></div>
      {pending.length > 0 && (
        <div className="card yellow">
          <h3>Waiting for you</h3>
          {pending.map((c) => <Approve key={c.id} c={c} school={school} say={say} />)}
        </div>
      )}
      <div className="field" style={{ maxWidth: 360 }}><label htmlFor="fs" className="lbl">Find a child</label><div style={{ position: "relative" }}><input id="fs" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 40 }} /><Search size={18} style={{ position: "absolute", left: 13, top: 15, color: "var(--muted)" }} /></div></div>
      {active.length === 0 && <div className="card"><Empty art={<Gini className="gini" />} title="No children yet">Families join with your class code from Settings, or sign up and wait for you here.</Empty></div>}
      {groups.map((g) => (
        <div className="card" key={g}>
          <h3>{g}</h3>
          <ul className="list">
            {active.filter((c) => (c.group || "No group") === g).map((c) => (
              <li key={c.id} style={{ cursor: "pointer" }} onClick={() => go("families", c.id)}>
                <Avatar name={c.name} />
                <div className="grow"><b>{c.name}</b><div className="sub">{c.adult ? <span className="pill blue">Grown-up</span> : `Age ${c.age}`} · week {Math.max(1, childWeek(c))} of {PLAN_WEEKS} · ⭐ {c.stars || 0}{c.lastActive ? ` · active ${ago(c.lastActive)}` : ""}</div></div>
                <span style={{ fontSize: 20 }} title="Speaking, reading, writing">{SKILLS.map((k) => STAGE_EMOJI[(c.stages || {})[k] || 0]).join("")}</span>
                {!c.stagesConfirmed && <span className="pill yellow hide-s">Estimate</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Approve({ c, school, say }) {
  const [group, setGroup] = useState(c.group || school.groups[0] || "");
  const [start, setStart] = useState(isoLocal());
  return (
    <div className="stack-s" style={{ background: "#fff", borderRadius: 14, padding: 12 }}>
      <div className="row"><Avatar name={c.name} /><div className="grow" style={{ flex: 1 }}><b>{c.name}</b><div className="sub small muted">{c.adult ? "Grown-up learner" : `Age ${c.age}`} · {c.parentEmails.join(", ")} · signed up {fmtDate(c.createdAt)}</div></div></div>
      <div className="small muted">Family says: {SKILLS.map((k) => `${SKILL[k].en.toLowerCase()} ${(SELF_CHECK[k].find((x) => x[0] === (c.intake?.est?.[k] ?? -1)) || [0, "?"])[1].toLowerCase()}`).join(" · ")}</div>
      <div className="grid2">
        <div className="field"><label>Group</label><select value={group} onChange={(e) => setGroup(e.target.value)}>{[...new Set([...school.groups, c.group].filter(Boolean))].map((g) => <option key={g}>{g}</option>)}</select></div>
        <div className="field"><label>Week 1 starts</label><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
      </div>
      <Btn kind="primary" icon={Check} onClick={async () => { try { await store.update("children", c.id, { status: "active", group, startDate: start, approvedAt: Date.now() }); say(`${firstName(c.name)} is in. Their family can start week 1.`); } catch (e) { say(friendlyError(e), true); } }}>Approve</Btn>
    </div>
  );
}

function ChildDetail({ child, data }) {
  const { go, school, say, profile } = useApp();
  const nm = firstName(child.name);
  const [stages, setStages] = useState({ ...child.stages });
  const [goals, setGoals] = useState({ ...child.goals });
  const [group, setGroup] = useState(child.group || "");
  const [newParent, setNewParent] = useState("");
  const subs = data.subs.filter((s) => s.childId === child.id).sort((a, b) => b.at - a.at);
  const acts = data.activity.filter((a) => a.childId === child.id).sort((a, b) => b.at - a.at);
  const parents = child.parentEmails.map((e) => ({ e, u: data.users.find((u) => u.email === e) }));
  const w = Math.max(1, childWeek(child));

  async function saveStages() {
    try {
      await store.update("children", child.id, { stages, goals, stagesConfirmed: true });
      await store.add("stageLogs", { childId: child.id, parentEmails: child.parentEmails, stages, source: "teacher", byName: profile.name, at: Date.now() });
      say("Stages saved. Packets follow the new stages from this week.");
    } catch (e) { say(friendlyError(e), true); }
  }
  async function addParent() {
    const e = newParent.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return say("That doesn't look like an email.", true);
    try { await store.update("children", child.id, { parentEmails: [...new Set([...child.parentEmails, e])] }); setNewParent(""); say("Added. They can sign in with that Google account now."); } catch (err) { say(friendlyError(err), true); }
  }

  return (
    <div className="stack">
      <button className="btn quiet" style={{ justifySelf: "start" }} onClick={() => go("families")}><ArrowLeft size={18} /> Children</button>
      <div className="card">
        <div className="row"><Avatar name={child.name} size="lg" /><div className="grow" style={{ flex: 1 }}><h1 style={{ fontSize: 30 }}>{child.name}</h1><p className="muted">{child.adult ? `Grown-up learner · ${Object.keys(child.adultDone || {}).length} lessons done` : `Age ${child.age}`} · {child.group} · week {w} of {PLAN_WEEKS}{child.startDate ? ` · started ${fmtDate(child.startDate)}` : ""}</p></div></div>
        <div className="stat-row"><span className="stat">⭐ {child.stars || 0}</span><span className="stat">🔥 {(child.streak && child.streak.count) || 0} days</span><span className="stat">{acts.length} activities</span><span className="stat">{subs.filter((s) => s.kind === "packet").length} hand-ins</span></div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Stages and goals</h3>{!child.stagesConfirmed && <span className="pill yellow">From the family's estimate</span>}</div>
        <Ladder now={stages} goal={goals} />
        <div className="grid3">
          {SKILLS.map((k) => (
            <div className="stack-s" key={k}>
              <b>{SKILL[k].en}</b>
              <div className="field"><label className="tiny">Now</label><select value={stages[k]} onChange={(e) => setStages({ ...stages, [k]: +e.target.value })}>{STAGES.map((s, L) => <option key={L} value={L}>{STAGE_EMOJI[L]} {s.en} · {s.what}</option>)}</select></div>
              <div className="field"><label className="tiny">6-month goal</label><select value={goals[k]} onChange={(e) => setGoals({ ...goals, [k]: +e.target.value })}>{STAGES.map((s, L) => <option key={L} value={L}>{STAGE_EMOJI[L]} {s.en}</option>)}</select></div>
            </div>
          ))}
        </div>
        <div className="row"><Btn kind="primary" onClick={saveStages}>Save stages</Btn><button className="btn quiet small" onClick={() => setGoals(suggestGoals(stages, child.intake))}>Suggest goals</button></div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Level</h3><span className="small muted">{child.levelBy === "family" && child.levelAt ? `Changed by the family ${fmtDate(child.levelAt)}` : "Families can change this too"}</span></div>
        <LevelPicker child={child} />
        <details><summary className="small" style={{ cursor: "pointer", fontWeight: 800 }}>Fine-tune path, letter pace and tracing</summary><div className="stack-s" style={{ marginTop: 8 }}>
        <div className="card-head"><h3>Path and letter pace</h3><span className="small muted">Changes this week's packet and Gini's activities.</span></div>
        {child.intake && child.intake.speak && <p className="small" style={{ margin: 0 }}><b>Family said:</b> understands {(UNDERSTAND.find((x) => x[0] === child.intake.understand) || [0, "-"])[1].toLowerCase()}; replies {(SPEAK.find((x) => x[0] === child.intake.speak) || [0, "-"])[1].toLowerCase()}; Kannada at home {child.intake.homeKannada === "daily" ? "every day" : child.intake.homeKannada === "never" ? "rarely" : "sometimes"}.</p>}
        <span className="label">Sentences</span>
        <div className="choices">
          {TRACK_KEYS.map((k) => <label className="choice" key={k}><input type="radio" name={`tr${child.id}`} checked={trackOf(child) === k} onChange={async () => { try { await store.update("children", child.id, { track: k, level: null }); say(`${nm} is now on ${TRACKS[k].en}.`); } catch (e) { say(friendlyError(e), true); } }} /><span>{TRACKS[k].icon} {TRACKS[k].en}</span></label>)}
        </div>
        <p className="small muted" style={{ margin: 0 }}>{TRACKS[trackOf(child)].who}. {TRACKS[trackOf(child)].detail}</p>
        <span className="label">Letter journey</span>
        {(() => { const j = journeyOf(child); return (
          <div className="row small">
            <span className="pill green">Day {j.day} of {JOURNEY_DAYS} · {j.section.en}</span>
            <span className="muted">{Object.keys(j.done).length} days done{(j.skipped || []).length ? ` · jumped past ${(j.skipped || []).join(", ")} by quick check` : ""}</span>
            <select className="input" style={{ width: "auto" }} aria-label="Move to section" value="" onChange={async (e) => { const d = +e.target.value; if (!d) return; try { await store.update("children", child.id, { journey: { ...j, day: d, done: j.done, skipped: j.skipped } }); say(`${nm} now starts at day ${d}.`); } catch (err) { say(friendlyError(err), true); } }}>
              <option value="">Move to…</option>{SECTIONS.map((sec) => <option key={sec.id} value={sec.from}>{sec.en} (day {sec.from})</option>)}
            </select>
          </div>
        ); })()}
        <span className="label">Letters in the weekly packet</span>
        <div className="choices">
          {PACE_KEYS.map((k) => <label className="choice" key={k}><input type="radio" name={`pc${child.id}`} checked={paceOf(child) === k} onChange={async () => { try { await store.update("children", child.id, { pace: k, level: null }); say(`${nm}'s letters are now at a ${PACES[k].en.toLowerCase()} pace.`); } catch (e) { say(friendlyError(e), true); } }} /><span>{PACES[k].en}</span></label>)}
        </div>
        <p className="small muted" style={{ margin: 0 }}>{PACES[paceOf(child)].detail}.</p>
        <label className="check"><input type="checkbox" checked={easyOf(child)} onChange={async (e) => { try { await store.update("children", child.id, { easyTrace: e.target.checked }); say(e.target.checked ? "Easy dot-to-dot tracing is on." : "Easy tracing is off."); } catch (err) { say(friendlyError(err), true); } }} /><span><b>Easy dot-to-dot tracing</b>: letters shown as dots that light up, gentler checks, and dotted letters in the PDF.</span></label>
        </div></details>
        {child.letters && Object.keys(child.letters).length > 0 && <p className="small" style={{ margin: 0 }}><b>Letters written well:</b> <span className="kn">{Object.entries(child.letters).filter(([, v]) => v >= 2).map(([k]) => k).join(" ") || "none yet"}</span></p>}
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Family</h3>
          {child.adult ? <p className="small muted" style={{ margin: 0 }}>Grown-ups sign in with Google.</p> : <KidCode child={child} />}
          <ul className="list">{parents.map(({ e, u }) => <li key={e}><Avatar name={u ? u.name : e} size="sm" /><div className="grow"><b>{u ? u.name : e}</b><div className="sub">{e}{u && u.phone ? ` · ${u.phone}` : ""}</div></div></li>)}</ul>
          <div className="row"><input className="input" style={{ flex: 1, minWidth: 0 }} placeholder="Add a parent's Gmail" value={newParent} onChange={(e) => setNewParent(e.target.value)} aria-label="Parent email" /><Btn kind="ghost" icon={UserPlus} onClick={addParent}>Add</Btn></div>
          <div className="field"><label>Group</label><div className="row"><select className="input" style={{ flex: 1 }} value={group} onChange={(e) => setGroup(e.target.value)}>{[...new Set([...school.groups, child.group].filter(Boolean))].map((g) => <option key={g}>{g}</option>)}</select><Btn kind="ghost" onClick={async () => { await store.update("children", child.id, { group }); say("Group changed."); }}>Save</Btn></div></div>
        </div>
        <div className="card">
          <h3>Recent activity with Gini</h3>
          {acts.length ? <ul className="list">{acts.slice(0, 8).map((a) => <li key={a.id}><span className="pill yellow">{a.kind === "day" ? "mission" : a.kind}{a.item ? ` ${a.item}` : ""}</span><div className="grow sub">week {a.week} · {"⭐".repeat(a.stars || 0)}</div><span className="tiny muted">{ago(a.at)}</span></li>)}</ul> : <p className="muted">Nothing yet.</p>}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Handwriting</h3><span className="small muted">Letters {nm} wrote alone on screen, newest first</span></div>
        {acts.filter((a) => a.strokes).length ? (
          <div className="hw-grid">{acts.filter((a) => a.strokes).slice(0, 24).map((a) => (
            <figure key={a.id} className="hw-cell"><StrokeThumb strokes={a.strokes} aspect={a.aspect || 1} size={a.kind === "write" ? 72 : a.kind === "storywrite" || a.kind === "family" ? 200 : 90} /><figcaption>{a.kind === "write" ? <><span className="kn">{a.item}</span> {"⭐".repeat(a.stars || 0)}{a.memory ? " · from memory" : ""}</> : a.kind === "dictation" ? <>Dictation {a.ok ? "✓" : "(nearly)"}: <span className="kn">{String(a.item || "").slice(0, 30)}</span></> : a.kind === "family" ? <>For family: <span className="kn">{String(a.item || "").slice(0, 30)}</span></> : "Own story"}</figcaption></figure>
          ))}</div>
        ) : <p className="muted small">Nothing yet. Letters appear here as {nm} writes them in Gini's space.</p>}
      </div>

      <div className="card">
        <h3>Hand-ins and recordings</h3>
        {subs.length ? subs.slice(0, 6).map((s) => <div key={s.id} className="stack-s"><b className="small">{s.kind === "speaking" ? "Speaking" : s.kind === "talk" ? "Talk with Gini" : "Pages"} · week {s.week}</b><Submitted s={s} /></div>) : <p className="muted">No hand-ins yet.</p>}
      </div>

      <div className="card"><h3>Messages with {nm}'s family</h3><Thread child={child} messages={data.messages} emptyText={`No messages yet. Say hello to ${nm}'s family.`} /></div>

      {profile.role === "admin" && (
        <div className="card">
          <h3>Remove {nm}</h3>
          <p className="small muted">For a test sign-up or a family that has left. {nm} disappears from the class, the summary and the family's app. Their hand-ins and messages stay stored until you delete them in Firebase.</p>
          <button className="btn ghost small" style={{ justifySelf: "start", color: "var(--red)" }} onClick={async () => {
            if (!window.confirm(`Remove ${child.name} from the class? This can't be undone.`)) return;
            try { await store.remove("children", child.id); say(`${nm} was removed.`); go("families"); } catch (e) { say(friendlyError(e), true); }
          }}>Remove from class</button>
        </div>
      )}
    </div>
  );
}
