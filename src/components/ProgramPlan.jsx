import { ArrowRight, Check, Star } from "lucide-react";
import { PLAN_WEEKS, isMeetWeek, childWeek, packetFor, monthFor } from "../lib/plan.js";
import { familyFor, knowFor, FAMILY_TALKS } from "../lib/family.js";
import { storyFor, STORIES } from "../lib/stories.js";
import { journeyOf, SECTIONS, JOURNEY_DAYS } from "../lib/journey.js";
import { levelOf, LEVELS, THEMES } from "../lib/course.js";
import { isAdult, UNITS, ADULT_LEVELS, adultLevelOf, doneUnits, nextUnit, unitNo, adultPace } from "../lib/adult.js";

// The whole six months for one learner: what they'll learn, what's done, what's next.
// compact: a strip of 6 months (or 4 grown-up levels) for home pages; otherwise the full plan.
export default function ProgramPlan({ child, compact = false, onOpen, onLesson }) {
  return isAdult(child) ? <AdultPlan child={child} compact={compact} onOpen={onOpen} onLesson={onLesson} /> : <KidPlan child={child} compact={compact} onOpen={onOpen} />;
}

const stateOf = (w, now) => (w < now ? "done" : w === now ? "now" : "later");

export function kidMonths(child) {
  const now = Math.max(1, childWeek(child));
  const level = levelOf(child);
  return Array.from({ length: 6 }, (_, i) => {
    const m = i + 1;
    const weeks = [1, 2, 3, 4].map((k) => {
      const w = i * 4 + k, meet = isMeetWeek(w), pk = packetFor(child, w);
      return { w, meet, pk, fam: familyFor(w), know: knowFor(w), story: level >= 3 ? storyFor(pk.n) : null, state: stateOf(w, now) };
    });
    return { m, info: monthFor(child, m), weeks, state: weeks.every((x) => x.state === "done") ? "done" : weeks.some((x) => x.state === "now") ? "now" : "later" };
  });
}

function KidPlan({ child, compact, onOpen }) {
  const now = Math.max(1, childWeek(child));
  const months = kidMonths(child);
  const j = journeyOf(child);
  const level = levelOf(child);
  if (compact) return (
    <div className="card plan-card">
      <div className="card-head"><h3>The 6-month plan</h3><span className="small muted">Week {Math.min(now, PLAN_WEEKS)} of {PLAN_WEEKS}</span></div>
      <div className="plan-months">{months.map((M) => (
        <button key={M.m} className={`plan-month ${M.state}`} onClick={onOpen}>
          <span className="pm-top"><b>Month {M.m}</b>{M.state === "done" ? <Check size={14} /> : M.state === "now" ? <Star size={14} /> : null}</span>
          <span className="pm-title">{M.info.en} <span className="kn">{M.info.kn}</span></span>
          <span className="pm-what">{M.weeks.filter((x) => !x.meet).map((x) => x.pk.pattern.en).join(" · ")}</span>
        </button>
      ))}</div>
      <div className="plan-journey" aria-label={`Letter journey: day ${j.day} of ${JOURNEY_DAYS}`}>
        {SECTIONS.map((s) => <span key={s.id} style={{ flex: s.to - s.from + 1 }} className={j.day > s.to ? "done" : j.day >= s.from ? "now" : ""}>{s.icon} {s.en}</span>)}
      </div>
      {onOpen && <button className="btn ghost small" style={{ justifySelf: "start" }} onClick={onOpen}>See everything in the plan <ArrowRight size={16} /></button>}
    </div>
  );
  return (
    <div className="stack">
      <div className="card">
        <h3>Everything in the program</h3>
        <ul className="plan-all">
          <li><b>18 sentence patterns</b><span>from "this is, that is" to telling a whole story</span></li>
          <li><b>18 word themes</b><span>{THEMES.slice(0, 18).map((t) => t.en).join(", ")}</span></li>
          <li><b>{JOURNEY_DAYS} letter-journey lessons</b><span>{SECTIONS.map((s) => `${s.en} (${s.kn})`).join(" → ")}</span></li>
          <li><b>{FAMILY_TALKS.length} family talks</b><span>talk with Amma, Appa, Ajji and Tata, then write for them</span></li>
          {level >= 3 && <li><b>{STORIES.length} stories</b><span>read aloud, answer, dictation, write your own</span></li>}
          <li><b>18 Know Karnataka cards</b><span>festivals, places, music and more, to talk about at home</span></li>
          <li><b>6 month-end meets</b><span>show what you learnt, and "Show Ajji"</span></li>
          <li><b>Every day</b><span>a 15-minute mission, Talk both ways, the words corner{level >= 3 ? ", the story corner" : ""}</span></li>
        </ul>
        <p className="small muted" style={{ margin: 0 }}>Level {level}: {LEVELS[level - 1].en}. Changing level changes the weeks below.</p>
      </div>
      <div className="card">
        <h3>Letter journey <span className="kn" style={{ fontWeight: 500 }}>ಅಕ್ಷರ ಪಯಣ</span></h3>
        <div className="plan-journey big">{SECTIONS.map((s) => <span key={s.id} style={{ flex: s.to - s.from + 1 }} className={j.day > s.to ? "done" : j.day >= s.from ? "now" : ""}>{s.icon} {s.en}<small>days {s.from} to {s.to}</small></span>)}</div>
        <span className="small muted">Day {j.day} of {JOURNEY_DAYS}, at your own pace (2 to 3 days a week finishes in time).</span>
      </div>
      {months.map((M) => (
        <div key={M.m} className={`card plan-month-full ${M.state}`}>
          <div className="card-head"><h3>Month {M.m}: {M.info.en} <span className="kn" style={{ fontWeight: 500 }}>{M.info.kn}</span></h3>{M.state === "now" && <span className="pill yellow">Now</span>}{M.state === "done" && <span className="pill green">Done</span>}</div>
          {M.info.script && <p className="small muted" style={{ margin: 0 }}>Letters: {M.info.script}</p>}
          <ul className="plan-weeks">{M.weeks.map((x) => (
            <li key={x.w} className={x.state}>
              <span className="pw-w">{x.state === "done" ? <Check size={14} /> : x.state === "now" ? <Star size={14} /> : null} Week {x.w}</span>
              {x.meet ? (
                <div><b>Month-end meet</b><span className="small muted">Review the month · {x.fam.pic} {x.fam.en}</span></div>
              ) : (
                <div>
                  <b>{x.pk.pattern.en} <span className="kn" style={{ fontWeight: 500 }}>{x.pk.pattern.kn}</span></b>
                  <span className="small">Words: {x.pk.theme.en} · {x.fam.pic} {x.fam.en}{x.story ? ` · 📖 ${x.story.en}` : ""}</span>
                  <span className="tiny muted">{x.know[0]} Know Karnataka: <span className="kn">{x.know[1]}</span></span>
                </div>
              )}
            </li>
          ))}</ul>
        </div>
      ))}
    </div>
  );
}

