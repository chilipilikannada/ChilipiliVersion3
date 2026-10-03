import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Undo2, Check, Play, Save } from "lucide-react";
import { ensureFont, layout, drawGlyph, score, encodeStrokes, thin, fitRecord, centreDots, litDots, autoPath, easyTraceScore } from "../lib/strokes.js";

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

  // The teacher's recording if there is one, otherwise a path worked out from the letter's shape.
  const model = useMemo(() => (L ? (record ? fitRecord(record, L) : null) || (mode !== "record" ? autoPath(L) : null) : null), [L, record, mode]);
  const easyTrace = easy && mode === "trace";
  const TOL = easy ? 0.075 : 0.045;
  const [demo, setDemo] = useState(null); // 0..1 while Gini shows the way (easy tracing)
  const t0 = useRef(performance.now());
  const dots = useMemo(() => (L && easy && mode === "trace" ? centreDots(L, model) : null), [L, easy, mode, model]);
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
    const finger = (p) => {
      g.fillStyle = "rgba(255,199,44,.95)"; g.strokeStyle = "#e0a100"; g.lineWidth = 3;
      g.beginPath(); g.arc(p[0] * H, p[1] * H, Math.max(13, H * 0.045), 0, Math.PI * 2); g.fill(); g.stroke();
      g.font = `${Math.max(22, H * 0.075)}px sans-serif`; g.textAlign = "left"; g.textBaseline = "top";
      g.fillText("👆", p[0] * H + H * 0.01, p[1] * H + H * 0.015);
    };
    const chevrons = (s) => { // little arrowheads along a finished line, showing the direction
      let acc = 0;
      for (let i = 1; i < s.length; i++) {
        const seg = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); acc += seg;
        if (acc < 0.16 || i > s.length - 3) continue; acc = 0;
        const ang = Math.atan2(s[i][1] - s[i - 1][1], s[i][0] - s[i - 1][0]), x = s[i][0] * H, y = s[i][1] * H, hl = Math.max(6, H * 0.022);
        g.strokeStyle = "#fff"; g.lineWidth = Math.max(2.5, H * 0.008); g.lineCap = "round";
        g.beginPath(); g.moveTo(x - hl * Math.cos(ang - 0.6), y - hl * Math.sin(ang - 0.6)); g.lineTo(x, y); g.lineTo(x - hl * Math.cos(ang + 0.6), y - hl * Math.sin(ang + 0.6)); g.stroke();
      }
    };
    // walk a fraction p of the whole path: returns the drawn parts and the tip
    const walk = (p) => {
      const total = ms.reduce((t, s) => t + s.slice(1).reduce((u, q, i) => u + Math.hypot(q[0] - s[i][0], q[1] - s[i][1]), 0), 0) || 1;
      let left = p * total, tip = ms[0][0]; const parts = [];
      ms.forEach((s) => {
        if (left <= 0) return;
        const part = [s[0]];
        for (let i = 1; i < s.length && left > 0; i++) {
          const seg = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
          if (seg <= left) { part.push(s[i]); left -= seg; }
          else { const t = left / seg; part.push([s[i - 1][0] + (s[i][0] - s[i - 1][0]) * t, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * t]); left = 0; }
        }
        parts.push(part); tip = part[part.length - 1];
      });
      return { parts, tip };
    };
    if (mode === "watch" && ms) {
      const { parts, tip } = walk(prog);
      parts.forEach((part, k) => { line(part, RED, Math.max(6, H * 0.035)); if (prog >= 1 || k < parts.length - 1) chevrons(ms[k]); badge(ms[k][0], k + 1, GREEN); });
      if (prog < 1) finger(tip);
    }
    if (dots) {
      const on = litDots(dots, strokes.current, TOL);
      const r = Math.max(6, H * 0.022);
      // the kid's own line, faint, so wobbles don't matter
      for (const s of strokes.current) line(s, "rgba(200,16,46,.22)", Math.max(10, H * 0.06));
      // the letter fills in neatly wherever they've been
      for (let i = 1; i < dots.length; i++) if (on[i] && on[i - 1] && dots[i].stroke === dots[i - 1].stroke) line([[dots[i - 1].x, dots[i - 1].y], [dots[i].x, dots[i].y]], RED, Math.max(8, H * 0.05));
      dots.forEach((d, i) => {
        g.fillStyle = on[i] ? RED : "#c9a978";
        g.beginPath(); g.arc(d.x * H, d.y * H, on[i] ? r * 0.8 : r, 0, Math.PI * 2); g.fill();
      });
      if (demo !== null && ms) {
        const { parts, tip } = walk(demo);
        parts.forEach((part) => line(part, "rgba(255,199,44,.85)", Math.max(10, H * 0.05)));
        finger(tip);
      } else if (mode === "trace" && !result) {
        const nxt = on.findIndex((v) => !v);
        if (nxt >= 0) {
          const d = dots[nxt], pulse = 1.5 + 0.35 * Math.sin((performance.now() - t0.current) / 180);
          g.fillStyle = "rgba(31,138,76,.25)"; g.beginPath(); g.arc(d.x * H, d.y * H, r * pulse * 1.6, 0, Math.PI * 2); g.fill();
          g.fillStyle = GREEN; g.beginPath(); g.arc(d.x * H, d.y * H, r * 1.4, 0, Math.PI * 2); g.fill();
          const nx = dots[nxt + 1];
          if (nx && nx.stroke === d.stroke) {
            const ang = Math.atan2(nx.y - d.y, nx.x - d.x), hl = r * 1.3, bx = d.x * H + Math.cos(ang) * r * 2.6, by = d.y * H + Math.sin(ang) * r * 2.6;
            g.strokeStyle = GREEN; g.lineWidth = Math.max(3, H * 0.01); g.lineCap = "round";
            g.beginPath(); g.moveTo(d.x * H + Math.cos(ang) * r * 1.6, d.y * H + Math.sin(ang) * r * 1.6); g.lineTo(bx, by);
            g.lineTo(bx - hl * Math.cos(ang - 0.6), by - hl * Math.sin(ang - 0.6)); g.moveTo(bx, by); g.lineTo(bx - hl * Math.cos(ang + 0.6), by - hl * Math.sin(ang + 0.6)); g.stroke();
          }
          if (!strokes.current.length) { g.font = `${Math.max(22, H * 0.075)}px sans-serif`; g.textAlign = "left"; g.textBaseline = "top"; g.fillText("👆", d.x * H + r, d.y * H + r); }
        }
      }
    }
    if (mode === "trace" && ms && !result && !dots) {
      const k = strokes.current.length;
      if (k < ms.length) { arrow(ms[k], GREEN); badge(ms[k][0], k + 1, GREEN); }
    }
    if (!dots) for (const s of strokes.current) line(s, mode === "record" ? "#7a2e1b" : RED, Math.max(6, H * (mode === "write" ? 0.04 : 0.045)));
  }, [L, H, Wpx, mode, model, prog, result, dots, demo, TOL]);

  // Easy tracing: keep the next dot pulsing.
  const drawRef = useRef(draw); drawRef.current = draw;
  useEffect(() => {
    if (!easyTrace || result) return;
    let id; const tick = () => { drawRef.current(); id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick); return () => cancelAnimationFrame(id);
  }, [easyTrace, result]);

  // Easy tracing: Gini's finger shows the way first.
  const demoRaf = useRef(0);
  const showMe = useCallback(() => {
    cancelAnimationFrame(demoRaf.current);
    if (!model || !model.strokes) return;
    const start = performance.now(), dur = 900 + 900 * model.strokes.length;
    const step = (t) => { const p = Math.min(1, (t - start) / dur); setDemo(p); if (p < 1) demoRaf.current = requestAnimationFrame(step); else setTimeout(() => setDemo(null), 350); };
    demoRaf.current = requestAnimationFrame(step);
  }, [model]);
  useEffect(() => { if (easyTrace && L && model) showMe(); return () => cancelAnimationFrame(demoRaf.current); }, [easyTrace, L, model, showMe]);

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
    if (demo !== null) { cancelAnimationFrame(demoRaf.current); setDemo(null); }
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
      const on = litDots(dots, strokes.current, TOL); const f = on.filter(Boolean).length / Math.max(1, dots.length);
      setLit(f);
      if (f >= 0.8) setTimeout(check, 250);
    }
  }
  function clear() { strokes.current = []; setResult(null); setLit(0); setN((v) => v + 1); }
  function undo() { strokes.current.pop(); setN((v) => v + 1); }
  function check() {
    let base;
    if (dots && mode === "trace") { const on = litDots(dots, strokes.current, TOL); base = easyTraceScore(on.filter(Boolean).length / Math.max(1, dots.length)); }
    else base = score(L, strokes.current, { mode, model, easy });
    const r = { ...base, strokes: encodeStrokes(strokes.current.map((s) => thin(s, 0.012))), aspect: L.aspect };
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
          {easyTrace && !result && model && <div className="row" style={{ justifyContent: "center" }}><button className="btn ghost small" onClick={showMe}><Play size={18} /> Show me</button></div>}
          {dots && mode === "trace" && !result && <div className="dot-meter" aria-label={`${Math.round(lit * 100)}% of dots`}><i style={{ width: `${Math.round(lit * 100)}%` }} /></div>}
          {result && mode !== "record" && (
            <div className={`pad-result ${result.stars >= 2 ? "good" : result.stars === 1 ? "ok" : "retry"}`} role="status">
              <span className="pad-stars" aria-label={`${result.stars} of 3 stars`}>{[1, 2, 3].map((k) => <span key={k} style={{ opacity: k <= result.stars ? 1 : 0.2 }}>⭐</span>)}</span>
              <b>{result.stars === 3 ? (easy ? "Super! 🎉" : "Beautiful!") : result.stars === 2 ? (easy ? "Great job! 👏" : "Very good!") : result.stars === 1 ? "Good try! 👍" : "Let's try again"}</b>
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
