import { useEffect, useRef } from "react";
import { decodeStrokes } from "../lib/strokes.js";

// A child's handwriting, redrawn from the saved strokes (no photo needed).
export default function StrokeThumb({ strokes, aspect = 1, size = 84, color = "#c8102e" }) {
  const cv = useRef(null);
  useEffect(() => {
    const c = cv.current; if (!c || !strokes) return;
    const H = size, W = Math.round(size * aspect), dpr = window.devicePixelRatio || 1;
    c.width = W * dpr; c.height = H * dpr;
    const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#fffdf6"; g.fillRect(0, 0, W, H);
    g.strokeStyle = color; g.lineWidth = Math.max(2, H * 0.045); g.lineCap = "round"; g.lineJoin = "round";
    for (const s of decodeStrokes(strokes)) {
      if (!s.length) continue;
      g.beginPath(); g.moveTo(s[0][0] * H, s[0][1] * H);
      for (const [x, y] of s.slice(1)) g.lineTo(x * H, y * H);
      if (s.length === 1) g.lineTo(s[0][0] * H + 0.5, s[0][1] * H);
      g.stroke();
    }
  }, [strokes, aspect, size, color]);
  return <canvas ref={cv} style={{ width: Math.round(size * aspect), height: size, borderRadius: 10, border: "1px solid var(--line)" }} aria-hidden="true" />;
}