function AdultPlan({ child, compact, onOpen, onLesson }) {
  const done = doneUnits(child), L = adultLevelOf(child), next = nextUnit(child), pace = adultPace(child);
  const j = journeyOf(child);
  if (compact) return (
    <div className="card plan-card">
      <div className="card-head"><h3>Your course</h3><span className="small muted">Week {Math.min(pace.week, PLAN_WEEKS)} of {PLAN_WEEKS} · {pace.doneCount} of {UNITS.length} lessons</span></div>
      <div className="plan-months four">{ADULT_LEVELS.map((LV) => {
        const us = UNITS.filter((u) => u.level === LV.n), d = us.filter((u) => done[u.id]).length;
        const st = d === us.length ? "done" : LV.n === L ? "now" : "later";
        return (
          <button key={LV.n} className={`plan-month ${st}`} onClick={onOpen}>
            <span className="pm-top"><b>{LV.icon} Level {LV.n}</b>{st === "done" ? <Check size={14} /> : st === "now" ? <Star size={14} /> : null}</span>
            <span className="pm-title">{LV.en} <span className="kn">{LV.kn}</span></span>
            <span className="pm-what">{d} of {us.length} · {us.slice(0, 3).map((u) => u.en).join(", ")}…</span>
          </button>
        );
      })}</div>
      <div className="plan-journey" aria-label={`Letter journey: day ${j.day} of ${JOURNEY_DAYS}`}>{SECTIONS.map((s) => <span key={s.id} style={{ flex: s.to - s.from + 1 }} className={j.day > s.to ? "done" : j.day >= s.from ? "now" : ""}>{s.icon} {s.en}</span>)}</div>
      {onOpen && <button className="btn ghost small" style={{ justifySelf: "start" }} onClick={onOpen}>See every lesson <ArrowRight size={16} /></button>}
    </div>
  );
  return (
    <div className="stack">
      <div className="card">
        <h3>Everything in the course</h3>
        <ul className="plan-all">
          <li><b>{UNITS.length} conversation lessons</b><span>about one a week, all with your partner, family and friends</span></li>
          <li><b>{JOURNEY_DAYS} letter-journey lessons</b><span>{SECTIONS.map((s) => `${s.en} (${s.kn})`).join(" → ")}</span></li>
          <li><b>{STORIES.length} stories</b><span>read aloud with English help, then answer</span></li>
          <li><b>Word lists</b><span>colours, family, food, home, feelings and more</span></li>
          <li><b>Talk both ways</b><span>speak English, hear Kannada; or speak Kannada, hear English</span></li>
        </ul>
      </div>
      {ADULT_LEVELS.map((LV) => (
        <div key={LV.n} className={`card plan-month-full ${LV.n === L ? "now" : ""}`}>
          <div className="card-head"><h3>{LV.icon} Level {LV.n}: {LV.en} <span className="kn" style={{ fontWeight: 500 }}>{LV.kn}</span></h3>{LV.n === L && <span className="pill yellow">My level</span>}</div>
          <p className="small muted" style={{ margin: 0 }}>{LV.what}</p>
          <ul className="plan-weeks">{UNITS.filter((u) => u.level === LV.n).map((u) => {
            const st = done[u.id] ? "done" : next && next.id === u.id ? "now" : "later";
            return (
              <li key={u.id} className={st} onClick={onLesson ? () => onLesson(u) : undefined} style={onLesson ? { cursor: "pointer" } : undefined}>
                <span className="pw-w">{st === "done" ? <Check size={14} /> : st === "now" ? <Star size={14} /> : null} Lesson {unitNo(u)}</span>
                <div><b>{u.icon} {u.en} <span className="kn" style={{ fontWeight: 500 }}>{u.kn}</span></b><span className="small muted">{u.goal}</span></div>
              </li>
            );
          })}</ul>
        </div>
      ))}
    </div>
  );
}
