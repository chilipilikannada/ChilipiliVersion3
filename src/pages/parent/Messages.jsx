import { useEffect } from "react";
import { firstName } from "../../lib/hooks.js";
import Thread from "../../components/Thread.jsx";

export default function Messages({ fam }) {
  const { child, messages } = fam;
  useEffect(() => { try { localStorage.setItem("chilipili-read-" + child.id, String(Date.now())); } catch {} }, [child.id, messages.length]);
  return (
    <div className="stack">
      <div className="page-title"><h1>Messages</h1><p className="muted">About {firstName(child.name)}, with the teacher. Type, or record a voice note.</p></div>
      <div className="card"><Thread child={child} messages={messages} /></div>
    </div>
  );
}
