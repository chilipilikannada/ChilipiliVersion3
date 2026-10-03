import { useState } from "react";
import BrandName from "../components/BrandName.jsx";
import { Gini, Logo, Skyline } from "../components/Art.jsx";
import { Btn } from "../components/ui.jsx";
import { useApp } from "../lib/hooks.js";
import { store } from "../lib/store/index.js";
import { friendlyError } from "../App.jsx";

export default function SignIn({ kids = false }) {
  const { say, go, school, user } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("parent");
  const device = store.mode === "device";

  const [code, setCode] = useState("");
  const [busyKid, setBusyKid] = useState(false);
  async function kidIn(e, typed) {
    if (e) e.preventDefault();
    const c = String(typed ?? code).replace(/\D/g, "");
    if (c.length !== 4) return say("Type your 4 numbers.", true);
    if (busyKid) return;
    setBusyKid(true);
    try { await store.signInKid(c); go("kid"); } catch (err) { say(err.message || friendlyError(err), true); setCode(""); }
    setBusyKid(false);
  }
  function typeCode(v) {
    const c = v.replace(/\D/g, "").slice(0, 4);
    setCode(c);
    if (c.length === 4) kidIn(null, c);
  }
  const kidForm = (
    <form className="kid-signin" onSubmit={kidIn}>
      <b>🦜 I'm a kid: type my number</b>
      <label className="pin-boxes">
        <input value={code} onChange={(e) => typeCode(e.target.value)} inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete="off" aria-label="Your 4 numbers" autoFocus disabled={busyKid} />
        {[0, 1, 2, 3].map((i) => <span key={i} className={"pin-box" + (i === code.length ? " on" : "")}>{code[i] || ""}</span>)}
      </label>
      <Btn kind="primary" block type="submit" disabled={busyKid || code.length !== 4}>{busyKid ? "Opening…" : "Open my space"}</Btn>
      <span className="tiny muted">Your grown-up sees your number on their Chili Pili home page. You stay signed in on this device.</span>
    </form>
  );
  async function google() { try { await store.signIn(); } catch (e) { say(friendlyError(e), true); } }
  async function deviceIn(e) {
    e.preventDefault();
    if (!name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return say("Enter your name and a valid email.", true);
    try { sessionStorage.setItem("chilipili-role", role); } catch {}
    await store.signIn({ name: name.trim(), email: email.trim() });
  }

  return (
    <div className="auth-wrap">
      <div className="skyline-bg"><Skyline /></div>
      <div className="auth-card card" style={{ gap: 16 }}>
        <div className="row"><Logo size={48} /><div><h1 style={{ margin: 0 }}><BrandName size="lg" /></h1></div></div>
        {user && <p className="muted">We couldn't load your account. Check your connection and try again.</p>}
        {kids && <>{kidForm}<ForgotNumber /></>}
        {kids && <p className="small muted" style={{ margin: 0 }}>Grown-ups, sign in below.</p>}
        {!device ? (
          <div className="stack">
            <p>Sign in with Google, or with a code sent to any email. No new password to remember, and you stay signed in on this device.</p>
            <Btn kind="primary" block onClick={google}>Continue with Google</Btn>
            <div className="or-line"><span>or</span></div>
            <EmailCode />
            {!kids && <button type="button" className="btn yellow" onClick={() => go("kids")}>I'm a kid</button>}
            <button className="btn quiet" onClick={() => go()}>Back</button>
          </div>
        ) : (
          <form className="stack" onSubmit={deviceIn}>
            <p className="small" style={{ background: "var(--yellow-soft)", padding: "10px 12px", borderRadius: 12 }}>
              Preview copy: it isn't connected to Google (Firebase), so everything is saved <b>on this device only</b>, no emails go out, and kid numbers only work here. On the live website, parents tap <b>Continue with Google</b> instead of typing an email.
            </p>
            <div className="field"><label htmlFor="n">Your name</label><input id="n" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
            <div className="field"><label htmlFor="e">Email</label><input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
            <label className="check small teacher-check"><input type="checkbox" checked={role === "teacher"} onChange={(e) => setRole(e.target.checked ? "teacher" : "parent")} /><span>I'm the teacher</span></label>
            <Btn kind="primary" block type="submit">Continue</Btn>
            <button type="button" className="btn quiet" onClick={() => go()}>Back</button>
          </form>
        )}
        <div style={{ display: "grid", justifyItems: "center" }}><Gini className="gini" /></div>
      </div>
    </div>
  );
}

// Sign in with a 6-digit code emailed from the teacher's Gmail: works with any email, no password.
function EmailCode() {
  const { say } = useApp();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  async function send(e) {
    e && e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) return say("Type your full email address.", true);
    setBusy(true);
    try {
      const r = await store.requestEmailCode(email.trim().toLowerCase());
      if (r && r.preview) { await store.signInWithEmailCode(email.trim().toLowerCase(), ""); return; }
      setSent(true); setCode(""); say("Code sent. Check your email (and spam, the first time).");
    } catch (err) { say(err.message || friendlyError(err), true); }
    setBusy(false);
  }
  async function verify(c) {
    if (c.length !== 6 || busy) return;
    setBusy(true);
    try { await store.signInWithEmailCode(email.trim().toLowerCase(), c); }
    catch (err) { say(err.message || friendlyError(err), true); setCode(""); setBusy(false); }
  }
  if (!open) return <button type="button" className="btn ghost" onClick={() => setOpen(true)}>✉️ Email me a sign-in code</button>;
  return sent ? (
    <div className="kid-signin" style={{ background: "var(--sky-soft, #e8f1fb)" }}>
      <b>Type the 6-digit code we emailed to {email.trim()}</b>
      <label className="pin-boxes six">
        <input value={code} onChange={(e) => { const c = e.target.value.replace(/\D/g, "").slice(0, 6); setCode(c); if (c.length === 6) verify(c); }} inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="one-time-code" aria-label="Your 6-digit code" autoFocus disabled={busy} />
        {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={"pin-box" + (i === code.length ? " on" : "")}>{code[i] || ""}</span>)}
      </label>
      <Btn kind="primary" block disabled={busy || code.length !== 6} onClick={() => verify(code)}>{busy ? "Signing in…" : "Sign in"}</Btn>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <button type="button" className="btn quiet small" disabled={busy} onClick={() => send()}>Send a new code</button>
        <button type="button" className="btn quiet small" disabled={busy} onClick={() => { setSent(false); setCode(""); }}>Use another email</button>
      </div>
    </div>
  ) : (
    <form className="stack-s" onSubmit={send}>
      <label className="small" htmlFor="ec">Any email works (Gmail, Yahoo, Outlook…). We'll send a code; no password needed.</label>
      <input id="ec" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      <Btn kind="ghost" block type="submit" disabled={busy}>{busy ? "Sending…" : "Send my code"}</Btn>
    </form>
  );
}

// "Forgot your number?": the number goes to the grown-up's own email, never on screen.
function ForgotNumber() {
  const { say } = useApp();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  async function send() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) return say("Type the grown-up's full email.", true);
    setBusy(true);
    try { const r = await store.remindKidNumber(email.trim().toLowerCase()); setDone(r.message || "Sent! Ask your grown-up to check their email."); }
    catch (err) { say(err.message || friendlyError(err), true); }
    setBusy(false);
  }
  if (!open) return <button type="button" className="btn quiet small" style={{ justifySelf: "center" }} onClick={() => setOpen(true)}>Forgot your number?</button>;
  return done ? <p className="small" style={{ margin: 0, textAlign: "center" }}>📬 {done}</p> : (
    <div className="stack-s">
      <span className="small">Type your grown-up's email. We'll send your number to them.</span>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input className="input" style={{ flex: 1, minWidth: 0 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="grown-up@example.com" aria-label="Grown-up's email" />
        <button type="button" className="btn primary small" disabled={busy} onClick={send}>{busy ? "…" : "Send"}</button>
      </div>
    </div>
  );
}
