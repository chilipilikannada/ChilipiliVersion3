import { useEffect, useMemo, useRef, useState } from "react";
import { Headphones, Gamepad2, Mic, PenLine, Puzzle, Star, Flame, ArrowLeft, ArrowRight, Volume2, Heart, Check, RotateCcw, Square, Play, Trophy, Lock, Eye, MessageCircle, Languages, SkipForward, BookOpen, Rocket } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Gini, Skyline, STAGE_EMOJI } from "../../components/Art.jsx";
import LetterPad from "../../components/LetterPad.jsx";
import SayIt from "../../components/SayIt.jsx";
import MicHelp from "../../components/MicHelp.jsx";
import LevelPicker from "../../components/LevelPicker.jsx";
import WritePad from "../../components/WritePad.jsx";
import { STORIES, storyFor } from "../../lib/stories.js";
import { compressImage, safeName } from "../../lib/files.js";
import { kidWeek, childWeek, PLAN_WEEKS, isMeetWeek } from "../../lib/plan.js";
import { STAGES, SKILLS, SKILL } from "../../lib/content.js";
import { TRACKS, tiles, SOUND, DAYS as ALL_DAYS, daysFor, dayPlan, reviewLessons, easyOf, paceOf, talkFor, DAILY_TALK, THEMES, themeTalk, pictureTalk, LEVELS, levelOf } from "../../lib/course.js";
import { playWord, playUrl, stopAudio, hasDeviceVoice, voiceKey, useRecorder, canRecord, audioExt } from "../../lib/audio.js";
import { isoLocal } from "../../lib/time.js";
import { JOURNEY, JOURNEY_DAYS, SECTIONS, journeyOf, learnedBefore, sectionOf, LETTER_PIC } from "../../lib/journey.js";
import { LETTER_WORD } from "../../lib/course.js";
import { friendlyError } from "../../App.jsx";
import { ALL_TALKS, familyFor, knowFor, writeFor } from "../../lib/family.js";
import { ensureFont, PAD_FONT, decodeStrokes } from "../../lib/strokes.js";
import { saveFile } from "../../lib/files.js";
import ProgramPlan from "../../components/ProgramPlan.jsx";
import { isAdult, ADULT_LEVELS, adultLevelOf, UNITS, unitsOf, doneUnits, nextUnit, unitNo, unitSteps, adultPace } from "../../lib/adult.js";

const ACTS = [
  ["listen", "Listen", "ಕೇಳು", Headphones],
  ["play", "Play", "ಆಡು", Gamepad2],
  ["speak", "Speak", "ಮಾತಾಡು", Mic],
  ["write", "Write", "ಬರೆ", PenLine],
  ["build", "Build", "ವಾಕ್ಯ ಕಟ್ಟು", Puzzle],
  ["talk", "Talk", "ಮಾತುಕತೆ", MessageCircle],
];
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const dayKey = (d) => `d${d}`;

export default function KidSpace({ fam }) {
  const { child, voiceLib, strokeLib } = fam;
  const { route, go, say, profile } = useApp();
  const sub = route[1] || "";
  const wk = useMemo(() => kidWeek(child), [child]);
  const nm = firstName(child.name);
  const easy = easyOf(child);
  // Keep the latest child values so several quick updates don't overwrite each other.
  const live = useRef(child);
  useEffect(() => { live.current = { ...live.current, ...child }; }, [child]);

  async function earn(kind, stars, extra = {}, detail = {}) {
    try {
      const c = live.current;
      const today = isoLocal(), y = isoLocal(Date.now() - 864e5);
      const st = c.streak || { count: 0, last: "" };
      const streak = st.last === today ? st : { count: st.last === y ? st.count + 1 : 1, last: today };
      const wd = (c.weekDone || {})[wk.week] || {};
      const weekDone = { ...(c.weekDone || {}), [wk.week]: { ...wd, [kind]: true, ...(extra.dayDone ? { [dayKey(extra.dayDone)]: true } : {}) } };
      const { dayDone, ...rest } = extra;
      const upd = { stars: (c.stars || 0) + stars, streak, weekDone, lastActive: Date.now(), ...rest };
      live.current = { ...c, ...upd };
      await store.add("activity", { childId: child.id, parentEmails: child.parentEmails, kind, week: wk.week, stars, ...detail, at: Date.now() });
      await store.update("children", child.id, upd);
    } catch (e) { say(friendlyError(e), true); }
  }

  if (child.status !== "active") {
    return <KidFrame child={child} onExit={() => go("home")}><div className="kid-card" style={{ textAlign: "center", justifyItems: "center" }}><Gini className="gini" /><h2>Almost ready!</h2><p>Your teacher is getting your space ready.</p></div></KidFrame>;
  }

  const back = () => { stopAudio(); go("kid"); };
  const props = { child, wk, voiceLib, strokeLib, earn, back, say, profile, go, easy };
  const P = wk.pattern;
  const DAYS = daysFor(wk.track);
  const doneWeek = (child.weekDone || {})[wk.week] || {};
  const daysDone = DAYS.map((_, i) => !!doneWeek[dayKey(i + 1)]);
  const nextDay = daysDone.findIndex((d) => !d) + 1 || 0;

  const adult = isAdult(child);
  let page;
  if (adult && sub === "unit") { const u = UNITS[Math.max(0, Math.min(UNITS.length - 1, (+route[2] || 1) - 1))]; page = <AdultLesson key={u.id} {...props} unit={u} />; }
  else if (adult && sub === "units") page = <CourseMap {...props} />;
  else if (adult && !sub) page = <AdultHome {...props} />;
  else if (sub === "family") { const t = ALL_TALKS.find((x) => x.id === route[2]); page = t ? <FamilyTalk key={t.id} {...props} talk={t} /> : <FamilyCorner {...props} />; }
  else if (sub === "plan") page = <><Head back={back} title={adult ? "My course" : "My 6-month plan"} kn="ನನ್ನ ಯೋಜನೆ" /><ProgramPlan child={child} onLesson={adult ? (u) => go("kid", "unit", String(unitNo(u))) : undefined} /></>;
  else if (sub === "day") { const d = Math.max(1, Math.min(6, +route[2] || nextDay || 1)); page = <Mission key={d} {...props} day={d} />; }
  else if (sub === "listen") page = <Listen {...props} cards={[...wk.theme.words, ...wk.words].map((w) => ({ kn: w[0], rom: w[1], en: w[2], pic: w[3] })).concat(P.model.map(([kn, rom, en]) => ({ kn, rom, en })))} />;
  else if (sub === "play") page = <PlayGame {...props} mode={wk.track === "start" ? "words" : "sentences"} words={[...wk.theme.words, ...wk.words]} sentences={[...P.model.map((m) => [m[0], m[2]]), ...P.build, ...P.ladder]} />;
  else if (sub === "speak") page = <Speak {...props} items={wk.track === "start" ? [...wk.words.slice(0, 3).map((w) => ({ kn: w[0], rom: w[1], pic: w[3] })), { kn: P.model[0][0], rom: P.model[0][1], en: P.model[0][2] }] : P.model.map(([kn, rom, en]) => ({ kn, rom, en }))} />;
  else if (sub === "write") page = <WriteFree {...props} />;
  else if (sub === "build") page = <Build {...props} rounds={[...P.build.map(([kn, en]) => ({ type: "order", kn, en })), ...P.blanks.map(([t, ans]) => ({ type: "gap", text: t, ans, kn: t.replace("___", ans) })), ...(wk.track !== "start" ? P.ladder.slice(1).map(([kn, en], j) => ({ type: "longer", kn, en, prev: P.ladder[j][0] })) : [])]} />;
  else if (sub === "talk") page = <Talk {...props} items={[DAILY_TALK.map(([q, qEn, a, aEn]) => ({ q, qEn, a, aEn, daily: true }))[new Date().getDay() % DAILY_TALK.length], ...pictureTalk(wk.theme, 1, new Date().getDate()), themeTalk(wk.theme), ...talkFor(P)].filter(Boolean)} />;
  else if (sub === "words") page = <WordsCorner {...props} themeId={route[2]} />;
  else if (sub === "stories") page = <StoryCorner {...props} storyId={route[2]} />;
  else if (sub === "level") page = <><Head back={back} title="My level" kn="ನನ್ನ ಹಂತ" /><div className="kid-card"><p style={{ margin: 0 }}>{adult ? "Every lesson stays open whatever your level; the level decides what comes next." : "Too easy? Try a harder level. Too hard? Go back. You choose!"}</p><LevelPicker child={child} kid onChanged={() => setTimeout(back, 900)} /></div></>;
  else if (sub === "journey") page = route[2] === "check" ? <QuickCheck {...props} /> : route[2] ? <JourneyDay key={route[2]} {...props} day={+route[2]} /> : <JourneyMap {...props} />;
  else if (sub === "say") page = <><Head back={back} title="Talk both ways" kn="ಮಾತಿನ ಸೇತುವೆ" /><SayIt child={child} profile={profile} voiceLib={voiceLib} kid onSaid={() => earn("say", 1)} /></>;
  else if (sub === "stars") page = <Stars {...props} />;
  else page = (
    <>
      <div className="kid-hello">
        <Gini className="gini" mood="cheer" />
        <div className="bubble">
          <h1><span className="kn">ನಮಸ್ಕಾರ</span> {nm}!</h1>
          <p>{wk.meet ? "It's meet week! Practise for your teacher." : <>This week: <b>{P.en}</b> <span className="kn">{P.kn}</span> and words about <b>{wk.theme.en.toLowerCase()}</b></>}</p>
        </div>
      </div>
      <JourneyCard child={child} go={go} />
      <FamilyCard wk={wk} child={child} go={go} />
      <button className="mission-card" onClick={() => go("kid", "day", String(nextDay || 1))}>
        <div className="mc-top"><span className="label" style={{ color: "#fff" }}>Today's mission</span><span className="mc-mins">about 15 min</span></div>
        {nextDay ? <b className="mc-title">{DAYS[nextDay - 1].icon} Day {nextDay}: {DAYS[nextDay - 1].en}</b> : <b className="mc-title">🏆 All 6 days done this week!</b>}
        <div className="mc-days" aria-label={`${daysDone.filter(Boolean).length} of 6 days done`}>{daysDone.map((d, i) => <span key={i} className={d ? "on" : i + 1 === nextDay ? "now" : ""}>{d ? "★" : i + 1}</span>)}</div>
        <span className="btn yellow mc-go">{nextDay ? "Start" : "Play a day again"} <ArrowRight size={18} /></span>
      </button>
      {!nextDay && wk.week < PLAN_WEEKS && (
        <button className="btn primary" style={{ justifySelf: "stretch" }} onClick={async () => {
          let step = 1; while (isMeetWeek(wk.week + step) && wk.week + step < PLAN_WEEKS) step++;
          await store.update("children", child.id, { ahead: (child.ahead || 0) + step }); say("Next week unlocked. Well done!");
        }}><Rocket size={18} /> I'm ready: start next week now</button>
      )}
      <ProgramPlan child={child} compact onOpen={() => go("kid", "plan")} />
      <button className="say-card words" onClick={() => go("kid", "words")}>
        <span className="wc-pics" aria-hidden="true">{wk.theme.words.slice(0, 3).map((w) => w[3]).join("")}</span>
        <span><b>Words corner</b><small>This week: {wk.theme.en} <span className="kn">{wk.theme.kn}</span>. Colours, family, fruits, animals and more.</small></span>
        <ArrowRight />
      </button>
      {levelOf(child) >= 3 && (
        <button className="say-card words" onClick={() => go("kid", "stories")}>
          <span className="wc-pics" aria-hidden="true">📖{storyFor(wk.packet.n).pic}</span>
          <span><b>Story corner</b><small>This week: {storyFor(wk.packet.n).en} <span className="kn">{storyFor(wk.packet.n).kn}</span>. Read, answer, write your own.</small></span>
          <ArrowRight />
        </button>
      )}
      <button className="say-card" onClick={() => go("kid", "say")}>
        <Languages size={34} />
        <span><b>Talk both ways</b><small>Speak English, hear Kannada. Or speak Kannada, hear English. Try it with Ajji and Tata!</small></span>
        <ArrowRight />
      </button>
      <h3 style={{ margin: "4px 4px 0" }}>Practise more</h3>
      <div className="tiles six">
        {ACTS.map(([k, en, kn, I]) => (
          <button key={k} className={`tile ${k}`} onClick={() => go("kid", k)}>
            {doneWeek[k] && <span className="done"><Check /></span>}
            <I /><b>{en}</b><small>{kn}</small>
          </button>
        ))}
      </div>
      <button className="level-btn" onClick={() => go("kid", "level")}>
        <span aria-hidden="true" style={{ fontSize: 30 }}>{LEVELS[levelOf(child) - 1].icon}</span>
        <span><b>Level {levelOf(child)}: {LEVELS[levelOf(child) - 1].en}</b><small>{levelOf(child) < 4 ? `Too easy? Try level ${levelOf(child) + 1}!` : "The top level. Amazing!"}</small></span>
        <ArrowRight />
      </button>
      <button className="kid-card" style={{ border: 0, cursor: "pointer", textAlign: "left", gridTemplateColumns: "auto 1fr auto", alignItems: "center", display: "grid" }} onClick={() => go("kid", "stars")}>
        <Trophy size={36} color="#e0a100" />
        <div><b style={{ fontSize: 20 }}>My stars, letters and birds</b><div className="muted small">{child.spoken || 0} times I talked in Kannada</div></div>
        <ArrowRight />
      </button>
    </>
  );
  return <KidFrame child={child} adult={adult} onExit={() => { stopAudio(); go("home"); }}>{page}</KidFrame>;
}

