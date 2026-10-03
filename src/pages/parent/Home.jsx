import { useState } from "react";
import ProgramPlan from "../../components/ProgramPlan.jsx";
import { Sparkles, Star, Flame, CalendarHeart, BookOpen, Camera, MapPin, Video, Clock, Check, X } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { Gini, Skyline, STAGE_EMOJI } from "../../components/Art.jsx";
import { Ladder, StageChip, StoredImage, Avatar, Empty } from "../../components/ui.jsx";
import { childWeek, childMonth, monthFor, packetFor, isMeetWeek, PLAN_WEEKS } from "../../lib/plan.js";
import { TRACKS, LEVELS, levelOf, levelPatch } from "../../lib/course.js";
import { store } from "../../lib/store/index.js";
import { journeyOf, journeyUnit, JOURNEY_DAYS } from "../../lib/journey.js";
import { SKILLS, SKILL } from "../../lib/content.js";
import { fmtWhen, ago, greeting } from "../../lib/time.js";
import { REACT } from "../../components/HandIn.jsx";
import { nextMeet, meetWhere } from "./Meets.jsx";
import KidCode from "../../components/KidCode.jsx";
import AdultHome from "./AdultHome.jsx";
import { familyFor, knowFor } from "../../lib/family.js";
import { playWord } from "../../lib/audio.js";
import { Volume2 } from "lucide-react";
import { isAdult, ADULT_LEVELS, adultLevelOf, adultLevelPatch } from "../../lib/adult.js";

