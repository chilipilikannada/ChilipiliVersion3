import { useMemo } from "react";
import { LayoutDashboard, Users, Inbox, CalendarHeart, MessageCircle, Megaphone, AudioLines, Settings as Cog, BarChart3, PenLine, FileText } from "lucide-react";
import { useApp, useWatch, useVoiceLib, useStrokeLib, usePacketFiles } from "../../lib/hooks.js";
import { Logo } from "../../components/Art.jsx";
import { Avatar } from "../../components/ui.jsx";
import Today from "./Today.jsx";
import Families from "./Families.jsx";
import Review from "./Review.jsx";
import Meets from "./Meets.jsx";
import Inboxes from "./Inboxes.jsx";
import Feed from "./Feed.jsx";
import Voice from "./Voice.jsx";
import Settings from "./Settings.jsx";
import Summary from "./Summary.jsx";
import Handwriting from "./Handwriting.jsx";
import Sheets from "./Sheets.jsx";
import { meetState } from "../parent/Meets.jsx";

const TABS = [
  ["today", "Today", LayoutDashboard],
  ["families", "Children", Users],
  ["summary", "Class summary", BarChart3],
  ["review", "Review", Inbox],
  ["sheets", "Packets", FileText],
  ["meets", "Meets", CalendarHeart],
  ["messages", "Messages", MessageCircle],
  ["feed", "Class feed", Megaphone],
  ["handwriting", "My handwriting", PenLine],
  ["voice", "My voice", AudioLines],
  ["settings", "Settings", Cog],
];
const MOBILE = ["today", "families", "review", "meets", "messages"];

export default function TeacherApp() {
  const { profile, route, go } = useApp();
  const [children] = useWatch("children", []);
  const [subs] = useWatch("submissions", []);
  const [activity] = useWatch("activity", []);
  const [logs] = useWatch("stageLogs", []);
  const [notes] = useWatch("meetNotes", []);
  const [messages] = useWatch("messages", []);
  const [meets] = useWatch("meets", []);
  const [posts] = useWatch("posts", []);
  const [users] = useWatch("users", []);
  const voiceLib = useVoiceLib();
  const strokeLib = useStrokeLib();
  const packetFiles = usePacketFiles();
  const data = { children, subs, activity, logs, notes, messages, meets, posts, users, voiceLib, strokeLib, packetFiles };

  const tab = route[0] || "today";
  const badges = useMemo(() => {
    const lastRead = (id) => { try { return Number(localStorage.getItem("chilipili-tread-" + id)) || 0; } catch { return 0; } };
    return {
      families: children.filter((c) => c.status === "pending").length,
      review: subs.filter((s) => s.status === "sent").length,
      meets: meets.filter((m) => m.status !== "cancelled" && meetState(m) === "ended" && !m.writtenUp).length,
      messages: new Set(messages.filter((m) => m.fromRole === "parent" && m.at > lastRead(m.childId)).map((m) => m.childId)).size,
    };
  }, [children, subs, meets, messages]);

  const Page = { today: Today, families: Families, review: Review, meets: Meets, messages: Inboxes, feed: Feed, voice: Voice, settings: Settings, summary: Summary, handwriting: Handwriting, sheets: Sheets }[tab] || Today;
  return (
    <div className="shell">
      <header className="appbar">
        <div className="appbar-in">
          <button className="brand" onClick={() => go("today")}><Logo /><span>Chili Pili<small>Teacher</small></span></button>
          <span className="spacer" />
          <button className="child-switch" onClick={() => go("settings")}><Avatar name={profile.name} size="sm" /> <span className="hide-s">{profile.name}</span></button>
        </div>
        <div className="kasuti on-red" />
      </header>
      <div className="body">
        <nav className="sidenav" aria-label="Sections">
          {TABS.map(([k, l, I]) => <button key={k} aria-current={tab === k ? "page" : undefined} onClick={() => go(k)}><I />{l}{badges[k] ? <span className="badge">{badges[k]}</span> : null}</button>)}
        </nav>
        <main className="main"><Page data={data} badges={badges} /></main>
      </div>
      <nav className="bottomnav" aria-label="Sections">
        {TABS.filter(([k]) => MOBILE.includes(k)).map(([k, l, I]) => <button key={k} aria-current={tab === k ? "page" : undefined} onClick={() => go(k)}><I />{l}{badges[k] ? <span className="badge">{badges[k]}</span> : null}</button>)}
      </nav>
    </div>
  );
}
