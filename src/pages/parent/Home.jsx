import { useState } from "react";
import { Sparkles, Star, Flame, CalendarHeart, BookOpen, Camera, MapPin, Video, Clock, Check, X } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { Gini, Skyline, STAGE_EMOJI } from "../../components/Art.jsx";
import { Ladder, StageChip, StoredImage, Avatar, Empty } from "../../components/ui.jsx";
import { childWeek, childMonth, monthFor, packetFor, isMeetWeek, PLAN_WEEKS } from "../../lib/plan.js";
import { TRACKS } from "../../lib/course.js";
import { SKILLS, SKILL } from "../../lib/content.js";
import { fmtWhen, ago, greeting } from "../../lib/time.js";
import { REACT } from "../../components/HandIn.jsx";
import { nextMeet, meetWhere } from "./Meets.jsx";

export default function Home({ fam }) {
  const { child, subs, posts, logs, meets, activity } = fam;
  const { go, profile, school } = useApp();
  const nm = firstName(child.name);

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
  const pk = packetFor(child, w);
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
            <span className="pill yellow" style={{ justifySelf: "start" }}>{T.icon} {T.en} path</span>
          </div>
        </div>
        <div className="stat-row">
          <span className="stat"><Star /> {child.stars || 0} stars</span>
          <span className="stat"><Flame /> {(child.streak && child.streak.count) || 0} day streak</span>
          {SKILLS.map((k) => <span className="stat" key={k} title={SKILL[k].en}>{STAGE_EMOJI[(child.stages || {})[k] || 0]} {SKILL[k].en}</span>)}
        </div>
        <button className="btn primary" style={{ justifySelf: "start" }} onClick={() => go("kid")}><Sparkles /> Open {nm}'s space with Gini</button>
      </div>

      <GettingStarted child={child} played={activity.some((a) => a.childId === child.id)} handed={subs.some((s) => s.childId === child.id && s.kind === "packet")} week={w} />

      <div className="grid2">
        <div className="card">
          <div className="card-head"><span className="label">This week</span>{isMeetWeek(w) ? <span className="pill blue">Meet week</span> : handedIn ? <span className="pill green">Handed in</span> : <span className="pill yellow">To do</span>}</div>
          {pk.meet ? (
            <><h3>Month-end meet week</h3><p className="muted">No new packet. {nm} gets ready to show the teacher what they learnt.</p></>
          ) : (
            <>
              <h3>{pk.pattern.en} <span className="kn" style={{ fontWeight: 500 }}>{pk.pattern.kn}</span></h3>
              <p className="small" style={{ margin: 0 }}><b>Letters:</b> {pk.unit.en} <span className="kn">{(pk.unit.items || []).slice(0, 8).join(" ")}</span></p>
              <p className="kn" style={{ margin: 0, fontSize: 18 }}>{pk.pattern.model[0][0]} <span className="small muted" style={{ fontFamily: "var(--f-body)" }}>{pk.pattern.model[0][2]}</span></p>
              <div className="stack-s small">
                {SKILLS.map((k) => <span key={k}>• <b>{SKILL[k].en}:</b> {pk.tasks[k].title}</span>)}
              </div>
            </>
          )}
          <div className="row">
            <button className="btn ghost small" onClick={() => go("packets", String(w))}><BookOpen size={18} /> Open packet</button>
            {!pk.meet && !handedIn && <button className="btn yellow small" onClick={() => go("packets", String(w))}><Camera size={18} /> Hand in</button>}
          </div>
          <div className="stack-s">
            <span className="label">In {nm}'s space this week</span>
            <div className="row small">{["listen", "play", "speak", "write", "build"].map((a) => <span key={a} className={`pill ${done[a] ? "green" : "grey"}`}>{done[a] ? "✓ " : ""}{a[0].toUpperCase() + a.slice(1)}</span>)}</div>
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
  if (hidden || week > 3 || (played && handed)) return null;
  const nm = firstName(child.name);
  const steps = [
    [played, `Let ${nm} play with Gini for 10 minutes`, "Listen, Play, Speak, Write and Build. Sit with them the first time; Write checks each letter.", () => go("kid"), "Open Gini"],
    [false, "Download this week's packet", "A PDF with tracing sheets, sentence pages and the answers. Print it, or fill it in on an iPad.", () => go("packets"), "Packet"],
    [handed, "Hand in by Sunday", "Photos of the finished pages, or the PDF. Your teacher replies here.", () => go("packets"), "Hand in"],
    [false, "Put the month-end meet in your calendar", "Week 4 of every month, with the teacher.", () => go("meets"), "Meets"],
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
