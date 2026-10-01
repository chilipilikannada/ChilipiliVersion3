import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Gini, Skyline } from "../../components/Art.jsx";
import { Btn } from "../../components/ui.jsx";
import { useApp, firstName } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { SELF_CHECK, SKILLS, SKILL, suggestGoals } from "../../lib/content.js";
import { isoLocal } from "../../lib/time.js";
import { friendlyError } from "../../App.jsx";
import { notifyServer } from "../../lib/config.js";
import { TRACKS, TRACK_KEYS, PACES, UNDERSTAND, SPEAK, placement, speakingStage } from "../../lib/course.js";

export default function Onboarding({ first, onDone }) {
  const { profile, school, say, go } = useApp();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: "", age: "7", understand: "", speak: "", reading: 0, writing: 0, homeKannada: "sometimes", practiceMinutes: 15, group: school.groups[0] || "", code: "", consent: false, track: "" });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const nm = firstName(f.name) || "your child";
  const place = () => placement({ understand: f.understand, speak: f.speak, reading: +f.reading, writing: +f.writing, homeKannada: f.homeKannada, age: +f.age });

  async function create() {
    if (!f.consent) return say("Please tick the consent box.", true);
    const est = { speaking: speakingStage(f.speak, f.understand), reading: +f.reading, writing: +f.writing };
    const intake = { understand: f.understand, speak: f.speak, homeKannada: f.homeKannada, practiceMinutes: +f.practiceMinutes, est };
    const pl = place();
    const track = f.track || pl.track;
    const base = {
      track, pace: pl.pace, placedAs: pl.track, name: f.name.trim(), age: +f.age, group: f.group, parentEmails: [profile.email], parentUids: [profile.uid],
      intake, startStages: est, stages: est, goals: suggestGoals(est, intake), stagesConfirmed: false,
      stars: 0, streak: { count: 0, last: "" }, weekDone: {}, consentAt: Date.now(), createdAt: Date.now(),
    };
    const code = f.code.trim().toUpperCase();
    const open = school.openSignup !== false;
    let id = null, active = false;
    try {
      if (open) {
        id = await store.add("children", { ...base, status: "active", startDate: isoLocal() }); active = true;
      } else if (code) {
        if (store.mode === "device") {
          const j = await store.get("settings", "join");
          if (j && j.code && j.code === code) { id = await store.add("children", { ...base, status: "active", joinCode: code, startDate: isoLocal() }); active = true; }
        } else {
          try { id = await store.add("children", { ...base, status: "active", joinCode: code, startDate: isoLocal() }); active = true; } catch { id = null; }
        }
      }
      if (!id) id = await store.add("children", { ...base, status: "pending", startDate: "" });
      notifyServer({ type: "registration", childId: id });
      say(active ? `Welcome, ${firstName(f.name)}! Week 1 is ready.` : code ? "That class code didn't match, so we've asked the teacher to approve." : "Sent to the teacher to approve. You'll see week 1 as soon as they do.");
      onDone(id);
    } catch (e) { say(friendlyError(e), true); }
  }

  const steps = [
    <div className="stack" key="0">
      <h1 style={{ fontSize: 30 }}>{first ? `Welcome, ${firstName(profile.name)}!` : "Add a child"}</h1>
      <p className="muted">Who is learning Kannada? Chili Pili is made for ages 5 to 12.</p>
      <div className="field"><label htmlFor="cn">Child's name</label><input id="cn" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" /></div>
      <div className="field"><label htmlFor="ca">Age</label><select id="ca" value={f.age} onChange={(e) => set("age", e.target.value)}>{Array.from({ length: 8 }, (_, i) => i + 5).map((a) => <option key={a}>{a}</option>)}</select></div>
      <Btn kind="primary" icon={ArrowRight} onClick={() => { if (!f.name.trim()) return say("Add your child's name.", true); if (+f.age <= 6) set("practiceMinutes", 10); setStep(1); }}>Next</Btn>
    </div>,
    <div className="stack" key="1">
      <h1 style={{ fontSize: 28 }}>Where is {nm} with Kannada?</h1>
      <p className="muted">Think about a normal day, not {nm}'s best day. The teacher checks at the first month-end meet.</p>
      <div className="field"><span className="lbl">When you speak Kannada to {nm}, {nm} understands</span>
        <div className="choices">{UNDERSTAND.map(([v, l]) => <label className="choice" key={v}><input type="radio" name="und" checked={f.understand === v} onChange={() => set("understand", v)} /><span>{l}</span></label>)}</div>
      </div>
      <div className="field"><span className="lbl">When {nm} replies, it's usually</span>
        <div className="choices">{SPEAK.map(([v, l]) => <label className="choice" key={v}><input type="radio" name="spk" checked={f.speak === v} onChange={() => set("speak", v)} /><span>{l}</span></label>)}</div>
      </div>
      {["reading", "writing"].map((k) => (
        <div className="field" key={k}><span className="lbl">{k === "reading" ? "Reads" : "Writes"} Kannada <span className="kn muted">{SKILL[k].kn}</span></span>
          <div className="choices">{SELF_CHECK[k].map(([v, l]) => <label className="choice" key={v}><input type="radio" name={k} checked={+f[k] === v} onChange={() => set(k, v)} /><span>{l}</span></label>)}</div>
        </div>
      ))}
      <div className="field"><span className="lbl">Kannada is spoken at home</span>
        <div className="choices">{[["never", "Rarely"], ["sometimes", "Sometimes"], ["daily", "Every day"]].map(([v, l]) => <label className="choice" key={v}><input type="radio" name="hk" checked={f.homeKannada === v} onChange={() => set("homeKannada", v)} /><span>{l}</span></label>)}</div>
      </div>
      <div className="field"><span className="lbl">Time you can give each day</span>
        <div className="choices">{[[10, "10 min"], [15, "15 min"], [20, "20 min or more"]].map(([v, l]) => <label className="choice" key={v}><input type="radio" name="pm" checked={+f.practiceMinutes === v} onChange={() => set("practiceMinutes", v)} /><span>{l}</span></label>)}</div>
      </div>
      <div className="row"><Btn kind="ghost" icon={ArrowLeft} onClick={() => setStep(0)}>Back</Btn><Btn kind="primary" icon={ArrowRight} onClick={() => { if (!f.understand || !f.speak) return say(`Please answer how ${nm} understands and replies.`, true); set("track", place().track); setStep(2); }}>Next</Btn></div>
    </div>,
    <div className="stack" key="path">
      <h1 style={{ fontSize: 28 }}>{nm}'s path</h1>
      {(() => { const pl = place(); return (
        <div className="placed">
          <b>We suggest {TRACKS[pl.track].icon} {TRACKS[pl.track].en}, with letters at a {PACES[pl.pace].en.toLowerCase()} pace.</b>
          <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{pl.why.map((w) => <li key={w}>{w}</li>)}</ul>
          <span className="small muted">Letters: {PACES[pl.pace].detail}.</span>
        </div>
      ); })()}
      <p className="muted small" style={{ margin: 0 }}>Most children start on First steps, even when they understand a lot at home. You can pick another path; the teacher reviews it at the first meet.</p>
      <div className="track-pick" role="radiogroup" aria-label="Learning path">
        {TRACK_KEYS.map((k) => {
          const t = TRACKS[k];
          return (
            <label key={k} className={`track-card ${f.track === k ? "on" : ""}`}>
              <input type="radio" name="track" checked={f.track === k} onChange={() => set("track", k)} />
              <span className="tc-icon" aria-hidden="true">{t.icon}</span>
              <span className="tc-body"><b>{t.en} <span className="kn muted" style={{ fontWeight: 500 }}>{t.kn}</span></b><span className="small">{t.who}</span><span className="small muted">Goal: {t.aim.charAt(0).toLowerCase() + t.aim.slice(1)}.</span></span>
            </label>
          );
        })}
      </div>
      {f.track && <p className="small" style={{ margin: 0 }}>{TRACKS[f.track].detail}</p>}
      <div className="row"><Btn kind="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>Back</Btn><Btn kind="primary" icon={ArrowRight} onClick={() => setStep(3)}>Next</Btn></div>
    </div>,
    <div className="stack" key="2">
      <h1 style={{ fontSize: 28 }}>{school.groups.length > 1 || school.openSignup === false ? "Join your class" : "Almost done"}</h1>
      {school.groups.length > 1 && <div className="field"><label htmlFor="cg">Group</label><select id="cg" value={f.group} onChange={(e) => set("group", e.target.value)}>{school.groups.map((g) => <option key={g}>{g}</option>)}</select></div>}
      {school.openSignup === false && <div className="field"><label htmlFor="cc">Class code</label><input id="cc" value={f.code} onChange={(e) => set("code", e.target.value)} placeholder="From your teacher" autoCapitalize="characters" autoComplete="off" /><span className="hint">With the code, {nm} starts today. Without it, the teacher approves you first.</span></div>}
      {school.openSignup !== false && <p className="muted">{nm} starts today at the level you chose. Your teacher gets a note and will confirm {nm}'s level at the first month-end meet.</p>}
      <label className="check"><input type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} /><span>I'm {nm}'s parent or guardian. I agree that {school.schoolName} keeps {nm}'s progress, photos and recordings to teach and report progress, and deletes them when I ask.</span></label>
      <div className="row"><Btn kind="ghost" icon={ArrowLeft} onClick={() => setStep(2)}>Back</Btn><Btn kind="primary" onClick={create}>Start learning</Btn></div>
    </div>,
  ];

  return (
    <div className="auth-wrap">
      <div className="skyline-bg"><Skyline /></div>
      <div className="auth-card card" style={{ gap: 16 }}>
        <div className="row"><Gini className="gini" mood={step === 3 ? "cheer" : "happy"} /><div className="dots" aria-label={`Step ${step + 1} of 4`}>{[0, 1, 2, 3].map((i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>
          {!first && <><span className="spacer" /><button className="btn quiet" onClick={() => go("home")}>Cancel</button></>}
          {first && <><span className="spacer" /><button className="btn quiet" onClick={() => store.signOut()}>Sign out</button></>}
        </div>
        {steps[step]}
      </div>
    </div>
  );
}
