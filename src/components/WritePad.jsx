import { useEffect, useRef, useState } from "react";
import { RotateCcw, Undo2 } from "lucide-react";
import { encodeStrokes, thin } from "../lib/strokes.js";

// Free writing on ruled lines (dictation, stories). Not scored; the teacher sees the handwriting.
export default function WritePad({ aspect = 2.2, lines = 2, onChange, label = "Write here" }) {
  const wrap = useRef(null), cv = useRef(null), strokes = useRef([]), drawing = useRef(false);
  const [w, setW] = useState(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(el); setW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  const H = w ? w / aspect : 0;
  useEffect(() => {
    const c = cv.current; if (!c || !H) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.round(w * dpr); c.height = Math.round(H * dpr);
    const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#fffdf6"; g.fillRect(0, 0, w, H);
    const band = H / lines;
    for (let i = 0; i < lines; i++) {
      const top = i * band + band * 0.18, bot = i * band + band * 0.82;
      g.strokeStyle = "#e7d3a8"; g.lineWidth = 1.5; g.setLineDash([]);
      g.beginPath(); g.moveTo(8, top); g.lineTo(w - 8, top); g.moveTo(8, bot); g.lineTo(w - 8, bot); g.stroke();
      g.setLineDash([6, 6]); g.strokeStyle = "#f0e2c2"; g.beginPath(); g.moveTo(8, (top + bot) / 2); g.lineTo(w - 8, (top + bot) / 2); g.stroke(); g.setLineDash([]);
    }
    g.strokeStyle = "#c8102e"; g.lineWidth = Math.max(3, H * 0.014 * (2 / lines) * 1.6); g.lineCap = "round"; g.lineJoin = "round";
    for (const s of strokes.current) { if (!s.length) continue; g.beginPath(); g.moveTo(s[0][0] * H, s[0][1] * H); for (const [x, y] of s.slice(1)) g.lineTo(x * H, y * H); if (s.length === 1) g.lineTo(s[0][0] * H + 0.5, s[0][1] * H); g.stroke(); }
  }, [w, H, n, lines]);
  const at = (e) => { const r = cv.current.getBoundingClientRect(); return [(e.clientX - r.left) / H, (e.clientY - r.top) / H]; };
  const emit = () => onChange && onChange(strokes.current.length ? encodeStrokes(strokes.current.map((s) => thin(s, 0.006))) : null, aspect);
  return (
    <div className="stack-s">
      <div ref={wrap} style={{ width: "100%" }}>
        <canvas ref={cv} className="write-pad" style={{ width: "100%", height: H || 120 }} aria-label={label}
          onPointerDown={(e) => { e.preventDefault(); drawing.current = true; try { cv.current.setPointerCapture(e.pointerId); } catch {} strokes.current.push([at(e)]); setN((v) => v + 1); }}
          onPointerMove={(e) => { if (!drawing.current) return; const s = strokes.current[strokes.current.length - 1]; const evs = e.nativeEvent.getCoalescedEvents ? e.nativeEvent.getCoalescedEvents() : [e.nativeEvent]; for (const ev of evs.length ? evs : [e.nativeEvent]) s.push(at(ev)); setN((v) => v + 1); }}
          onPointerUp={() => { if (drawing.current) { drawing.current = false; emit(); } }} onPointerCancel={() => { drawing.current = false; emit(); }} />
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn ghost small" onClick={() => { strokes.current.pop(); setN((v) => v + 1); emit(); }}><Undo2 size={16} /> Undo</button>
        <button className="btn ghost small" onClick={() => { strokes.current = []; setN((v) => v + 1); emit(); }}><RotateCcw size={16} /> Clear</button>
      </div>
    </div>
  );
}
