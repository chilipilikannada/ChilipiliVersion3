import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useApp, firstName } from "../../lib/hooks.js";
import { Avatar, Empty } from "../../components/ui.jsx";
import { Gini } from "../../components/Art.jsx";
import Thread from "../../components/Thread.jsx";
import { ago } from "../../lib/time.js";

export default function Inboxes({ data }) {
  const { route, go } = useApp();
  const kids = data.children.filter((c) => c.status === "active");
  const sel = kids.find((c) => c.id === route[1]);
  const last = (id) => data.messages.filter((m) => m.childId === id).sort((a, b) => b.at - a.at)[0];
  const read = (id) => { try { return Number(localStorage.getItem("chilipili-tread-" + id)) || 0; } catch { return 0; } };
  useEffect(() => { if (sel) try { localStorage.setItem("chilipili-tread-" + sel.id, String(Date.now())); } catch {} }, [sel, data.messages.length]);

  if (sel) return (
    <div className="stack">
      <button className="btn quiet" style={{ justifySelf: "start" }} onClick={() => go("messages")}><ArrowLeft size={18} /> All messages</button>
      <div className="page-title"><h1>{sel.name}'s family</h1></div>
      <div className="card"><Thread child={sel} messages={data.messages} emptyText={`Say hello to ${firstName(sel.name)}'s family.`} /></div>
    </div>
  );
  const sorted = [...kids].sort((a, b) => ((last(b.id) || {}).at || 0) - ((last(a.id) || {}).at || 0));
  return (
    <div className="stack">
      <div className="page-title"><h1>Messages</h1><p className="muted">One conversation per child with their family. Text or voice notes.</p></div>
      <div className="card">
        {sorted.length ? <ul className="list">{sorted.map((c) => {
          const l = last(c.id); const unread = l && l.fromRole === "parent" && l.at > read(c.id);
          return <li key={c.id} style={{ cursor: "pointer" }} onClick={() => go("messages", c.id)}><Avatar name={c.name} /><div className="grow"><b>{c.name}</b><div className="sub">{l ? `${l.fromRole === "parent" ? l.fromName : "You"}: ${l.text || "Voice note"}` : "No messages yet"}</div></div>{l && <span className="tiny muted">{ago(l.at)}</span>}{unread && <span className="pill red">New</span>}</li>;
        })}</ul> : <Empty art={<Gini className="gini" />} title="No families yet">Conversations appear once families join.</Empty>}
      </div>
    </div>
  );
}
