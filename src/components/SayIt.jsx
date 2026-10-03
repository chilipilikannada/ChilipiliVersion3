import { useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2, Keyboard, Send, Trash2 } from "lucide-react";
import { store } from "../lib/store/index.js";
import { useWatch } from "../lib/hooks.js";
import { playWord, playUrl, useRecorder, canRecord, stopAudio } from "../lib/audio.js";
import { translate, transcribe, serverEarsKnown, speakEnglish, useListen, canListen } from "../lib/voice.js";
import { Gini } from "./Art.jsx";
import MicHelp from "./MicHelp.jsx";

// Talk both ways: speak English and hear Kannada, or speak Kannada and hear English.
// Turns stack up like a chat, so a child and a grandparent can talk through it.
// Every phrase is saved for the learner and the teacher (who can record it in their own voice).
export default function SayIt({ child, profile, voiceLib = {}, kid = false, onSaid, demo = false, audience }) {
  const who = audience || (child && child.adult ? "adult" : "kid");
  const enEars = useListen("en-US");
  const knEars = useListen("kn-IN");
  const rec = useRecorder(30);
  const [talking, setTalking] = useState(null); // "en" | "kn" while listening
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [turns, setTurns] = useState([]);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState("");
  const endRef = useRef(null);
  const [phrases] = useWatch("phrases", child && profile ? (profile.role === "kid" ? [["childId", "==", child.id]] : [["parentEmails", "array-contains", profile.email]]) : null);
  const mine = (phrases || []).filter((p) => !child || p.childId === child.id).sort((a, b) => b.at - a.at).slice(0, 12);

  useEffect(() => { if (endRef.current && turns.length) endRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [turns.length]);

  function fail(e) {
    setErr(e.code === "offline" ? "The translator works on the live website." : e.code === "not_configured" || e.code === 501 ? "The translator isn't switched on yet. Try again soon!" : e.code === 429 ? e.message : e.message || "Something went wrong. Try again.");
  }

  async function run(text, from) {
    const t = String(text || "").trim();
    if (!t) { setErr("I didn't catch that. Try again, a little louder."); return; }
    setBusy("Translating…"); setErr("");
    try {
      const r = await translate(t, from, who);
      if (r.blocked) { setErr("Let's try something else to say!"); setBusy(""); return; }
      const dir = r.from || (from === "auto" ? (/[ಀ-೿]/.test(t) ? "kn" : "en") : from);
      const turn = { id: Date.now(), from: dir, heard: t, ...r };
      setTurns((x) => [...x, turn].slice(-20));
      if (dir === "en") playWord(r.kn, voiceLib); else speakEnglish(r.en);
      if (child && profile && !demo) store.add("phrases", { childId: child.id, parentEmails: child.parentEmails, en: r.en || "", kn: r.kn || "", roman: r.roman || "", from: dir, by: profile.uid, byName: profile.name || "", at: Date.now() }).catch(() => {});
      onSaid && onSaid(r);
    } catch (e) { fail(e); }
    setBusy("");
  }

  // English: the browser's own listening where it exists (fast, live words). Kannada: Google's speech
  // service on the server, which works on every phone; the browser's Kannada listening is the fallback.
  const useBrowserFor = (lang) => canListen() && (lang === "en" || serverEarsKnown() === false || !canRecord());
  function startTalk(lang) {
    stopAudio(); setErr(""); setTalking(lang);
    if (useBrowserFor(lang)) (lang === "en" ? enEars : knEars).start();
    else rec.start().then((ok) => { if (!ok) setTalking(null); });
  }
  function stopTalk() {
    if (!talking) return;
    if (useBrowserFor(talking)) (talking === "en" ? enEars : knEars).stop();
    else rec.stop();
  }
  // Browser listening finished
  const lastEars = useRef("");
  useEffect(() => {
    for (const [ears, lang] of [[enEars, "en"], [knEars, "kn"]]) {
      if (talking === lang && ears.final && !ears.listening) {
        const t = ears.text;
        setTalking(null);
        if (ears.error && !["nospeech"].includes(ears.error)) return;
        if (t && t !== lastEars.current) { lastEars.current = t; run(t, lang); }
        else if (!t) setErr("I didn't catch that. Tap and try again.");
        ears.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enEars.final, enEars.listening, knEars.final, knEars.listening]);
  // Recording finished: send to the server to listen
  useEffect(() => {
    if (!rec.blob || !talking) return;
    const lang = talking; setTalking(null);
    (async () => {
      setBusy(lang === "kn" ? "Listening to the Kannada…" : "Listening…");
      try {
        const r = await transcribe(rec.blob, lang);
        rec.reset();
        if (!r.text) { setBusy(""); setErr("I didn't catch that. Hold the phone close and try again."); return; }
        await run(r.text, r.lang || lang);
      } catch (e) {
        setBusy(""); rec.reset();
        if (canListen() && (e.code === "not_configured" || e.code === 501 || e.code === "not_enabled")) setErr("Tap the button again: I'll use this device's own listening.");
        else fail(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.blob]);

  const listening = !!talking && (enEars.listening || knEars.listening || rec.recording);
  const liveText = talking === "en" ? enEars.text : talking === "kn" ? knEars.text : "";
  const micErr = rec.error || (["denied", "dictation"].includes(enEars.error) && enEars.error) || (["denied", "dictation"].includes(knEars.error) && knEars.error);

  return (
    <div className="stack">
      <div className="kid-card say-box">
        <div className="talk-q">
          <Gini className="gini-s" mood={turns.length ? "cheer" : "happy"} />
          <div className="talk-bubble">
            <b>{kid ? "Talk both ways!" : "Talk both ways: English ⇄ ಕನ್ನಡ"}</b>
            <span className="small muted">Speak English, hear Kannada. Speak Kannada, hear English. Perfect for talking with Ajji and Tata.</span>
          </div>
        </div>

        {turns.length > 0 && (
          <div className="bridge">
            {turns.map((t) => <Turn key={t.id} t={t} voiceLib={voiceLib} practice={!demo && t.from === "en"} />)}
            <div ref={endRef} />
          </div>
        )}

        {busy && <p className="small muted" style={{ textAlign: "center", margin: 0 }}>{busy}</p>}
        {err && <p className="small" style={{ textAlign: "center", color: "var(--red-deep)", margin: 0 }}>{err}</p>}
        {micErr && <MicHelp error={micErr} onRetry={() => { rec.reset(); enEars.reset(); knEars.reset(); }} />}

        {!typing ? (
          <>
            <div className="bridge-mics">
              {["en", "kn"].map((lang) => {
                const on = talking === lang;
                return (
                  <button key={lang} className={`bridge-mic ${lang} ${on ? "on" : ""}`} disabled={!!busy || (!!talking && !on)} onClick={() => (on ? stopTalk() : startTalk(lang))} aria-label={on ? "Stop" : lang === "en" ? "Speak English" : "Speak Kannada"}>
                    <span className="bm-icon">{on ? <Square /> : <Mic />}</span>
                    <b>{on ? "Tap when done" : lang === "en" ? "Speak English" : "ಕನ್ನಡ ಮಾತಾಡಿ"}</b>
                    <small>{on ? (rec.recording ? `Listening… ${rec.seconds}s` : "Listening…") : lang === "en" ? "Hear it in Kannada" : "Speak Kannada · hear English"}</small>
                  </button>
                );
              })}
            </div>
            {listening && liveText && <p className="say-heard">“{liveText}”</p>}
            <button className="btn quiet small" style={{ justifySelf: "center" }} onClick={() => setTyping(true)}><Keyboard size={16} /> Type instead</button>
          </>
        ) : (
          <form className="row" onSubmit={(e) => { e.preventDefault(); const t = typed; setTyped(""); run(t, "auto"); }}>
            <input className="input" style={{ flex: 1, minWidth: 0 }} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type English or ಕನ್ನಡ" aria-label="What you want to say" maxLength={200} />
            <button className="btn primary" disabled={!!busy || !typed.trim()} aria-label="Translate"><Send size={18} /></button>
            {(canListen() || canRecord()) && <button type="button" className="icon-btn" onClick={() => setTyping(false)} aria-label="Speak instead"><Mic /></button>}
          </form>
        )}
        {turns.length > 1 && <button className="btn quiet small" style={{ justifySelf: "center" }} onClick={() => setTurns([])}><Trash2 size={14} /> Clear the conversation</button>}
      </div>

      {mine.length > 0 && (
        <div className="kid-card">
          <h3>{kid ? "My phrases" : "Saved phrases"}</h3>
          <ul className="sent-list">{mine.map((p) => (
            <li key={p.id}><button className="icon-btn" onClick={() => playWord(p.kn, voiceLib)} aria-label={`Hear ${p.en}`}><Volume2 size={18} /></button><div><b className="kn">{p.kn}</b><div className="small muted">{p.roman ? `${p.roman} · ` : ""}{p.en}</div></div></li>
          ))}</ul>
        </div>
      )}
    </div>
  );
}

function Turn({ t, voiceLib, practice }) {
  const rec = useRecorder(12);
  const kn = t.from === "kn";
  return (
    <div className={`turn ${kn ? "from-kn" : "from-en"}`}>
      <span className="turn-who">{kn ? "ಕನ್ನಡ → English" : "English → ಕನ್ನಡ"}</span>
      <span className="small muted turn-heard">{kn ? <><span className="kn">{t.kn || t.heard}</span>{t.roman ? ` · ${t.roman}` : ""}</> : `“${t.heard}”`}</span>
      {kn ? (
        <div className="turn-out"><b>{t.en}</b><button className="icon-btn hear" onClick={() => speakEnglish(t.en)} aria-label="Hear the English"><Volume2 size={18} /></button></div>
      ) : (
        <>
          <div className="turn-out"><b className="kn">{t.kn}</b><button className="icon-btn hear" onClick={() => playWord(t.kn, voiceLib)} aria-label="Hear the Kannada"><Volume2 size={18} /></button></div>
          {t.roman && <span className="say-roman">{t.roman}</span>}
        </>
      )}
      {t.words && t.words.length > 0 && (
        <div className="turn-words">{t.words.map((w, i) => (
          <button key={i} className="hint-chip" onClick={() => playWord(w[0], voiceLib)} title={w[2]}><span className="kn">{w[0]}</span> <small>{w[1]} · {w[2]}</small></button>
        ))}</div>
      )}
      {t.note && <span className="tiny muted">💡 {t.note}</span>}
      {practice && canRecord() && (
        <div className="row" style={{ gap: 8 }}>
          {rec.recording ? <button className="btn small ghost" onClick={rec.stop} aria-label="Stop"><Square size={14} /> Stop</button>
            : <button className="btn small ghost" onClick={rec.start} aria-label="Record yourself"><Mic size={14} /> Now you say it</button>}
          {rec.url && <button className="btn small quiet" onClick={() => playUrl(rec.url)} aria-label="Play my voice"><Volume2 size={14} /> Play mine</button>}
          {rec.url && <span className="small">🎉 Say it to someone today!</span>}
        </div>
      )}
    </div>
  );
}
