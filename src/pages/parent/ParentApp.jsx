import { useEffect, useMemo, useState } from "react";
import ProgramPlan from "../../components/ProgramPlan.jsx";
import BrandName from "../../components/BrandName.jsx";
import { Home, BookOpen, CalendarHeart, MessageCircle, User, Sparkles, ChevronDown, LogOut } from "lucide-react";
import { useApp, useWatch, useVoiceLib, useStrokeLib, usePacketFiles, firstName } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Logo } from "../../components/Art.jsx";
import { Avatar, Modal } from "../../components/ui.jsx";
import Onboarding from "./Onboarding.jsx";
import HomePage from "./Home.jsx";
import Packets from "./Packets.jsx";
import Meets from "./Meets.jsx";
import Messages from "./Messages.jsx";
import ChildPage from "./Child.jsx";
import KidSpace from "../kid/KidSpace.jsx";
import { isAdult, UNITS } from "../../lib/adult.js";

const TABS = [
  ["home", "Home", Home],
  ["packets", "Packets", BookOpen],
  ["meets", "Meets", CalendarHeart],
  ["messages", "Messages", MessageCircle],
  ["child", "Profile", User],
];

export default function ParentApp() {
  const { profile, route, go } = useApp();
  const me = [["parentEmails", "array-contains", profile.email]];
  const [children, loadingKids] = useWatch("children", me);
  const [subs] = useWatch("submissions", me);
  const [activity] = useWatch("activity", me);
  const [logs] = useWatch("stageLogs", me);
  const [notes] = useWatch("meetNotes", me);
  const [messages] = useWatch("messages", me);
  const [meets] = useWatch("meets", []);
  const [posts] = useWatch("posts", []);
  const voiceLib = useVoiceLib();
  const strokeLib = useStrokeLib();
  const packetFiles = usePacketFiles();

  const [sel, setSel] = useState(() => { try { return localStorage.getItem("chilipili-child") || ""; } catch { return ""; } });
  const [picker, setPicker] = useState(false);
  const kids = useMemo(() => [...children].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)), [children]);
  const child = kids.find((c) => c.id === sel) || kids[0] || null;
  useEffect(() => { if (child) try { localStorage.setItem("chilipili-child", child.id); } catch {} }, [child]);

  const fam = { child, kids, subs, activity, logs, notes, messages, meets, posts, voiceLib, strokeLib, packetFiles, setSel };
  const tab = route[0] || "home";

  if (loadingKids) return <div className="auth-wrap"><b>Loading…</b></div>;
  if (!kids.length || route[0] === "add") return <Onboarding first={!kids.length} onDone={(id) => { setSel(id); go("home"); }} />;
  if (tab === "kid" && child) return <KidSpace fam={fam} />;

  const unreadTeacher = messages.filter((m) => m.childId === child.id && m.fromRole !== "parent" && m.at > (Number(localStorage.getItem("chilipili-read-" + child.id)) || 0)).length;
  const badges = { messages: unreadTeacher };

  const adult = isAdult(child);
  const tabs = adult ? TABS.filter(([k]) => k !== "packets") : TABS;
  const Page = { plan: PlanPage, home: HomePage, packets: Packets, meets: Meets, messages: Messages, child: ChildPage }[tab] || HomePage;
  return (
    <div className="shell">
      <header className="appbar">
        <div className="appbar-in">
          <button className="brand" onClick={() => go("home")}><Logo /><BrandName light /></button>
          <span className="spacer" />
          <button className="child-switch" onClick={() => setPicker(true)} aria-label="Switch learner">
            <Avatar name={child.name} size="sm" /> {firstName(child.name)} <ChevronDown size={16} />
          </button>
        </div>
        <div className="kasuti on-red" />
      </header>
      <div className="body">
        <nav className="sidenav" aria-label="Sections">
          {tabs.map(([k, l, I]) => <button key={k} aria-current={tab === k ? "page" : undefined} onClick={() => go(k)}><I />{l}{badges[k] ? <span className="badge">{badges[k]}</span> : null}</button>)}
          <button className="btn yellow kid-cta" onClick={() => go("kid")}><Sparkles size={18} /> {adult ? "My lessons" : `${firstName(child.name)}'s space`}</button>
        </nav>
        <main className="main"><Page fam={fam} /></main>
      </div>
      <nav className="bottomnav" aria-label="Sections">
        {tabs.map(([k, l, I]) => <button key={k} aria-current={tab === k ? "page" : undefined} onClick={() => go(k)}><I />{l}{badges[k] ? <span className="badge">{badges[k]}</span> : null}</button>)}
      </nav>
      {picker && (
        <Modal title="Who's learning" onClose={() => setPicker(false)}>
          <ul className="list">
            {kids.map((k) => (
              <li key={k.id}>
                <Avatar name={k.name} />
                <div className="grow"><b>{k.name}</b><div className="sub">{isAdult(k) ? "Me · grown-up lessons" : k.status === "active" ? k.group : "Waiting for the teacher"}{isAdult(k) && k.status !== "active" ? " · waiting for the teacher" : ""}</div></div>
                <button className="btn small ghost" onClick={() => { setSel(k.id); setPicker(false); }}>{k.id === child.id ? "Selected" : "Switch"}</button>
              </li>
            ))}
          </ul>
          <button className="btn ghost" onClick={() => { setPicker(false); go("add"); }}>Add a learner (a child, or me)</button>
          <button className="btn quiet" onClick={() => store.signOut()}><LogOut size={18} /> Sign out ({profile.email})</button>
        </Modal>
      )}
    </div>
  );
}

// The whole six months for the selected learner.
function PlanPage({ fam }) {
  const { go } = useApp();
  const { child } = fam;
  const adult = isAdult(child);
  return (
    <div className="stack">
      <div className="page-title"><h1>{adult ? "My course" : `${firstName(child.name)}'s 6-month plan`}</h1><p className="muted" style={{ margin: 0 }}>Everything in the program, week by week. ✓ done · ★ this week.</p></div>
      <ProgramPlan child={child} onLesson={adult ? (u) => go("kid", "unit", String(UNITS.indexOf(u) + 1)) : undefined} />
    </div>
  );
}
