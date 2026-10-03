import { useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, FileText, AudioLines, Megaphone } from "lucide-react";
import { useApp } from "../../lib/hooks.js";
import { PLAN_WEEKS, isMeetWeek, packetNo, monthOfWeek } from "../../lib/plan.js";
import { lesson, TRACKS, LEVELS, levelPatch } from "../../lib/course.js";
import { storyFor, STORIES } from "../../lib/stories.js";
import { familyFor, knowFor, FAMILY_TALKS, KNOW } from "../../lib/family.js";
import { JOURNEY_DAYS } from "../../lib/journey.js";
import { UNITS } from "../../lib/adult.js";
import { MONTHS } from "../../lib/content.js";

// The whole 6-month course on one page, with a check that nothing repeats.
export default function CoursePlan() {
  const { go } = useApp();
  const [lv, setLv] = useState(2);
  const [who, setWho] = useState("kids");
  const P = levelPatch(lv);
  const rows = useMemo(() => Array.from({ length: PLAN_WEEKS }, (_, i) => {
    const w = i + 1, meet = isMeetWeek(w), n = packetNo(w);
    const L = meet ? null : lesson(P.track, n, P.pace);
    return { w, meet, n, month: monthOfWeek(w), L, story: storyFor(n), fam: familyFor(w), know: knowFor(w) };
  }), [lv]);
  const lessonRows = rows.filter((r) => !r.meet);
  const uniq = (xs) => new Set(xs).size;
  const checks = [
    ["Weeks in the plan", PLAN_WEEKS, PLAN_WEEKS === 24],
    ["Lesson weeks with a new sentence pattern", `${uniq(lessonRows.map((r) => r.L.pattern.en))} of ${lessonRows.length}`, uniq(lessonRows.map((r) => r.L.pattern.en)) === lessonRows.length],
    ["Lesson weeks with a new word theme", `${uniq(lessonRows.map((r) => r.L.theme.en))} of ${lessonRows.length}`, uniq(lessonRows.map((r) => r.L.theme.en)) === lessonRows.length],
    ["Lesson weeks with a new family talk", `${uniq(lessonRows.map((r) => r.fam.id))} of ${lessonRows.length}`, uniq(lessonRows.map((r) => r.fam.id)) === lessonRows.length],
    ["Lesson weeks with a new story (levels 3 and 4)", `${uniq(lessonRows.map((r) => r.story.id))} of ${lessonRows.length}`, uniq(lessonRows.map((r) => r.story.id)) === lessonRows.length],
    ["Lesson weeks with a new Know Karnataka card", `${uniq(lessonRows.map((r) => r.know[1]))} of ${lessonRows.length}`, uniq(lessonRows.map((r) => r.know[1])) === lessonRows.length],
    ["Letter journey (self-paced, 2 to 3 days a week)", `${JOURNEY_DAYS} days`, JOURNEY_DAYS >= 40],
    ["Grown-up lessons (about one a week)", `${UNITS.length} lessons`, UNITS.length >= 24],
  ];
  return (
    <div className="stack">
      <div className="page-title"><h1>Course plan</h1><p className="muted" style={{ margin: 0 }}>Six months, week by week. This is exactly what the app gives each learner.</p></div>

      <div className="card">
        <h3>Is it really six months?</h3>
        <ul className="setup-list">{checks.map(([label, val, ok]) => (
          <li key={label} className={ok ? "ok" : "no"}>{ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}<div><b>{label}</b> <span className="muted">· {val}</span></div></li>
        ))}</ul>
        <p className="small muted" style={{ margin: 0 }}>Each week: 6 daily missions (about 15 minutes), a printable packet, one family talk with writing, and the letter journey. Every 4th week is a month-end meet with a review week and "Show Ajji". Keen learners can start the next week early, so a fast child may finish sooner; slower ones can take longer.</p>
      </div>

      <div className="card">
        <div className="row">
          <div className="chips">{[["kids", "Children"], ["adults", "Grown-ups"]].map(([k, l]) => <button key={k} className={`chip ${who === k ? "on" : ""}`} onClick={() => setWho(k)}>{l}</button>)}</div>
          {who === "kids" && <div className="chips">{LEVELS.map((L) => <button key={L.n} className={`chip ${lv === L.n ? "on" : ""}`} onClick={() => setLv(L.n)}>{L.icon} Level {L.n}</button>)}</div>}
        </div>
        {who === "kids" ? (
          <div style={{ overflowX: "auto" }}>
            <table className="plan-table">
              <thead><tr><th>Week</th><th>This week</th><th>Words</th><th>Family talk + writing</th>{lv >= 3 && <th>Story</th>}<th>Know Karnataka</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.w} className={r.meet ? "meet" : ""}>
                  <td><b>{r.w}</b><div className="tiny muted">Month {r.month}</div></td>
                  <td>{r.meet ? <><b>Month-end meet</b><div className="tiny muted">Review: {MONTHS[r.month - 1] ? MONTHS[r.month - 1].en : ""}</div></> : <><b>{r.L.pattern.en}</b> <span className="kn small">{r.L.pattern.kn}</span></>}</td>
                  <td>{r.meet ? "Review" : <>{r.L.theme.en} <span className="kn small">{r.L.theme.kn}</span></>}</td>
                  <td>{r.fam.pic} {r.fam.en}</td>
                  {lv >= 3 && <td>{r.story.pic} {r.story.en}{r.meet ? " (retell)" : ""}</td>}
                  <td>{r.know[0]} <span className="kn small">{r.know[1]}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <p className="small muted">Grown-ups get one new lesson a week (they can go ahead early). A learner who starts at a higher level starts further down this list. Between lessons: role-play review, 2 to 3 letter-journey days, stories and Talk both ways.</p>
            <table className="plan-table">
              <thead><tr><th>Week</th><th>Lesson</th><th>Level</th></tr></thead>
              <tbody>{UNITS.map((u, i) => (
                <tr key={u.id}><td><b>{i + 1}</b></td><td>{u.icon} {u.en} <span className="kn small">{u.kn}</span><div className="tiny muted">{u.goal}</div></td><td>{u.level}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Adding extra</h3>
        <ul className="list">
          <li><FileText size={22} /><div className="grow"><b>Your own worksheets for any week</b><div className="sub">Upload a PDF or photo under Packets. Families see it with that week's packet.</div></div><button className="btn ghost small" onClick={() => go("sheets")}>Packets</button></li>
          <li><AudioLines size={22} /><div className="grow"><b>Your voice for any word or sentence</b><div className="sub">Record it once under My voice; it replaces the computer voice everywhere.</div></div><button className="btn ghost small" onClick={() => go("voice")}>My voice</button></li>
          <li><Megaphone size={22} /><div className="grow"><b>A song, rhyme or video for everyone</b><div className="sub">Post it in the class feed with a photo or link.</div></div><button className="btn ghost small" onClick={() => go("feed")}>Class feed</button></li>
          <li><span aria-hidden="true" style={{ fontSize: 22 }}>➕</span><div className="grow"><b>More weeks or new content</b><div className="sub">New family talks, stories, lessons or months 7 to 12 live in the app's content files ({FAMILY_TALKS.length} family talks, {STORIES.length} stories, {KNOW.length} Know cards, {UNITS.length} grown-up lessons today). See "Adding content" in the README.</div></div></li>
        </ul>
      </div>
    </div>
  );
}
