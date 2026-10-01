import { useRef, useState } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { useApp } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import PacketView from "../../components/PacketView.jsx";
import { StoredFileLink } from "../../components/HandIn.jsx";
import { TRACKS, TRACK_KEYS, lesson } from "../../lib/course.js";
import { PLAN_WEEKS, isMeetWeek, packetNo } from "../../lib/plan.js";
import { isoLocal } from "../../lib/time.js";
import { compressImage, safeName } from "../../lib/files.js";
import { friendlyError } from "../../App.jsx";

// Preview every path's packets, download them, and add your own sheets to any week.
export default function Sheets({ data }) {
  const { voiceLib, strokeLib, packetFiles } = data;
  const { say, profile } = useApp();
  const [track, setTrack] = useState("start");
  const [week, setWeek] = useState(1);
  const [title, setTitle] = useState("");
  const [forTrack, setForTrack] = useState("all");
  const [busy, setBusy] = useState(false);
  const pick = useRef(null);
  const preview = { id: "preview", name: "", startDate: isoLocal(), track };
  const mine = packetFiles.filter((f) => +f.week === week).sort((a, b) => a.at - b.at);

  async function upload(files) {
    setBusy(true);
    try {
      for (const f0 of files) {
        if (!(/^image\//.test(f0.type) || f0.type === "application/pdf")) throw new Error(`${f0.name}: please choose a PDF or an image.`);
        if (f0.size > 20 * 1024 * 1024) throw new Error(`${f0.name} is over 20 MB.`);
        const f = await compressImage(f0, 2400);
        const path = `packets/${week}_${Date.now()}_${safeName(f.name)}`;
        await store.upload(path, f);
        await store.add("packetFiles", { week, track: forTrack, title: title.trim() || f0.name.replace(/\.\w+$/, ""), name: f.name, path, type: f.type, by: profile.uid, at: Date.now() });
      }
      setTitle(""); say(`Added to week ${week}. Families see it on that week's packet.`);
    } catch (e) { say(friendlyError(e), true); }
    setBusy(false);
  }

  return (
    <div className="stack">
      <div className="page-title"><h1>Packets</h1><p className="muted">Every family gets a packet for their path each week, as a PDF. Preview any of them here, and add your own worksheets to a week.</p></div>
      <div className="card" style={{ gap: 10 }}>
        <div className="choices">{TRACK_KEYS.map((k) => <label className="choice" key={k}><input type="radio" name="sheet-track" checked={track === k} onChange={() => setTrack(k)} /><span>{TRACKS[k].icon} {TRACKS[k].en}</span></label>)}</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {Array.from({ length: PLAN_WEEKS }, (_, i) => i + 1).map((n) => (
            <button key={n} className="chip" aria-pressed={n === week} onClick={() => setWeek(n)} style={{ flex: "none" }} title={isMeetWeek(n) ? "Meet week" : lesson(track, packetNo(n)).pattern.en}>
              {isMeetWeek(n) ? `Wk ${n} · meet` : `Wk ${n}`}{packetFiles.some((f) => +f.week === n) ? " 📎" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Your sheets for week {week}</h3>
        {mine.length ? <ul className="list">{mine.map((f) => (
          <li key={f.id}><FileText size={20} /><div className="grow"><b>{f.title}</b><div className="sub">{f.track === "all" ? "All paths" : TRACKS[f.track] ? TRACKS[f.track].en : f.track}</div></div>
            <StoredFileLink file={{ ...f, name: "Open" }} />
            <button className="icon-btn" aria-label={`Remove ${f.title}`} onClick={async () => { try { await store.remove("packetFiles", f.id); say("Removed."); } catch (e) { say(friendlyError(e), true); } }}><Trash2 size={18} /></button>
          </li>))}</ul> : <p className="muted small">None yet. Families still get the full packet PDF; anything you add here appears under it as an extra sheet.</p>}
        <div className="grid2" style={{ alignItems: "end" }}>
          <div className="field"><label htmlFor="sh-t">Title (optional)</label><input id="sh-t" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Colouring sheet: ಆನೆ" maxLength={80} /></div>
          <div className="field"><label htmlFor="sh-p">For</label><select id="sh-p" value={forTrack} onChange={(e) => setForTrack(e.target.value)}><option value="all">All paths</option>{TRACK_KEYS.map((k) => <option key={k} value={k}>{TRACKS[k].en}</option>)}</select></div>
        </div>
        <button className="btn yellow" style={{ justifySelf: "start" }} disabled={busy} onClick={() => pick.current.click()}><Upload size={18} /> {busy ? "Uploading…" : "Add a PDF or image"}</button>
        <input ref={pick} type="file" accept="application/pdf,image/*" multiple hidden onChange={(e) => { const fs = [...e.target.files]; e.target.value = ""; if (fs.length) upload(fs); }} />
      </div>

      <PacketView child={preview} week={week} voiceLib={voiceLib} strokeLib={strokeLib} packetFiles={packetFiles} />
    </div>
  );
}
