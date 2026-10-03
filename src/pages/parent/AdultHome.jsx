import { Sparkles, Star, Flame, Volume2, Languages, Keyboard, MessageCircle, BookOpen } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { Skyline } from "../../components/Art.jsx";
import { Avatar } from "../../components/ui.jsx";
import { playWord } from "../../lib/audio.js";
import { journeyOf, JOURNEY_DAYS } from "../../lib/journey.js";
import { UNITS, doneUnits, nextUnit, unitNo, adultLevelOf, adultPace } from "../../lib/adult.js";
import { LevelStepper } from "./Home.jsx";
import ProgramPlan from "../../components/ProgramPlan.jsx";

// Home page for a grown-up learner: what's next, progress, and habits that make it stick.
export default function AdultHome({ fam }) {
  const { child, voiceLib, subs } = fam;
  const { go } = useApp();
  const nm = firstName(child.name);
  const u = nextUnit(child), done = doneUnits(child), nDone = UNITS.filter((x) => done[x.id]).length;
  const jr = journeyOf(child);
  const L = adultLevelOf(child);
  const pace = adultPace(child);
  const reply = subs.filter((s) => s.childId === child.id && s.status === "reviewed").sort((a, b) => (b.reviewedAt || 0) - (a.reviewedAt || 0))[0];
  return (
    <div className="stack">
      <div className="child-hero">
        <Skyline className="skyline" color="#8a0d1f" sun="#c8102e" />
        <div className="row" style={{ alignItems: "flex-start" }}>
          <Avatar name={child.name} size="lg" />
          <div className="grow" style={{ flex: 1, minWidth: 0 }}>
            <span className="label" style={{ color: "var(--red-deep)" }}>My Kannada · week {pace.week} of {pace.weeks}</span>
            <h1 style={{ fontSize: "clamp(28px,5vw,40px)" }}>{nm}</h1>
            <LevelStepper child={child} />
          </div>
        </div>
        <div className="stat-row">
          <span className="stat"><Star /> {child.stars || 0} stars</span>
          <span className="stat"><Flame /> {(child.streak && child.streak.count) || 0} day streak</span>
          <span className="stat">📚 {nDone} of {UNITS.length} lessons</span>
          <span className="stat">✏️ Script: day {jr.day} of {JOURNEY_DAYS}</span>
        </div>
        <button className="btn primary" style={{ justifySelf: "start" }} onClick={() => go("kid")}><Sparkles /> Continue learning</button>
      </div>

      <ProgramPlan child={child} compact onOpen={() => go("plan")} />

      {u && (
        <div className="card">
          <div className="card-head"><span className="label">{pace.thisWeek ? "Next week's lesson" : "This week's lesson"}</span><span className="small muted">{pace.thisWeek ? "This week's is done ✓ · or start early" : "15 to 20 minutes"}</span></div>
          <h3>{u.icon} Lesson {unitNo(u)}: {u.en} <span className="kn" style={{ fontWeight: 500 }}>{u.kn}</span></h3>
          <p className="muted" style={{ margin: 0 }}>{u.goal}</p>
          <ul className="phrase-list">{u.phrases.slice(0, 4).map(([kn, rom, en]) => (
            <li key={kn}><button className="icon-btn hear" onClick={() => playWord(kn, voiceLib)} aria-label={`Hear ${en}`}><Volume2 size={18} /></button><div><b className="kn">{kn}</b><span className="small muted">{rom} · {en}</span></div></li>
          ))}</ul>
          <button className="btn yellow" style={{ justifySelf: "start" }} onClick={() => go("kid", "unit", String(unitNo(u)))}>Start lesson {unitNo(u)}</button>
        </div>
      )}

      <div className="grid2">
        <div className="card">
          <h3>Make it stick</h3>
          <ul className="list">
            <li><span aria-hidden="true" style={{ fontSize: 22 }}>⏱️</span><div className="grow"><b>A little every day</b><div className="sub">One lesson or one letter day. The streak counts days, not minutes.</div></div></li>
            <li><span aria-hidden="true" style={{ fontSize: 22 }}>🗣️</span><div className="grow"><b>Use one phrase with a real person</b><div className="sub">Family, a friend, the next Kannada speaker you meet. Mistakes are welcome.</div></div></li>
            <li><Languages size={22} /><div className="grow"><b>Talk both ways</b><div className="sub">Speak English and hear Kannada, or let a relative speak Kannada and hear it in English.</div></div><button className="btn ghost small" onClick={() => go("kid", "say")}>Open</button></li>
            <li><Keyboard size={22} /><div className="grow"><b>Add a Kannada keyboard</b><div className="sub">iPhone: Settings → General → Keyboard → Add → Kannada. Android: Gboard → Languages → Kannada.</div></div></li>
          </ul>
        </div>
        <div className="card">
          <h3>Also for you</h3>
          <ul className="list">
            <li><span aria-hidden="true" style={{ fontSize: 22 }}>✏️</span><div className="grow"><b>Letter journey</b><div className="sub">{L >= 3 ? "Part of your level" : "Optional for now"}: {JOURNEY_DAYS} short lessons from ಅ to ಒತ್ತಕ್ಷರ.</div></div><button className="btn ghost small" onClick={() => go("kid", "journey")}>Open</button></li>
            <li><BookOpen size={22} /><div className="grow"><b>Stories</b><div className="sub">Read aloud with English help, then answer questions.</div></div><button className="btn ghost small" onClick={() => go("kid", "stories")}>Open</button></li>
            <li><MessageCircle size={22} /><div className="grow"><b>Ask the teacher</b><div className="sub">{reply ? "The teacher replied to your practice. See Messages." : "Your recordings reach the teacher; message any time."}</div></div><button className="btn ghost small" onClick={() => go("messages")}>Open</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
