import { useState } from "react";
import { Printer, Download, FileText, Volume2, PenLine, Puzzle } from "lucide-react";
import { SKILLS, SKILL, ALPHABET } from "../lib/content.js";
import { TRACKS, LETTER_WORD, SOUND } from "../lib/course.js";
import { packetFor, weekStart, PLAN_WEEKS, isMeetWeek, packetNo } from "../lib/plan.js";
import { fmtDate, DAY } from "../lib/time.js";
import { playWord } from "../lib/audio.js";
import { saveFile } from "../lib/files.js";
import { useApp } from "../lib/hooks.js";
import { store } from "../lib/store/index.js";
import { friendlyError } from "../App.jsx";

// The weekly packet on screen, the PDF download, and any sheets the teacher added.
export default function PacketView({ child, week, voiceLib, strokeLib, packetFiles = [], onPractise }) {
  const { say, school } = useApp();
  const [busy, setBusy] = useState(false);
  const pk = packetFor(child, week);
  const from = weekStart(child, week), to = from + 6 * DAY;
  const T = TRACKS[pk.track];
  const extras = packetFiles.filter((f) => +f.week === +week && (!f.track || f.track === "all" || f.track === pk.track));

  async function download() {
    setBusy(true);
    try {
      const { packetPdf, packetFileName } = await import("../lib/packetPdf.js");
      const bytes = await packetPdf({ child, pk, strokeLib, school: school.schoolName });
      const r = await saveFile(packetFileName(child, week), bytes, "application/pdf");
      if (r === "saved") say("Packet saved. Open it to print, or fill it in on a tablet.");
    } catch (e) { say(friendlyError(e), true); }
    setBusy(false);
  }

  if (pk.meet) {
    return (
      <div className="card">
        <span className="label">Week {week} of {PLAN_WEEKS} · month {pk.month} ends</span>
        <h3>Month-end meet week <span className="kn">ಕೂಟ</span></h3>
        <p>No new packet this week. Get ready to show the teacher what you learnt:</p>
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>
          <li>Write this month's letters from memory on one page.</li>
          <li>{pk.track === "start" ? "Say 3 sentences you learnt this month." : pk.track === "write" ? "Write 5 sentences using this month's patterns." : "Bring this month's writing and read your best piece aloud."}</li>
          <li>Bring this month's packets, or have the photos ready.</li>
        </ol>
        <ExtraSheets extras={extras} />
      </div>
    );
  }
  const P = pk.pattern, U = pk.unit;
  return (
    <div className="card packet">
      <div className="card-head">
        <div>
          <span className="label">Week {week} of {PLAN_WEEKS} · packet {packetNo(week)} · {fmtDate(from)} to {fmtDate(to)}</span>
          <h3 style={{ fontSize: 26, marginTop: 4 }}>{P.en} <span className="kn" style={{ fontWeight: 500 }}>{P.kn}</span></h3>
          <span className="pill yellow">{T.icon} {T.en} path</span>
        </div>
      </div>
      <div className="dl-bar">
        <button className="btn primary" onClick={download} disabled={busy}><Download size={18} /> {busy ? "Making your PDF…" : "Download packet (PDF)"}</button>
        <span className="small muted">Tracing sheets, sentence pages and a grown-ups' page with answers. Print it, or fill it in on an iPad.</span>
      </div>
      <ExtraSheets extras={extras} />

      <div className="stack-s">
        <div className="card-head"><span className="label">Letters · {U.en}</span>{onPractise && <button className="btn ghost small" onClick={() => onPractise("write")}><PenLine size={16} /> Trace on screen</button>}</div>
        <div className="letters-row">
          {(U.items || []).map((t) => (
            <button key={t} className="lchip kn" onClick={() => voiceLib && playWord(t, voiceLib)} aria-label={t}>
              <b>{t}</b>{SOUND[t] ? <small>{SOUND[t]}</small> : null}{LETTER_WORD[t] ? <small className="kn">{LETTER_WORD[t][0]}</small> : null}
            </button>
          ))}
        </div>
        {U.tip && <p className="small" style={{ margin: 0 }}>💡 {U.tip}</p>}
      </div>

      <div className="stack-s">
        <div className="card-head"><span className="label">Sentences of the week · {P.focus}</span>{onPractise && <button className="btn ghost small" onClick={() => onPractise("build")}><Puzzle size={16} /> Build them</button>}</div>
        <ul className="sent-list">
          {P.model.map(([kn, rom, en]) => (
            <li key={kn}>
              <button className="icon-btn" onClick={() => voiceLib && playWord(kn, voiceLib)} aria-label={`Hear ${en}`}><Volume2 size={18} /></button>
              <div><b className="kn">{kn}</b><div className="small muted">{rom} · {en}</div></div>
            </li>
          ))}
        </ul>
        {pk.track !== "start" && (
          <details className="ladder-box">
            <summary>Make it longer (the sentence ladder)</summary>
            <ol>{P.ladder.map(([kn, en]) => <li key={kn}><span className="kn">{kn}</span> <span className="small muted">{en}</span></li>)}</ol>
          </details>
        )}
      </div>

      <div className="acts">
        {SKILLS.map((k) => (
          <div className={`act ${k}`} key={k}>
            <span className="label" style={{ color: "inherit" }}>{SKILL[k].en}</span>
            <h4>{pk.tasks[k].title}</h4>
            <ol>{pk.tasks[k].steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </div>
        ))}
      </div>
      {pk.track !== "start" && (
        <details className="ladder-box">
          <summary>For grown-ups: this week's dictation</summary>
          <p className="small muted" style={{ margin: "6px 0" }}>Read each sentence slowly, twice. Your child writes it on the dictation lines in the PDF.</p>
          <ol>{P.dictation.map((d) => <li key={d} className="kn">{d}</li>)}</ol>
        </details>
      )}
      <p className="tiny muted">About 15 minutes a day. Week {Math.ceil(week / 4) * 4} is the month-end meet. Hand in photos or a PDF of the finished pages below.</p>
    </div>
  );
}

function ExtraSheets({ extras }) {
  const { say } = useApp();
  if (!extras.length) return null;
  async function open(f) {
    try { const u = await store.url(f.path); if (u) window.open(u, "_blank", "noopener"); } catch (e) { say(friendlyError(e), true); }
  }
  return (
    <div className="stack-s">
      <span className="label">Extra sheets from your teacher</span>
      <div className="row">{extras.map((f) => <button key={f.id} className="btn ghost small" onClick={() => open(f)}><FileText size={16} /> {f.title || f.name}</button>)}</div>
    </div>
  );
}

export function AlphabetChart() {
  return (
    <div className="card alphabet">
      <div className="card-head"><div><span className="label">Stick it on the fridge</span><h3 style={{ fontSize: 26 }}>ಕನ್ನಡ ಅಕ್ಷರಮಾಲೆ · Kannada alphabet</h3></div>
        <button className="btn ghost small no-print" onClick={() => window.print()}><Printer size={18} /> Print</button></div>
      <span className="label">ಸ್ವರಗಳು · Vowels</span>
      <div className="abc">{ALPHABET.vowels.map(([k, r]) => <span key={k}><b className="kn">{k}</b><small>{r}</small></span>)}</div>
      <span className="label">ವ್ಯಂಜನಗಳು · Consonants</span>
      {ALPHABET.consonants.map((row, i) => <div className="abc" key={i}>{row.map(([k, r]) => <span key={k}><b className="kn">{k}</b><small>{r}</small></span>)}</div>)}
    </div>
  );
}

export const weekLabel = (w) => (isMeetWeek(w) ? "Meet week" : `Packet ${packetNo(w)}`);
