import { useState } from "react";
import { Gini, Logo, Skyline } from "../components/Art.jsx";
import { Btn } from "../components/ui.jsx";
import { useApp } from "../lib/hooks.js";
import { store } from "../lib/store/index.js";
import { friendlyError } from "../App.jsx";

export default function SignIn() {
  const { say, go, school, user } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("parent");
  const device = store.mode === "device";

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
        <div className="row"><Logo size={44} /><div><h1 style={{ fontSize: 26 }}>{school.schoolName}</h1><span className="kn muted">ಚಿಲಿಪಿಲಿ ಕನ್ನಡ</span></div></div>
        {user && <p className="muted">We couldn't load your account. Check your connection and try again.</p>}
        {!device ? (
          <div className="stack">
            <p>Sign in with your Google (Gmail) account. No new password to remember.</p>
            <Btn kind="primary" block onClick={google}>Continue with Google</Btn>
            <button className="btn quiet" onClick={() => go()}>Back</button>
          </div>
        ) : (
          <form className="stack" onSubmit={deviceIn}>
            <p className="small" style={{ background: "var(--yellow-soft)", padding: "10px 12px", borderRadius: 12 }}>
              This app isn't connected to a server yet, so everything you add is saved <b>on this device only</b>. Once it's live with Firebase, families sign in with Google.
            </p>
            <div className="field"><label htmlFor="n">Your name</label><input id="n" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
            <div className="field"><label htmlFor="e">Email</label><input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
            <div className="field"><span className="lbl">I am</span>
              <div className="choices">
                <label className="choice"><input type="radio" name="role" checked={role === "parent"} onChange={() => setRole("parent")} /><span>A parent</span></label>
                <label className="choice"><input type="radio" name="role" checked={role === "teacher"} onChange={() => setRole("teacher")} /><span>The teacher</span></label>
              </div>
            </div>
            <Btn kind="primary" block type="submit">Continue</Btn>
            <button type="button" className="btn quiet" onClick={() => go()}>Back</button>
          </form>
        )}
        <div style={{ display: "grid", justifyItems: "center" }}><Gini className="gini" /></div>
      </div>
    </div>
  );
}
