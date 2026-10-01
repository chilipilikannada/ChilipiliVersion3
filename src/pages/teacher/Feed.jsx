import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { useApp } from "../../lib/hooks.js";
import { store } from "../../lib/store/index.js";
import { Avatar, Btn, Empty, PhotoPicker, FilePreview, StoredImage } from "../../components/ui.jsx";
import { Gini } from "../../components/Art.jsx";
import { compressImage, safeName } from "../../lib/files.js";
import { ago } from "../../lib/time.js";
import { friendlyError } from "../../App.jsx";

export default function Feed({ data }) {
  const { profile, say } = useApp();
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const posts = [...data.posts].sort((a, b) => b.at - a.at);

  async function post() {
    if (!text.trim() && !files.length) return say("Write something or add a photo.", true);
    try {
      let photoPath = null;
      if (files[0]) { const f = await compressImage(files[0]); photoPath = `posts/${Date.now()}_${safeName(f.name)}`; await store.upload(photoPath, f); }
      await store.add("posts", { text: text.trim(), photoPath, by: profile.uid, byName: profile.name, at: Date.now() });
      setText(""); setFiles([]); say("Posted. Every family can see it on their home page.");
    } catch (e) { say(friendlyError(e), true); }
  }
  return (
    <div className="stack">
      <div className="page-title"><h1>Class feed</h1><p className="muted">News, reminders and photos for every family. It shows on their home page.</p></div>
      <div className="card">
        <div className="field"><label htmlFor="pt">Share with families</label><textarea id="pt" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Such a lovely meet today! Next month: stories. Keep the flash cards going." /></div>
        <PhotoPicker onFiles={(f) => setFiles(f.slice(0, 1))} label="Add a photo" accept="image/*" />
        <FilePreview files={files} onRemove={() => setFiles([])} />
        <Btn kind="primary" icon={Send} onClick={post}>Post</Btn>
      </div>
      {posts.length ? posts.map((p) => (
        <div className="card post" key={p.id}>
          <div className="row"><Avatar name={p.byName} size="sm" /><b>{p.byName}</b><span className="tiny muted">{ago(p.at)}</span><span className="spacer" style={{ flex: 1 }} /><button className="icon-btn" aria-label="Delete post" onClick={async () => { await store.remove("posts", p.id); say("Post deleted."); }}><Trash2 size={18} /></button></div>
          {p.text && <p>{p.text}</p>}
          {p.photoPath && <StoredImage path={p.photoPath} alt="" />}
        </div>
      )) : <div className="card"><Empty art={<Gini className="gini" />} title="No posts yet">Start with a welcome: tell families what month 1 is about.</Empty></div>}
    </div>
  );
}