function KidFrame({ child, onExit, children, adult }) {
  const [hold, setHold] = useState(0);
  const t = useRef(null);
  function down() { let p = 0; t.current = setInterval(() => { p += 10; setHold(p); if (p >= 100) { clearInterval(t.current); setHold(0); onExit(); } }, 80); }
  function up() { clearInterval(t.current); setHold(0); }
  return (
    <div className={adult ? "kid adult" : "kid"}>
      <div className="skyline-bg"><Skyline color="#b3261e" sun="#c8102e" /></div>
      <div className="kid-in">
        <div className="kid-top">
          {adult ? <button className="btn ghost small" onClick={onExit}><ArrowLeft size={16} /> My page</button> : <button className="btn ghost small" onPointerDown={down} onPointerUp={up} onPointerLeave={up} onKeyDown={(e) => e.key === "Enter" && onExit()} aria-label="Grown-ups: press and hold to leave"
            style={{ background: `linear-gradient(90deg, var(--yellow-soft) ${hold}%, #fff ${hold}%)` }}>
            {hold ? "Keep holding…" : "Grown-ups"}
          </button>}
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

function Celebrate({ stars, text, back, again, next }) {
  return (
    <div className="kid-card celebrate">
      <Gini className="gini" mood="cheer" />
      <div className="stars-burst">{"⭐".repeat(Math.max(1, stars))}</div>
      <h2><span className="kn">ಶಭಾಷ್!</span> {text}</h2>
      <div className="row" style={{ justifyContent: "center" }}>
        {again && <button className="btn ghost" onClick={again}><RotateCcw size={18} /> Again</button>}
        {next ? <button className="btn primary" onClick={next}>Next <ArrowRight size={18} /></button> : <button className="btn primary" onClick={back}>Back home</button>}
      </div>
    </div>
  );
}

const audible = (text, lib) => !!(lib[voiceKey(text)] || hasDeviceVoice());
const HearBtn = ({ text, lib, say, big }) => (
  <button className={big ? "big-round red" : "icon-btn hear"} onClick={async () => { const r = await playWord(text, lib); if (!r) say("This device has no voice for Kannada. Try Chrome or Edge, or ask a grown-up to read it with you!"); }} aria-label="Hear it"><Volume2 /></button>
);

/* ---------- Today's mission: 4 short steps ---------- */
function Mission(props) {
  const { child, wk, day, easy, back, earn, go } = props;
  const DAYS = daysFor(wk.track);
  const plan = useMemo(() => {
    const j = journeyOf(child);
    const known = learnedBefore(j.day).slice(-6);
    const unit = { ...wk.packet.unit, items: j.lesson.items, review: known.slice(-2) };
    return dayPlan({ ...wk.packet, unit }, day, { easy, review: reviewLessons(wk.track, wk.packet.n, paceOf(child)), seed: wk.week * 7 + day });
  }, [wk, day, easy, child]);
  const [i, setI] = useState(0);
  const [stars, setStars] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => { setI(0); setStars(0); setDone(false); }, [day]);
  const step = plan[Math.min(i, plan.length - 1)];
  function finish(s = 1) {
    const total = stars + s; setStars(total);
    if (i + 1 < plan.length) { setI(i + 1); window.scrollTo({ top: 0 }); }
    else { setDone(true); earn("day", 2, { dayDone: day }); }
  }
  if (done) return (
    <div className="kid-card celebrate">
      <Gini className="gini" mood="cheer" />
      <div className="stars-burst">⭐⭐⭐</div>
      <h2><span className="kn">ಶಭಾಷ್!</span> Day {day} done!</h2>
      <p>{day < 6 ? "Come back tomorrow for the next mission." : "You finished the whole week. Amazing!"}</p>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn ghost" onClick={() => go("kid", "say")}><Languages size={18} /> Talk both ways</button>
        <button className="btn primary" onClick={back}>Back home</button>
      </div>
    </div>
  );
  const cfg = { ...props, onFinish: finish, inMission: true, back };
  return (
    <>
      <div className="kid-back"><button className="icon-btn" style={{ background: "#fff" }} onClick={back} aria-label="Back"><ArrowLeft /></button>
        <div><h2>{DAYS[day - 1].icon} Day {day}: {DAYS[day - 1].en}</h2><div className="small">Step {i + 1} of {plan.length}: <b>{step.title}</b></div></div></div>
      <div className="mission-steps">{plan.map((s, j) => <span key={j} className={j < i ? "on" : j === i ? "now" : ""} />)}</div>
      {step.kind === "listen" ? <Listen key={i} {...cfg} cards={step.cards} /> :
        step.kind === "play" ? <PlayGame key={i} {...cfg} mode={step.mode} words={step.words} sentences={step.sentences} /> :
          step.kind === "speak" ? <Speak key={i} {...cfg} items={step.items} /> :
            step.kind === "write" ? <WriteSteps key={i} {...cfg} items={step.items} steps={step.steps} memory={step.memory} /> :
              step.kind === "build" ? <Build key={i} {...cfg} rounds={step.rounds} /> :
                step.kind === "story" ? <StoryRead key={i} {...cfg} story={step.story} record={step.record} mustRecord={step.mustRecord} /> :
                  step.kind === "questions" ? <StoryQuestions key={i} {...cfg} story={step.story} /> :
                    step.kind === "dictation" ? <Dictation key={i} {...cfg} lines={step.lines} story={step.story} /> :
                      step.kind === "storywrite" ? <StoryWrite key={i} {...cfg} story={step.story} /> :
                <Talk key={i} {...cfg} items={step.items} />}
    </>
  );
}

/* ---------- Listen ---------- */
function Listen({ cards, voiceLib, earn, back, say, onFinish, inMission }) {
  const [i, setI] = useState(0);
  const [finished, setFinished] = useState(false);
  const c = cards[i];
  useEffect(() => { if (c && audible(c.kn, voiceLib)) playWord(c.kn, voiceLib); /* eslint-disable-next-line */ }, [i]);
  function next() {
    if (i + 1 < cards.length) setI(i + 1);
    else if (!finished) { setFinished(true); earn("listen", 1); onFinish && onFinish(1); }
  }
  if (finished && !onFinish) return <Celebrate stars={1} text="You listened to everything!" back={back} again={() => { setI(0); setFinished(false); }} />;
  if (!c) return null;
  return (
    <>
      {!inMission && <Head back={back} title="Listen" kn="ಕೇಳು" />}
      <div className="kid-card">
        <div className="dots">{cards.map((_, j) => <i key={j} className={j <= i ? "on" : ""} />)}</div>
        <div className="flash">
          {c.pic ? <div className="pic" aria-hidden="true">{c.pic}</div> : <span className="pill yellow">Sentence</span>}
          <div className={`knw ${c.pic ? "" : "sentence"}`}>{c.kn}</div>
          {c.rom && <div className="rom">{c.rom}</div>}
          {c.en && <div className="en">{c.en}</div>}
        </div>
        <div className="row" style={{ justifyContent: "center", gap: 18 }}>
          <button className="icon-btn" style={{ width: 60, height: 60, background: "#fff", border: "2px solid var(--line)" }} disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Previous"><ArrowLeft /></button>
          <HearBtn text={c.kn} lib={voiceLib} say={say} big />
          <button className="icon-btn" style={{ width: 60, height: 60, background: "var(--yellow)" }} onClick={next} aria-label="Next"><ArrowRight /></button>
        </div>
        <p className="small muted" style={{ textAlign: "center", margin: 0 }}>Say it out loud after Gini!</p>
      </div>
    </>
  );
}

/* ---------- Play: words to pictures, or sentences to meanings ---------- */
function PlayGame({ mode, words = [], sentences = [], voiceLib, earn, back, onFinish, inMission }) {
  const sentencesMode = mode === "sentences" && sentences.length >= 3;
  const ROUNDS = 6;
  const make = () => {
    if (!sentencesMode) {
      const ws = words.filter((w) => w[3]);
      return shuffle(Array.from({ length: ROUNDS }, (_, r) => ws[r % ws.length])).map((target) => {
        const others = shuffle(ws.filter((x) => x[2] !== target[2])).slice(0, 3);
        return { kn: target[0], answer: target[2], options: shuffle([target, ...others]).map((o) => ({ label: o[2], pic: o[3] })) };
      });
    }
    const uniq = sentences.filter((p, i) => p[1] && sentences.findIndex((q) => q[0] === p[0]) === i);
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
  const hear = cur && audible(cur.kn, voiceLib);
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
  if (end) return end.win ? <Celebrate stars={end.stars} text={`${end.stars} hearts left!`} back={back} again={onFinish ? null : again} next={onFinish ? () => onFinish(end.stars) : null} /> :
    <div className="kid-card celebrate"><Gini className="gini" mood="think" /><h2>Nearly! Let's try again.</h2><div className="row" style={{ justifyContent: "center" }}><button className="btn primary" onClick={again}><RotateCcw size={18} /> Try again</button>{onFinish ? <button className="btn ghost" onClick={() => onFinish(0)}>Skip</button> : <button className="btn ghost" onClick={back}>Back home</button>}</div></div>;
  if (!cur) return null;
  return (
    <>
      {!inMission && <Head back={back} title="Play" kn="ಆಡು" />}
      <div className="kid-card">
        <div className="card-head"><div className="hearts">{[0, 1, 2].map((i) => <Heart key={i} fill={i < hearts ? "currentColor" : "none"} />)}</div><span className="label">Round {r + 1} of {rounds.length}</span></div>
        <div style={{ textAlign: "center" }} className="stack-s">
          <p className="muted">{sentencesMode ? "Read (or listen), then tap what it means" : hear ? "Listen, then tap the right picture" : "Read the word, then tap the right picture"}</p>
          {(sentencesMode || !hear) && <div className="kn" style={{ fontSize: sentencesMode ? "clamp(24px,6vw,34px)" : 54, color: "var(--red-deep)", fontWeight: 600, lineHeight: 1.4 }}>{cur.kn}</div>}
          {hear && <div style={{ display: "grid", justifyItems: "center" }}><button className="big-round red" onClick={() => playWord(cur.kn, voiceLib)} aria-label="Hear it again"><Volume2 /></button></div>}
        </div>
        <div className={sentencesMode ? "picks list1" : "picks"}>
          {cur.options.map((o) => (
            <button key={o.label} className={`pick ${sentencesMode ? "text" : ""} ${pick && pick.o === o.label ? (pick.ok ? "right" : "wrong") : ""} ${pick && !pick.ok && o.label === cur.answer ? "right" : ""}`} onClick={() => choose(o)} aria-label={o.label}>
              {o.pic && <span aria-hidden="true">{o.pic}</span>}<small>{o.label}</small>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// Upload recordings and hand them to the teacher (no button to press, no deadline).
async function sendClips({ child, profile, week, kind, clips, labels, note }) {
  const files = [];
  for (const [k, b] of Object.entries(clips)) {
    const path = `speaking/${child.id}/${Date.now()}_${k}.${audioExt(b.type)}`;
    await store.upload(path, b); files.push({ path, type: b.type || "audio/webm", name: labels[k] || "recording" });
  }
  if (files.length) await store.add("submissions", { childId: child.id, parentEmails: child.parentEmails, kind, week, files, note, status: "sent", by: profile.uid, byName: profile.name, at: Date.now() });
  return files.length;
}

/* ---------- Recorder block used by Speak and Talk ---------- */
function RecordBlock({ onClip, clip, hearText, voiceLib, say, maxSeconds = 15, hearLabel = "Teacher" }) {
  const rec = useRecorder(maxSeconds);
  const file = useRef(null);
  const [mine, setMine] = useState(null);
  const live = canRecord() && rec.error !== "unsupported";
  useEffect(() => { if (rec.blob) onClip(rec.blob); /* eslint-disable-next-line */ }, [rec.blob]);
  useEffect(() => { if (!clip) { setMine(null); return; } const u = URL.createObjectURL(clip); setMine(u); return () => URL.revokeObjectURL(u); }, [clip]);
  return (
    <>
      <div className="row" style={{ justifyContent: "center", gap: 18 }}>
        {hearText && <div style={{ display: "grid", justifyItems: "center", gap: 4 }}><HearBtn text={hearText} lib={voiceLib} say={say} big /><span className="tiny">{hearLabel}</span></div>}
        <div style={{ display: "grid", justifyItems: "center", gap: 4 }}>
          {live ? (rec.recording
            ? <button className="big-round rec" onClick={rec.stop} aria-label="Stop"><Square /></button>
            : <button className="big-round green" onClick={rec.start} aria-label="Record"><Mic /></button>)
            : <button className="big-round green" onClick={() => file.current.click()} aria-label="Record"><Mic /></button>}
          <span className="tiny">{rec.recording ? `Listening… ${rec.seconds}s` : "Me"}</span>
          <input ref={file} type="file" accept="audio/*" capture="user" hidden onChange={(e) => { rec.useFile(e.target.files[0]); e.target.value = ""; }} />
        </div>
        <div style={{ display: "grid", justifyItems: "center", gap: 4 }}>
          <button className="big-round" style={{ background: mine ? "var(--sky)" : "#d9cdb8" }} disabled={!mine} onClick={() => playUrl(mine)} aria-label="Play my voice"><Play /></button><span className="tiny">Play mine</span>
        </div>
      </div>
      {rec.error && <MicHelp error={rec.error} onRetry={() => { rec.reset(); rec.start(); }} />}
    </>
  );
}

/* ---------- Speak: hear it, say it, compare ---------- */
function Speak({ child, wk, items, voiceLib, earn, back, say, profile, onFinish, inMission }) {
  const [i, setI] = useState(0);
  const [clips, setClips] = useState({});
  const [finished, setFinished] = useState(null);
  const w = items[i];
  async function finish() {
    let sent = 0;
    try { sent = await sendClips({ child, profile, week: wk.week, kind: "speaking", clips, labels: Object.fromEntries(items.map((x, k) => [k, x.rom || x.en || x.kn])), note: `Said: ${Object.keys(clips).map((k) => items[k].kn).join(" / ")}` }); } catch (e) { say(friendlyError(e), true); }
    earn("speak", 2, sent ? { spoken: (child.spoken || 0) + sent } : {});
    if (onFinish) onFinish(2); else setFinished({ sent });
  }
  if (finished) return <Celebrate stars={2} text={finished.sent ? "Your teacher will hear you!" : "Great speaking!"} back={back} />;
  if (!w) return null;
  return (
    <>
      {!inMission && <Head back={back} title="Speak" kn="ಮಾತಾಡು" />}
      <div className="kid-card">
        <div className="dots">{items.map((_, j) => <i key={j} className={j <= i ? "on" : ""} />)}</div>
        <div className="flash">{w.pic && <div className="pic" aria-hidden="true">{w.pic}</div>}<div className={`knw ${w.pic ? "" : "sentence"}`}>{w.kn}</div>{w.rom && <div className="rom">{w.rom}</div>}{w.en && <div className="en">{w.en}</div>}</div>
        <ol className="small" style={{ margin: "0 auto", paddingLeft: 20 }}><li>Listen</li><li>Tap the mic and say it</li><li>Play yours and compare!</li></ol>
        <RecordBlock key={i} clip={clips[i]} onClip={(b) => setClips((c) => ({ ...c, [i]: b }))} hearText={w.kn} voiceLib={voiceLib} say={say} />
        <div className="row" style={{ justifyContent: "center" }}>
          {i > 0 && <button className="btn ghost" onClick={() => setI(i - 1)}><ArrowLeft size={18} /> Back</button>}
          {i + 1 < items.length ? <button className="btn primary" onClick={() => setI(i + 1)}>Next <ArrowRight size={18} /></button>
            : <button className="btn primary" onClick={finish}>Finish ⭐</button>}
        </div>
        {Object.keys(clips).length > 0 && <p className="tiny muted" style={{ textAlign: "center", margin: 0 }}>Your recordings go to your teacher when you finish.</p>}
      </div>
    </>
  );
}

/* ---------- Talk with Gini: answer out loud ---------- */
function Talk({ child, wk, items, voiceLib, earn, back, say, profile, onFinish, inMission }) {
  const [i, setI] = useState(0);
  const [clips, setClips] = useState({});
  const [finished, setFinished] = useState(null);
  const t = items[i];
  const hints = t && t.hints ? t.hints.slice(0, 6) : t && t.daily ? [] : wk.words.slice(0, 6);
  useEffect(() => { if (t && t.q) setTimeout(() => playWord(t.q, voiceLib), 300); /* eslint-disable-next-line */ }, [i]);
  async function finish() {
    const n = Object.keys(clips).length;
    let sent = 0;
    try { sent = await sendClips({ child, profile, week: wk.week, kind: "talk", clips, labels: Object.fromEntries(items.map((x, k) => [k, x.qEn])), note: `Talked with Gini: ${Object.keys(clips).map((k) => items[k].q || items[k].a).join(" / ")}` }); } catch (e) { say(friendlyError(e), true); }
    earn("talk", n ? 3 : 1, sent ? { spoken: (child.spoken || 0) + sent } : {});
    if (onFinish) onFinish(n ? 3 : 1); else setFinished({ n });
  }
  if (finished) return <Celebrate stars={finished.n ? 3 : 1} text={finished.n ? `You talked in Kannada ${finished.n} ${finished.n === 1 ? "time" : "times"}!` : "Let's talk next time!"} back={back} />;
  if (!t) return null;
  const has = !!clips[i];
  return (
    <>
      {!inMission && <Head back={back} title="Talk with Gini" kn="ಮಾತುಕತೆ" />}
      <div className="kid-card">
        <div className="dots">{items.map((_, j) => <i key={j} className={j <= i ? "on" : ""} />)}</div>
        <div className="talk-q">
          <Gini className="gini-s" mood={has ? "cheer" : "happy"} />
          <div className="talk-bubble">
            {t.pic && <span className="talk-pic" aria-hidden="true">{t.pic}</span>}
            {t.q ? <><b className="kn">{t.q}</b><span className="small muted">{t.qEn}</span></> : <><span className="pill yellow">Your turn to ask!</span><b>{t.qEn}</b></>}
            {t.q && <button className="icon-btn hear" style={{ justifySelf: "start" }} onClick={() => playWord(t.q, voiceLib)} aria-label="Hear Gini's question"><Volume2 /></button>}
          </div>
        </div>
        <div className="talk-frame">
          <span className="label">{t.q ? "You can say" : "Say this to Gini"}</span>
          <b className="kn">{t.a}</b>
          <span className="small muted">{t.aEn}</span>
          {/___/.test(t.a) && hints.length > 0 && <div className="talk-hints">{hints.map((w) => <button key={w[0]} className="hint-chip" onClick={() => playWord(w[0], voiceLib)}><span aria-hidden="true">{w[3]}</span> <span className="kn">{w[0]}</span></button>)}</div>}
          {/___/.test(t.a) && hints.length > 0 && <span className="tiny muted">Fill the gap with your own word. Any Kannada word is great!</span>}
        </div>
        <RecordBlock key={i} clip={clips[i]} onClip={(b) => setClips((c) => ({ ...c, [i]: b }))} hearText={t.a.replace(/___/g, "…").split(" / ")[0]} hearLabel="Example" voiceLib={voiceLib} say={say} maxSeconds={20} />
        {has && <p className="talk-yay">🎉 <b>You said it in Kannada!</b> Gini is so happy.</p>}
        <div className="row" style={{ justifyContent: "center" }}>
          {i + 1 < items.length ? <button className="btn primary" onClick={() => setI(i + 1)}>{has ? "Next question" : "Skip"} <ArrowRight size={18} /></button>
            : <button className="btn primary" onClick={finish}>Finish ⭐</button>}
        </div>
      </div>
    </>
  );
}

/* ---------- Write ---------- */
const STEP_INFO = { watch: ["Watch", Eye], trace: ["Trace", PenLine], write: ["On my own", Star] };
function WriteFree(props) {
  const { child, wk, back, easy } = props;
  const items = useMemo(() => [...new Set([...(wk.unit.items || []), ...(wk.unit.review || [])])], [wk]);
  const best = child.letters || {};
  const [sel, setSel] = useState(null);
  if (sel) return <><Head back={() => setSel(null)} title="Write" kn="ಬರೆ" /><WriteSteps {...props} inMission items={[sel]} steps={["watch", "trace", "write"]} onFinish={() => setSel(null)} /></>;
  const doneN = items.filter((t) => best[t] >= 2).length;
  return (
    <>
      <Head back={back} title="Write" kn="ಬರೆ" />
      <div className="kid-card">
        <div className="card-head"><div><b style={{ fontSize: 20 }}>{wk.unit.en}</b><div className="small muted">Tap one to start. {easy ? "Follow the dots!" : "Get 2 stars on each!"}</div></div><span className="pill yellow">{doneN}/{items.length}</span></div>
        {wk.unit.tip && <p className="small" style={{ background: "var(--yellow-soft)", borderRadius: 14, padding: 10, margin: 0 }}>💡 {wk.unit.tip}</p>}
        <div className="letter-grid kid">
          {items.map((t) => (
            <button key={t} className={`lg-cell kn ${best[t] >= 2 ? "has" : ""}`} onClick={() => setSel(t)} aria-label={`${t}, ${best[t] || 0} stars`}>
              <span>{t}</span><small className="lg-stars">{"⭐".repeat(best[t] || 0) || "·"}</small>
            </button>
          ))}
        </div>
        <p className="tiny muted" style={{ textAlign: "center" }}>Then do this week's tracing pages on paper.</p>
      </div>
    </>
  );
}

// Goes through letters, each through its steps (watch, trace, write). Writing alone goes to the teacher.
function WriteSteps({ child, strokeLib, voiceLib, earn, easy, items, steps, memory, onFinish, onItem }) {
  const [k, setK] = useState(0);
  const [s, setS] = useState(0);
  const [res, setRes] = useState(null);
  const [tries, setTries] = useState(0);
  const sel = items[k];
  const mode = steps[s];
  const best = child.letters || {};
  useEffect(() => { setRes(null); setTries(0); }, [k, s]);
  if (!sel) return null;
  const rec = strokeLib[voiceKey(sel)];
  function advance(stars = 1) {
    if (s + 1 >= steps.length && onItem) onItem(sel, stars);
    if (s + 1 < steps.length) setS(s + 1);
    else if (k + 1 < items.length) { setK(k + 1); setS(0); }
    else onFinish && onFinish(stars);
  }
  const hint = SOUND[sel] ? `Say "${SOUND[sel]}" as you write` : "Say it slowly as you write";
  return (
    <div className="kid-card">
      <div className="write-top">
        <span className="pill yellow">{k + 1} of {items.length}</span>
        <div className="wsteps mini">{steps.map((m, j) => { const [l, I] = STEP_INFO[m]; return <span key={m} className={j === s ? "on" : j < s ? "past" : ""}><I size={14} /> {l}</span>; })}</div>
      </div>
      <p style={{ textAlign: "center", margin: 0 }}>
        {mode === "watch" ? <>Watch how <b className="kn" style={{ fontSize: 26 }}>{sel}</b> is written</>
          : mode === "trace" ? <>{easy ? "Follow the dots" : "Trace"} <b className="kn" style={{ fontSize: 26 }}>{sel}</b>. Start at the green dot!</>
            : memory ? <>Write <b>{SOUND[sel] ? `"${SOUND[sel]}"` : "the letter you hear"}</b> from memory</>
              : <>Now write <b className="kn" style={{ fontSize: 26 }}>{sel}</b> on your own</>}
        <span className="small muted" style={{ display: "block" }}>{memory ? "Tap the speaker to hear it." : hint}</span>
      </p>
      {mode === "write" && !memory && <div className="model-mini kn" aria-hidden="true">{sel}</div>}
      {mode === "write" && memory && <div style={{ display: "grid", justifyItems: "center" }}><button className="icon-btn hear" onClick={() => playWord(sel, voiceLib)} aria-label="Hear the letter"><Volume2 /></button></div>}
      <LetterPad key={sel + mode + k} text={sel} mode={mode} record={rec} easy={easy}
        onDone={(r) => {
          setRes(r); setTries((t) => t + 1);
          if (mode === "write" && r.stars >= 1) {
            const prev = best[sel] || 0;
            earn("write", r.stars, r.stars > prev ? { letters: { ...best, [sel]: r.stars } } : {}, { item: sel, score: Math.round(r.coverage * 100), strokes: r.strokes, aspect: r.aspect, memory: !!memory });
          }
        }} />
      <div className="row" style={{ justifyContent: "center" }}>
        {mode === "watch" && <button className="btn primary" onClick={() => advance()}>{steps[s + 1] === "trace" ? "I'm ready to trace" : "Next"} <ArrowRight size={18} /></button>}
        {mode !== "watch" && res && res.stars >= 1 && <button className="btn primary" onClick={() => advance(res.stars)}>{s + 1 < steps.length ? `Now: ${STEP_INFO[steps[s + 1]][0].toLowerCase()}` : k + 1 < items.length ? <>Next: <span className="kn">{items[k + 1]}</span></> : "Done"} <ArrowRight size={18} /></button>}
        {mode !== "watch" && res && res.stars === 0 && tries >= (easy ? 1 : 3) && <button className="btn ghost" onClick={() => advance(0)}><SkipForward size={18} /> Skip for now</button>}
      </div>
    </div>
  );
}

/* ---------- Build: put words in order, fill the gap, make it longer ---------- */
function Build({ rounds, voiceLib, earn, back, say, onFinish, inMission }) {
  const [r, setR] = useState(0);
  const [misses, setMisses] = useState(0);
  const [end, setEnd] = useState(false);
  const cur = rounds[r];
  function next(missed) {
    const m = misses + missed; setMisses(m);
    if (r + 1 < rounds.length) setR(r + 1);
    else { const stars = m === 0 ? 3 : m <= 3 ? 2 : 1; earn("build", stars); if (onFinish) onFinish(stars); else setEnd(stars); }
  }
  if (end) return <Celebrate stars={end} text="You built every sentence!" back={back} again={() => { setR(0); setMisses(0); setEnd(false); }} />;
  if (!cur) return null;
  return (
    <>
      {!inMission && <Head back={back} title="Build" kn="ವಾಕ್ಯ ಕಟ್ಟು" />}
      <div className="kid-card">
        <div className="dots">{rounds.map((_, j) => <i key={j} className={j <= r ? "on" : ""} />)}</div>
        {cur.type === "gap" ? <Gap key={r} round={cur} rounds={rounds} voiceLib={voiceLib} onDone={next} /> : <Order key={r} round={cur} voiceLib={voiceLib} say={say} onDone={next} />}
      </div>
    </>
  );
}

function Order({ round, voiceLib, say, onDone }) {
  const words = useMemo(() => tiles(round.kn), [round.kn]);
  const mark = /\?$/.test(round.kn) ? "?" : ".";
  const bank0 = useMemo(() => { let b; let n = 0; do { b = shuffle(words.map((w, i) => ({ w, i }))); } while (words.length > 1 && n++ < 20 && b.every((x, j) => x.i === j)); return b; }, [words]);
  const [placed, setPlaced] = useState([]);
  const [state, setState] = useState(null);
  const [missed, setMissed] = useState(0);
  const prevWords = round.prev ? new Set(tiles(round.prev)) : null;
  const bank = bank0.filter((x) => !placed.includes(x));
  useEffect(() => { if (!round.en || /^Listen/.test(round.en)) setTimeout(() => playWord(round.kn, voiceLib), 300); /* eslint-disable-next-line */ }, []);
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
        <p className="build-en" style={{ fontSize: 20, fontWeight: 800, margin: "6px 0 0" }}>{round.en || "Listen, then put the words in order"}</p>
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
      {state === "right" && <p style={{ textAlign: "center", margin: 0 }} className="kn"><b style={{ color: "var(--leaf)" }}>✓ {round.kn}</b> <span className="small">Now say it out loud!</span></p>}
    </div>
  );
}

function Gap({ round, rounds, voiceLib, onDone }) {
  const options = useMemo(() => {
    const pool = [...new Set(rounds.filter((x) => x.type === "gap").map((x) => x.ans))].filter((x) => x !== round.ans);
    return shuffle([round.ans, ...shuffle(pool).slice(0, 2)]);
  }, [round, rounds]);
  const [pick, setPick] = useState(null);
  const [missed, setMissed] = useState(0);
  const ok = pick === round.ans;
  const [before, after] = round.text.split("___");
  return (
    <div className="stack">
      <div style={{ textAlign: "center" }}><span className="pill yellow">Fill the gap</span></div>
      <p className="kn gap-line">{before}<span className={`gap ${pick ? (ok ? "right" : "bad") : ""}`}>{pick || "?"}</span>{after}</p>
      <div className="build-bank">
        {options.map((o) => <button key={o} className="wtile kn" disabled={ok} onClick={() => { setPick(o); if (o === round.ans) playWord(round.kn, voiceLib); else setMissed((m) => m + 1); }}>{o}</button>)}
      </div>
      {ok && <div className="row" style={{ justifyContent: "center" }}><button className="btn primary" onClick={() => onDone(missed)}>Next <ArrowRight size={18} /></button></div>}
    </div>
  );
}

/* ---------- Stars, letters and birds ---------- */
function Stars({ child, wk, back }) {
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
        <p className="talk-yay" style={{ margin: 0 }}>🗣️ I talked in Kannada <b>{child.spoken || 0}</b> {(child.spoken || 0) === 1 ? "time" : "times"}!</p>
      </div>
      <div className="kid-card">
        <h3>Letters I can write</h3>
        {letters.length ? <div className="letter-grid kid small">{letters.map(([t, s]) => <span key={t} className={`lg-cell kn ${s >= 2 ? "has" : ""}`}><span>{t}</span><small className="lg-stars">{"⭐".repeat(s)}</small></span>)}</div>
          : <p className="muted small">Write letters to fill this up!</p>}
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
        <p className="small muted">You're a <b>{STAGES[Math.max(...SKILLS.map((k) => (child.stages || {})[k] || 0))].en}</b>! Your teacher moves you up as you grow.</p>
      </div>
      <div className="kid-card">
        <h3>My weeks</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(64px,1fr))", gap: 8 }}>
          {Array.from({ length: PLAN_WEEKS }, (_, j) => j + 1).map((n) => {
            const d = ALL_DAYS.filter((_, i) => (weeks[n] || {})[dayKey(i + 1)]).length;
            return <div key={n} style={{ borderRadius: 14, padding: 8, textAlign: "center", background: n > w ? "#f3ead8" : d >= 6 ? "var(--yellow)" : d ? "var(--yellow-soft)" : "#fff", border: n === w ? "3px solid var(--red)" : "1px solid var(--line)", opacity: n > w ? 0.5 : 1 }}>
              <div className="tiny muted">{isMeetWeek(n) ? "Meet" : `Wk ${n}`}</div>
              <div style={{ fontSize: 16 }}>{n > w ? <Lock size={16} /> : d >= 6 ? "🏅" : d ? `${d}/6` : "·"}</div>
            </div>;
          })}
        </div>
      </div>
    </>
  );
}

/* ---------- Words corner: every theme, any time ---------- */
function WordsCorner(props) {
  const { wk, back, go, themeId, voiceLib, say } = props;
  const theme = THEMES.find((t) => t.id === themeId);
  const [mode, setMode] = useState("look");
  useEffect(() => { setMode("look"); }, [themeId]);
  if (!theme) return (
    <>
      <Head back={back} title="Words corner" kn="ಪದಗಳು" />
      <div className="theme-grid">
        {THEMES.map((t) => (
          <button key={t.id} className={`theme-card ${t.id === wk.theme.id ? "now" : ""}`} onClick={() => go("kid", "words", t.id)}>
            {t.id === wk.theme.id && <span className="pill yellow tiny">This week</span>}
            <span className="tc-pics" aria-hidden="true">{t.words.slice(0, 3).map((w) => w[3]).join("")}</span>
            <b>{t.en}</b><small className="kn">{t.kn}</small>
          </button>
        ))}
      </div>
    </>
  );
  const cards = theme.words.map((w) => ({ kn: w[0], rom: w[1], en: w[2], pic: w[3] }));
  const toGrid = () => go("kid", "words");
  return (
    <>
      <Head back={toGrid} title={theme.en} kn={theme.kn} />
      <div className="seg" style={{ justifySelf: "center" }}>
        <button aria-pressed={mode === "look"} onClick={() => setMode("look")}>Look and say</button>
        <button aria-pressed={mode === "cards"} onClick={() => setMode("cards")}>Flashcards</button>
        <button aria-pressed={mode === "play"} onClick={() => setMode("play")}>Play</button>
      </div>
      {mode === "look" ? (
        <div className="kid-card">
          <div className="word-grid">
            {cards.map((c) => (
              <button key={c.kn} className="word-tile" onClick={() => playWord(c.kn, voiceLib)} aria-label={`${c.en}, ${c.rom}`}>
                <span className="wt-pic" aria-hidden="true">{c.pic}</span>
                <b className="kn">{c.kn}</b><small>{c.rom} · {c.en}</small>
              </button>
            ))}
          </div>
          <p className="small muted" style={{ textAlign: "center", margin: 0 }}>Tap a picture to hear it, then say it out loud!</p>
        </div>
      ) : mode === "cards" ? <Listen key={theme.id} {...props} inMission cards={cards} onFinish={() => { say("You know all the " + theme.en.toLowerCase() + " words!"); setMode("play"); }} />
        : <PlayGame key={theme.id + "p"} {...props} inMission mode="words" words={theme.words} onFinish={() => toGrid()} />}
    </>
  );
}

/* ---------- Letter journey: 45 self-paced days of writing and reading ---------- */
function JourneyCard({ child, go }) {
  const j = journeyOf(child);
  const doneN = Object.keys(j.done).length;
  return (
    <button className="journey-card" onClick={() => go("kid", "journey")}>
      <div className="mc-top"><span className="label">Letter journey · ಅಕ್ಷರ ಪಯಣ</span><span className="mc-mins">{doneN}/{JOURNEY_DAYS} days</span></div>
      <b className="mc-title">{j.finished ? "🏆 You finished the journey!" : <>{j.section.icon} Day {j.day}: <span className="kn">{j.lesson.items.slice(0, 5).join(" ")}</span></>}</b>
      <div className="jc-bar" aria-hidden="true"><i style={{ width: `${Math.round((doneN / JOURNEY_DAYS) * 100)}%` }} /></div>
      <span className="small">{j.section.en} · write it, find it, read it</span>
    </button>
  );
}

function JourneyMap({ child, back, go }) {
  const j = journeyOf(child);
  const nextSec = SECTIONS[SECTIONS.indexOf(j.section) + 1];
  return (
    <>
      <Head back={back} title="Letter journey" kn="ಅಕ್ಷರ ಪಯಣ" />
      <div className="kid-card">
        <button className="btn primary" style={{ justifySelf: "stretch", fontSize: 20 }} onClick={() => go("kid", "journey", String(j.day))}>{j.finished ? "Play the last day again" : <>Start day {j.day}: <span className="kn">{j.lesson.items.slice(0, 4).join(" ")}</span></>} <ArrowRight size={18} /></button>
        {nextSec && <button className="btn ghost" onClick={() => go("kid", "journey", "check")}><Rocket size={18} /> I know the {j.section.en.toLowerCase()} already: quick check to jump to {nextSec.en.toLowerCase()}</button>}
      </div>
      {SECTIONS.map((sec) => (
        <div className="kid-card" key={sec.id}>
          <h3>{sec.icon} {sec.en} <span className="kn muted" style={{ fontWeight: 500 }}>{sec.kn}</span></h3>
          <div className="jmap">
            {JOURNEY.slice(sec.from - 1, sec.to).map((d) => {
              const done = !!j.done[d.day], open = done || d.day <= j.day;
              return (
                <button key={d.day} className={`jday ${done ? "done" : d.day === j.day ? "now" : ""}`} disabled={!open} onClick={() => go("kid", "journey", String(d.day))} aria-label={`Day ${d.day}${done ? ", done" : open ? "" : ", locked"}`}>
                  <small>Day {d.day}</small><b className="kn">{d.items.slice(0, 3).join(" ")}</b>{done ? <span className="jd-mark">★</span> : !open ? <Lock size={12} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function JourneyDay(props) {
  const { child, day, back, earn, go, easy } = props;
  const lesson = JOURNEY[Math.max(1, Math.min(JOURNEY_DAYS, day)) - 1];
  const known = learnedBefore(lesson.day);
  const steps = useMemo(() => {
    const out = [
      { kind: "meet", title: "Meet today's letters" },
      { kind: "write", title: "Write them" },
      { kind: "hunt", title: "Find the sound" },
      { kind: "read", title: lesson.story ? "Read the story" : "Read words" },
    ];
    if (known.length >= 2) out.push({ kind: "remember", title: "Remember: write from memory" });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.day]);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => { setI(0); setDone(false); }, [day]);
  const review = useMemo(() => shuffle(known.filter((k) => [...k].length <= 2)).slice(0, 2), [lesson.day]); // eslint-disable-line react-hooks/exhaustive-deps
  function next() {
    if (i + 1 < steps.length) { setI(i + 1); window.scrollTo({ top: 0 }); return; }
    setDone(true);
    const j = journeyOf(child);
    const dn = { ...j.done, [lesson.day]: true };
    earn("journey", 3, { journey: { day: Math.max(j.day, Math.min(JOURNEY_DAYS, lesson.day + 1)), done: dn, skipped: j.skipped } }, { item: `day ${lesson.day}` });
  }
  if (done) return (
    <div className="kid-card celebrate">
      <Gini className="gini" mood="cheer" />
      <div className="stars-burst">⭐⭐⭐</div>
      <h2><span className="kn">ಶಭಾಷ್!</span> Day {lesson.day} done!</h2>
      {lesson.day < JOURNEY_DAYS ? <p>Day {lesson.day + 1} is open: <b className="kn">{JOURNEY[lesson.day].items.slice(0, 4).join(" ")}</b></p> : <p>You finished the whole letter journey!</p>}
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn ghost" onClick={back}>Back home</button>
        {lesson.day < JOURNEY_DAYS && <button className="btn primary" onClick={() => go("kid", "journey", String(lesson.day + 1))}>Keep going: day {lesson.day + 1} <ArrowRight size={18} /></button>}
      </div>
    </div>
  );
  const st = steps[i];
  const sec = sectionOf(lesson.day);
  const cards = lesson.items.map((x, k) => {
    const w = LETTER_WORD[x];
    return { kn: x, rom: lesson.sounds && lesson.sounds[k] ? `"${lesson.sounds[k]}"` : "", en: w ? `as in ${w[0]} (${w[2]})` : lesson.words[k] ? `as in ${lesson.words[k][0]} (${lesson.words[k][2]})` : "", pic: LETTER_PIC[x] || (lesson.words[k] && lesson.words[k][3]) || "🔤" };
  });
  const cfg = { ...props, inMission: true, onFinish: next };
  return (
    <>
      <div className="kid-back"><button className="icon-btn" style={{ background: "#fff" }} onClick={() => go("kid", "journey")} aria-label="Back"><ArrowLeft /></button>
        <div><h2>{sec.icon} Day {lesson.day}</h2><div className="small">Step {i + 1} of {steps.length}: <b>{st.title}</b></div></div></div>
      <div className="mission-steps">{steps.map((x, k) => <span key={k} className={k < i ? "on" : k === i ? "now" : ""} />)}</div>
      {lesson.tip && i === 0 && <p className="small kid-tip">💡 {lesson.tip}</p>}
      {st.kind === "meet" ? <Listen key={"m" + day} {...cfg} cards={cards} />
        : st.kind === "write" ? <WriteSteps key={"w" + day} {...cfg} items={lesson.items} steps={["watch", "trace", "write"]} />
          : st.kind === "hunt" ? <LetterHunt key={"h" + day} {...cfg} targets={lesson.items} sounds={lesson.sounds} pool={known} />
            : st.kind === "read" ? <ReadWords key={"r" + day} {...cfg} words={(lesson.reading && lesson.reading.length ? lesson.reading : lesson.words)} story={lesson.story} />
              : <WriteSteps key={"rm" + day} {...cfg} items={review} steps={["write"]} memory />}
    </>
  );
}

// Hear a sound (or read it), tap the right letter.
function LetterHunt({ targets, sounds = [], pool = [], voiceLib, earn, onFinish, rounds: R = 6, onScore }) {
  const make = () => shuffle(Array.from({ length: R }, (_, r) => r % targets.length)).map((k) => {
    const t = targets[k];
    const others = shuffle([...new Set([...targets, ...pool])].filter((x) => x !== t)).slice(0, 3);
    return { t, sound: sounds[k] || "", options: shuffle([t, ...others]) };
  });
  const [rounds] = useState(make);
  const [r, setR] = useState(0);
  const [pick, setPick] = useState(null);
  const [right, setRight] = useState(0);
  const cur = rounds[r];
  useEffect(() => { if (cur) setTimeout(() => playWord(cur.t, voiceLib), 250); /* eslint-disable-next-line */ }, [r]);
  function choose(o) {
    if (pick) return;
    const ok = o === cur.t; setPick({ o, ok });
    const n = right + (ok ? 1 : 0); if (ok) setRight(n);
    setTimeout(() => {
      setPick(null);
      if (r + 1 < rounds.length) setR(r + 1);
      else { const stars = n >= R - 1 ? 3 : n >= R / 2 ? 2 : 1; earn("hunt", stars); onScore && onScore(n, R); onFinish && onFinish(stars); }
    }, ok ? 650 : 1100);
  }
  if (!cur) return null;
  return (
    <div className="kid-card">
      <div className="card-head"><span className="label">Find the sound · {r + 1} of {rounds.length}</span><span className="pill green">{right} ✓</span></div>
      <div style={{ display: "grid", justifyItems: "center", gap: 6 }}>
        <button className="big-round red" onClick={() => playWord(cur.t, voiceLib)} aria-label="Hear the sound"><Volume2 /></button>
        {cur.sound && <b style={{ fontSize: 26 }}>"{cur.sound}"</b>}
        <span className="small muted">Tap the letter you hear</span>
      </div>
      <div className="hunt-grid">
        {cur.options.map((o) => <button key={o} className={`hunt-btn kn ${pick && pick.o === o ? (pick.ok ? "right" : "wrong") : ""} ${pick && !pick.ok && o === cur.t ? "right" : ""}`} onClick={() => choose(o)}>{o}</button>)}
      </div>
    </div>
  );
}

// Read a word out loud, then check: hear it and see the picture.
function ReadWords({ words, story, voiceLib, earn, onFinish }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [storyOn, setStoryOn] = useState(false);
  const w = words[i];
  if (storyOn && story) return (
    <div className="kid-card">
      <span className="label">Read the story out loud</span>
      <div className="story">{story.map((l) => <p key={l} className="kn">{l} <button className="icon-btn hear" onClick={() => playWord(l, voiceLib)} aria-label="Hear this line"><Volume2 size={18} /></button></p>)}</div>
      <button className="btn primary" onClick={() => { earn("read", 3); onFinish && onFinish(3); }}>I read it! ⭐</button>
    </div>
  );
  if (!w) return null;
  return (
    <div className="kid-card">
      <div className="dots">{words.map((_, j) => <i key={j} className={j <= i ? "on" : ""} />)}</div>
      <p style={{ textAlign: "center", margin: 0 }} className="muted">Read it out loud first. Then check!</p>
      <div className="read-word kn">{w[0]}</div>
      {shown ? (
        <div className="flash"><div className="pic" aria-hidden="true">{w[3]}</div><div className="rom">{w[1]}</div><div className="en">{w[2]}</div></div>
      ) : <button className="btn yellow" style={{ justifySelf: "center" }} onClick={() => { setShown(true); playWord(w[0], voiceLib); }}><Eye size={18} /> Check</button>}
      {shown && <div className="row" style={{ justifyContent: "center" }}>
        <button className="icon-btn hear" onClick={() => playWord(w[0], voiceLib)} aria-label="Hear it"><Volume2 /></button>
        <button className="btn primary" onClick={() => { setShown(false); if (i + 1 < words.length) setI(i + 1); else if (story) setStoryOn(true); else { earn("read", 2); onFinish && onFinish(2); } }}>Next <ArrowRight size={18} /></button>
      </div>}
    </div>
  );
}

// Quick check: pass it to jump to the next section.
function QuickCheck(props) {
  const { child, go, earn } = props;
  const j = journeyOf(child);
  const sec = j.section, nextSec = SECTIONS[SECTIONS.indexOf(sec) + 1];
  const pool = useMemo(() => [...new Set(JOURNEY.slice(sec.from - 1, sec.to).flatMap((d) => d.items))], [sec]);
  const sounds = useMemo(() => Object.fromEntries(JOURNEY.slice(sec.from - 1, sec.to).flatMap((d) => d.items.map((x, k) => [x, (d.sounds || [])[k] || ""]))), [sec]);
  const targets = useMemo(() => shuffle(pool).slice(0, 8), [pool]);
  const toWrite = useMemo(() => shuffle(pool.filter((x) => [...x].length <= 2)).slice(0, 3), [pool]);
  const [stage, setStage] = useState("hunt");
  const [huntOk, setHuntOk] = useState(false);
  const writes = useRef([]);
  if (!nextSec) { go("kid", "journey"); return null; }
  if (stage === "result") {
    const pass = huntOk && writes.current.length === toWrite.length && writes.current.every((x) => x >= 1);
    return (
      <div className="kid-card celebrate">
        <Gini className="gini" mood={pass ? "cheer" : "think"} />
        {pass ? <>
          <h2><span className="kn">ಶಭಾಷ್!</span> You know your {sec.en.toLowerCase()}!</h2>
          <p>{nextSec.icon} {nextSec.en} are open now.</p>
          <button className="btn primary" onClick={async () => {
            await earn("check", 3, { journey: { day: Math.max(j.day, nextSec.from), done: j.done, skipped: [...(j.skipped || []), sec.id] } }, { item: `jumped to ${nextSec.en}` });
            go("kid", "journey", String(nextSec.from));
          }}>Start {nextSec.en.toLowerCase()} <ArrowRight size={18} /></button>
        </> : <>
          <h2>Almost! Let's keep practising.</h2>
          <p>Carry on with day {j.day}. You can try the check again any time.</p>
          <button className="btn primary" onClick={() => go("kid", "journey", String(j.day))}>Go to day {j.day} <ArrowRight size={18} /></button>
        </>}
      </div>
    );
  }
  return (
    <>
      <Head back={() => go("kid", "journey")} title="Quick check" kn="ಪರೀಕ್ಷೆ" />
      <p className="small kid-tip">Find 7 of 8 sounds, then write 3 letters from memory, and you jump to {nextSec.en.toLowerCase()}.</p>
      {stage === "hunt" ? <LetterHunt {...props} targets={targets} sounds={targets.map((t) => sounds[t])} pool={pool} rounds={8} onScore={(n) => setHuntOk(n >= 7)} onFinish={() => setStage("write")} />
        : <WriteSteps {...props} items={toWrite} steps={["write"]} memory onItem={(_, stars) => writes.current.push(stars)} onFinish={() => setStage("result")} />}
    </>
  );
}

/* ---------- Stories: read, understand, dictation, write your own (Big writers) ---------- */
function StoryRead({ child, wk, story, record, mustRecord, voiceLib, earn, say, profile, onFinish, inMission }) {
  const [enOn, setEnOn] = useState({});
  const [clip, setClip] = useState(null);
  const [busy, setBusy] = useState(false);
  async function done() {
    setBusy(true);
    let sent = 0;
    if (clip) { try { sent = await sendClips({ child, profile, week: wk.week, kind: "reading", clips: { 0: clip }, labels: { 0: `Read aloud: ${story.en}` }, note: `Read the story aloud: ${story.kn}` }); } catch (e) { say(friendlyError(e), true); } }
    earn("story", clip ? 3 : 2, sent ? { spoken: (child.spoken || 0) + 1 } : {}, { item: story.id });
    setBusy(false);
    onFinish && onFinish(clip ? 3 : 2);
  }
  return (
    <div className="kid-card story-card">
      <div className="story-title"><span className="pic" aria-hidden="true">{story.pic}</span><div><h2 className="kn" style={{ margin: 0 }}>{story.kn}</h2><span className="small muted">{story.en}</span></div></div>
      <p className="small muted" style={{ margin: 0 }}>Read each line out loud. Tap 🔊 to check, and ? for the English.</p>
      {story.lines.map((l, i) => (
        <div className="story-line" key={i}>
          <p className="kn">{l}</p>
          <div className="row" style={{ gap: 4 }}>
            <button className="icon-btn hear" onClick={() => playWord(l, voiceLib)} aria-label={`Hear line ${i + 1}`}><Volume2 size={18} /></button>
            <button className="icon-btn" style={{ background: "#fff" }} onClick={() => setEnOn((x) => ({ ...x, [i]: !x[i] }))} aria-label={`English for line ${i + 1}`}>?</button>
          </div>
          {enOn[i] && <span className="en">{story.en_lines[i]}</span>}
        </div>
      ))}
      {record && (
        <div className="stack-s">
          <span className="label">{mustRecord ? "Record yourself reading the whole story" : "Record yourself reading it (your teacher will listen)"}</span>
          <RecordBlock clip={clip} onClip={setClip} voiceLib={voiceLib} say={say} maxSeconds={120} />
        </div>
      )}
      <button className="btn primary" disabled={busy} onClick={done}>{clip ? "Send my reading ⭐" : "I read it ⭐"}</button>
    </div>
  );
}

function StoryQuestions({ story, voiceLib, earn, onFinish }) {
  const qs = useMemo(() => story.q.map(([q, right, ...other]) => ({ q, right, options: shuffle([right, ...other]) })), [story]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const cur = qs[i];
  useEffect(() => { if (cur) setTimeout(() => playWord(cur.q, voiceLib), 250); /* eslint-disable-next-line */ }, [i]);
  function choose(o) {
    if (pick && pick.ok) return;
    const ok = o === cur.right; setPick({ o, ok });
    if (ok) { const sc = score + (pick ? 0 : 1); setScore(sc); if (!pick) playWord(o, voiceLib); }
  }
  function next() {
    if (i + 1 < qs.length) { setI(i + 1); setPick(null); }
    else { const stars = score === qs.length ? 3 : score >= 2 ? 2 : 1; earn("questions", stars, {}, { item: story.id, score }); onFinish && onFinish(stars); }
  }
  return (
    <div className="kid-card">
      <div className="card-head"><span className="label">Question {i + 1} of {qs.length} · {story.en}</span><span className="pill green">{score} ✓</span></div>
      <div className="row" style={{ alignItems: "flex-start" }}><b className="kn" style={{ fontSize: "clamp(22px,6vw,28px)", flex: 1 }}>{cur.q}</b><button className="icon-btn hear" onClick={() => playWord(cur.q, voiceLib)} aria-label="Hear the question"><Volume2 size={18} /></button></div>
      <div className="stack-s">{cur.options.map((o) => <button key={o} className={`q-opt kn ${pick && pick.o === o ? (pick.ok ? "right" : "wrong") : ""}`} onClick={() => choose(o)}>{o}</button>)}</div>
      {pick && !pick.ok && <p className="small" style={{ margin: 0 }}>Not quite. Look at the story again and try another answer.</p>}
      {pick && pick.ok && <button className="btn primary" onClick={next}>{i + 1 < qs.length ? "Next question" : "Finish"} <ArrowRight size={18} /></button>}
    </div>
  );
}

function Dictation({ lines, voiceLib, earn, onFinish }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [pad, setPad] = useState(null);
  const [right, setRight] = useState(0);
  const line = lines[i];
  useEffect(() => { setShown(false); setPad(null); if (line) setTimeout(() => playWord(line, voiceLib), 300); /* eslint-disable-next-line */ }, [i]);
  function mark(ok) {
    const r = right + (ok ? 1 : 0); setRight(r);
    earn("dictation", ok ? 2 : 1, {}, { item: line, ok, ...(pad ? { strokes: pad.strokes, aspect: pad.aspect } : {}) });
    if (i + 1 < lines.length) setI(i + 1); else onFinish && onFinish(r === lines.length ? 3 : 2);
  }
  if (!line) return null;
  return (
    <div className="kid-card">
      <div className="card-head"><span className="label">Dictation {i + 1} of {lines.length}</span><span className="pill green">{right} ✓</span></div>
      <div style={{ display: "grid", justifyItems: "center", gap: 6 }}>
        <button className="big-round red" onClick={() => playWord(line, voiceLib)} aria-label="Hear the sentence"><Volume2 /></button>
        <span className="small muted">Listen as many times as you like. Write it on paper, or here with your finger.</span>
      </div>
      {!shown && <WritePad key={i} aspect={2.2} lines={2} onChange={(strokes, aspect) => setPad(strokes ? { strokes, aspect } : null)} />}
      {!shown ? <button className="btn yellow" onClick={() => setShown(true)}><Eye size={18} /> Show the answer</button> : (
        <>
          <p className="dict-answer kn">{line}</p>
          <span className="small">Check every letter and sign. How did you do?</span>
          <div className="row" style={{ justifyContent: "center" }}>
            <button className="btn primary" onClick={() => mark(true)}><Check size={18} /> I got it right</button>
            <button className="btn ghost" onClick={() => mark(false)}>Nearly: I'll fix it</button>
          </div>
        </>
      )}
    </div>
  );
}

function StoryWrite({ child, wk, story, voiceLib, earn, say, profile, onFinish }) {
  const [pad, setPad] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [clip, setClip] = useState(null);
  const [busy, setBusy] = useState(false);
  const cam = useRef(null);
  async function send() {
    if (!pad && !photo && !clip) return say("Write your story (here or on paper), then send it.", true);
    setBusy(true);
    try {
      const files = [];
      if (photo) { const f = await compressImage(photo); const path = `handins/${child.id}/${Date.now()}_${safeName(f.name)}`; await store.upload(path, f); files.push({ path, type: f.type, name: "My story (paper)" }); }
      if (clip) { const path = `speaking/${child.id}/${Date.now()}_story.${audioExt(clip.type)}`; await store.upload(path, clip); files.push({ path, type: clip.type || "audio/webm", name: "Reading my story" }); }
      if (files.length) await store.add("submissions", { childId: child.id, parentEmails: child.parentEmails, kind: "story", week: wk.week, files, note: `My story (after "${story.en}")`, status: "sent", by: profile.uid, byName: profile.name, at: Date.now() });
      await earn("storywrite", 3, clip ? { spoken: (child.spoken || 0) + 1 } : {}, { item: story.id, ...(pad ? { strokes: pad.strokes, aspect: pad.aspect } : {}) });
      say("Your story is with your teacher!");
      onFinish && onFinish(3);
    } catch (e) { say(friendlyError(e), true); }
    setBusy(false);
  }
  return (
    <div className="kid-card">
      <span className="label">Write your own story</span>
      <b style={{ fontSize: 18 }}>{story.write}</b>
      <div className="talk-hints" style={{ justifyContent: "flex-start" }}>{[...story.bank, ...story.words.map((w) => w[0])].map((w) => <button key={w} className="hint-chip kn" onClick={() => playWord(w, voiceLib)}>{w}</button>)}</div>
      <span className="small muted">Write on paper and take a photo, or write here. Then read it aloud!</span>
      <WritePad aspect={1.25} lines={5} onChange={(strokes, aspect) => setPad(strokes ? { strokes, aspect } : null)} label="Write your story" />
      <div className="row">
        <button className="btn ghost small" onClick={() => cam.current.click()}>📷 {photo ? "Retake photo" : "Photo of my paper"}</button>
        {photo && <span className="pill green">Photo ready</span>}
        <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { setPhoto(e.target.files[0] || null); e.target.value = ""; }} />
      </div>
      <span className="label">Read your story aloud</span>
      <RecordBlock clip={clip} onClip={setClip} voiceLib={voiceLib} say={say} maxSeconds={120} />
      <button className="btn primary" disabled={busy} onClick={send}>{busy ? "Sending…" : "Send my story to my teacher ⭐"}</button>
    </div>
  );
}

function StoryCorner(props) {
  const { wk, back, go, storyId } = props;
  const [stage, setStage] = useState("read");
  useEffect(() => { setStage("read"); }, [storyId]);
  const st = STORIES.find((x) => x.id === storyId);
  const thisWeek = storyFor(wk.packet.n);
  if (!st) return (
    <>
      <Head back={back} title="Story corner" kn="ಕಥೆಗಳು" />
      <div className="story-list">
        {STORIES.map((x) => (
          <button key={x.id} className={`story-item ${x.id === thisWeek.id ? "now" : ""}`} onClick={() => go("kid", "stories", x.id)}>
            <span className="pic" aria-hidden="true">{x.pic}</span>
            <span><b className="kn" style={{ fontSize: 20 }}>{x.kn}</b><span className="small muted" style={{ display: "block" }}>{x.en}{x.id === thisWeek.id ? " · this week" : ""}</span></span>
            <ArrowRight />
          </button>
        ))}
      </div>
    </>
  );
  const toList = () => go("kid", "stories");
  const cfg = { ...props, inMission: true };
  return (
    <>
      <Head back={toList} title={st.en} kn="" />
      <div className="seg" style={{ justifySelf: "center" }}>
        {[["read", "Read"], ["questions", "Questions"], ["dictation", "Dictation"], ["write", "Write"]].map(([k, l]) => <button key={k} aria-pressed={stage === k} onClick={() => setStage(k)}>{l}</button>)}
      </div>
      {stage === "read" ? <StoryRead key={st.id + "r"} {...cfg} story={st} record onFinish={() => setStage("questions")} />
        : stage === "questions" ? <StoryQuestions key={st.id + "q"} {...cfg} story={st} onFinish={() => setStage("dictation")} />
          : stage === "dictation" ? <Dictation key={st.id + "d"} {...cfg} lines={st.lines.filter((l) => !/"/.test(l)).slice(0, 3)} onFinish={() => setStage("write")} />
            : <StoryWrite key={st.id + "w"} {...cfg} story={st} onFinish={toList} />}
    </>
  );
}


/* ---------- Grown-up learners ---------- */
function AdultHome({ child, go }) {
  const L = adultLevelOf(child), LV = ADULT_LEVELS[L - 1];
  const u = nextUnit(child), done = doneUnits(child), nDone = UNITS.filter((x) => done[x.id]).length;
  const nm = firstName(child.name);
  const pace = adultPace(child);
  return (
    <>
      <div className="kid-hello">
        <Gini className="gini" mood="cheer" />
        <div className="bubble">
          <h1><span className="kn">ನಮಸ್ಕಾರ</span> {nm}!</h1>
          <p>{LV.icon} Level {L}: <b>{LV.en}</b> <span className="kn">{LV.kn}</span> · {nDone} of {UNITS.length} lessons done</p>
        </div>
      </div>
      {u && pace.thisWeek ? (
        <div className="kid-card">
          <span className="label">Week {pace.week} of {pace.weeks} · this week's lesson is done ✓</span>
          <b style={{ fontSize: 19 }}>Now make it stick</b>
          <ul className="list" style={{ margin: 0 }}>
            {pace.review && <li><span aria-hidden="true" style={{ fontSize: 22 }}>{pace.review.icon}</span><div className="grow"><b>Redo a role-play</b><div className="sub">{pace.review.en}: say your lines faster this time</div></div><button className="btn ghost small" onClick={() => go("kid", "unit", String(unitNo(pace.review)))}>Go</button></li>}
            <li><span aria-hidden="true" style={{ fontSize: 22 }}>✏️</span><div className="grow"><b>Two letter-journey days</b><div className="sub">Reading and writing, 10 minutes each</div></div><button className="btn ghost small" onClick={() => go("kid", "journey")}>Go</button></li>
            <li><span aria-hidden="true" style={{ fontSize: 22 }}>🗣️</span><div className="grow"><b>Use Talk both ways with your partner</b><div className="sub">Say one real thing in Kannada every day</div></div><button className="btn ghost small" onClick={() => go("kid", "say")}>Go</button></li>
          </ul>
          <button className="btn quiet small" style={{ justifySelf: "start" }} onClick={() => go("kid", "unit", String(unitNo(u)))}>Ready for more? Start lesson {unitNo(u)} early <ArrowRight size={16} /></button>
        </div>
      ) : u ? (
        <button className="mission-card" onClick={() => go("kid", "unit", String(unitNo(u)))}>
          <div className="mc-top"><span className="label" style={{ color: "#fff" }}>Week {pace.week} of {pace.weeks} · this week's lesson</span><span className="mc-mins">15 to 20 min</span></div>
          <b className="mc-title">{u.icon} Lesson {unitNo(u)}: {u.en} <span className="kn" style={{ fontWeight: 500 }}>{u.kn}</span></b>
          <span className="small" style={{ color: "#fff", opacity: .9 }}>{u.goal}</span>
          <span className="btn yellow mc-go">Start <ArrowRight size={18} /></span>
        </button>
      ) : <div className="kid-card"><h2>🏆 All {UNITS.length} lessons done!</h2><p style={{ margin: 0 }}>Keep going with stories, the script and "Talk both ways". Any lesson can be done again.</p></div>}
      <ProgramPlan child={child} compact onOpen={() => go("kid", "plan")} />
      <button className="say-card" onClick={() => go("kid", "say")}>
        <Languages size={34} />
        <span><b>Talk both ways: English ⇄ ಕನ್ನಡ</b><small>Speak English, hear Kannada with easy pronunciation. Speak Kannada, hear English. Your phrases are saved.</small></span>
        <ArrowRight />
      </button>
      <JourneyCard child={child} go={go} />
      <p className="small muted" style={{ margin: "-6px 6px 0" }}>{L >= 3 ? "Reading and writing is part of your level: one letter lesson a day." : "Reading and writing the script is optional at your level. Start whenever you like."}</p>
      <button className="say-card words" onClick={() => go("kid", "stories")}>
        <span className="wc-pics" aria-hidden="true">📖</span>
        <span><b>Stories</b><small>12 short stories to read aloud, with English and questions.</small></span>
        <ArrowRight />
      </button>
      <button className="say-card words" onClick={() => go("kid", "words")}>
        <span className="wc-pics" aria-hidden="true">🎨🍎👪</span>
        <span><b>Word lists</b><small>Colours, family, fruits, animals, body, home and more, with pictures.</small></span>
        <ArrowRight />
      </button>
      <button className="level-btn" onClick={() => go("kid", "level")}>
        <span aria-hidden="true" style={{ fontSize: 30 }}>{LV.icon}</span>
        <span><b>Level {L}: {LV.en}</b><small>{L < 4 ? `Ready for more? Try level ${L + 1}.` : "The top level."}</small></span>
        <ArrowRight />
      </button>
    </>
  );
}

function CourseMap({ child, back, go }) {
  const done = doneUnits(child), L = adultLevelOf(child);
  return (
    <>
      <Head back={back} title="All lessons" kn="ಪಾಠಗಳು" />
      {ADULT_LEVELS.map((LV) => (
        <div className="kid-card" key={LV.n}>
          <div className="card-head"><b>{LV.icon} Level {LV.n}: {LV.en} <span className="kn muted" style={{ fontWeight: 500 }}>{LV.kn}</span></b>{LV.n === L && <span className="pill green">My level</span>}</div>
          <ul className="unit-list">{unitsOf(LV.n).map((u) => (
            <li key={u.id}><button onClick={() => go("kid", "unit", String(unitNo(u)))}>
              <span className="ul-icon" aria-hidden="true">{done[u.id] ? "✅" : u.icon}</span>
              <span><b>{unitNo(u)}. {u.en}</b> <span className="kn small">{u.kn}</span><small className="muted">{u.goal}</small></span>
              <ArrowRight size={18} />
            </button></li>
          ))}</ul>
          {LV.n === 3 && <button className="btn ghost small" style={{ justifySelf: "start" }} onClick={() => go("kid", "journey")}><PenLine size={16} /> The script: letter journey (45 short lessons)</button>}
          {LV.n === 4 && <button className="btn ghost small" style={{ justifySelf: "start" }} onClick={() => go("kid", "stories")}><BookOpen size={16} /> Stories to read and write</button>}
        </div>
      ))}
    </>
  );
}

function DialogueStep({ unit, voiceLib, say, onFinish }) {
  const [en, setEn] = useState(true);
  return (
    <div className="kid-card">
      <div className="note-box"><span className="label">How it works</span><p style={{ margin: 0 }}>{unit.note}</p></div>
      <div className="card-head"><b>The conversation</b><button className="btn quiet small" onClick={() => setEn(!en)}>{en ? "Hide English" : "Show English"}</button></div>
      <div className="dialogue">{unit.dialogue.map(([who, kn, rom, e], j) => (
        <div key={j} className={`dl-line ${who}`}>
          <span className="dl-who">{who === "you" ? "You" : "Them"}</span>
          <div><b className="kn">{kn}</b><span className="small muted">{rom}</span>{en && <span className="small">{e}</span>}</div>
          <button className="icon-btn hear" onClick={async () => { const r = await playWord(kn, voiceLib); if (!r) say("No audio on this device for that line yet."); }} aria-label="Hear this line"><Volume2 /></button>
        </div>
      ))}</div>
      <p className="tiny muted" style={{ margin: 0 }}>Next you'll practise your lines out loud: Gini plays the other person.</p>
      <div className="row" style={{ justifyContent: "center" }}><button className="btn primary" onClick={() => onFinish(1)}>Got it <ArrowRight size={18} /></button></div>
    </div>
  );
}

function AdultLesson(props) {
  const { child, unit, back, earn, go } = props;
  const steps = useMemo(() => unitSteps(unit), [unit]);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const step = steps[Math.min(i, steps.length - 1)];
  function finish() {
    if (i + 1 < steps.length) { setI(i + 1); window.scrollTo({ top: 0 }); }
    else { setDone(true); earn("unit", 3, { adultDone: { ...(child.adultDone || {}), [unit.id]: Date.now() } }, { item: unit.en }); }
  }
  const nextU = UNITS[unitNo(unit)];
  if (done) return (
    <div className="kid-card celebrate">
      <Gini className="gini" mood="cheer" />
      <div className="stars-burst">⭐⭐⭐</div>
      <h2><span className="kn">ಶಭಾಷ್!</span> Lesson {unitNo(unit)} done</h2>
      <p>Use one of today's phrases with someone before tomorrow. That's what makes it stick.</p>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn ghost" onClick={back}>My lessons</button>
        {nextU && <button className="btn primary" onClick={() => go("kid", "unit", String(unitNo(nextU)))}>Next: {nextU.en} <ArrowRight size={18} /></button>}
      </div>
    </div>
  );
  const cfg = { ...props, wk: props.wk, onFinish: finish, inMission: true, back };
  return (
    <>
      <div className="kid-back"><button className="icon-btn" style={{ background: "#fff" }} onClick={back} aria-label="Back"><ArrowLeft /></button>
        <div><h2>{unit.icon} {unit.en} <span className="kn" style={{ fontWeight: 500 }}>{unit.kn}</span></h2><div className="small">Step {i + 1} of {steps.length}: <b>{step.title}</b></div></div></div>
      <div className="mission-steps">{steps.map((s, j) => <span key={j} className={j < i ? "on" : j === i ? "now" : ""} />)}</div>
      {step.kind === "listen" ? <Listen key={i} {...cfg} cards={step.cards} /> :
        step.kind === "dialogue" ? <DialogueStep key={i} {...cfg} unit={step.unit} /> :
          step.kind === "speak" ? <Speak key={i} {...cfg} items={step.items} /> :
            step.kind === "play" ? <PlayGame key={i} {...cfg} mode="sentences" sentences={step.sentences} /> :
              step.kind === "build" ? <Build key={i} {...cfg} rounds={step.rounds} /> :
                <Talk key={i} {...cfg} items={step.items} />}
    </>
  );
}


/* ---------- Family: talk with Amma, Appa, Ajji and Tata, then write for them ---------- */
function FamilyCard({ wk, child, go }) {
  const t = familyFor(wk.week), done = ((child.weekDone || {})[wk.week] || {}).family;
  return (
    <button className="family-card" onClick={() => go("kid", "family", t.id)}>
      <span className="fc-pic" aria-hidden="true">{t.pic}</span>
      <span className="fc-body">
        <span className="label">Family talk this week {done ? "✓" : ""}</span>
        <b>{t.en}</b>
        <small>Talk with Gini as {t.who}, then write something for {t.who.split(" ")[0]} ✍️</small>
      </span>
      <ArrowRight />
    </button>
  );
}

function FamilyCorner({ child, wk, back, go }) {
  const now = familyFor(wk.week), k = knowFor(wk.week);
  const done = new Set(Object.values(child.weekDone || {}).flatMap((w) => (w && w.familyIds) || []));
  return (
    <>
      <Head back={back} title="Family corner" kn="ಮನೆಯವರ ಜೊತೆ" />
      <div className="kid-card know-card">
        <span className="label">Know Karnataka · ತಿಳಿದುಕೊ</span>
        <div className="row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}><span style={{ fontSize: 40 }} aria-hidden="true">{k[0]}</span><div><b className="kn" style={{ fontSize: 20 }}>{k[1]}</b><p style={{ margin: "4px 0 0" }}>{k[2]}</p></div></div>
        <span className="small muted">Ask Amma, Appa or Ajji: what do they remember about this?</span>
      </div>
      <div className="kid-card">
        <span className="label">Talk, then write for your family</span>
        <ul className="unit-list">{ALL_TALKS.map((t) => (
          <li key={t.id}><button onClick={() => go("kid", "family", t.id)}>
            <span className="ul-icon" aria-hidden="true">{done.has(t.id) ? "✅" : t.pic}</span>
            <span><b>{t.en}</b> <span className="kn small">{t.kn}</span><small className="muted">{t.goal}</small></span>
            {t.id === now.id ? <span className="pill yellow">This week</span> : <ArrowRight size={18} />}
          </button></li>
        ))}</ul>
      </div>
    </>
  );
}

function FamilyTalk(props) {
  const { child, wk, talk, back, earn, go } = props;
  const level = levelOf(child);
  const steps = useMemo(() => {
    const L = talk.lines;
    const cards = L.map(([, kn, rom, en]) => ({ kn, rom, en }));
    const roleplay = L.map((d, i) => d[0] !== "you" ? null : {
      q: i > 0 && L[i - 1][0] !== "you" ? L[i - 1][1] : "",
      qEn: i > 0 && L[i - 1][0] !== "you" ? `${talk.who} says: ${L[i - 1][3]}` : `You start! Say this to ${talk.who.split(" ")[0]}`,
      a: d[1], aEn: `${d[3]}  (${d[2]})`, hints: [],
    }).filter(Boolean);
    return [
      { kind: "listen", title: "Listen to the talk", cards },
      { kind: "talk", title: `Gini plays ${talk.who}`, items: roleplay },
      { kind: "write", title: `Write for ${talk.who.split(" ")[0]}` },
    ];
  }, [talk]);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const step = steps[Math.min(i, steps.length - 1)];
  const k = knowFor(wk.week);
  function finish() { if (i + 1 < steps.length) { setI(i + 1); window.scrollTo({ top: 0 }); } else setDone(true); }
  if (done) return (
    <div className="kid-card celebrate">
      <Gini className="gini" mood="cheer" />
      <div className="stars-burst">⭐⭐⭐</div>
      <h2><span className="kn">ಶಭಾಷ್!</span> You talked and wrote for {talk.who.split(" ")[0]}!</h2>
      <p>Tonight, try this talk for real with {talk.who === "Amma" || talk.who === "Appa" ? talk.who : "Amma or Appa"}.</p>
      <div className="know-card" style={{ textAlign: "left" }}><span className="label">Did you know? {k[0]}</span><b className="kn">{k[1]}</b><span className="small">{k[2]}</span></div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn ghost" onClick={() => go("kid", "family")}>Family corner</button>
        <button className="btn primary" onClick={back}>Back home</button>
      </div>
    </div>
  );
  const cfg = { ...props, onFinish: finish, inMission: true };
  return (
    <>
      <div className="kid-back"><button className="icon-btn" style={{ background: "#fff" }} onClick={back} aria-label="Back"><ArrowLeft /></button>
        <div><h2>{talk.pic} {talk.en}</h2><div className="small">Step {i + 1} of {steps.length}: <b>{step.title}</b></div></div></div>
      <div className="mission-steps">{steps.map((s2, j) => <span key={j} className={j < i ? "on" : j === i ? "now" : ""} />)}</div>
      {i === 0 && <p className="small muted" style={{ margin: "0 4px" }}>💡 {talk.note}</p>}
      {step.kind === "listen" ? <Listen key={i} {...cfg} cards={step.cards} /> :
        step.kind === "talk" ? <Talk key={i} {...cfg} items={step.items} /> :
          <WriteForFamily key={i} {...cfg} talk={talk} target={writeFor(talk, level)} level={level} />}
    </>
  );
}

// Draws the child's handwriting on a card they can send to Ajji (WhatsApp, Messages...) or save.
async function familyCardImage({ strokes, aspect, target, who, name }) {
  await ensureFont().catch(() => {});
  const W = 1080, Hh = 1080, c = document.createElement("canvas"); c.width = W; c.height = Hh;
  const g = c.getContext("2d");
  g.fillStyle = "#fff8ea"; g.fillRect(0, 0, W, Hh);
  g.fillStyle = "#c8102e"; g.fillRect(0, 0, W, 150);
  g.fillStyle = "#ffc72c"; g.fillRect(0, 150, W, 14);
  g.fillStyle = "#fff"; g.font = "bold 58px system-ui, sans-serif"; g.textAlign = "center"; g.fillText(`For ${who} ❤️`, W / 2, 98);
  g.fillStyle = "#2a0f0c"; g.font = `64px ${PAD_FONT}, "Noto Sans Kannada", sans-serif`; g.fillText(target[0], W / 2, 280, W - 80);
  g.fillStyle = "#7b5b52"; g.font = "34px system-ui, sans-serif"; g.fillText(`${target[1]} · ${target[2]}`, W / 2, 340, W - 80);
  // the handwriting, fitted into a ruled box
  const box = { x: 70, y: 400, w: W - 140, h: 520 };
  g.fillStyle = "#fffdf6"; g.strokeStyle = "#e7d3a8"; g.lineWidth = 3; g.beginPath(); g.roundRect ? g.roundRect(box.x, box.y, box.w, box.h, 28) : g.rect(box.x, box.y, box.w, box.h); g.fill(); g.stroke();
  const pts = decodeStrokes(strokes || []);
  const all = pts.flat();
  if (all.length) {
    const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const sc = Math.min((box.w - 80) / Math.max(0.05, maxX - minX), (box.h - 80) / Math.max(0.05, maxY - minY));
    const ox = box.x + (box.w - (maxX - minX) * sc) / 2 - minX * sc, oy = box.y + (box.h - (maxY - minY) * sc) / 2 - minY * sc;
    g.strokeStyle = "#1d5fa8"; g.lineWidth = Math.max(8, Math.min(22, sc * 0.02)); g.lineCap = "round"; g.lineJoin = "round";
    for (const s of pts) { if (!s.length) continue; g.beginPath(); g.moveTo(ox + s[0][0] * sc, oy + s[0][1] * sc); for (const [x, y] of s.slice(1)) g.lineTo(ox + x * sc, oy + y * sc); if (s.length === 1) g.lineTo(ox + s[0][0] * sc + 1, oy + s[0][1] * sc); g.stroke(); }
  }
  g.fillStyle = "#7b5b52"; g.font = "32px system-ui, sans-serif"; g.fillText(`Written by ${name} in Kannada · Chili Pili`, W / 2, 1010);
  return new Promise((res) => c.toBlob(res, "image/png"));
}

function WriteForFamily({ child, wk, talk, target, level, voiceLib, earn, say, profile, onFinish }) {
  const [pad, setPad] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const who = talk.who.split(" ")[0], nm = firstName(child.name);
  const sentence = level >= 3;
  async function keep(share) {
    if (!pad) return say(`Write it first, then send it to ${who}!`, true);
    setBusy(true);
    try {
      const blob = await familyCardImage({ strokes: pad.strokes, aspect: pad.aspect, target, who, name: nm });
      const file = new File([blob], `for-${who.toLowerCase()}-${talk.id}.png`, { type: "image/png" });
      if (!sent) {
        const path = `handins/${child.id}/${Date.now()}_family_${talk.id}.png`;
        await store.upload(path, file).catch(() => {});
        await store.add("submissions", { childId: child.id, parentEmails: child.parentEmails, kind: "family", week: wk.week, files: [{ path, type: "image/png", name: `For ${who}` }], note: `Wrote for ${who}: ${target[0]}`, status: "sent", by: profile.uid, byName: profile.name, at: Date.now() }).catch(() => {});
        const wd = (child.weekDone || {})[wk.week] || {};
        await earn("family", 3, { weekDone: { ...(child.weekDone || {}), [wk.week]: { ...wd, family: true, familyIds: [...new Set([...(wd.familyIds || []), talk.id])] } } }, { item: target[0], strokes: pad.strokes, aspect: pad.aspect });
        setSent(true);
      }
      if (share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `For ${who}`, text: `${target[0]} (${nm} wrote this in Kannada)` }).catch(() => {});
      } else if (share) {
        await saveFile(file.name, blob, "image/png");
        say(`Saved the picture. A grown-up can send it to ${who} on WhatsApp.`);
      }
    } catch (e) { say(friendlyError(e), true); }
    setBusy(false);
  }
  return (
    <div className="kid-card">
      <span className="label">Write this for {who} ✍️</span>
      <div className="flash" style={{ padding: "10px 6px" }}>
        <div className={`knw ${sentence ? "sentence" : ""}`}>{target[0]}</div>
        <div className="rom">{target[1]}</div><div className="en">{target[2]}</div>
      </div>
      <div className="row" style={{ justifyContent: "center" }}><HearBtn text={target[0]} lib={voiceLib} say={say} /></div>
      <span className="small muted">{sentence ? "Copy the whole sentence neatly. Leave a space between words." : level === 2 ? "Copy the words. Look at each letter before you write it." : "Copy the word, letter by letter."}</span>
      <WritePad aspect={sentence ? 1.6 : 2.2} lines={sentence ? 2 : 1} onChange={(strokes, aspect) => setPad(strokes ? { strokes, aspect } : null)} label={`Write for ${who}`} />
      <button className="btn primary" disabled={busy || !pad} onClick={() => keep(true)}>💌 {busy ? "Getting it ready…" : `Send to ${who}`}</button>
      {sent && <p className="talk-yay">🎉 <b>{who} will love this!</b> Your teacher has a copy too.</p>}
      {sent ? <button className="btn ghost" onClick={() => onFinish(3)}>Finish <ArrowRight size={18} /></button>
        : <button className="btn quiet small" disabled={busy || !pad} onClick={() => keep(false).then(() => onFinish(3))}>Just save it (send later)</button>}
    </div>
  );
}
