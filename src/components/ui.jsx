import { useEffect, useRef, useState } from "react";
import { X, Camera, Mic, Square, Play, Trash2, Upload } from "lucide-react";
import { STAGES, SKILLS, SKILL, CAN_DO } from "../lib/content.js";
import { STAGE_EMOJI } from "./Art.jsx";
import { initials, colorFor, useUrl } from "../lib/hooks.js";
import { useRecorder, canRecord } from "../lib/audio.js";
import MicHelp from "./MicHelp.jsx";

export function Btn({ kind = "primary", size, block, icon: Icon, children, onClick, busyText, type = "button", ...rest }) {
  const [busy, setBusy] = useState(false);
  async function click(e) {
    if (!onClick) return;
    const r = onClick(e);
    if (r && typeof r.then === "function") { setBusy(true); try { await r; } finally { setBusy(false); } }
  }
  return (
    <button type={type} className={`btn ${kind} ${size || ""} ${block ? "block" : ""}`} onClick={click} disabled={busy || rest.disabled} {...rest}>
      {Icon && <Icon aria-hidden="true" />}{busy && busyText ? busyText : children}
    </button>
  );
}

export function Avatar({ name, size = "", photo }) {
  return <span className={`avatar ${size}`} style={{ background: colorFor(name) }}>{photo ? <img src={photo} alt="" /> : initials(name)}</span>;
}

export function Empty({ art, title, children, action }) {
  return <div className="empty">{art}<h3>{title}</h3>{children && <p>{children}</p>}{action}</div>;
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="modal-back" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="card-head"><h2 style={{ fontSize: 24 }}>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><X /></button></div>
        {children}
      </div>
    </div>
  );
}

export function StageChip({ stage }) {
  return <span className="pill yellow">{STAGE_EMOJI[stage]} {STAGES[stage].en} <span className="kn">{STAGES[stage].kn}</span></span>;
}

// Ladder: where the child is (red), the 6-month goal (dashed), for each skill.
export function Ladder({ now = {}, goal, compact }) {
  return (
    <div className="ladder">
      {SKILLS.map((k) => (
        <div className="lrow" key={k}>
          <b>{SKILL[k].en} <span className="kn muted" style={{ fontWeight: 400 }}>{SKILL[k].kn}</span></b>
          <div className="lsteps" role="img" aria-label={`${SKILL[k].en}: ${STAGES[now[k] || 0].en}${goal ? `, goal ${STAGES[goal[k]].en}` : ""}`}>
            {STAGES.map((s, L) => {
              const c = [];
              if (L <= (now[k] || 0)) c.push("have");
              else if (goal && L <= goal[k]) c.push("goal");
              if (L === (now[k] || 0)) c.push("now");
              return <span key={L} className={`lstep ${c.join(" ")}`} title={`${s.en} ${s.kn}: ${CAN_DO[k][L]}`}>{STAGE_EMOJI[L]}</span>;
            })}
          </div>
          {!compact && <div className="lcap">Now <b>{STAGES[now[k] || 0].en}</b>: {((t) => t.charAt(0).toLowerCase() + t.slice(1))(CAN_DO[k][now[k] || 0].replace(/\.$/, ""))}.{goal && <> Goal: <b>{STAGES[goal[k]].en}</b>.</>}</div>}
        </div>
      ))}
    </div>
  );
}

// Pick photos from the camera or gallery, preview them, then send.
export function PhotoPicker({ onFiles, label = "Take or choose photos", accept = "image/*,application/pdf" }) {
  const cam = useRef(null), pick = useRef(null);
  return (
    <div className="row">
      <Btn kind="yellow" icon={Camera} onClick={() => cam.current.click()}>Take a photo</Btn>
      <Btn kind="ghost" icon={Upload} onClick={() => pick.current.click()}>{label}</Btn>
      <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { onFiles([...e.target.files]); e.target.value = ""; }} />
      <input ref={pick} type="file" accept={accept} multiple hidden onChange={(e) => { onFiles([...e.target.files]); e.target.value = ""; }} />
    </div>
  );
}

export function FilePreview({ files, onRemove }) {
  const [urls, setUrls] = useState([]);
  useEffect(() => { const u = files.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null)); setUrls(u); return () => u.forEach((x) => x && URL.revokeObjectURL(x)); }, [files]);
  if (!files.length) return null;
  return (
    <div className="photos">
      {files.map((f, i) => (
        <div className="ph" key={i} style={{ position: "relative" }}>
          {urls[i] ? <img src={urls[i]} alt={f.name} /> : <span className="tiny" style={{ padding: 6, overflowWrap: "anywhere" }}>📄 {f.name}</span>}
          {onRemove && <button className="icon-btn" style={{ position: "absolute", top: 2, right: 2, background: "#fff", width: 30, height: 30 }} onClick={() => onRemove(i)} aria-label="Remove"><Trash2 size={16} /></button>}
        </div>
      ))}
    </div>
  );
}

// Record a voice note (falls back to the phone's recorder app where the browser can't record).
export function VoiceRecorder({ onDone, maxSeconds = 60, compact }) {
  const r = useRecorder(maxSeconds);
  const file = useRef(null);
  const live = canRecord() && r.error !== "unsupported";
  useEffect(() => { if (r.blob) onDone && onDone(r.blob, r.url); /* eslint-disable-next-line */ }, [r.blob]);
  if (compact) return (
    <>
      <button type="button" className={`round-btn ${r.recording ? "rec" : ""}`} onClick={live ? (r.recording ? r.stop : r.start) : () => file.current.click()} aria-label={r.recording ? `Stop recording (${r.seconds}s)` : "Record a voice note"}>
        {r.recording ? <Square /> : <Mic />}
      </button>
      <input ref={file} type="file" accept="audio/*" capture="user" hidden onChange={(e) => { r.useFile(e.target.files[0]); e.target.value = ""; }} />
    </>
  );
  return (
    <div className="row">
      {live ? (
        r.recording
          ? <Btn kind="primary" icon={Square} onClick={r.stop}>Stop · {r.seconds}s</Btn>
          : <Btn kind="ghost" icon={Mic} onClick={r.start}>Record voice note</Btn>
      ) : (
        <Btn kind="ghost" icon={Mic} onClick={() => file.current.click()}>Record voice note</Btn>
      )}
      <input ref={file} type="file" accept="audio/*" capture="user" hidden onChange={(e) => { r.useFile(e.target.files[0]); e.target.value = ""; }} />
      {r.error && r.error !== "unsupported" && <MicHelp error={r.error} onRetry={() => { r.reset(); r.start(); }} />}
    </div>
  );
}

export function StoredImage({ path, alt = "", ...rest }) {
  const u = useUrl(path);
  return u ? <img src={u} alt={alt} {...rest} /> : <div style={{ aspectRatio: "4/3", background: "#f3ead8", borderRadius: 12 }} />;
}
export function StoredAudio({ path }) {
  const u = useUrl(path);
  return u ? <audio controls src={u} preload="none" style={{ width: "100%", maxWidth: 360 }} /> : <span className="tiny muted">Loading audio…</span>;
}

// Preview a recorded blob without re-creating its URL on every render.
export function BlobAudio({ blob }) {
  const [u, setU] = useState(null);
  useEffect(() => { if (!blob) return; const x = URL.createObjectURL(blob); setU(x); return () => URL.revokeObjectURL(x); }, [blob]);
  return u ? <audio controls src={u} style={{ width: "100%", maxWidth: 360 }} /> : null;
}

export function PlayButton({ onClick, label = "Play" }) {
  return <button className="big-round red" onClick={onClick} aria-label={label}><Play /></button>;
}
