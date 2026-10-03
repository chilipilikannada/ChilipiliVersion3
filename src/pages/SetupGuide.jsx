import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Circle, Copy, RefreshCw, ExternalLink } from "lucide-react";
import { useApp } from "../lib/hooks.js";
import { store } from "../lib/store/index.js";
import { Logo } from "../components/Art.jsx";
import BrandName from "../components/BrandName.jsx";
import firestoreRules from "../../firebase/firestore.rules?raw";
import storageRules from "../../firebase/storage.rules?raw";

const SITE = typeof location !== "undefined" ? location.host : "chilipilikannada.vercel.app";

// Going live, step by step, with a live check for each step. Open it at your-site/#/setup.
export default function SetupGuide() {
  const { say, go } = useApp();
  const [st, setSt] = useState(null);
  const [busy, setBusy] = useState(false);
  const cloud = store.mode === "cloud";
  async function check() {
    setBusy(true);
    try { const r = await fetch("/api/status?deep=1"); setSt(r.ok ? await r.json() : { error: true }); } catch { setSt({ error: true }); }
    setBusy(false);
  }
  useEffect(() => { check(); }, []);
  const copy = (text, what) => navigator.clipboard?.writeText(text).then(() => say(`${what} copied.`), () => say("Couldn't copy; select the text instead.", true));
  const D = (st && st.deep) || {};
  const live = st && !st.error;
  const ok = (v) => (v === undefined || v === null ? null : !!v);
  const steps = [
    { title: "Put the code on GitHub and Vercel", ok: live ? true : null, why: live ? "" : "This page can't reach its server. If you're in the Claude preview, open your live website instead.",
      how: ["Unzip the latest chilipili-repo.zip and upload everything inside chilipili-app to your GitHub repository (Add file → Upload files → Commit).", "Vercel builds it by itself in about a minute."] },
    { title: "Connect Firebase (Google sign-in and saving)", ok: cloud, why: cloud ? "" : "The VITE_FIREBASE_ settings aren't in this build yet.",
      how: ["console.firebase.google.com → your project → ⚙ Project settings → General → Your apps → Web app (</>) → copy the six config values.", "Vercel → Project → Settings → Environment Variables: add VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID and VITE_ADMIN_EMAILS = ashsmi0621@gmail.com.", "Vercel → Deployments → ⋯ → Redeploy (these values are baked in when the site is built)."],
      link: ["https://console.firebase.google.com", "Firebase console"] },
    { title: "Turn on Google sign-in", ok: null, manual: true,
      how: ["Firebase → Build → Authentication → Get started → Sign-in method → Google → Enable → Save.", `Authentication → Settings → Authorized domains → Add domain: ${SITE}`, "Then press the test button: you should land in the teacher view as ashsmi0621@gmail.com."],
      test: ["Test sign-in", () => go("signin")] },
    { title: "Create the database and file storage, then publish the rules", ok: ok(D.database && D.database.ok), why: D.database && !D.database.ok ? D.database.why : "",
      how: ["Firebase → Build → Firestore Database → Create database (production mode, a US location). Then Rules → paste the Firestore rules → Publish.", "Firebase → Build → Storage → Get started. Then Rules → paste the Storage rules → Publish. If it asks to let Storage read Firestore, say yes."],
      extra: <div className="row"><button className="btn ghost small" onClick={() => copy(firestoreRules, "Firestore rules")}><Copy size={14} /> Copy Firestore rules</button><button className="btn ghost small" onClick={() => copy(storageRules, "Storage rules")}><Copy size={14} /> Copy Storage rules</button></div> },
    { title: "Add the service account (kid numbers, email codes, Monday emails)", ok: ok(D.accounts && D.database && D.accounts.ok && D.database.ok), why: D.accounts && !D.accounts.ok ? D.accounts.why : D.database && !D.database.ok ? D.database.why : "",
      how: ["Firebase → ⚙ Project settings → Service accounts → Generate new private key → a .json file downloads.", "Open it, copy everything, and paste it into Vercel as FIREBASE_SERVICE_ACCOUNT. Keep the file private.", "Redeploy."] },
    { title: "Send emails from ashsmi0621@gmail.com", ok: ok(D.gmail && D.gmail.ok), why: D.gmail && !D.gmail.ok ? D.gmail.why : "",
      how: ["myaccount.google.com/security (signed in as ashsmi0621@gmail.com) → turn on 2-Step Verification.", "myaccount.google.com/apppasswords → name it Chili Pili → Create → copy the 16 letters.", "Vercel: GMAIL_USER = ashsmi0621@gmail.com, GMAIL_APP_PASSWORD = the 16 letters, TEACHER_EMAIL = ashsmi0621@gmail.com. Redeploy.", "This turns on: email sign-in codes, kid numbers by email, welcome emails and the Monday notes."],
      link: ["https://myaccount.google.com/apppasswords", "Google app passwords"] },
    { title: "Monday emails run by themselves", ok: live ? !!st.cron : null, why: live && !st.cron ? "CRON_SECRET is not set." : "",
      how: ["Vercel: CRON_SECRET = any long random text (for example, 40 letters and numbers). Redeploy."] },
    { title: "Talk both ways (voice translator)", ok: live ? !!(st.claude && D.voice && D.voice.ok) : null, why: live ? [!st.claude && "ANTHROPIC_API_KEY is not set.", D.voice && !D.voice.ok && D.voice.why].filter(Boolean).join(" ") : "",
      how: ["console.anthropic.com → API keys → Create → Vercel: ANTHROPIC_API_KEY.", "console.cloud.google.com (your Firebase project) → APIs & Services → enable Cloud Text-to-Speech, Cloud Speech-to-Text and Cloud Translation → Credentials → Create API key → restrict it to those three → Vercel: GOOGLE_API_KEY.", "Redeploy."] },
  ];
  const done = steps.filter((s) => s.ok).length;
  return (
    <div className="auth-wrap" style={{ alignItems: "start" }}>
      <div className="card setup-guide">
        <div className="row"><Logo size={44} /><BrandName size="md" /></div>
        <h1 style={{ margin: "4px 0 0" }}>Go live: setup</h1>
        <p className="muted" style={{ margin: 0 }}>{done} of {steps.length} steps confirmed{st && st.checkedAt ? ` · checked ${new Date(st.checkedAt).toLocaleTimeString()}` : ""}. After changing anything in Vercel, redeploy, then press Check again.</p>
        <button className="btn primary" style={{ justifySelf: "start" }} disabled={busy} onClick={check}><RefreshCw size={16} /> {busy ? "Checking…" : "Check again"}</button>
        <ol className="setup-steps">{steps.map((s, i) => (
          <li key={s.title} className={s.ok ? "ok" : s.ok === false ? "no" : "todo"}>
            <div className="ss-head">{s.ok ? <CheckCircle2 size={20} /> : s.ok === false ? <AlertCircle size={20} /> : <Circle size={20} />}<b>{i + 1}. {s.title}</b></div>
            {!s.ok && s.why && <p className="small ss-why">{s.why}</p>}
            {!s.ok && <ul className="small">{s.how.map((h) => <li key={h}>{h}</li>)}</ul>}
            {!s.ok && s.extra}
            {!s.ok && s.link && <a className="small" href={s.link[0]} target="_blank" rel="noreferrer"><ExternalLink size={14} /> {s.link[1]}</a>}
            {s.manual && s.test && <button className="btn ghost small" style={{ justifySelf: "start" }} onClick={s.test[1]}>{s.test[0]}</button>}
          </li>
        ))}</ol>
        <button className="btn quiet" onClick={() => go()}>Back to the website</button>
      </div>
    </div>
  );
}
