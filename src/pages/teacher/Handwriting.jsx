import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { useApp } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { ALPHABET } from "../../lib/content.js";
import { JOURNEY } from "../../lib/journey.js";
import { voiceKey } from "../../lib/audio.js";
import LetterPad from "../../components/LetterPad.jsx";
import { friendlyError } from "../../App.jsx";

const uniq = (a) => [...new Set(a)];
export const HAND_SETS = [
  { title: "Vowels", kn: "ಸ್ವರಗಳು", items: ALPHABET.vowels.map((v) => v[0]) },
  { title: "Consonants", kn: "ವ್ಯಂಜನಗಳು", items: ALPHABET.consonants.flat().map((c) => c[0]) },
  { title: "Vowel signs", kn: "ಕಾಗುಣಿತ", items: uniq([...JOURNEY.filter((d) => d.section === "signs").flatMap((d) => d.items), "ಕಿ", "ಕೀ", "ಕು", "ಕೂ", "ಕೆ", "ಕೇ", "ಕೈ", "ಕೊ", "ಕೋ", "ಕೌ", "ಹು", "ಹೂ", "ಗೊಂ"]) },
  { title: "Joined letters", kn: "ಒತ್ತಕ್ಷರ", items: uniq([...JOURNEY.filter((d) => d.section === "joined").flatMap((d) => d.items), "ಶ್ರ"]) },
];

// The teacher writes each letter once; children watch it, trace it, and are checked against it.
export default function Handwriting({ data }) {
  const { strokeLib } = data;
  const { say, profile } = useApp();
  const [set, setSet] = useState(0);
  const [sel, setSel] = useState(HAND_SETS[0].items[0]);
  const [mode, setMode] = useState("record");
  const [ver, setVer] = useState(0);
  const key = voiceKey(sel);
  const rec = strokeLib[key];
  const count = (s) => s.items.filter((t) => strokeLib[voiceKey(t)]).length;

  async function save({ strokes, aspect }) {
    try {
      await store.set("strokes", key, { text: sel, aspect, strokes, by: profile.uid, byName: profile.name, at: Date.now() });
      say(`Saved how to write ${sel}.`); setMode("watch"); setVer((v) => v + 1);
      const items = HAND_SETS[set].items, i = items.indexOf(sel);
      const next = items.slice(i + 1).find((t) => !strokeLib[voiceKey(t)]);
      if (next) setTimeout(() => { setSel(next); setMode("record"); }, 900);
    } catch (e) { say(friendlyError(e), true); }
  }
  async function remove() {
    try { await store.remove("strokes", key); say(`Removed ${sel}.`); setMode("record"); } catch (e) { say(friendlyError(e), true); }
  }

  return (
    <div className="stack">
      <div className="page-title"><h1>My handwriting</h1><p className="muted">Write each letter once, slowly, over the grey shape, the way you teach it. Children then watch your strokes, see a green start dot and arrows, and get checked on your order and direction.</p></div>
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {HAND_SETS.map((s, i) => <button key={s.title} className="chip" aria-pressed={i === set} onClick={() => { setSet(i); setSel(s.items[0]); setMode(strokeLib[voiceKey(s.items[0])] ? "watch" : "record"); }} style={{ flex: "none" }}>{s.title} <span className="tiny">{count(s)}/{s.items.length}</span></button>)}
        </div>
      </div>
      <div className="grid2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-head"><h3 className="kn" style={{ fontSize: 34 }}>{sel}</h3>
            <div className="seg">
              <button aria-pressed={mode === "record"} onClick={() => setMode("record")}>{rec ? "Rewrite" : "Write it"}</button>
              <button aria-pressed={mode === "watch"} disabled={!rec} onClick={() => setMode("watch")}>Play</button>
            </div>
          </div>
          {mode === "record" && <p className="small muted" style={{ margin: 0 }}>Each time you lift your finger or pen starts a new stroke. Undo removes the last one.</p>}
          <LetterPad key={sel + mode + ver} text={sel} mode={mode} record={rec} onSave={save} maxHeight={320} />
          {rec && <div className="row"><span className="pill green"><Check size={14} /> Recorded {rec.strokes.length} {rec.strokes.length === 1 ? "stroke" : "strokes"}</span><span className="spacer" /><button className="btn quiet small" onClick={remove}><Trash2 size={16} /> Remove</button></div>}
        </div>
        <div className="card">
          <h3>{HAND_SETS[set].title} <span className="kn muted" style={{ fontWeight: 400 }}>{HAND_SETS[set].kn}</span></h3>
          <div className="letter-grid">
            {HAND_SETS[set].items.map((t) => {
              const has = !!strokeLib[voiceKey(t)];
              return <button key={t} className={`lg-cell kn ${t === sel ? "on" : ""} ${has ? "has" : ""}`} onClick={() => { setSel(t); setMode(has ? "watch" : "record"); }} aria-label={`${t}${has ? ", recorded" : ""}`}>{t}{has && <Check className="lg-check" size={14} />}</button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
