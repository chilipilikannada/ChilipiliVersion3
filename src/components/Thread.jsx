import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { store } from "../lib/store/index.js";
import { useApp } from "../lib/hooks.js";
import { fmtTime } from "../lib/time.js";
import { audioExt } from "../lib/audio.js";
import { VoiceRecorder, StoredAudio, BlobAudio } from "./ui.jsx";
import { friendlyError } from "../App.jsx";

// Conversation about one child, between the family and the teacher. Text or voice notes.
export default function Thread({ child, messages, emptyText }) {
  const { profile, say } = useApp();
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(null);
  const end = useRef(null);
  const list = useMemo(() => messages.filter((m) => m.childId === child.id).sort((a, b) => a.at - b.at), [messages, child.id]);
  useEffect(() => { end.current && end.current.scrollIntoView({ block: "end" }); }, [list.length]);

  async function send(e) {
    e && e.preventDefault();
    if (!text.trim() && !voice) return;
    try {
      let audioPath = null;
      if (voice) {
        audioPath = `messages/${child.id}/${Date.now()}.${audioExt(voice.type)}`;
        await store.upload(audioPath, voice);
      }
      await store.add("messages", { childId: child.id, parentEmails: child.parentEmails, from: profile.uid, fromName: profile.name, fromRole: profile.role, text: text.trim(), audioPath, at: Date.now() });
      setText(""); setVoice(null);
    } catch (err) { say(friendlyError(err), true); }
  }

  return (
    <div className="stack">
      <div className="thread">
        {list.length === 0 && <p className="muted" style={{ textAlign: "center" }}>{emptyText || "No messages yet. Say ನಮಸ್ಕಾರ!"}</p>}
        {list.map((m) => (
          <div key={m.id} className={`msg ${m.from === profile.uid ? "me" : "them"}`}>
            {m.text}
            {m.audioPath && <StoredAudio path={m.audioPath} />}
            <small>{m.from === profile.uid ? "You" : m.fromName} · {fmtTime(m.at)}</small>
          </div>
        ))}
        <div ref={end} />
      </div>
      {voice && <div className="row"><BlobAudio blob={voice} /><button className="btn quiet" onClick={() => setVoice(null)}>Remove</button></div>}
      <form className="composer" onSubmit={send}>
        <VoiceRecorder compact onDone={(blob) => setVoice(blob)} />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" aria-label="Message" maxLength={1000} />
        <button type="submit" className="round-btn send" aria-label="Send"><Send /></button>
      </form>
    </div>
  );
}
