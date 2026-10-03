import { useState } from "react";
import { Check, Send } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Avatar, Btn, Empty, StoredImage, StoredAudio, VoiceRecorder, Modal, BlobAudio } from "../../components/ui.jsx";
import { Gini } from "../../components/Art.jsx";
import { REACT, StoredFileLink } from "../../components/HandIn.jsx";
import { ago } from "../../lib/time.js";
import { lesson, trackOf } from "../../lib/course.js";
import { packetNo, isMeetWeek } from "../../lib/plan.js";
import { audioExt } from "../../lib/audio.js";
import { friendlyError } from "../../App.jsx";

export default function Review({ data }) {
  const queue = data.subs.filter((s) => s.status === "sent").sort((a, b) => a.at - b.at);
  const done = data.subs.filter((s) => s.status === "reviewed").sort((a, b) => (b.reviewedAt || 0) - (a.reviewedAt || 0)).slice(0, 10);
  return (
    <div className="stack">
      <div className="page-title"><h1>Review</h1><p className="muted">Oldest first. One tap to react; add a line or a voice note if you like. Families see it straight away.</p></div>
      {queue.length ? queue.map((s) => <ReviewCard key={s.id} s={s} child={data.children.find((c) => c.id === s.childId)} />)
        : <div className="card"><Empty art={<Gini className="gini" mood="cheer" />} title="All caught up!">Paper pages, speaking recordings and Talk answers land here as children do them.</Empty></div>}
      {done.length > 0 && (
        <div className="card">
          <h3>Recently reviewed</h3>
          <ul className="list">{done.map((s) => { const c = data.children.find((x) => x.id === s.childId); return <li key={s.id}><Avatar name={c ? c.name : "?"} size="sm" /><div className="grow"><b>{c ? c.name : "Child"}</b> <span className="sub">· {s.kind === "packet" ? "pages" : s.kind} week {s.week}</span>{s.feedback && <div className="sub">{s.feedback}</div>}</div><span className="pill green">{REACT[s.reaction] || "Reviewed"}</span></li>; })}</ul>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ s, child }) {
  const { profile, say } = useApp();
  const [reaction, setReaction] = useState(3);
  const [feedback, setFeedback] = useState("");
  const [voice, setVoice] = useState(null);
  const [zoom, setZoom] = useState(null);
  const theme = child && !isMeetWeek(s.week) ? lesson(trackOf(child), packetNo(s.week)).pattern : null;

  async function send() {
    try {
      let feedbackAudio = null;
      if (voice) { feedbackAudio = `feedback/${s.childId}/${Date.now()}.${audioExt(voice.type)}`; await store.upload(feedbackAudio, voice); }
      await store.update("submissions", s.id, { status: "reviewed", reaction, feedback: feedback.trim(), feedbackAudio, reviewedBy: profile.name, reviewedAt: Date.now() });
      say(`Sent to ${child ? firstName(child.name) : "the"}'s family.`);
    } catch (e) { say(friendlyError(e), true); }
  }
  const imgs = (s.files || []).filter((f) => /^image/.test(f.type));
  const auds = (s.files || []).filter((f) => /^audio/.test(f.type));
  const other = (s.files || []).filter((f) => !/^image|^audio/.test(f.type));
  return (
    <div className="card">
      <div className="row"><Avatar name={child ? child.name : "?"} /><div className="grow" style={{ flex: 1 }}><b>{child ? child.name : "A child"}</b><div className="sub small muted">{s.kind === "speaking" ? "Speaking with Gini" : s.kind === "talk" ? "Talked with Gini (answers out loud)" : s.kind === "reading" ? "Read a story aloud" : s.kind === "story" ? `Wrote a story · week ${s.week}` : s.kind === "family" ? `Wrote for family · ${s.note || ""}` : `Pages · week ${s.week}${theme ? ` · ${theme.en}` : ""}`} · {ago(s.at)}</div></div></div>
      {imgs.length > 0 && <div className="photos">{imgs.map((f) => <button className="ph" key={f.path} onClick={() => setZoom(f.path)} aria-label="Enlarge photo"><StoredImage path={f.path} alt="" /></button>)}</div>}
      {auds.map((f) => <div key={f.path} className="stack-s"><span className="tiny muted">{f.name}</span><StoredAudio path={f.path} /></div>)}
      {other.length > 0 && <div className="row">{other.map((f) => <StoredFileLink key={f.path} file={f} />)}</div>}
      {s.note && <p className="small" style={{ background: "var(--paper)", borderRadius: 12, padding: "8px 10px" }}>“{s.note}”</p>}
      <div className="choices">{[3, 2, 1].map((r) => <label className="choice" key={r}><input type="radio" name={`r${s.id}`} checked={reaction === r} onChange={() => setReaction(r)} /><span>{REACT[r]}</span></label>)}</div>
      <div className="field"><label htmlFor={`f${s.id}`} className="tiny">A line for the family (optional)</label><input id={`f${s.id}`} value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={500} placeholder="Lovely neat ಅ! Keep practising ಆ." /></div>
      <VoiceRecorder onDone={(b) => setVoice(b)} />
      {voice && <BlobAudio blob={voice} />}
      <Btn kind="primary" icon={Send} onClick={send}>Send</Btn>
      {zoom && <Modal title="Photo" onClose={() => setZoom(null)}><StoredImage path={zoom} alt="" style={{ borderRadius: 12 }} /></Modal>}
    </div>
  );
}
