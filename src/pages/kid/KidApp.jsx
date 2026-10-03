import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useApp, useDoc, useWatch, useVoiceLib, useStrokeLib, firstName } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Gini, Skyline } from "../../components/Art.jsx";
import KidSpace from "./KidSpace.jsx";

// A child signed in with their own code: only their space, nothing else.
export default function KidApp() {
  const { profile, route, go } = useApp();
  const child = useDoc("children", profile.kidId);
  const [activity] = useWatch("activity", [["childId", "==", profile.kidId]]);
  const voiceLib = useVoiceLib();
  const strokeLib = useStrokeLib();
  useEffect(() => { if (route[0] !== "kid" && route[0] !== "home") go("kid"); /* eslint-disable-next-line */ }, [route[0]]);
  if (child === undefined) return <div className="auth-wrap"><b>Loading…</b></div>;
  if (!child) return <Grownups name={profile.name} gone />;
  if (route[0] === "home") return <Grownups name={child.name} />;
  return <KidSpace fam={{ child, voiceLib, strokeLib, activity, subs: [], logs: [] }} />;
}

function Grownups({ name, gone }) {
  const { go } = useApp();
  const [hold, setHold] = useState(0);
  const t = useRef(null);
  function down() { let p = 0; t.current = setInterval(() => { p += 8; setHold(p); if (p >= 100) { clearInterval(t.current); store.signOut(); } }, 80); }
  function up() { clearInterval(t.current); setHold(0); }
  return (
    <div className="auth-wrap">
      <div className="skyline-bg"><Skyline /></div>
      <div className="auth-card card" style={{ gap: 14, textAlign: "center", justifyItems: "center" }}>
        <Gini className="gini" />
        {gone ? <p>This code doesn't work any more. Ask a grown-up for the new one.</p> : <h2>{firstName(name)}'s space</h2>}
        {!gone && <button className="btn primary" onClick={() => go("kid")}>Back to Gini</button>}
        <p className="small muted">Grown-ups: parents sign in with Google to see packets, messages and progress. To sign {firstName(name) || "this child"} out of this device, press and hold:</p>
        <button className="btn ghost" onPointerDown={down} onPointerUp={up} onPointerLeave={up} onKeyDown={(e) => e.key === "Enter" && store.signOut()}
          style={{ background: `linear-gradient(90deg, var(--yellow-soft) ${hold}%, #fff ${hold}%)` }}><LogOut size={18} /> {hold ? "Keep holding…" : "Sign out"}</button>
      </div>
    </div>
  );
}
