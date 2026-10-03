import { Lock } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import PacketView, { AlphabetChart } from "../../components/PacketView.jsx";
import HandIn from "../../components/HandIn.jsx";
import { childWeek, PLAN_WEEKS, isMeetWeek, packetNo, weekStart } from "../../lib/plan.js";
import { lesson, trackOf } from "../../lib/course.js";
import { fmtDate } from "../../lib/time.js";

export default function Packets({ fam }) {
  const { child, subs, voiceLib, strokeLib, packetFiles } = fam;
  const { route, go } = useApp();
  if (child.status !== "active") return <div className="card"><p>Packets open once the teacher approves {firstName(child.name)}.</p></div>;
  if (route[1] === "chart") return <div className="stack"><button className="btn quiet no-print" style={{ justifySelf: "start" }} onClick={() => go("packets")}>← Packets</button><AlphabetChart /></div>;
  const now = Math.max(1, childWeek(child));
  const w = Math.min(now, Math.max(1, +route[1] || now));
  const status = (n) => {
    if (n > now) return "locked";
    if (isMeetWeek(n)) return "meet";
    const s = subs.filter((x) => x.childId === child.id && x.week === n && x.kind === "packet");
    return s.some((x) => x.status === "reviewed") ? "reviewed" : s.length ? "sent" : n < now ? "missed" : "now";
  };
  return (
    <div className="stack">
      <div className="page-title no-print"><h1>Weekly packets</h1><p className="muted">Download the PDF, do it together, then hand in photos or a PDF. Three packets a month, then the month-end meet.</p></div>
      <button className="card no-print" onClick={() => go("packets", "chart")} style={{ border: 0, cursor: "pointer", textAlign: "left", gridTemplateColumns: "auto 1fr", display: "grid", alignItems: "center" }}>
        <b className="kn" style={{ fontSize: 30, color: "var(--red)", width: 56, textAlign: "center" }}>ಅಆ</b>
        <span><b>Alphabet chart</b><span className="small muted" style={{ display: "block" }}>Print the whole ಅಕ್ಷರಮಾಲೆ for the fridge.</span></span>
      </button>
      <div className="card no-print" style={{ padding: 12 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {Array.from({ length: PLAN_WEEKS }, (_, i) => i + 1).map((n) => {
            const st = status(n);
            const t = isMeetWeek(n) ? null : lesson(trackOf(child), packetNo(n)).pattern;
            return (
              <button key={n} disabled={st === "locked"} onClick={() => go("packets", String(n))} aria-pressed={n === w}
                style={{ flex: "none", minWidth: 96, border: n === w ? "3px solid var(--red)" : "2px solid var(--line)", borderRadius: 14, padding: "8px 10px", textAlign: "left", cursor: st === "locked" ? "default" : "pointer", opacity: st === "locked" ? 0.55 : 1,
                  background: st === "reviewed" || st === "sent" ? "var(--leaf-soft)" : st === "meet" ? "var(--sky-soft)" : "#fff" }}>
                <b style={{ display: "block", fontSize: 14 }}>Week {n}</b>
                <span className="tiny" style={{ display: "block", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t ? t.en.replace(/^Project: /, "") : <span className="kn">ಕೂಟ</span>}</span>
                <span className="tiny muted" style={{ display: "flex", alignItems: "center", gap: 4 }}>{st === "locked" ? <><Lock size={12} /> {fmtDate(weekStart(child, n))}</> : st === "meet" ? "Meet" : st === "reviewed" ? "Reviewed" : st === "sent" ? "Pages sent" : st === "now" ? "This week" : "Open"}</span>
              </button>
            );
          })}
        </div>
      </div>
      <PacketView child={child} week={w} voiceLib={voiceLib} strokeLib={strokeLib} packetFiles={packetFiles} onPractise={(k) => go("kid", k)} />
      {!isMeetWeek(w) && <div className="no-print"><HandIn child={child} week={w} subs={subs} /></div>}
    </div>
  );
}
