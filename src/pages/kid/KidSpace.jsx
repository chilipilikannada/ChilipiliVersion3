import { useEffect, useMemo, useRef, useState } from "react";
import { Headphones, Gamepad2, Mic, PenLine, Puzzle, Star, Flame, ArrowLeft, ArrowRight, Volume2, Heart, Check, RotateCcw, Square, Play, Send, Trophy, Lock, Eye } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Gini, Skyline, STAGE_EMOJI } from "../../components/Art.jsx";
import LetterPad from "../../components/LetterPad.jsx";
import { kidWeek, childWeek, PLAN_WEEKS, isMeetWeek } from "../../lib/plan.js";
import { STAGES, SKILLS, SKILL } from "../../lib/content.js";
import { TRACKS, tiles, SOUND, LETTER_WORD } from "../../lib/course.js";
import { playWord, playUrl, stopAudio, hasDeviceVoice, voiceKey, useRecorder, canRecord, audioExt } from "../../lib/audio.js";
import { isoLocal } from "../../lib/time.js";
import { friendlyError } from "../../App.jsx";

const ACTS = [
  ["listen", "Listen", "ಕೇಳು", Headphones],
  ["play", "Play", "ಆಡು", Gamepad2],
  ["speak", "Speak", "ಮಾತಾಡು", Mic],
  ["write", "Write", "ಬರೆ", PenLine],
  ["build", "Build", "ವಾಕ್ಯ ಕಟ್ಟು", Puzzle],
];
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function KidSpace({ fam }) {
  const { child, voiceLib, strokeLib } = fam;
  const { route, go, say, profile } = useApp();
  const sub = route[1] || "";
  const wk = useMemo(() => kidWeek(child), [child]);
  const done = (child.weekDone || {})[wk.week] || {};
  const nm = firstName(child.name);

  async function earn(kind, stars, extra = {}, detail = {}) {
    try {
      const today = isoLocal();
      const y = isoLocal(Date.now() - 864e5);
      const st = child.streak || { count: 0, last: "" };
      const streak = st.last === today ? st : { count: st.last === y ? st.count + 1 : 1, last: today };
      const weekDone = { ...(child.weekDone || {}), [wk.week]: { ...done, [kind]: true } };
      await store.add("activity", { childId: child.id, parentEmails: child.parentEmails, kind, week: wk.week, stars, ...detail, at: Date.now() });
      await store.update("children", child.id, { stars: (child.stars || 0) + stars, streak, weekDone, lastActive: Date.now(), ...extra });
    } catch (e) { say(friendlyError(e), true); }
  }

  if (child.status !== "active") {
    return <KidFrame child={child} onExit={() => go("home")}><div className="kid-card" style={{ textAlign: "center", justifyItems: "center" }}><Gini className="gini" /><h2>Almost ready!</h2><p>Your teacher is getting your space ready.</p></div></KidFrame>;
  }

  const props = { child, wk, voiceLib, strokeLib, earn, back: () => { stopAudio(); go("kid"); }, say, profile, go, sub: route[2] };
  const n = Object.keys(done).length;
  return (
    <KidFrame child={child} onExit={() => { stopAudio(); go("home"); }}>
      {sub === "listen" ? <Listen {...props} /> :
        sub === "play" ? <PlayGame {...props} /> :
          sub === "speak" ? <Speak {...props} /> :
            sub === "write" ? <Write {...props} /> :
              sub === "build" ? <Build {...props} /> :
                sub === "stars" ? <Stars {...props} /> :
                  <>
                    <div className="kid-hello">
                      <Gini className="gini" mood="cheer" />
                      <div className="bubble">
                        <h1><span className="kn">ನಮಸ್ಕಾರ</span> {nm}!</h1>
                        <p>{wk.meet ? "It's meet week! Practise for your teacher." : <>This week: <b>{wk.pattern.en}</b> <span className="kn">{wk.pattern.kn}</span> and <b>{wk.unit.en}</b></>}</p>
                      </div>
                    </div>
                    <div className="tiles five">
                      {ACTS.map(([k, en, kn, I]) => (
                        <button key={k} className={`tile ${k}`} onClick={() => go("kid", k)}>
                          {done[k] && <span className="done"><Check /></span>}
                          <I /><b>{en}</b><small>{kn}</small>
                        </button>
                      ))}
                    </div>
                    <button className="kid-card" style={{ border: 0, cursor: "pointer", textAlign: "left", gridTemplateColumns: "auto 1fr auto", alignItems: "center", display: "grid" }} onClick={() => go("kid", "stars")}>
                      <Trophy size={36} color="#e0a100" />
                      <div><b style={{ fontSize: 20 }}>My stars, letters and birds</b><div className="muted small">{n} of 5 done this week</div></div>
                      <ArrowRight />
                    </button>
                  </>}
    </KidFrame>
  );
}

