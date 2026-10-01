import { Inbox, Users, CalendarHeart, MessageCircle, Megaphone, AudioLines, Settings, Star, BarChart3, PenLine, FileText } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { Gini, Skyline, STAGE_EMOJI } from "../../components/Art.jsx";
import { Avatar, Empty } from "../../components/ui.jsx";
import { childWeek, isMeetWeek } from "../../lib/plan.js";
import { SKILLS } from "../../lib/content.js";
import { greeting, ago, fmtWhen } from "../../lib/time.js";
import { meetState } from "../parent/Meets.jsx";
import { PATTERNS, PROJECTS } from "../../lib/course.js";
import { HAND_SETS } from "./Handwriting.jsx";
import { voiceKey } from "../../lib/audio.js";

export default function Today({ data, badges }) {
  const { profile, go, school } = useApp();
  const { children, subs, activity, meets, voiceLib, strokeLib } = data;
  const active = children.filter((c) => c.status === "active");
  const weekAgo = Date.now() - 7 * 864e5;
  const next = meets.filter((m) => m.status !== "cancelled" && meetState(m) !== "ended").sort((a, b) => a.startAt - b.startAt)[0];
  const allWords = [...new Set([...PATTERNS, ...PROJECTS].flatMap((p) => [...p.words.map((w) => w[0]), ...p.model.map((m) => m[0])]))];
  const recorded = allWords.filter((w) => voiceLib[voiceKey(w)]).length;
  const letters = HAND_SETS.slice(0, 2).flatMap((s) => s.items);
  const written = letters.filter((t) => strokeLib[voiceKey(t)]).length;

  const rows = active.map((c) => {
    const w = Math.max(1, childWeek(c));
    const acts = activity.filter((a) => a.childId === c.id && a.at > weekAgo);
    const handed = subs.some((s) => s.childId === c.id && s.week === w && s.kind === "packet");
    return { c, w, acts: acts.length, stars: acts.reduce((t, a) => t + (a.stars || 0), 0), handed, quiet: !c.lastActive || c.lastActive < weekAgo };
  }).sort((a, b) => a.acts - b.acts);

  return (
    <div className="stack">
      <div className="child-hero">
        <Skyline className="skyline" />
        <div className="row"><Gini className="gini-s" /><div><span className="label" style={{ color: "var(--red-deep)" }}>{school.schoolName}</span><h1 style={{ fontSize: "clamp(26px,4vw,36px)" }}>{greeting()}, {firstName(profile.name)}</h1></div></div>
        <div className="stat-row">
          <span className="stat"><Users /> {active.length} children</span>
          <span className="stat"><Star /> {activity.filter((a) => a.at > weekAgo).length} activities this week</span>
        </div>
      </div>

      <div className="tiles4">
        <Tile icon={Inbox} n={badges.review} label="Hand-ins to review" onClick={() => go("review")} />
        <Tile icon={Users} n={badges.families} label="Families waiting" onClick={() => go("families")} />
        <Tile icon={CalendarHeart} n={badges.meets} label="Meets to write up" onClick={() => go("meets")} />
        <Tile icon={MessageCircle} n={badges.messages} label="New messages" onClick={() => go("messages")} />
      </div>

      <div className="grid2">
        <div className="card">
          <span className="label">Next month-end meet</span>
          {next ? <><h3>{fmtWhen(next.startAt, school.timeZone, school.tzLabel)}</h3><p className="muted">{next.group} · {next.mode === "online" ? "online" : next.location || school.venue || "in person"}</p></> : <p className="muted">None scheduled.</p>}
          <button className="btn ghost small" style={{ justifySelf: "start" }} onClick={() => go("meets")}>Meets</button>
        </div>
        <div className="card">
          <span className="label">Your voice and handwriting</span>
          <h3>{written} of {letters.length} letters written · {recorded} of {allWords.length} words and sentences recorded</h3>
          <p className="muted small">Children watch your strokes and get checked against them in Write, and hear your voice in Listen, Play and Speak. Start with the vowels and month 1's sentences.</p>
          <div className="row">
            <button className="btn yellow small" onClick={() => go("handwriting")}><PenLine size={18} /> Write letters</button>
            <button className="btn ghost small" onClick={() => go("voice")}><AudioLines size={18} /> Record words</button>
            <button className="btn ghost small" onClick={() => go("sheets")}><FileText size={18} /> Packets</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>This week, child by child</h3><span className="tiny muted">Quietest first</span></div>
        {rows.length ? (
          <ul className="list">
            {rows.map(({ c, w, acts, stars, handed, quiet }) => (
              <li key={c.id} style={{ cursor: "pointer" }} onClick={() => go("families", c.id)}>
                <Avatar name={c.name} />
                <div className="grow">
                  <b>{c.name}</b> <span className="sub">· week {w}{isMeetWeek(w) ? " (meet)" : ""}</span>
                  <div className="sub">{acts} activities · {stars} ⭐ · {handed ? "packet handed in" : isMeetWeek(w) ? "meet week" : "packet not handed in"}{c.lastActive ? ` · active ${ago(c.lastActive)}` : ""}</div>
                </div>
                <span className="hide-s" style={{ fontSize: 20 }}>{SKILLS.map((k) => STAGE_EMOJI[(c.stages || {})[k] || 0]).join("")}</span>
                {quiet && <span className="pill red">Quiet</span>}
              </li>
            ))}
          </ul>
        ) : <Empty art={<Gini className="gini" />} title="No children yet">Share your class code (Settings) with families. They'll appear here as they sign up.</Empty>}
      </div>

      <div className="grid3">
        <button className="card" style={{ border: 0, textAlign: "left", cursor: "pointer" }} onClick={() => go("summary")}><BarChart3 color="var(--red)" /><h3>Class summary</h3><p className="muted small">Every child's level and goal, this week's effort, spreadsheet.</p></button>
        <button className="card" style={{ border: 0, textAlign: "left", cursor: "pointer" }} onClick={() => go("feed")}><Megaphone color="var(--red)" /><h3>Class feed</h3><p className="muted small">Share photos and news with every family.</p></button>
        <button className="card" style={{ border: 0, textAlign: "left", cursor: "pointer" }} onClick={() => go("settings")}><Settings color="var(--red)" /><h3>Settings</h3><p className="muted small">Class code, groups, venue, time zone, team.</p></button>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, n, label, onClick }) {
  return (
    <button className="card" onClick={onClick} style={{ border: 0, textAlign: "left", cursor: "pointer", gridTemplateColumns: "auto 1fr", alignItems: "center", display: "grid" }}>
      <span style={{ width: 48, height: 48, borderRadius: 14, background: n ? "var(--red)" : "var(--yellow-soft)", color: n ? "#fff" : "var(--red)", display: "grid", placeItems: "center" }}><Icon /></span>
      <span><b style={{ fontFamily: "var(--f-display)", fontSize: 28, lineHeight: 1 }}>{n || 0}</b><span className="small muted" style={{ display: "block" }}>{label}</span></span>
    </button>
  );
}
