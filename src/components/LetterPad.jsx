import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Undo2, Check, Play, Save } from "lucide-react";
import { ensureFont, layout, drawGlyph, score, encodeStrokes, thin, fitRecord, centreDots, litDots } from "../lib/strokes.js";

const RED = "#c8102e", GREEN = "#1f8a4c", GHOST = "#eadfc4", GUIDE = "#f0e2c2";

// One letter (or word) to watch, trace, write alone, or (for the teacher) record.
// mode: "watch" | "trace" | "write" | "record"
export default function LetterPad({ text, mode = "trace", record, onDone, onSave, maxHeight = 360, checkLabel = "Check", easy = false }) {
  const [L, setL] = useState(null);
  const [w, setW] = useState(0);
  const [n, setN] = useState(0);
  const [result, setResult] = useState(null);
  const [prog, setProg] = useState(mode === "watch" ? 0 : 1);
  const wrap = useRef(null), cv = useRef(null);
  const strokes = useRef([]), drawing = useRef(false), raf = useRef(0);

  useEffect(() => { let on = true; ensureFont().then(() => on && setL(layout(text))); return () => { on = false; }; }, [text]);
  useEffect(() => { strokes.current = []; setN(0); setResult(null); }, [text, mode]);
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(el);
    setW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const model = useMemo(() => (L && record ? fitRecord(record, L) : null), [L, record]);
  const dots = useMemo(() => (L && easy && mode !== "write" && mode !== "record" ? centreDots(L, model) : null), [L, easy, mode, model]);
  const [lit, setLit] = useState(0);
  const H = L && w ? Math.max(90, Math.min(w / L.aspect, maxHeight)) : 0; // pixels per box unit
  const Wpx = L ? H * L.aspect : 0;

  const draw = useCallback(() => {
    const c = cv.current; if (!c || !L || !H) return;
    const dpr = window.devicePixelRatio || 1;
    if (c.width !== Math.round(Wpx * dpr)) { c.width = Math.round(Wpx * dpr); c.height = Math.round(H * dpr); }
    const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, Wpx, H);
    g.fillStyle = "#fffdf6"; g.fillRect(0, 0, Wpx, H);
    // writing guide lines
    g.strokeStyle = GUIDE; g.lineWidth = 1.5;
    for (const y of [L.bbox.y0, L.bbox.y1]) { g.beginPath(); g.moveTo(0, y * H); g.lineTo(Wpx, y * H); g.stroke(); }
    g.setLineDash([6, 6]); g.beginPath(); g.moveTo(0, 0.5 * H); g.lineTo(Wpx, 0.5 * H); g.stroke(); g.setLineDash([]);
    // the letter
    if (mode !== "write") drawGlyph(g, L, H, { fill: dots ? "#f4eddd" : GHOST });
    else if (result) drawGlyph(g, L, H, { stroke: "#b9a47a", dash: [5, 5], width: 1.5 });
    const ms = model && model.strokes;
    const line = (s, color, width) => {
      if (!s.length) return;
      g.strokeStyle = color; g.lineWidth = width; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(s[0][0] * H, s[0][1] * H);
      for (let i = 1; i < s.length; i++) g.lineTo(s[i][0] * H, s[i][1] * H);
      if (s.length === 1) g.lineTo(s[0][0] * H + 0.1, s[0][1] * H);
      g.stroke();
    };
    const badge = (p, k, color) => {
      g.fillStyle = color; g.beginPath(); g.arc(p[0] * H, p[1] * H, Math.max(11, H * 0.035), 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fff"; g.font = `800 ${Math.max(12, H * 0.04)}px Nunito, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(String(k), p[0] * H, p[1] * H + 1);
    };
    const arrow = (s, color) => {
      if (s.length < 2) return;
      let i = 1, d = 0; while (i < s.length - 1 && d < 0.09) { d += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); i++; }
      const a = s[0], b = s[i]; const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const tip = [b[0] * H, b[1] * H], hl = Math.max(9, H * 0.03);
      g.strokeStyle = color; g.lineWidth = Math.max(3, H * 0.01); g.lineCap = "round";
      g.beginPath(); g.moveTo(a[0] * H, a[1] * H); g.lineTo(tip[0], tip[1]);
      g.moveTo(tip[0], tip[1]); g.lineTo(tip[0] - hl * Math.cos(ang - 0.5), tip[1] - hl * Math.sin(ang - 0.5));
      g.moveTo(tip[0], tip[1]); g.lineTo(tip[0] - hl * Math.cos(ang + 0.5), tip[1] - hl * Math.sin(ang + 0.5)); g.stroke();
    };
    if (mode === "watch" && ms) {
      const total = ms.reduce((t, s) => t + s.slice(1).reduce((u, p, i) => u + Math.hypot(p[0] - s[i][0], p[1] - s[i][1]), 0), 0) || 1;
      let left = prog * total;
      ms.forEach((s, k) => {
        if (left <= 0) return;
        const part = [s[0]];
        for (let i = 1; i < s.length && left > 0; i++) {
          const seg = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
          if (seg <= left) { part.push(s[i]); left -= seg; }
          else { const t = left / seg; part.push([s[i - 1][0] + (s[i][0] - s[i - 1][0]) * t, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * t]); left = 0; }
        }
        line(part, RED, Math.max(6, H * 0.035));
        badge(s[0], k + 1, GREEN);
      });
    }
    if (dots) {
      const on = litDots(dots, strokes.current);
      const r = Math.max(5, H * 0.02);
      dots.forEach((d, i) => {
        g.fillStyle = on[i] ? GREEN : "#b08a55";
        g.beginPath(); g.arc(d.x * H, d.y * H, on[i] ? r * 1.25 : r, 0, Math.PI * 2); g.fill();
      });
      if (ms && mode === "trace" && !result) {
        const firsts = dots.filter((d) => d.first);
        const k = Math.min(strokes.current.length, firsts.length - 1);
        if (firsts[k]) { const f = firsts[k]; badge([f.x, f.y], f.stroke + 1, GREEN); }
      }
    }
    if (mode === "trace" && ms && !result && !dots) {
      const k = strokes.current.length;
      if (k < ms.length) { arrow(ms[k], GREEN); badge(ms[k][0], k + 1, GREEN); }
    }
    for (const s of strokes.current) line(s, mode === "record" ? "#7a2e1b" : RED, Math.max(6, H * (mode === "write" ? 0.04 : 0.045)));
  }, [L, H, Wpx, mode, model, prog, result]);

  useEffect(() => { draw(); }, [draw, n]);

  // Watch: animate the teacher's strokes.
  const play = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (!model || !model.strokes) { setProg(1); return; }
    const t0 = performance.now(), dur = 900 + 700 * model.strokes.length;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur); setProg(p); if (p < 1) raf.current = requestAnimationFrame(step); };
    raf.current = requestAnimationFrame(step);
  }, [model]);
  useEffect(() => { if (mode === "watch" && L) play(); return () => cancelAnimationFrame(raf.current); }, [mode, L, play]);

  const at = (e) => { const r = cv.current.getBoundingClientRect(); return [(e.clientX - r.left) / H, (e.clientY - r.top) / H]; };
  function down(e) {
    if (mode === "watch" || result) return;
    e.preventDefault(); drawing.current = true;
    try { cv.current.setPointerCapture(e.pointerId); } catch {}
    strokes.current.push([at(e)]); setN((v) => v + 1);
  }
  function move(e) {
    if (!drawing.current) return;
    const s = strokes.current[strokes.current.length - 1];
    const evs = e.nativeEvent.getCoalescedEvents ? e.nativeEvent.getCoalescedEvents() : [e.nativeEvent];
    for (const ev of evs.length ? evs : [e.nativeEvent]) s.push(at(ev));
    draw();
  }
  function up() {
    if (!drawing.current) return; drawing.current = false; setN((v) => v + 1);
    if (dots && mode === "trace" && !result) {
      const on = litDots(dots, strokes.current); const f = on.filter(Boolean).length / Math.max(1, dots.length);
      setLit(f);
      if (f >= 0.85) setTimeout(check, 250);
    }
  }
  function clear() { strokes.current = []; setResult(null); setLit(0); setN((v) => v + 1); }
  function undo() { strokes.current.pop(); setN((v) => v + 1); }
  function check() {
    const r = { ...score(L, strokes.current, { mode, model, easy }), strokes: encodeStrokes(strokes.current.map((s) => thin(s, 0.012))), aspect: L.aspect };
    setResult(r); onDone && onDone(r);
  }

  const has = strokes.current.length > 0;
  return (
    <div className="pad">
      <div ref={wrap} className="pad-wrap">
        {L ? (
          <canvas ref={cv} className="pad-canvas" style={{ width: Wpx, height: H }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
            aria-label={mode === "watch" ? `How to write ${text}` : `Writing area for ${text}`} role="img" />
        ) : <div className="pad-loading" style={{ height: 240 }}>Getting the letters ready…</div>}
      </div>
      {mode === "watch" && (
        <div className="row" style={{ justifyContent: "center" }}>
          {model ? <button className="btn ghost small" onClick={play}><Play size={18} /> Watch again</button>
            : <p className="small muted" style={{ textAlign: "center", margin: 0 }}>Look at the shape carefully. Your teacher will add how to write it soon.</p>}
        </div>
      )}
      {mode !== "watch" && (
        <>
          {dots && mode === "trace" && !result && <div className="dot-meter" aria-label={`${Math.round(lit * 100)}% of dots`}><i style={{ width: `${Math.round(lit * 100)}%` }} /></div>}
          {result && mode !== "record" && (
            <div className={`pad-result ${result.stars >= 2 ? "good" : result.stars === 1 ? "ok" : "retry"}`} role="status">
              <span className="pad-stars" aria-label={`${result.stars} of 3 stars`}>{[1, 2, 3].map((k) => <span key={k} style={{ opacity: k <= result.stars ? 1 : 0.2 }}>⭐</span>)}</span>
              <b>{result.stars === 3 ? "Beautiful!" : result.stars === 2 ? "Very good!" : result.stars === 1 ? "Good try!" : "Let's try again"}</b>
              {result.tips.map((t) => <span key={t} className="small">{t}</span>)}
            </div>
          )}
          <div className="row" style={{ justifyContent: "center" }}>
            {has && !result && <button className="btn ghost small" onClick={undo}><Undo2 size={18} /> Undo</button>}
            {(has || result) && <button className="btn ghost small" onClick={clear}><RotateCcw size={18} /> {result ? "Try again" : "Clear"}</button>}
            {mode === "record" ? <button className="btn primary small" disabled={!has} onClick={() => onSave && onSave({ strokes: encodeStrokes(strokes.current.map((s) => thin(s))), aspect: L.aspect })}><Save size={18} /> Save</button>
              : !result && <button className="btn primary small" disabled={!has} onClick={check}><Check size={18} /> {checkLabel}</button>}
          </div>
        </>
      )}
    </div>
  );
}
