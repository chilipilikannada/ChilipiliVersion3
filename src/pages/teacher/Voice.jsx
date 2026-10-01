import { useMemo, useState } from "react";
import { Mic, Square, Play, Check, RotateCcw, Save } from "lucide-react";
import { useApp } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Btn } from "../../components/ui.jsx";
import { ALPHABET } from "../../lib/content.js";
import { PATTERNS, PROJECTS } from "../../lib/course.js";
import { voiceKey, useRecorder, canRecord, playWord, playUrl, audioExt } from "../../lib/audio.js";
import { friendlyError } from "../../App.jsx";

// The teacher records each word once; children hear this voice in Listen, Play and Speak.
export default function Voice({ data }) {
  const { voiceLib } = data;
  const [sel, setSel] = useState(0);
  const sets = useMemo(() => [
    ...[...PATTERNS, ...PROJECTS].map((p, i) => ({
      title: i < PATTERNS.length ? `${i + 1} · ${p.en}` : p.en, kn: p.kn,
      items: [
        ...p.words.map((w) => ({ text: w[0], rom: w[1], en: w[2], pic: w[3] })),
        ...p.model.map((m) => ({ text: m[0], rom: m[1], en: m[2], pic: "💬" })),
        ...p.build.map((b) => ({ text: b[0], rom: "", en: b[1], pic: "🧩" })),
        ...p.ladder.slice(1).map((b) => ({ text: b[0], rom: "", en: b[1], pic: "🪜" })),
      ].filter((x, j, a) => a.findIndex((y) => y.text === x.text) === j),
    })),
    { title: "Vowels", kn: "ಸ್ವರಗಳು", items: ALPHABET.vowels.map(([v, r]) => ({ text: v, rom: r, en: "", pic: "" })) },
    { title: "Consonants", kn: "ವ್ಯಂಜನಗಳು", items: ALPHABET.consonants.flat().map(([v, r]) => ({ text: v, rom: r, en: "", pic: "" })) },
  ], []);
  const done = (s) => s.items.filter((x) => voiceLib[voiceKey(x.text)]).length;
  const set = sets[sel];
  return (
    <div className="stack">
      <div className="page-title"><h1>My voice</h1><p className="muted">Record each word and sentence once. Children hear you, not a robot, in Listen, Play, Speak and Build. Words first, then the 💬 sentences of the week; 🧩 and 🪜 are the Build sentences.</p></div>
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {sets.map((s, i) => { const d = done(s); return (
            <button key={s.title} className="chip" aria-pressed={i === sel} onClick={() => setSel(i)} style={{ flex: "none" }}>{s.title} <span className="tiny">{d}/{s.items.length}</span></button>
          ); })}
        </div>
      </div>
      <div className="card">
        <h3>{set.title} <span className="kn muted" style={{ fontWeight: 400 }}>{set.kn}</span></h3>
        <ul className="list">{set.items.map((x) => <WordRow key={x.text} x={x} lib={voiceLib} />)}</ul>
      </div>
      {!canRecord() && <p className="small muted">This browser can't record directly, so the mic button opens your phone's voice recorder instead.</p>}
    </div>
  );
}

function WordRow({ x, lib }) {
  const { say, profile } = useApp();
  const r = useRecorder(14);
  const [saving, setSaving] = useState(false);
  const has = !!lib[voiceKey(x.text)];
  async function save() {
    setSaving(true);
    try {
      const key = voiceKey(x.text);
      const path = `voice/${key}_${Date.now()}.${audioExt(r.blob.type)}`;
      await store.upload(path, r.blob);
      await store.set("voice", key, { text: x.text, path, by: profile.uid, byName: profile.name, at: Date.now() });
      r.reset(); say(`Saved ${x.text}.`);
    } catch (e) { say(friendlyError(e), true); }
    setSaving(false);
  }
  return (
    <li>
      <span style={{ fontSize: 28, width: 40, textAlign: "center" }} aria-hidden="true">{x.pic}</span>
      <div className="grow"><b className="kn" style={{ fontSize: x.text.length > 12 ? 18 : 22 }}>{x.text}</b>{(x.rom || x.en) && <div className="sub">{[x.rom, x.en].filter(Boolean).join(" · ")}</div>}</div>
      {has && !r.blob && <button className="icon-btn" onClick={() => playWord(x.text, lib)} aria-label={`Play ${x.text}`}><Play /></button>}
      {has && !r.blob && <span className="pill green hide-s"><Check size={14} /> Recorded</span>}
      {r.recording ? <Btn kind="primary" size="small" icon={Square} onClick={r.stop}>{r.seconds}s</Btn>
        : r.blob ? <>
          <button className="icon-btn" onClick={() => playUrl(r.url)} aria-label="Play recording"><Play /></button>
          <button className="icon-btn" onClick={r.reset} aria-label="Record again"><RotateCcw /></button>
          <Btn kind="primary" size="small" icon={Save} onClick={save} disabled={saving}>Save</Btn>
        </> : <Btn kind={has ? "ghost" : "yellow"} size="small" icon={Mic} onClick={r.start}>{has ? "Redo" : "Record"}</Btn>}
    </li>
  );
}
