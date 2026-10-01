import { useMemo } from "react";
import { Mail, Download } from "lucide-react";
import { useApp } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Avatar, Btn, Empty } from "../../components/ui.jsx";
import { Gini, STAGE_EMOJI } from "../../components/Art.jsx";
import { SKILLS, SKILL, STAGES } from "../../lib/content.js";
import { PLAN_WEEKS } from "../../lib/plan.js";
import { buildSummary, summaryCSV } from "../../lib/summary.js";
import { saveFile } from "../../lib/files.js";
import { notifyServer } from "../../lib/config.js";
import { ago } from "../../lib/time.js";

// Where every child is: stages vs goals, and this week's effort.
export default function Summary({ data }) {
  const { go, say } = useApp();
  const s = useMemo(() => buildSummary({ children: data.children, activity: data.activity, subs: data.subs }), [data.children, data.activity, data.subs]);
  const max = Math.max(1, ...SKILLS.flatMap((k) => s.dist[k]));

  async function emailMe() {
    if (store.mode !== "cloud") return say("Emails work once the app is live on Vercel with Firebase.", true);
    const r = await notifyServer({ type: "summary" });
    if (r && r.sent) say("Summary sent to your email.");
    else say(r && (r.skipped || r.error) ? `Couldn't send: ${r.skipped || r.error}` : "Couldn't send the email.", true);
  }
  async function csv() {
    const r = await saveFile(`chilipili-class-${new Date().toISOString().slice(0, 10)}.csv`, summaryCSV(s), "text/csv");
    if (r === "unavailable") say("Downloads aren't available here.", true);
  }

  return (
    <div className="stack">
      <div className="page-title"><h1>Class summary</h1><p className="muted">Where every child is, their 6-month goal, and this week's effort. You also get this by email every Monday.</p></div>
      <div className="row">
        <Btn kind="primary" icon={Mail} onClick={emailMe}>Email me this summary</Btn>
        <Btn kind="ghost" icon={Download} onClick={csv}>Download spreadsheet</Btn>
      </div>
      {s.total === 0 ? <div className="card"><Empty art={<Gini className="gini" />} title="No children yet">Once families join, you'll see every child's level here.</Empty></div> : <>
        <div className="tiles4">
          <Stat n={s.total} label="children" />
          <Stat n={`${s.handedIn}/${s.total}`} label="packets handed in this week" />
          <Stat n={s.weekActs} label="activities with Gini this week" />
          <Stat n={s.quiet.length} label="quiet for 7 days" warn={s.quiet.length > 0} />
        </div>

        <div className="card">
          <h3>Where the class is</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="dist">
              <thead><tr><th />{STAGES.map((st, L) => <th key={L}><span style={{ fontSize: 20 }}>{STAGE_EMOJI[L]}</span><br />{st.en}</th>)}</tr></thead>
              <tbody>{SKILLS.map((k) => (
                <tr key={k}><th>{SKILL[k].en}</th>{s.dist[k].map((n, L) => (
                  <td key={L}><div className="bar" style={{ opacity: n ? 1 : 0.35 }}><i style={{ height: `${(n / max) * 100}%` }} /></div><b className="num">{n || ""}</b></td>
                ))}</tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Child by child</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="kids">
              <thead><tr><th>Child</th>{SKILLS.map((k) => <th key={k}>{SKILL[k].en}</th>)}<th>This week</th></tr></thead>
              <tbody>{s.rows.map((r) => (
                <tr key={r.id} onClick={() => go("families", r.id)} style={{ cursor: "pointer" }}>
                  <td><div className="row" style={{ flexWrap: "nowrap" }}><Avatar name={r.name} size="sm" /><div><b>{r.name}</b><div className="tiny muted">age {r.age} · week {r.week}/{PLAN_WEEKS}{r.confirmed ? "" : " · estimate"}</div></div></div></td>
                  {SKILLS.map((k) => <td key={k}><span style={{ fontSize: 18 }}>{STAGE_EMOJI[r.stages[k] || 0]}</span> {STAGES[r.stages[k] || 0].en}<div className="tiny muted">goal {STAGES[r.goals[k] ?? 0].en}</div></td>)}
                  <td><b className="num">{r.weekActs}</b> activities · {r.weekStars} ⭐<div className="tiny" style={{ color: r.handedIn ? "var(--leaf)" : "var(--red-deep)" }}>{r.handedIn ? "packet in" : r.meetWeek ? "meet week" : "no packet yet"}{r.lastActive ? ` · ${ago(r.lastActive)}` : ""}</div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </>}
    </div>
  );
}

function Stat({ n, label, warn }) {
  return <div className="card" style={{ gap: 2 }}><b style={{ fontFamily: "var(--f-display)", fontSize: 30, lineHeight: 1, color: warn ? "var(--red)" : "var(--ink)" }} className="num">{n}</b><span className="small muted">{label}</span></div>;
}
