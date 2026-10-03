import { Headphones, Mic, Gamepad2, PenLine, Camera, CalendarHeart, MessageCircleHeart, Sprout, Users, Printer, Puzzle } from "lucide-react";
import BrandName from "../components/BrandName.jsx";
import { Gini, Logo, Skyline, STAGE_EMOJI } from "../components/Art.jsx";
import { MONTHS, STAGES } from "../lib/content.js";
import { TRACKS, TRACK_KEYS } from "../lib/course.js";
import { ADULT_LEVELS, UNITS } from "../lib/adult.js";
import SayIt from "../components/SayIt.jsx";
import { Languages } from "lucide-react";
import { useApp } from "../lib/hooks.js";
import { store } from "../lib/store/index.js";

export default function Landing() {
  const { go, school, say } = useApp();
  // Sign-in page: Continue with Google, or a code emailed to any address.
  function start() { go("signin"); }
  function startAdult() { try { sessionStorage.setItem("chilipili-intent", "adult"); } catch {} start(); }
  return (
    <div>
      <header className="land-top">
        <nav className="land-nav" aria-label="Main">
          <span className="brand"><Logo /> <BrandName size="lg" /></span>
          <span className="spacer" />
          <button className="btn yellow small" onClick={() => go("kids")}>I'm a kid</button>
          <button className="btn ghost small" onClick={start}>Sign in</button>
        </nav>
        <div className="hero">
          <div>
            <p className="label" style={{ color: "var(--red-deep)" }}>ಕನ್ನಡ ಕಲಿಯೋಣ · Kannada for families in the USA</p>
            <h1>Kannada at home, <em>at your own pace.</em></h1>
            <p className="lede">Children practise with Gini the parrot, learn to talk with Amma, Appa, Ajji and Tata, and write to them in Kannada. Grown-ups get conversation lessons with English letters for every phrase, then the script when they're ready.</p>
            <div className="cta">
              <button className="btn primary" onClick={start}>Start for my child</button>
              <button className="btn ghost" onClick={startAdult}>Learn Kannada myself</button>
              <button className="btn yellow" onClick={() => go("kids")}>I'm a kid</button>
            </div>
          </div>
          <div className="hero-art">
            <div className="bubble" style={{ justifySelf: "center", marginBottom: 6 }}><b className="kn" style={{ fontSize: 22 }}>ನಮಸ್ಕಾರ!</b> <span className="muted">I'm Gini.</span></div>
            <Gini className="gini" mood="cheer" />
          </div>
        </div>
        <div className="skyline-band"><Skyline /></div>
      </header>

      <section className="section" id="try">
        <h2><Languages size={26} style={{ verticalAlign: "-4px" }} /> Talk both ways: English ⇄ ಕನ್ನಡ</h2>
        <p className="sub">Speak English and hear it in Kannada, with easy pronunciation. Or let Ajji speak Kannada and hear it in English. Try it right now.</p>
        <div style={{ maxWidth: 560, width: "100%" }}><SayIt demo audience="adult" /></div>
        <p className="tiny muted">A few free tries here; lots more once you sign in. Translation by AI (Claude), Kannada voice and listening by Google.</p>
      </section>

      <section className="land-red" id="how">
        <div className="section">
          <h2>How it works</h2>
          <p className="sub">One month at a time, six months in all. Every child starts where they are.</p>
          <div className="steps">
            <Step n="1" icon={Sprout} title="Tell us where your child is">Two minutes of questions when you sign up. Your child's plan starts straight away, at their level.</Step>
            <Step n="2" icon={Headphones} title="Three weeks at home">Each week: a printable packet, plus Gini's games to listen, speak, play and trace. About 15 minutes a day.</Step>
            <Step n="3" icon={Users} title="Month-end meet">In week 4 the children meet the teacher, in person or online, and show what they've learnt.</Step>
            <Step n="4" icon={MessageCircleHeart} title="Grow together">The teacher listens to every recording, replies with voice notes, and moves each learner up when they're ready.</Step>
          </div>
        </div>
        <div className="kasuti" style={{ backgroundColor: "var(--paper)" }} />
      </section>

      <section className="section" id="grown-ups">
        <h2>Grown-ups can learn too</h2>
        <p className="sub">For anyone in the USA with a partner or loved ones who speak Kannada: talk with them, with their family, and with your children, in Kannada.</p>
        <div className="grid3">
          {ADULT_LEVELS.map((L) => <div className="card" key={L.n}><span style={{ fontSize: 34 }}>{L.icon}</span><h3>Level {L.n}: {L.en} <span className="kn muted" style={{ fontWeight: 500, fontSize: 16 }}>{L.kn}</span></h3><p className="small muted" style={{ margin: 0 }}>{L.what}</p></div>)}
        </div>
        <p className="small muted" style={{ maxWidth: 720 }}>{UNITS.length} conversation lessons, 15 to 20 minutes each: hear the phrases, see how the grammar works, say them, then role-play the conversation with Gini. Plus the letter journey, stories, and Talk both ways for anything else.</p>
        <button className="btn primary" style={{ justifySelf: "start" }} onClick={startAdult}>Learn Kannada myself</button>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <h2>Made for small hands</h2>
        <p className="sub">Big buttons, the teacher's own voice, and a parrot who cheers them on. Works on a phone, an iPad or a laptop.</p>
        <div className="tiles five" style={{ maxWidth: 900 }}>
          <div className="tile listen"><Headphones /><b>Listen</b><small>ಕೇಳು</small></div>
          <div className="tile play"><Gamepad2 /><b>Play</b><small>ಆಡು</small></div>
          <div className="tile speak"><Mic /><b>Speak</b><small>ಮಾತಾಡು</small></div>
          <div className="tile write"><PenLine /><b>Write</b><small>ಬರೆ</small></div>
          <div className="tile build"><Puzzle /><b>Build</b><small>ವಾಕ್ಯ ಕಟ್ಟು</small></div>
        </div>
        <p className="small muted" style={{ maxWidth: 700 }}>A 15-minute mission every day, six days a week. Gini asks questions and children answer out loud; Write checks each letter traced with a finger; Build turns words into sentences. And <b>Talk both ways</b>: speak English and hear Kannada, or speak Kannada and hear English.</p>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <h2>From egg to Garuda</h2>
        <p className="sub">Speaking, reading and writing each grow through seven bird stages. Children often speak like a parrot before they read like one, and that's fine.</p>
        <div className="birds">
          {STAGES.map((s, i) => <div className="bird" key={s.en}><span className="e">{STAGE_EMOJI[i]}</span><b>{s.en}</b><span className="kn">{s.kn}</span><span className="tiny muted">{s.what}</span></div>)}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <h2>Three paths, one class</h2>
        <p className="sub">Parents pick where their child starts. Everyone meets at the same month-end meet.</p>
        <div className="grid3">
          {TRACK_KEYS.map((k) => <div className="card" key={k}><span style={{ fontSize: 34 }}>{TRACKS[k].icon}</span><h3>{TRACKS[k].en} <span className="kn muted" style={{ fontWeight: 500, fontSize: 16 }}>{TRACKS[k].kn}</span></h3><p className="small" style={{ margin: 0 }}>{TRACKS[k].who}.</p><p className="small muted" style={{ margin: 0 }}>{TRACKS[k].detail}</p></div>)}
        </div>
      </section>

      <section style={{ background: "var(--yellow-soft)" }}>
        <div className="section">
          <h2>Six months, six milestones</h2>
          <div className="months">
            {MONTHS.map((m, i) => <div className="month" key={m.en}><span className="m">Month {i + 1}</span><h3>{m.en}</h3><span className="kn">{m.kn}</span><span className="small muted">{m.covers}</span></div>)}
          </div>
        </div>
      </section>

      <section className="section">
        <h2>For parents</h2>
        <div className="grid3">
          <Feature icon={Printer} title="Download this week's packet">A PDF with tracing sheets, sentence pages and an answers page for grown-ups.</Feature>
          <Feature icon={Camera} title="Hand in photos or a PDF">Snap the finished pages, or upload the filled-in PDF. The teacher replies.</Feature>
          <Feature icon={MessageCircleHeart} title="Talk to the teacher">Messages and voice notes, whenever you need.</Feature>
          <Feature icon={CalendarHeart} title="Never miss a meet">Add month-end meets to your phone calendar in one tap.</Feature>
        </div>
      </section>

      <section style={{ background: "var(--yellow)" }}>
        <div className="section" style={{ justifyItems: "center", textAlign: "center" }}>
          <Gini className="gini" />
          <h2>Ready when you are</h2>
          <p className="sub" style={{ color: "#4a2a20" }}>Sign in with Google, then add your child, yourself, or both.</p>
          <div className="row" style={{ justifyContent: "center" }}><button className="btn primary" onClick={start}>Start for my child</button><button className="btn ghost" onClick={startAdult}>Learn Kannada myself</button></div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-in">
          <span><b>Chili Pili Kannada Kali</b> · <span className="kn">ಚಿಲಿಪಿಲಿ ಕನ್ನಡ ಕಲಿ</span> · Kannada for kids and grown-ups in the USA</span>
          {school.contactEmail && <a href={`mailto:${school.contactEmail}`}>{school.contactEmail}</a>}
          <a href="#/setup" className="small">Site setup</a>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, icon: Icon, title, children }) {
  return <div className="step"><span className="ic"><Icon size={22} /></span><span className="n">{n}</span><h3>{title}</h3><p className="muted">{children}</p></div>;
}
function Feature({ icon: Icon, title, children }) {
  return <div className="card"><span style={{ width: 44, height: 44, borderRadius: 14, background: "var(--red-soft)", color: "var(--red)", display: "grid", placeItems: "center" }}><Icon size={22} /></span><h3>{title}</h3><p className="muted">{children}</p></div>;
}

