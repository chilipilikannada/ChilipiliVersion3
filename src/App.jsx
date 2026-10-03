import { useCallback, useEffect, useMemo, useState } from "react";
import { store } from "./lib/store/index.js";
import { DEFAULT_SCHOOL } from "./lib/config.js";
import { AppCtx, useDoc, useRoute } from "./lib/hooks.js";
import Landing from "./pages/Landing.jsx";
import KidApp from "./pages/kid/KidApp.jsx";
import SetupGuide from "./pages/SetupGuide.jsx";
import SignIn from "./pages/SignIn.jsx";
import ParentApp from "./pages/parent/ParentApp.jsx";
import TeacherApp from "./pages/teacher/TeacherApp.jsx";
import { Gini } from "./components/Art.jsx";

const ADMIN_EMAILS = String(import.meta.env.VITE_ADMIN_EMAILS || "ashsmi0621@gmail.com").toLowerCase().split(/[,\s]+/).filter(Boolean);

export function friendlyError(e) {
  const c = String((e && (e.code || e.message)) || e || "");
  if (/permission|insufficient/i.test(c)) return "You don't have access to do that. If this looks wrong, ask your teacher.";
  if (/network|unavailable|offline/i.test(c)) return "No internet connection. Please try again.";
  if (/popup-closed|cancelled-popup/i.test(c)) return "The sign-in window was closed before finishing.";
  if (/unauthorized-domain/i.test(c)) return "This web address isn't allowed to sign in yet. Add it in Firebase: Authentication > Settings > Authorized domains.";
  return c.replace(/^Firebase:\s*/i, "") || "Something went wrong.";
}

export default function App() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [toast, setToast] = useState(null);
  const [route, go] = useRoute();
  const schoolDoc = useDoc("settings", "school");
  const school = useMemo(() => ({ ...DEFAULT_SCHOOL, ...(schoolDoc || {}) }), [schoolDoc]);

  const say = useCallback((msg, err) => {
    setToast({ msg, err, id: Date.now() });
  }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), toast.err ? 6000 : 3200); return () => clearTimeout(t); }, [toast]);

  useEffect(() => store.onAuth(setUser), []);

  // Load or create the person's profile.
  useEffect(() => {
    if (user === undefined) return;
    if (!user) { setProfile(null); return; }
    if (user.kid) { setProfile({ uid: user.uid, name: user.name || "", email: "", role: "kid", kidId: user.kid }); return; }
    let live = true;
    (async () => {
      try {
        let p = await store.get("users", user.uid);
        if (!p) {
          const wanted = sessionStorageGet("chilipili-role");
          const role = ADMIN_EMAILS.includes(user.email) || (store.mode === "device" && wanted === "teacher") ? "admin" : "parent";
          p = { name: user.name || user.email.split("@")[0], email: user.email, role, phone: "", createdAt: Date.now() };
          await store.set("users", user.uid, p);
        }
        if (live) setProfile({ ...p, uid: user.uid, email: (p.email || user.email).toLowerCase() });
      } catch (e) { console.error(e); say(friendlyError(e), true); if (live) setProfile(null); }
    })();
    return () => { live = false; };
  }, [user, say]);

  const ctx = useMemo(() => ({ user, profile, setProfile, school, say, route, go, isStaff: profile && (profile.role === "teacher" || profile.role === "admin") }), [user, profile, school, say, route, go]);

  let page;
  if (user === undefined || (user && profile === undefined)) page = <Loading />;
  else if (route[0] === "setup") page = <SetupGuide />;
  else if (!user) page = route[0] === "signin" || route[0] === "kids" ? <SignIn kids={route[0] === "kids"} /> : <Landing />;
  else if (!profile) page = <SignIn />;
  else page = profile.role === "kid" ? <KidApp /> : ctx.isStaff ? <TeacherApp /> : <ParentApp />;

  return (
    <AppCtx.Provider value={ctx}>
      {page}
      {toast && <div key={toast.id} className={`toast ${toast.err ? "err" : ""}`} role="status" aria-live="polite">{toast.msg}</div>}
    </AppCtx.Provider>
  );
}

function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }

function Loading() {
  return <div className="auth-wrap"><div style={{ display: "grid", justifyItems: "center", gap: 10 }}><Gini className="gini" /><b>Loading…</b></div></div>;
}