export default function Home({ fam }) {
  const { child, subs, posts, logs, meets, activity } = fam;
  const { go, profile, school } = useApp();
  const nm = firstName(child.name);

  if (isAdult(child) && child.status === "active") return <AdultHome fam={fam} />;
  if (child.status !== "active") {
    return (
      <div className="stack">
        <div className="page-title"><h1>{greeting()}, {firstName(profile.name)}</h1></div>
        <div className="card yellow" style={{ justifyItems: "center", textAlign: "center" }}>
          <Gini className="gini" />
          <h2>Almost there!</h2>
          <p>We've sent {nm}'s sign-up to the teacher. As soon as they approve, week 1 and {nm}'s space with Gini open here.</p>
          <p className="small muted">Have a class code? Add {nm} again with the code to start straight away.</p>
        </div>
      </div>
    );
  }

  const w = Math.max(1, childWeek(child)); const m = childMonth(child); const mi = monthFor(child, m);
  const pk0 = packetFor(child, w);
  const pk = pk0.meet ? pk0 : { ...pk0, unit: journeyUnit(child, 1) };
  const jr = journeyOf(child);
  const T = TRACKS[pk.track];
  const handedIn = subs.some((s) => s.childId === child.id && s.week === w && s.kind === "packet");
  const lastReply = subs.filter((s) => s.childId === child.id && s.status === "reviewed").sort((a, b) => (b.reviewedAt || 0) - (a.reviewedAt || 0))[0];
  const nm2 = nextMeet(meets, child.group);
  const done = (child.weekDone || {})[w] || {};
  const feed = [...posts].sort((a, b) => b.at - a.at).slice(0, 3);

  return (
    <div className="stack">
      <div className="child-hero">
        <Skyline className="skyline" color="#8a0d1f" sun="#c8102e" />
        <div className="row" style={{ alignItems: "flex-start" }}>
          <Avatar name={child.name} size="lg" />
          <div className="grow" style={{ flex: 1, minWidth: 0 }}>
            <span className="label" style={{ color: "var(--red-deep)" }}>Week {w} of {PLAN_WEEKS} · Month {m}</span>
            <h1 style={{ fontSize: "clamp(28px,5vw,40px)" }}>{nm}</h1>
            <p><b>{mi.en}</b> <span className="kn">{mi.kn}</span> · {mi.script}</p>
            <LevelStepper child={child} />
          </div>
        </div>
        <div className="stat-row">
          <span className="stat"><Star /> {child.stars || 0} stars</span>
          <span className="stat"><Flame /> {(child.streak && child.streak.count) || 0} day streak</span>
          {SKILLS.map((k) => <span className="stat" key={k} title={SKILL[k].en}>{STAGE_EMOJI[(child.stages || {})[k] || 0]} {SKILL[k].en}</span>)}
        </div>
        <button className="btn primary" style={{ justifySelf: "start" }} onClick={() => go("kid")}><Sparkles /> Open {nm}'s space with Gini</button>
        <KidCode child={child} compact />
      </div>

      <ProgramPlan child={child} compact onOpen={() => go("plan")} />

      <FamilyAtHome child={child} week={w} voiceLib={fam.voiceLib} go={go} />

      <GettingStarted child={child} played={activity.some((a) => a.childId === child.id)} handed={subs.some((s) => s.childId === child.id && s.kind === "packet")} week={w} />

      <div className="grid2">
        <div className="card">
          <div className="card-head"><span className="label">This week</span>{isMeetWeek(w) ? <span className="pill blue">Meet week</span> : handedIn ? <span className="pill green">Pages sent</span> : null}</div>
          {pk.meet ? (
            <><h3>Month-end meet week</h3><p className="muted">No new packet. {nm} gets ready to show the teacher what they learnt.</p></>
          ) : (
            <>
              <h3>{pk.pattern.en} <span className="kn" style={{ fontWeight: 500 }}>{pk.pattern.kn}</span></h3>
              <div className="words">{pk.theme.words.slice(0, 6).map((x) => <span className="word" key={x[0]}><b>{x[3]} {x[0]}</b><small>{x[2]}</small></span>)}</div>
              <p className="small" style={{ margin: 0 }}><b>Letter journey:</b> day {jr.day} of {JOURNEY_DAYS} · <span className="kn">{(pk.unit.items || []).slice(0, 8).join(" ")}</span></p>
              <p className="kn" style={{ margin: 0, fontSize: 18 }}>{pk.pattern.model[0][0]} <span className="small muted" style={{ fontFamily: "var(--f-body)" }}>{pk.pattern.model[0][2]}</span></p>
              <div className="stack-s small">
                {SKILLS.map((k) => <span key={k}>• <b>{SKILL[k].en}:</b> {pk.tasks[k].title}</span>)}
              </div>
            </>
          )}
          <div className="row">
            <button className="btn ghost small" onClick={() => go("packets", String(w))}><BookOpen size={18} /> Open packet</button>
            {!pk.meet && <button className="btn yellow small" onClick={() => go("packets", String(w))}><Camera size={18} /> Send pages</button>}
          </div>
          <div className="stack-s">
            <span className="label">{nm}'s missions this week</span>
            <div className="row small">{[1, 2, 3, 4, 5, 6].map((d) => <span key={d} className={`pill ${done["d" + d] ? "green" : "grey"}`}>{done["d" + d] ? "✓ " : ""}Day {d}</span>)}</div>
          </div>
        </div>

        <div className="card">
          <span className="label">Month-end meet</span>
          {nm2 ? (
            <>
              <h3>{fmtWhen(nm2.startAt, school.timeZone, school.tzLabel)}</h3>
              <p className="row small muted">{nm2.mode === "online" ? <Video size={16} /> : <MapPin size={16} />} {meetWhere(nm2, school)} · <Clock size={16} /> {nm2.duration || 60} min</p>
            </>
          ) : <p className="muted">The teacher will post the next meet here.</p>}
          <button className="btn ghost small" style={{ justifySelf: "start" }} onClick={() => go("meets")}><CalendarHeart size={18} /> Meet details</button>
          {lastReply && (
            <div className="stack-s" style={{ background: "var(--leaf-soft)", borderRadius: 14, padding: 12 }}>
              <span className="label" style={{ color: "var(--leaf)" }}>Latest from the teacher</span>
              <b>{REACT[lastReply.reaction] || "Reviewed"} · week {lastReply.week}</b>
              {lastReply.feedback && <p className="small">{lastReply.feedback}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>{nm}'s stages</h3><button className="btn quiet small" onClick={() => go("child")}>See progress</button></div>
        <Ladder now={child.stages} goal={child.goals} compact />
        {!child.stagesConfirmed && <p className="tiny muted">Starting stages come from your answers. The teacher confirms them at the first month-end meet.</p>}
      </div>

      <div className="card">
        <h3>From the class</h3>
        {feed.length ? feed.map((p) => (
          <div className="post" key={p.id}>
            <div className="row"><Avatar name={p.byName} size="sm" /><b>{p.byName}</b><span className="tiny muted">{ago(p.at)}</span></div>
            {p.text && <p>{p.text}</p>}
            {p.photoPath && <StoredImage path={p.photoPath} alt="" />}
          </div>
        )) : <Empty title="Nothing yet" art={null}>Updates and photos from the teacher appear here.</Empty>}
      </div>
    </div>
  );
}

// First-weeks guide for parents: four small steps, ticked off as they happen.
function GettingStarted({ child, played, handed, week }) {
  const { go } = useApp();
  const key = "chilipili-started-" + child.id;
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(key) === "1"; } catch { return false; } });
  if (hidden || week > 2) return null;
  const nm = firstName(child.name);
  const steps = [
    [played, `15 minutes a day with Gini`, `Open ${nm}'s space and tap Today's mission. There are six short missions a week, each one a little different. Sit with ${nm} the first time.`, () => go("kid"), "Open Gini"],
    [false, "A page or two of paper a day", "Download the packet: tracing, words and sentences. Print it, or fill it in on an iPad.", () => go("packets"), "Packet"],
    [false, "Talk both ways", `When ${nm} wants to say something, say it in English together and hear it in Kannada. Then ${nm} says it to you.`, () => go("kid", "say"), "Try it"],
    [handed, "Your teacher sees the work", `Letters ${nm} writes on screen and every recording reach the teacher on their own. Snap paper pages whenever they're done: no deadline.`, () => go("packets"), "Send pages"],
  ];
  return (
    <div className="card" style={{ border: "2px solid var(--yellow)" }}>
      <div className="card-head"><h3>Getting started</h3><button className="icon-btn" aria-label="Hide" onClick={() => { try { localStorage.setItem(key, "1"); } catch {} setHidden(true); }}><X size={18} /></button></div>
      <ul className="list">
        {steps.map(([done, t, d, fn, cta], i) => (
          <li key={i}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", flex: "none", background: done ? "var(--leaf)" : "var(--yellow-soft)", color: done ? "#fff" : "var(--red)", fontWeight: 800 }}>{done ? <Check size={18} /> : i + 1}</span>
            <div className="grow"><b>{t}</b><div className="sub">{d}</div></div>
            {!done && <button className="btn ghost small" onClick={fn}>{cta}</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Quick back-and-forth between levels, right on the home page.
export function LevelStepper({ child }) {
  const { say, go } = useApp();
  const adult = isAdult(child), LIST = adult ? ADULT_LEVELS : LEVELS;
  const n = adult ? adultLevelOf(child) : levelOf(child), L = LIST[n - 1];
  const [ask, setAsk] = useState(0);
  async function move(k) {
    try { await store.update("children", child.id, { ...(adult ? adultLevelPatch(k) : levelPatch(k)), levelBy: "family", levelAt: Date.now() }); say(`Level ${k}: ${LIST[k - 1].en}. You can switch back any time.`); setAsk(0); }
    catch (e) { say(e.message || "Couldn't change the level.", true); }
  }
  return (
    <div className="level-stepper">
      <div className="ls-row">
      <button className="icon-btn" disabled={n <= 1} onClick={() => setAsk(n - 1)} aria-label="Easier level">◀</button>
      <button className="ls-mid" onClick={() => go("child")}><span aria-hidden="true">{L.icon}</span> Level {n}: {L.en}</button>
      <button className="icon-btn" disabled={n >= 4} onClick={() => setAsk(n + 1)} aria-label="Harder level">▶</button>
      </div>
      {ask > 0 && (
        <div className="ls-ask">
          <span className="small">{ask > n ? `Try level ${ask}: ${LIST[ask - 1].en}? It's harder.` : `Go back to level ${ask}: ${LIST[ask - 1].en}?`}</span>
          <div className="row"><button className="btn primary small" onClick={() => move(ask)}>Yes</button><button className="btn ghost small" onClick={() => setAsk(0)}>No</button></div>
        </div>
      )}
    </div>
  );
}

// This week's family talk, for the parent to do with the child for real.
function FamilyAtHome({ child, week, voiceLib, go }) {
  const t = familyFor(week), k = knowFor(week), nm = firstName(child.name);
  const done = ((child.weekDone || {})[week] || {}).family;
  return (
    <div className="card">
      <div className="card-head"><span className="label">This week at home</span>{done ? <span className="pill green">{nm} wrote for {t.who.split(" ")[0]}</span> : null}</div>
      <h3>{t.pic} {t.en} <span className="kn" style={{ fontWeight: 500 }}>{t.kn}</span></h3>
      <p className="muted" style={{ margin: 0 }}>{nm} practises this talk with Gini, then writes a line for {t.who}. Tonight, do it for real: you say {t.who === "Amma" || t.who === "Appa" ? `${t.who}'s lines` : `${t.who}'s lines (or call them!)`} and {nm} answers.</p>
      <ul className="phrase-list">{t.lines.map(([who, kn, rom, en], i) => (
        <li key={i}><button className="icon-btn hear" onClick={() => playWord(kn, voiceLib)} aria-label={`Hear: ${en}`}><Volume2 size={18} /></button>
          <div><span className="tiny muted">{who === "you" ? nm : t.who === "Ajji and Tata" ? "Ajji / Tata" : t.who}</span><b className="kn">{kn}</b><span className="small muted">{rom} · {en}</span></div></li>
      ))}</ul>
      <div className="know-card"><span className="label">Talk about it: {k[0]} <span className="kn">{k[1]}</span></span><span className="small">{k[2]}</span></div>
      <button className="btn yellow" style={{ justifySelf: "start" }} onClick={() => go("kid", "family", t.id)}>Open {nm}'s family talk</button>
    </div>
  );
}
