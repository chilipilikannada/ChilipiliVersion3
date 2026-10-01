import { useState } from "react";
import { Send, FileText } from "lucide-react";
import { store } from "../lib/store/index.js";
import { useApp } from "../lib/hooks.js";
import { compressImage, safeName } from "../lib/files.js";
import { audioExt } from "../lib/audio.js";
import { PhotoPicker, FilePreview, VoiceRecorder, Btn, StoredImage, StoredAudio, BlobAudio } from "./ui.jsx";
import { useUrl } from "../lib/hooks.js";
import { fmtDate } from "../lib/time.js";
import { friendlyError } from "../App.jsx";

export const REACT = { 3: "Great work!", 2: "Good effort", 1: "Let's practise more" };

// Hand in the finished packet: photos from the camera, a voice note, a short note.
export default function HandIn({ child, week, subs }) {
  const { profile, say } = useApp();
  const [files, setFiles] = useState([]);
  const [voice, setVoice] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const sent = subs.filter((s) => s.childId === child.id && s.week === week && s.kind === "packet").sort((a, b) => b.at - a.at);

  async function send() {
    if (!files.length && !voice) return say("Add a photo of the finished pages first.", true);
    setBusy(true);
    try {
      const out = [];
      for (const f0 of files) {
        if (f0.size > 20 * 1024 * 1024) throw new Error(`${f0.name} is too large (over 20 MB).`);
        const f0b = f0.type ? f0 : new File([f0], f0.name, { type: /\.pdf$/i.test(f0.name) ? "application/pdf" : "image/jpeg" });
        const f = await compressImage(f0b);
        const path = `handins/${child.id}/${Date.now()}_${safeName(f.name)}`;
        await store.upload(path, f); out.push({ path, type: f.type, name: f.name });
      }
      if (voice) {
        const path = `handins/${child.id}/${Date.now()}_voice.${audioExt(voice.type)}`;
        await store.upload(path, voice); out.push({ path, type: voice.type || "audio/webm", name: "Voice note" });
      }
      await store.add("submissions", { childId: child.id, parentEmails: child.parentEmails, kind: "packet", week, files: out, note: note.trim(), status: "sent", by: profile.uid, byName: profile.name, at: Date.now() });
      setFiles([]); setVoice(null); setNote("");
      say(`Week ${week} handed in. Your teacher will reply here.`);
    } catch (e) { say(friendlyError(e), true); }
    setBusy(false);
  }

  return (
    <div className="card">
      <h3>Hand in week {week}</h3>
      {sent.map((s) => <Submitted key={s.id} s={s} />)}
      <p className="muted small">Take a photo of each finished page, or upload a PDF (a scan, or the packet filled in on an iPad). Add a voice note if your child wants to say something to the teacher.</p>
      <PhotoPicker onFiles={(f) => setFiles((x) => [...x, ...f.filter((y) => /^image\//.test(y.type) || y.type === "application/pdf" || /\.pdf$/i.test(y.name))])} label="Upload photos or PDF" />
      <FilePreview files={files} onRemove={(i) => setFiles((x) => x.filter((_, j) => j !== i))} />
      <VoiceRecorder onDone={(b) => setVoice(b)} />
      {voice && <BlobAudio blob={voice} />}
      <div className="field"><label htmlFor={`hn${week}`}>Note for the teacher (optional)</label><input id={`hn${week}`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="She did the tracing all by herself" /></div>
      <Btn kind="primary" icon={Send} onClick={send} disabled={busy}>{busy ? "Sending…" : "Send to teacher"}</Btn>
    </div>
  );
}

export function Submitted({ s }) {
  return (
    <div className="stack-s" style={{ background: "var(--paper)", borderRadius: 14, padding: 12 }}>
      <div className="card-head"><b>Sent {fmtDate(s.at)}</b><span className={`pill ${s.status === "reviewed" ? "green" : "yellow"}`}>{s.status === "reviewed" ? REACT[s.reaction] || "Reviewed" : "With the teacher"}</span></div>
      <div className="photos">{(s.files || []).filter((f) => /^image/.test(f.type)).map((f) => <div className="ph" key={f.path}><StoredImage path={f.path} alt={f.name} /></div>)}</div>
      {(s.files || []).filter((f) => f.type === "application/pdf").map((f) => <StoredFileLink key={f.path} file={f} />)}
      {(s.files || []).filter((f) => /^audio/.test(f.type)).map((f) => <StoredAudio key={f.path} path={f.path} />)}
      {s.note && <p className="small">“{s.note}”</p>}
      {s.status === "reviewed" && (s.feedback || s.feedbackAudio) && (
        <div style={{ background: "var(--leaf-soft)", borderRadius: 12, padding: 10 }} className="stack-s">
          <b className="small" style={{ color: "var(--leaf)" }}>{s.reviewedBy || "Teacher"}</b>
          {s.feedback && <p>{s.feedback}</p>}
          {s.feedbackAudio && <StoredAudio path={s.feedbackAudio} />}
        </div>
      )}
    </div>
  );
}

// Opens a stored PDF (hand-ins, teacher sheets).
export function StoredFileLink({ file }) {
  const url = useUrl(file.path);
  return <a className="file-chip" href={url || undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!url}><FileText size={18} /> <span>{file.name || "PDF"}</span></a>;
}
