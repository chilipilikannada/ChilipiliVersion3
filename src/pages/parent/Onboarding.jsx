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
import { TRACKS, TRACK_KEYS, PACES, UNDERSTAND, SPEAK, placement, speakingStage, LEVELS, levelFromPlacement, levelPatch } from "../../lib/course.js";
import { makeKidCode } from "../../components/KidCode.jsx";
import { ADULT_LEVELS, ADULT_GOALS, A_UNDERSTAND, A_SPEAK, A_READ, adultPlacement, adultLevelPatch } from "../../lib/adult.js";

export default function Onboarding({ first, onDone }) {
  const { profile, school, say, go } = useApp();
  const [step, setStep] = useState(0);
  const intentAdult = (() => { try { return sessionStorage.getItem("chilipili-intent") === "adult"; } catch { return false; } })();
  const [f, setF] = useState({ name: intentAdult ? profile.name || "" : "", age: "7", understand: "", speak: "", reading: 0, writing: 0, homeKannada: "sometimes", practiceMinutes: 15, group: school.groups[0] || "", code: "", consent: false, track: "", aGoals: [], aUnd: "", aSpk: "", aRead: "", aLevel: 0 });
  const [who, setWho] = useState(intentAdult ? "adult" : "");
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const nm = firstName(f.name) || "your child";
  const place = () => placement({ understand: f.understand, speak: f.speak, reading: +f.reading, writing: +f.writing, homeKannada: f.homeKannada, age: +f.age });

  async function create() {
    if (!f.consent) return say("Please tick the consent box.", true);
    const est = { speaking: speakingStage(f.speak, f.understand), reading: +f.reading, writing: +f.writing };
    const intake = { understand: f.understand, speak: f.speak, homeKannada: f.homeKannada, practiceMinutes: +f.practiceMinutes, est };
    const pl = place();
    const suggested = levelFromPlacement(pl);
    const lv = +f.level || suggested;
    const base = {
      ...levelPatch(lv), placedAs: suggested, name: f.name.trim(), age: +f.age, group: f.group, parentEmails: [profile.email], parentUids: [profile.uid],
      intake, startStages: est, stages: est, goals: suggestGoals(est, intake), stagesConfirmed: false,
      stars: 0, streak: { count: 0, last: "" }, weekDone: {}, consentAt: Date.now(), createdAt: Date.now(),
    };
    await saveLearner(base, false);
  }

  // Shared by children and grown-ups: open sign-up, class code, or wait for the teacher.
  async function saveLearner(base, adult) {
    const who = firstName(base.name);
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
      try { sessionStorage.removeItem("chilipili-intent"); } catch {}
      let pin = "";
      if (!adult) { try { pin = await makeKidCode({ id, parentEmails: base.parentEmails }); } catch {} }
      const sent = await Promise.race([notifyServer({ type: "registration", childId: id }), new Promise((r) => setTimeout(r, 6000))]);
      const emailed = !!(sent && sent.parent && sent.parent.sent);
      if (adult) say(active ? `Welcome, ${who}! Your first lesson is ready.` : code ? "That class code didn't match, so we've asked the teacher to approve." : "Sent to the teacher to approve. Your lessons open as soon as they do.");
      else say(active ? `Welcome, ${who}! Week 1 is ready.${pin ? ` ${who}'s number for "I'm a kid" is ${pin}.` : ""}${emailed ? " We've emailed it to you too." : ""}` : code ? "That class code didn't match, so we've asked the teacher to approve." : "Sent to the teacher to approve. You'll see week 1 as soon as they do.");
      onDone(id);
    } catch (e) { say(friendlyError(e), true); }
  }

  async function createAdult() {
    if (!f.consent) return say("Please tick the consent box.", true);
    const pl = adultPlacement({ understand: f.aUnd, speak: f.aSpk, read: f.aRead, goals: f.aGoals });
    const lv = +f.aLevel || pl.level;
    const stg = { speaking: { none: 0, phrases: 1, simple: 3, fluent: 4 }[f.aSpk] || 0, reading: { none: 0, slow: 1, yes: 3 }[f.aRead] || 0, writing: { none: 0, slow: 1, yes: 2 }[f.aRead] || 0 };
    const base = {
      adult: true, ...adultLevelPatch(lv), pace: pl.pace, placedAs: pl.level, name: f.name.trim(), group: f.group, parentEmails: [profile.email], parentUids: [profile.uid],
      intake: { goals: f.aGoals, understand: f.aUnd, speak: f.aSpk, read: f.aRead }, startStages: stg, stages: stg, goals: Object.fromEntries(Object.entries(stg).map(([k, v]) => [k, Math.min(6, v + 2)])), stagesConfirmed: false,
      stars: 0, streak: { count: 0, last: "" }, weekDone: {}, adultDone: {}, consentAt: Date.now(), createdAt: Date.now(),
    };
    await saveLearner(base, true);
  }

  const steps = [
    <div className="stack" key="0">
      <h1 style={{ fontSize: 30 }}>Your child</h1>
      <p className="muted">Tell us about your child. The kids' course is made for ages 5 to 12.</p>
      <div className="field"><label htmlFor="cn">Child's name</label><input id="cn" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" /></div>
      <div className="field"><label htmlFor="ca">Age</label><select id="ca" value={f.age} onChange={(e) => set("age", e.target.value)}>{Array.from({ length: 8 }, (_, i) => i + 5).map((a) => <option key={a}>{a}</option>)}</select></div>
      <div className="row"><Btn kind="ghost" icon={ArrowLeft} onClick={() => setWho("")}>Back</Btn><Btn kind="primary" icon={ArrowRight} onClick={() => { if (!f.name.trim()) return say("Add your child's name.", true); if (+f.age <= 6) set("practiceMinutes", 10); setStep(1); }}>Next</Btn></div>
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
      <div className="row"><Btn kind="ghost" icon={ArrowLeft} onClick={() => setStep(0)}>Back</Btn><Btn kind="primary" icon={ArrowRight} onClick={() => { if (!f.understand || !f.speak) return say(`Please answer how ${nm} understands and replies.`, true); set("level", levelFromPlacement(place())); setStep(2); }}>Next</Btn></div>
    </div>,
    <div className="stack" key="path">
      <h1 style={{ fontSize: 28 }}>{nm}'s level</h1>
      {(() => { const pl = place(); return (
        <div className="placed">
          <b>We suggest level {levelFromPlacement(pl)}: {LEVELS[levelFromPlacement(pl) - 1].en}.</b>
          <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{pl.why.map((w) => <li key={w}>{w}</li>)}</ul>

        </div>
      ); })()}

      <div className="track-pick" role="radiogroup" aria-label="Level">
        {LEVELS.map((L) => (
          <label key={L.n} className={`track-card ${+f.level === L.n ? "on" : ""}`}>
            <input type="radio" name="level" checked={+f.level === L.n} onChange={() => set("level", L.n)} />
            <span className="tc-icon" aria-hidden="true">{L.icon}</span>
            <span className="tc-body"><b>Level {L.n}: {L.en}{L.n === levelFromPlacement(place()) ? " (suggested)" : ""}</b><span className="tiny muted">Ages {L.ages}</span><span className="small">{L.what}</span></span>
          </label>
        ))}
      </div>
      <p className="small muted" style={{ margin: 0 }}>Want a challenge? Pick a higher level. You can move up or down any time from {nm}'s profile, and {nm} can too.</p>
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

  const nmA = firstName(f.name) || "you";
  const plA = adultPlacement({ understand: f.aUnd, speak: f.aSpk, read: f.aRead, goals: f.aGoals });
  const radio = (key, list, name) => <div className="choices">{list.map(([v, l]) => <label className="choice" key={v}><input type="radio" name={name} checked={f[key] === v} onChange={() => set(key, v)} /><span>{l}</span></label>)}</div>;
  const adultSteps = [
    <div className="stack" key="a0">
      <h1 style={{ fontSize: 30 }}>Learning for yourself</h1>
      <p className="muted">Learn to talk with your partner and loved ones in Kannada. Conversation first, with English letters for every phrase; the script comes when you're ready.</p>
      <div className="field"><label htmlFor="an">Your name</label><input id="an" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></div>
      <div className="field"><span className="lbl">What do you want Kannada for? <span className="muted">(pick any)</span></span>
        <div className="choices">{ADULT_GOALS.map(([v, l]) => <label className="choice" key={v}><input type="checkbox" checked={f.aGoals.includes(v)} onChange={(e) => set("aGoals", e.target.checked ? [...f.aGoals, v] : f.aGoals.filter((x) => x !== v))} /><span>{l}</span></label>)}</div>
      </div>
      <div className="row"><Btn kind="ghost" icon={ArrowLeft} onClick={() => setWho("")}>Back</Btn><Btn kind="primary" icon={ArrowRight} onClick={() => { if (!f.name.trim()) return say("Add your name.", true); setStep(1); }}>Next</Btn></div>
    </div>,
    <div className="stack" key="a1">
      <h1 style={{ fontSize: 28 }}>Where are you with Kannada?</h1>
      <p className="muted">A rough answer is fine. You can change level any time.</p>
      <div className="field"><span className="lbl">When people speak Kannada, you understand</span>{radio("aUnd", A_UNDERSTAND, "aund")}</div>
      <div className="field"><span className="lbl">You can speak</span>{radio("aSpk", A_SPEAK, "aspk")}</div>
      <div className="field"><span className="lbl">Can you read the Kannada script?</span>{radio("aRead", A_READ, "aread")}</div>
      <div className="row"><Btn kind="ghost" icon={ArrowLeft} onClick={() => setStep(0)}>Back</Btn><Btn kind="primary" icon={ArrowRight} onClick={() => { if (!f.aUnd || !f.aSpk || !f.aRead) return say("Please answer all three.", true); set("aLevel", plA.level); setStep(2); }}>Next</Btn></div>
    </div>,
    <div className="stack" key="a2">
      <h1 style={{ fontSize: 28 }}>Your level</h1>
      <div className="placed"><b>We suggest level {plA.level}: {ADULT_LEVELS[plA.level - 1].en}.</b><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{plA.why.map((w) => <li key={w}>{w}</li>)}</ul></div>
      <div className="track-pick" role="radiogroup" aria-label="Level">
        {ADULT_LEVELS.map((L) => (
          <label key={L.n} className={`track-card ${+f.aLevel === L.n ? "on" : ""}`}>
            <input type="radio" name="alevel" checked={+f.aLevel === L.n} onChange={() => set("aLevel", L.n)} />
            <span className="tc-icon" aria-hidden="true">{L.icon}</span>
            <span className="tc-body"><b>Level {L.n}: {L.en}{L.n === plA.level ? " (suggested)" : ""}</b><span className="small">{L.what}</span></span>
          </label>
        ))}
      </div>
      <p className="small muted" style={{ margin: 0 }}>Every lesson stays open whatever you pick. The level only decides what comes next.</p>
      <div className="row"><Btn kind="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>Back</Btn><Btn kind="primary" icon={ArrowRight} onClick={() => setStep(3)}>Next</Btn></div>
    </div>,
    <div className="stack" key="a3">
      <h1 style={{ fontSize: 28 }}>{school.groups.length > 1 || school.openSignup === false ? "Join the class" : "Almost done"}</h1>
      {school.groups.length > 1 && <div className="field"><label htmlFor="ag">Group</label><select id="ag" value={f.group} onChange={(e) => set("group", e.target.value)}>{school.groups.map((g) => <option key={g}>{g}</option>)}</select></div>}
      {school.openSignup === false && <div className="field"><label htmlFor="acc">Class code</label><input id="acc" value={f.code} onChange={(e) => set("code", e.target.value)} placeholder="From your teacher" autoCapitalize="characters" autoComplete="off" /><span className="hint">With the code, you start today. Without it, the teacher approves you first.</span></div>}
      <label className="check"><input type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} /><span>I agree that {school.schoolName} keeps my progress and recordings to teach me and reply, and deletes them when I ask.</span></label>
      <div className="row"><Btn kind="ghost" icon={ArrowLeft} onClick={() => setStep(2)}>Back</Btn><Btn kind="primary" onClick={createAdult}>Start learning</Btn></div>
    </div>,
  ];
  const chooser = (
    <div className="stack">
      <h1 style={{ fontSize: 30 }}>{first ? `Welcome, ${firstName(profile.name)}!` : "Add a learner"}</h1>
      <p className="muted">Who is learning Kannada?</p>
      <div className="who-pick">
        <button className="who-card" onClick={() => { setWho("child"); setStep(0); }}><span aria-hidden="true">🧒</span><b>My child</b><small>Games with Gini the parrot, letters, weekly packets</small></button>
        <button className="who-card" onClick={() => { setWho("adult"); setStep(0); set("name", profile.name || ""); }}><span aria-hidden="true">🙋</span><b>Me</b><small>Conversation lessons for grown-ups, then the script</small></button>
      </div>
      <p className="small muted" style={{ margin: 0 }}>Families can have both: add your children and yourself, and switch from the name at the top.</p>
    </div>
  );
  const view = !who ? chooser : who === "adult" ? adultSteps[step] : steps[step];


  return (
    <div className="auth-wrap">
      <div className="skyline-bg"><Skyline /></div>
      <div className="auth-card card" style={{ gap: 16 }}>
        <div className="row"><Gini className="gini" mood={step === 3 ? "cheer" : "happy"} />{who && <div className="dots" aria-label={`Step ${step + 1} of 4`}>{[0, 1, 2, 3].map((i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>}
          {!first && <><span className="spacer" /><button className="btn quiet" onClick={() => go("home")}>Cancel</button></>}
          {first && <><span className="spacer" /><button className="btn quiet" onClick={() => store.signOut()}>Sign out</button></>}
        </div>
        {view}
      </div>
    </div>
  );
}