function KidFrame({ child, onExit, children }) {
  const [hold, setHold] = useState(0);
  const t = useRef(null);
  function down() { let p = 0; t.current = setInterval(() => { p += 10; setHold(p); if (p >= 100) { clearInterval(t.current); setHold(0); onExit(); } }, 80); }
  function up() { clearInterval(t.current); setHold(0); }
  return (
    <div className="kid">
      <div className="skyline-bg"><Skyline color="#b3261e" sun="#c8102e" /></div>
      <div className="kid-in">
        <div className="kid-top">
          <button className="btn ghost small" onPointerDown={down} onPointerUp={up} onPointerLeave={up} onKeyDown={(e) => e.key === "Enter" && onExit()} aria-label="Grown-ups: press and hold to leave"
            style={{ background: `linear-gradient(90deg, var(--yellow-soft) ${hold}%, #fff ${hold}%)` }}>
            {hold ? "Keep holding…" : "Grown-ups"}
          </button>
          <span className="spacer" />
          <span className="stat"><Star size={20} color="#e0a100" fill="#ffc72c" /> {child.stars || 0}</span>
          <span className="stat"><Flame size={20} /> {(child.streak && child.streak.count) || 0}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function Head({ back, title, kn }) {
  return <div className="kid-back"><button className="icon-btn" style={{ background: "#fff" }} onClick={back} aria-label="Back"><ArrowLeft /></button><h2>{title} <span className="kn" style={{ fontWeight: 500 }}>{kn}</span></h2></div>;
}

function Celebrate({ stars, text, back, again }) {
  return (
    <div className="kid-card celebrate">
      <Gini className="gini" mood="cheer" />
      <div className="stars-burst">{"⭐".repeat(Math.max(1, stars))}</div>
      <h2><span className="kn">ಶಭಾಷ್!</span> {text}</h2>
      <div className="row" style={{ justifyContent: "center" }}>
        {again && <button className="btn ghost" onClick={again}><RotateCcw size={18} /> Again</button>}
        <button className="btn primary" onClick={back}>Back home</button>
      </div>
    </div>
  );
}

const audible = (text, lib) => !!(lib[voiceKey(text)] || hasDeviceVoice());
const HearBtn = ({ text, lib, say, big }) => (
  <button className={big ? "big-round red" : "icon-btn hear"} onClick={async () => { const r = await playWord(text, lib); if (!r) say("Your teacher hasn't recorded this yet. Ask a grown-up to read it with you!"); }} aria-label="Hear it"><Volume2 /></button>
);

/* ---------- Listen: words, then this week's sentences ---------- */
function Listen({ wk, voiceLib, earn, back, say }) {
  const cards = useMemo(() => [
    ...wk.words.map((w) => ({ kn: w[0], rom: w[1], en: w[2], pic: w[3] })),
    ...wk.pattern.model.map((m) => ({ kn: m[0], rom: m[1], en: m[2], sentence: true })),
  ], [wk]);
  const [i, setI] = useState(0);
  const [finished, setFinished] = useState(false);
  const c = cards[i];
  useEffect(() => { if (audible(c.kn, voiceLib)) playWord(c.kn, voiceLib); /* eslint-disable-next-line */ }, [i]);
  function next() {
    if (i + 1 < cards.length) setI(i + 1);
    else if (!finished) { setFinished(true); earn("listen", 1); }
  }
  if (finished) return <Celebrate stars={1} text="You listened to everything!" back={back} again={() => { setI(0); setFinished(false); }} />;
  return (
    <>
      <Head back={back} title="Listen" kn="ಕೇಳು" />
      <div className="kid-card">
        <div className="dots">{cards.map((_, j) => <i key={j} className={j <= i ? "on" : ""} />)}</div>
        <div className="flash">
          {c.sentence ? <span className="pill yellow">Sentence of the week</span> : <div className="pic" aria-hidden="true">{c.pic}</div>}
          <div className={`knw ${c.sentence ? "sentence" : ""}`}>{c.kn}</div>
          <div className="rom">{c.rom}</div>
          <div className="en">{c.en}</div>
        </div>
        <div className="row" style={{ justifyContent: "center", gap: 18 }}>
          <button className="icon-btn" style={{ width: 60, height: 60, background: "#fff", border: "2px solid var(--line)" }} disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Previous"><ArrowLeft /></button>
          <HearBtn text={c.kn} lib={voiceLib} say={say} big />
          <button className="icon-btn" style={{ width: 60, height: 60, background: "var(--yellow)" }} onClick={next} aria-label="Next"><ArrowRight /></button>
        </div>
        {!audible(c.kn, voiceLib) && <p className="small muted" style={{ textAlign: "center" }}>Say it together with a grown-up: <b>{c.rom}</b></p>}
      </div>
    </>
  );
}

/* ---------- Play: words to pictures (first steps), sentences to meanings (others) ---------- */
function PlayGame({ wk, voiceLib, earn, back, say }) {
  const sentences = wk.track !== "start";
  const ROUNDS = 6;
  const make = () => {
    if (!sentences) {
      const words = wk.words;
      return Array.from({ length: ROUNDS }, (_, r) => {
        const target = words[r % words.length];
        const others = shuffle(words.filter((x) => x !== target)).slice(0, 3);
        return { kn: target[0], answer: target[2], options: shuffle([target, ...others]).map((o) => ({ label: o[2], pic: o[3] })) };
      }).sort(() => Math.random() - 0.5);
    }
    const pool = [...wk.pattern.model.map((m) => [m[0], m[2]]), ...wk.pattern.build, ...wk.pattern.ladder];
    const uniq = pool.filter((p, i) => pool.findIndex((q) => q[0] === p[0]) === i);
    return shuffle(uniq).slice(0, ROUNDS).map((t) => {
      const others = shuffle(uniq.filter((x) => x[1] !== t[1])).slice(0, 2);
      return { kn: t[0], answer: t[1], options: shuffle([t, ...others]).map((o) => ({ label: o[1] })) };
    });
  };
  const [rounds, setRounds] = useState(make);
  const [r, setR] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [pick, setPick] = useState(null);
  const [end, setEnd] = useState(null);
  const cur = rounds[r];
  const hear = audible(cur.kn, voiceLib);
  useEffect(() => { if (!end && hear) playWord(cur.kn, voiceLib); /* eslint-disable-next-line */ }, [r, end]);
  function choose(o) {
    if (pick) return;
    const ok = o.label === cur.answer;
    setPick({ o: o.label, ok });
    const h = ok ? hearts : hearts - 1;
    if (!ok) setHearts(h);
    setTimeout(() => {
      setPick(null);
      if (h <= 0) { setEnd({ win: false }); return; }
      if (r + 1 >= rounds.length) { setEnd({ win: true, stars: h }); earn("play", h); return; }
      setR(r + 1);
    }, ok ? 700 : 1200);
  }
  function again() { setRounds(make()); setR(0); setHearts(3); setEnd(null); }
  if (end) return end.win ? <Celebrate stars={end.stars} text={`${end.stars} hearts left!`} back={back} again={again} /> :
    <div className="kid-card celebrate"><Gini className="gini" mood="think" /><h2>Nearly! Let's try again.</h2><div className="row" style={{ justifyContent: "center" }}><button className="btn primary" onClick={again}><RotateCcw size={18} /> Try again</button><button className="btn ghost" onClick={back}>Back home</button></div></div>;
  return (
    <>
      <Head back={back} title="Play" kn="ಆಡು" />
      <div className="kid-card">
        <div className="card-head"><div className="hearts">{[0, 1, 2].map((i) => <Heart key={i} fill={i < hearts ? "currentColor" : "none"} />)}</div><span className="label">Round {r + 1} of {rounds.length}</span></div>
        <div style={{ textAlign: "center" }} className="stack-s">
          <p className="muted">{sentences ? "Read (or listen), then tap what it means" : hear ? "Listen, then tap the right picture" : "Read the word, then tap the right picture"}</p>
          {(sentences || !hear) && <div className="kn" style={{ fontSize: sentences ? "clamp(24px,6vw,34px)" : 54, color: "var(--red-deep)", fontWeight: 600, lineHeight: 1.4 }}>{cur.kn}</div>}
          {hear && <div style={{ display: "grid", justifyItems: "center" }}><button className="big-round red" onClick={() => playWord(cur.kn, voiceLib)} aria-label="Hear it again"><Volume2 /></button></div>}
        </div>
        <div className={sentences ? "picks list1" : "picks"}>
          {cur.options.map((o) => (
            <button key={o.label} className={`pick ${sentences ? "text" : ""} ${pick && pick.o === o.label ? (pick.ok ? "right" : "wrong") : ""} ${pick && !pick.ok && o.label === cur.answer ? "right" : ""}`} onClick={() => choose(o)} aria-label={o.label}>
              {o.pic && <span aria-hidden="true">{o.pic}</span>}<small>{o.label}</small>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- Speak: hear it, say it, compare, send to the teacher ---------- */
function Speak({ child, wk, voiceLib, earn, back, say, profile }) {
  const items = useMemo(() => {
    const ws = wk.words.map((w) => ({ kn: w[0], rom: w[1], pic: w[3] }));
    const ss = wk.pattern.model.map((m) => ({ kn: m[0], rom: m[1], en: m[2], sentence: true }));
    if (wk.track === "start") return [...ws.slice(0, (child.age || 7) <= 6 ? 2 : 3), ss[0]];
    if (wk.track === "write") return [ws[0], ...ss.slice(0, 3)];
    return [...ss, { kn: wk.pattern.ladder[wk.pattern.ladder.length - 1][0], rom: "", en: wk.pattern.ladder[wk.pattern.ladder.length - 1][1], sentence: true }];
  }, [wk, child.age]);
  const [i, setI] = useState(0);
  const [clips, setClips] = useState({});
  const [sent, setSent] = useState(false);
  const [finished, setFinished] = useState(false);
  const rec = useRecorder(15);
  const file = useRef(null);
  const w = items[i];
  const live = canRecord() && rec.error !== "unsupported";
  useEffect(() => { if (rec.blob) setClips((c) => ({ ...c, [i]: rec.blob })); /* eslint-disable-next-line */ }, [rec.blob]);
  useEffect(() => { rec.reset(); /* eslint-disable-next-line */ }, [i]);
  const [mine, setMine] = useState(null);
  useEffect(() => { if (!clips[i]) { setMine(null); return; } const u = URL.createObjectURL(clips[i]); setMine(u); return () => URL.revokeObjectURL(u); }, [clips, i]);

  async function sendToTeacher() {
    try {
      const files = [];
      for (const [k, b] of Object.entries(clips)) {
        const path = `speaking/${child.id}/${Date.now()}_${k}.${audioExt(b.type)}`;
        await store.upload(path, b); files.push({ path, type: b.type || "audio/webm", name: items[k].rom || items[k].en || "recording" });
      }
      await store.add("submissions", { childId: child.id, parentEmails: child.parentEmails, kind: "speaking", week: wk.week, files, note: `Said: ${Object.keys(clips).map((k) => items[k].kn).join(" / ")}`, status: "sent", by: profile.uid, byName: profile.name, at: Date.now() });
      setSent(true); say("Sent to your teacher!");
    } catch (e) { say(friendlyError(e), true); }
  }

  if (finished) return (
    <div className="kid-card celebrate">
      <Gini className="gini" mood="cheer" /><div className="stars-burst">⭐⭐</div>
      <h2><span className="kn">ಶಭಾಷ್!</span> You said {Object.keys(clips).length} {Object.keys(clips).length === 1 ? "thing" : "things"}!</h2>
      {Object.keys(clips).length > 0 && !sent && <button className="btn yellow" onClick={sendToTeacher}><Send size={18} /> Send to my teacher</button>}
      {sent && <span className="pill green">Sent to your teacher</span>}
      <button className="btn primary" onClick={back}>Back home</button>
    </div>
  );
  return (
    <>
      <Head back={back} title="Speak" kn="ಮಾತಾಡು" />
      <div className="kid-card">
        <div className="dots">{items.map((_, j) => <i key={j} className={j <= i ? "on" : ""} />)}</div>
        <div className="flash">{w.pic && <div className="pic" aria-hidden="true">{w.pic}</div>}<div className={`knw ${w.sentence ? "sentence" : ""}`}>{w.kn}</div>{w.rom && <div className="rom">{w.rom}</div>}{w.en && <div className="en">{w.en}</div>}</div>
        <ol className="small" style={{ margin: "0 auto", paddingLeft: 20 }}><li>Listen to your teacher</li><li>Tap the mic and say it</li><li>Play yours and compare!</li></ol>
        <div className="row" style={{ justifyContent: "center", gap: 18 }}>
          <div style={{ display: "grid", justifyItems: "center", gap: 4 }}><HearBtn text={w.kn} lib={voiceLib} say={say} big /><span className="tiny">Teacher</span></div>
          <div style={{ display: "grid", justifyItems: "center", gap: 4 }}>
            {live ? (rec.recording
              ? <button className="big-round rec" onClick={rec.stop} aria-label="Stop"><Square /></button>
              : <button className="big-round green" onClick={rec.start} aria-label="Record"><Mic /></button>)
              : <button className="big-round green" onClick={() => file.current.click()} aria-label="Record"><Mic /></button>}
            <span className="tiny">{rec.recording ? `Recording… ${rec.seconds}s` : "Me"}</span>
            <input ref={file} type="file" accept="audio/*" capture="user" hidden onChange={(e) => { rec.useFile(e.target.files[0]); e.target.value = ""; }} />
          </div>
          <div style={{ display: "grid", justifyItems: "center", gap: 4 }}>
            <button className="big-round" style={{ background: mine ? "var(--sky)" : "#d9cdb8" }} disabled={!mine} onClick={() => playUrl(mine)} aria-label="Play my voice"><Play /></button><span className="tiny">Play mine</span>
          </div>
        </div>
        {rec.error === "denied" && <p className="small" style={{ textAlign: "center" }}>Ask a grown-up to allow the microphone for this website.</p>}
        <div className="row" style={{ justifyContent: "center" }}>
          {i > 0 && <button className="btn ghost" onClick={() => setI(i - 1)}><ArrowLeft size={18} /> Back</button>}
          {i + 1 < items.length ? <button className="btn primary" onClick={() => setI(i + 1)}>Next <ArrowRight size={18} /></button>
            : <button className="btn primary" onClick={() => { setFinished(true); earn("speak", 2); }}>Finish ⭐</button>}
        </div>
      </div>
    </>
  );
}

/* ---------- Write: pick a letter, watch it, trace it, then write it alone ---------- */
const STEPS = [["watch", "Watch", Eye], ["trace", "Trace", PenLine], ["write", "On my own", Star]];
function Write({ child, wk, strokeLib, earn, back }) {
  const items = useMemo(() => [...new Set([...(wk.unit.items || []), ...(wk.unit.review || [])])], [wk]);
  const best = child.letters || {};
  const [sel, setSel] = useState(null);
  const [step, setStep] = useState(0);
  const [res, setRes] = useState(null);
  const [traceOk, setTraceOk] = useState(false);
  const pick = (t) => { setSel(t); setStep(0); setRes(null); setTraceOk(false); };

  if (!sel) {
    const doneN = items.filter((t) => best[t] >= 2).length;
    return (
      <>
        <Head back={back} title="Write" kn="ಬರೆ" />
        <div className="kid-card">
          <div className="card-head"><div><b style={{ fontSize: 20 }}>{wk.unit.en}</b><div className="small muted">Tap one to start. Get 2 stars on each!</div></div><span className="pill yellow">{doneN}/{items.length}</span></div>
          {wk.unit.tip && <p className="small" style={{ background: "var(--yellow-soft)", borderRadius: 14, padding: 10, margin: 0 }}>💡 {wk.unit.tip}</p>}
          <div className="letter-grid kid">
            {items.map((t) => (
              <button key={t} className={`lg-cell kn ${best[t] >= 2 ? "has" : ""}`} onClick={() => pick(t)} aria-label={`${t}, ${best[t] || 0} stars`}>
                <span>{t}</span><small className="lg-stars">{"⭐".repeat(best[t] || 0) || "·"}</small>
              </button>
            ))}
          </div>
          <p className="tiny muted" style={{ textAlign: "center" }}>Then do this week's tracing sheet on paper.</p>
        </div>
      </>
    );
  }
  const rec = strokeLib[voiceKey(sel)];
  const [mode] = STEPS[step];
  const i = items.indexOf(sel);
  const next = items.slice(i + 1).find((t) => !(best[t] >= 2)) || items[(i + 1) % items.length];
  const hint = SOUND[sel] ? `Say "${SOUND[sel]}" as you write` : LETTER_WORD[sel] ? "" : "Say it slowly as you write";
  return (
    <>
      <Head back={() => setSel(null)} title="Write" kn="ಬರೆ" />
      <div className="kid-card">
        <div className="wsteps" role="tablist">{STEPS.map(([k, l, I], j) => <button key={k} role="tab" aria-selected={j === step} className={j < step ? "past" : ""} disabled={j === 2 && !traceOk && step < 2} onClick={() => { setStep(j); setRes(null); }}><I size={16} /> {l}</button>)}</div>
        <p style={{ textAlign: "center", margin: 0 }}>
          {mode === "watch" ? <>Watch how <b className="kn" style={{ fontSize: 24 }}>{sel}</b> is written</> : mode === "trace" ? <>Trace <b className="kn" style={{ fontSize: 24 }}>{sel}</b>. Start at the green dot!</> : <>Now write <b className="kn" style={{ fontSize: 24 }}>{sel}</b> on your own</>}
          {hint && <span className="small muted" style={{ display: "block" }}>{hint}</span>}
        </p>
        {mode === "write" && <div className="model-mini kn" aria-hidden="true">{sel}</div>}
        <LetterPad key={sel + mode} text={sel} mode={mode} record={rec}
          onDone={(r) => {
            setRes(r);
            if (mode === "trace" && r.stars >= 1) setTraceOk(true);
            if (mode === "write" && r.stars >= 1) {
              const prev = best[sel] || 0;
              earn("write", r.stars, r.stars > prev ? { letters: { ...best, [sel]: r.stars } } : {}, { item: sel, score: Math.round(r.coverage * 100) });
            }
          }} />
        <div className="row" style={{ justifyContent: "center" }}>
          {mode === "watch" && <button className="btn primary" onClick={() => setStep(1)}>I'm ready to trace <ArrowRight size={18} /></button>}
          {mode === "trace" && res && res.stars >= 1 && <button className="btn primary" onClick={() => { setStep(2); setRes(null); }}>Now on my own <ArrowRight size={18} /></button>}
          {mode === "write" && res && res.stars >= 1 && <>
            <button className="btn ghost" onClick={() => setSel(null)}>All letters</button>
            <button className="btn primary" onClick={() => pick(next)}>Next: <span className="kn">{next}</span> <ArrowRight size={18} /></button>
          </>}
        </div>
      </div>
    </>
  );
}

/* ---------- Build: put words in order, fill the gap, make it longer ---------- */
function Build({ wk, voiceLib, earn, back, say }) {
  const P = wk.pattern;
  const rounds = useMemo(() => {
    const out = P.build.map(([kn, en]) => ({ type: "order", kn, en }));
    const pool = [...new Set(P.words.map((w) => w[0]).concat(P.blanks.map((b) => b[1])))];
    for (const [t, ans] of P.blanks) out.push({ type: "gap", kn: t.replace("___", ans), text: t, ans, options: shuffle([ans, ...shuffle(pool.filter((x) => x !== ans)).slice(0, 2)]) });
    if (wk.track !== "start") P.ladder.slice(1).forEach(([kn, en], j) => out.push({ type: "longer", kn, en, prev: P.ladder[j][0] }));
    return out;
  }, [P, wk.track]);
  const [r, setR] = useState(0);
  const [misses, setMisses] = useState(0);
  const [end, setEnd] = useState(false);
  const cur = rounds[r];
  function next(missed) {
    const m = misses + missed; setMisses(m);
    if (r + 1 < rounds.length) setR(r + 1);
    else { const stars = m === 0 ? 3 : m <= 3 ? 2 : 1; setEnd(stars); earn("build", stars); }
  }
  if (end) return <Celebrate stars={end} text="You built every sentence!" back={back} again={() => { setR(0); setMisses(0); setEnd(false); }} />;
  return (
    <>
      <Head back={back} title="Build" kn="ವಾಕ್ಯ ಕಟ್ಟು" />
      <div className="kid-card">
        <div className="dots">{rounds.map((_, j) => <i key={j} className={j <= r ? "on" : ""} />)}</div>
        {cur.type === "gap" ? <Gap key={r} round={cur} voiceLib={voiceLib} onDone={next} /> : <Order key={r} round={cur} voiceLib={voiceLib} say={say} onDone={next} />}
      </div>
    </>
  );
}

function Order({ round, voiceLib, say, onDone }) {
  const words = useMemo(() => tiles(round.kn), [round.kn]);
  const mark = /\?$/.test(round.kn) ? "?" : ".";
  const bank0 = useMemo(() => { let b; do { b = shuffle(words.map((w, i) => ({ w, i }))); } while (words.length > 1 && b.every((x, j) => x.i === j)); return b; }, [words]);
  const [placed, setPlaced] = useState([]);
  const [state, setState] = useState(null); // null | "right" | {bad: index}
  const [missed, setMissed] = useState(0);
  const prevWords = round.prev ? new Set(tiles(round.prev)) : null;
  const bank = bank0.filter((x) => !placed.includes(x));
  function check() {
    const got = placed.map((x) => x.w);
    const bad = got.findIndex((w, j) => w !== words[j]);
    if (bad === -1 && got.length === words.length) { setState("right"); playWord(round.kn, voiceLib); }
    else { setState({ bad }); setMissed((m) => m + 1); }
  }
  return (
    <div className="stack">
      <div style={{ textAlign: "center" }}>
        <span className="pill yellow">{round.type === "longer" ? "Make it longer" : "Put the words in order"}</span>
        {round.prev && <p className="kn small" style={{ margin: "8px 0 0" }}>{round.prev}</p>}
        <p className="build-en" style={{ fontSize: 20, fontWeight: 800, margin: "6px 0 0" }}>{round.en}</p>
      </div>
      <div className={`build-line ${state === "right" ? "right" : ""}`} aria-label="Your sentence">
        {placed.length ? placed.map((x, j) => (
          <button key={x.i} className={`wtile kn ${state && state.bad === j ? "bad" : ""}`} onClick={() => { if (state === "right") return; setPlaced(placed.filter((y) => y !== x)); setState(null); }}>{x.w}</button>
        )) : <span className="muted small">Tap the words below</span>}
        {placed.length === words.length && <span className="kn mark">{mark}</span>}
      </div>
      <div className="build-bank">
        {bank.map((x) => <button key={x.i} className={`wtile kn ${prevWords && !prevWords.has(x.w) ? "new" : ""}`} onClick={() => { setPlaced([...placed, x]); setState(null); }}>{x.w}</button>)}
      </div>
      {state && state !== "right" && <p className="small" style={{ textAlign: "center", color: "var(--red-deep)", margin: 0 }}>Not quite. The red word is in the wrong place. Tap it to take it back.</p>}
      <div className="row" style={{ justifyContent: "center" }}>
        <HearBtn text={round.kn} lib={voiceLib} say={say} />
        {state === "right" ? <button className="btn primary" onClick={() => onDone(missed)}>Next <ArrowRight size={18} /></button>
          : <button className="btn primary" disabled={placed.length !== words.length} onClick={check}><Check size={18} /> Check</button>}
      </div>
      {state === "right" && <p style={{ textAlign: "center", margin: 0 }} className="kn"><b style={{ color: "var(--leaf)" }}>✓ {round.kn}</b></p>}
    </div>
  );
}

function Gap({ round, voiceLib, onDone }) {
  const [pick, setPick] = useState(null);
  const [missed, setMissed] = useState(0);
  const ok = pick === round.ans;
  const [before, after] = round.text.split("___");
  return (
    <div className="stack">
      <div style={{ textAlign: "center" }}><span className="pill yellow">Fill the gap</span></div>
      <p className="kn gap-line">{before}<span className={`gap ${pick ? (ok ? "right" : "bad") : ""}`}>{pick || "?"}</span>{after}</p>
      <div className="build-bank">
        {round.options.map((o) => <button key={o} className="wtile kn" disabled={ok} onClick={() => { setPick(o); if (o === round.ans) playWord(round.kn, voiceLib); else setMissed((m) => m + 1); }}>{o}</button>)}
      </div>
      {ok && <div className="row" style={{ justifyContent: "center" }}><button className="btn primary" onClick={() => onDone(missed)}>Next <ArrowRight size={18} /></button></div>}
    </div>
  );
}

/* ---------- Stars, letters and birds ---------- */
function Stars({ child, back }) {
  const w = Math.max(1, childWeek(child));
  const weeks = child.weekDone || {};
  const letters = Object.entries(child.letters || {}).filter(([, s]) => s >= 1);
  const tr = TRACKS[child.track] || null;
  return (
    <>
      <Head back={back} title="My stars" kn="ನಕ್ಷತ್ರಗಳು" />
      <div className="kid-card" style={{ textAlign: "center", justifyItems: "center" }}>
        <div style={{ fontSize: 60, lineHeight: 1 }}>⭐</div>
        <h2 style={{ fontSize: 40 }}>{child.stars || 0}</h2>
        <p className="muted">stars so far · {(child.streak && child.streak.count) || 0} day streak{tr ? ` · ${tr.icon} ${tr.en}` : ""}</p>
      </div>
      <div className="kid-card">
        <h3>Letters I can write</h3>
        {letters.length ? <div className="letter-grid kid small">{letters.map(([t, s]) => <span key={t} className={`lg-cell kn ${s >= 2 ? "has" : ""}`}><span>{t}</span><small className="lg-stars">{"⭐".repeat(s)}</small></span>)}</div>
          : <p className="muted small">Write letters in Write to fill this up!</p>}
      </div>
      <div className="kid-card">
        <h3>My birds</h3>
        {SKILLS.map((k) => {
          const L = (child.stages || {})[k] || 0;
          return (
            <div key={k} className="row" style={{ justifyContent: "space-between" }}>
              <b>{SKILL[k].en} <span className="kn muted">{SKILL[k].kn}</span></b>
              <span style={{ fontSize: 26 }}>{STAGES.map((s, j) => <span key={j} style={{ opacity: j <= L ? 1 : 0.2, filter: j <= L ? "none" : "grayscale(1)" }}>{STAGE_EMOJI[j]}</span>)}</span>
            </div>
          );
        })}
        <p className="small muted">You're a <b>{STAGES[Math.max(...SKILLS.map((k) => (child.stages || {})[k] || 0))].en}</b>! Your teacher moves you up at the month-end meet.</p>
      </div>
      <div className="kid-card">
        <h3>My weeks</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(64px,1fr))", gap: 8 }}>
          {Array.from({ length: PLAN_WEEKS }, (_, j) => j + 1).map((n) => {
            const d = Object.keys(weeks[n] || {}).length;
            return <div key={n} style={{ borderRadius: 14, padding: 8, textAlign: "center", background: n > w ? "#f3ead8" : d >= 5 ? "var(--yellow)" : d ? "var(--yellow-soft)" : "#fff", border: n === w ? "3px solid var(--red)" : "1px solid var(--line)", opacity: n > w ? 0.5 : 1 }}>
              <div className="tiny muted">{isMeetWeek(n) ? "Meet" : `Wk ${n}`}</div>
              <div style={{ fontSize: 20 }}>{n > w ? <Lock size={16} /> : d >= 5 ? "🏅" : d ? "⭐".repeat(Math.min(d, 3)) : "·"}</div>
            </div>;
          })}
        </div>
      </div>
    </>
  );
}
