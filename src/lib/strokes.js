// Handwriting: lay a letter out in a box, check a child's strokes against its shape,
// and (when the teacher has recorded it) against the teacher's stroke order and direction.
// Coordinates are in "box units": y from 0 (top) to 1 (bottom), x from 0 to the box's aspect ratio.
import fontUrl from "@fontsource/noto-sans-kannada/files/noto-sans-kannada-kannada-500-normal.woff2?url";

export const PAD_FONT = "KnPad";
let fontReady = null;
export function ensureFont() {
  if (fontReady) return fontReady;
  fontReady = (async () => {
    try {
      if (typeof FontFace === "undefined") return false;
      const f = new FontFace(PAD_FONT, `url(${fontUrl})`, { weight: "500" });
      await f.load(); document.fonts.add(f); return true;
    } catch { return false; }
  })();
  return fontReady;
}
const fontCss = (px) => `500 ${px}px ${PAD_FONT}, "Noto Sans Kannada", sans-serif`;

let _mc = null;
const measureCtx = () => (_mc ||= document.createElement("canvas").getContext("2d"));

// Box shape and where the letter sits inside it. Deterministic for a given text and font.
export function layout(text) {
  const g = measureCtx(); g.font = fontCss(100);
  const m = g.measureText(text);
  const l = m.actualBoundingBoxLeft || 0, r = m.actualBoundingBoxRight || m.width, a = m.actualBoundingBoxAscent || 70, d = m.actualBoundingBoxDescent || 10;
  const bw = Math.max(1, l + r), bh = Math.max(1, a + d);
  const aspect = Math.min(3, Math.max(1, Math.round(((bw / bh) * 0.72 / 0.68) * 4) / 4));
  const s = Math.min((0.68 * 1) / bh, (0.8 * aspect) / bw); // box units per font px at size 100
  const size = 100 * s;
  const cx = aspect / 2, cy = 0.5;
  const x = cx - ((r - l) / 2) * s; // text origin x (left alignment)
  const y = cy + ((a - d) / 2) * s; // baseline
  return { text, aspect, size, x, y, bbox: { x0: cx - (bw * s) / 2, x1: cx + (bw * s) / 2, y0: cy - (bh * s) / 2, y1: cy + (bh * s) / 2 } };
}

// Draw the letter into a 2D context where 1 box unit = H pixels.
export function drawGlyph(g, L, H, { fill, stroke, dash, ox = 0, oy = 0, width } = {}) {
  g.save();
  g.font = fontCss(L.size * H);
  g.textBaseline = "alphabetic"; g.textAlign = "left";
  if (fill) { g.fillStyle = fill; g.fillText(L.text, ox + L.x * H, oy + L.y * H); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = width || Math.max(1, H * 0.008); if (dash) g.setLineDash(dash); g.strokeText(L.text, ox + L.x * H, oy + L.y * H); }
  g.restore();
}

// ---------- grids and distances ----------
const GH = 96;
function dist(mask, W, H) {
  const INF = 1e9, d = new Float32Array(W * H);
  for (let i = 0; i < d.length; i++) d[i] = mask[i] ? 0 : INF;
  const a = 1, b = Math.SQRT2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; let v = d[i];
    if (x > 0) v = Math.min(v, d[i - 1] + a);
    if (y > 0) { v = Math.min(v, d[i - W] + a); if (x > 0) v = Math.min(v, d[i - W - 1] + b); if (x < W - 1) v = Math.min(v, d[i - W + 1] + b); }
    d[i] = v;
  }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
    const i = y * W + x; let v = d[i];
    if (x < W - 1) v = Math.min(v, d[i + 1] + a);
    if (y < H - 1) { v = Math.min(v, d[i + W] + a); if (x < W - 1) v = Math.min(v, d[i + W + 1] + b); if (x > 0) v = Math.min(v, d[i + W - 1] + b); }
    d[i] = v;
  }
  return d;
}

const glyphCache = new Map();
function glyphGrid(L) {
  const key = L.text + "|" + L.aspect;
  if (glyphCache.has(key)) return glyphCache.get(key);
  const W = Math.round(GH * L.aspect), H = GH;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  drawGlyph(g, L, H, { fill: "#000" });
  const px = g.getImageData(0, 0, W, H).data;
  const mask = new Uint8Array(W * H); let n = 0;
  for (let i = 0; i < W * H; i++) if (px[i * 4 + 3] > 110) { mask[i] = 1; n++; }
  const out = { W, H, mask, n, d: dist(mask, W, H) };
  glyphCache.set(key, out);
  return out;
}

// Points every ~half a grid cell along the strokes, in grid coordinates.
function samples(strokes, sx = 1, sy = 1, ox = 0, oy = 0) {
  const out = [], step = 0.5 / GH;
  for (const s of strokes) {
    for (let i = 0; i < s.length; i++) {
      const [x1, y1] = s[i];
      if (i === 0) { out.push([(x1 * sx + ox) * GH, (y1 * sy + oy) * GH]); continue; }
      const [x0, y0] = s[i - 1];
      const len = Math.hypot(x1 - x0, y1 - y0), k = Math.max(1, Math.ceil(len / step));
      for (let j = 1; j <= k; j++) { const t = j / k; out.push([((x0 + (x1 - x0) * t) * sx + ox) * GH, ((y0 + (y1 - y0) * t) * sy + oy) * GH]); }
    }
  }
  return out;
}

const inkLength = (strokes) => strokes.reduce((t, s) => t + s.slice(1).reduce((u, p, i) => u + Math.hypot(p[0] - s[i][0], p[1] - s[i][1]), 0), 0);
function bboxOf(strokes) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const s of strokes) for (const [x, y] of s) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1 };
}

function shapeScore(L, strokes, { free = false, easy = false } = {}) {
  const G = glyphGrid(L);
  let sx = 1, sy = 1, ox = 0, oy = 0;
  if (free) {
    // Writing alone: stretch the child's letter onto the model's box before comparing.
    const b = bboxOf(strokes), m = L.bbox;
    const cw = Math.max(0.02, b.x1 - b.x0), ch = Math.max(0.02, b.y1 - b.y0);
    sx = (m.x1 - m.x0) / cw; sy = (m.y1 - m.y0) / ch;
    ox = m.x0 - b.x0 * sx; oy = m.y0 - b.y0 * sy;
  }
  const pts = samples(strokes, sx, sy, ox, oy);
  if (!pts.length || !G.n) return { coverage: 0, precision: 0 };
  const tolP = easy ? (free ? 6.5 : 5.5) : free ? 4.5 : 3.6, tolC = easy ? (free ? 7 : 6.5) : free ? 5 : 4.5;
  let good = 0;
  const ink = new Uint8Array(G.W * G.H);
  for (const [x, y] of pts) {
    const xi = Math.round(x), yi = Math.round(y);
    if (xi >= 0 && yi >= 0 && xi < G.W && yi < G.H) { ink[yi * G.W + xi] = 1; if (G.d[yi * G.W + xi] <= tolP) good++; }
  }
  const dc = dist(ink, G.W, G.H);
  let cov = 0;
  for (let i = 0; i < G.W * G.H; i++) if (G.mask[i] && dc[i] <= tolC) cov++;
  return { coverage: cov / G.n, precision: good / pts.length };
}

// Resample a stroke to n points, for comparing direction and shape.
function resample(s, n = 16) {
  if (s.length < 2) return Array.from({ length: n }, () => s[0] || [0, 0]);
  const segs = [0]; for (let i = 1; i < s.length; i++) segs.push(segs[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]));
  const L = segs[segs.length - 1] || 1, out = [];
  for (let k = 0; k < n; k++) {
    const t = (L * k) / (n - 1); let i = 1; while (i < segs.length - 1 && segs[i] < t) i++;
    const u = (t - segs[i - 1]) / Math.max(1e-6, segs[i] - segs[i - 1]);
    out.push([s[i - 1][0] + (s[i][0] - s[i - 1][0]) * u, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * u]);
  }
  return out;
}
const meanDist = (a, b) => a.reduce((t, p, i) => t + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length;

function orderCheck(model, strokes) {
  const tips = [];
  const ms = model.filter((s) => s.length > 1), ks = strokes.filter((s) => s.length > 1 || inkLength([s]) > 0);
  if (!ms.length || !ks.length) return { ok: true, tips };
  if (Math.hypot(ks[0][0][0] - ms[0][0][0], ks[0][0][1] - ms[0][0][1]) > 0.2) tips.push("Start at the green dot.");
  let wrongWay = 0, wrongOrder = 0;
  for (let i = 0; i < Math.min(ms.length, ks.length); i++) {
    const a = resample(ks[i]), b = resample(ms[i]);
    const fwd = meanDist(a, b), rev = meanDist([...a].reverse(), b);
    if (rev < fwd * 0.6 && rev < 0.2) wrongWay++;
    else if (fwd > 0.22) wrongOrder++;
  }
  if (wrongWay) tips.push("Follow the arrows: one line went the other way.");
  if (wrongOrder) tips.push("Try the lines in your teacher's order. Press Watch to see it again.");
  if (ks.length > ms.length + 1) tips.push(`Your teacher writes this in ${ms.length} ${ms.length === 1 ? "stroke" : "strokes"}. Try lifting your finger less.`);
  return { ok: !wrongWay && !wrongOrder && tips.length === 0, tips };
}

// The verdict: stars 0..3 and friendly tips.
export function score(L, strokes, { mode = "trace", model = null, easy = false } = {}) {
  const ink = inkLength(strokes);
  const minInk = (easy ? 0.25 : 0.35) * Math.max(1, [...L.text].length * 0.6);
  if (ink < minInk) return { stars: 0, coverage: 0, precision: 0, tips: ["Keep going: write the whole letter."], orderOk: true };
  const free = mode === "write";
  const { coverage, precision } = shapeScore(L, strokes, { free, easy });
  let stars = easy
    ? (coverage >= 0.7 && precision >= 0.65 ? 3 : coverage >= 0.5 && precision >= 0.5 ? 2 : 1)
    : coverage >= 0.85 && precision >= 0.85 ? 3 : coverage >= 0.72 && precision >= 0.76 ? 2 : coverage >= 0.5 && precision >= 0.6 ? 1 : 0;
  if (easy) {
    const tips = [];
    if (coverage < 0.5) tips.push(free ? "Good try! Look at the letter once more and write it bigger." : "Go over all the dots.");
    return { stars, coverage, precision, tips, orderOk: true };
  }
  const tips = [];
  if (coverage < 0.72) tips.push(free ? "Some parts of the letter are missing. Look at the model again." : "Trace over all of the grey letter.");
  if (precision < 0.76) tips.push(free ? "Try to keep the shape closer to the model." : "Stay on the grey lines.");
  let orderOk = true;
  if (model && model.strokes && model.strokes.length && !model.auto && !free) {
    const o = orderCheck(model.strokes, strokes);
    orderOk = o.ok; tips.push(...o.tips);
    if (!orderOk) stars = Math.min(stars, 2);
  }
  return { stars, coverage, precision, tips: tips.slice(0, 2), orderOk };
}

// ---------- storing the teacher's strokes (Firestore can't hold nested arrays) ----------
export const encodeStrokes = (strokes) => strokes.filter((s) => s.length).map((s) => s.map(([x, y]) => `${Math.round(x * 1000)},${Math.round(y * 1000)}`).join(";"));
export const decodeStrokes = (arr = []) => arr.map((s) => s.split(";").map((p) => p.split(",").map((v) => +v / 1000)));

// Simplify a stroke a little so recordings stay small.
export function thin(s, min = 0.008) {
  const out = [];
  for (const p of s) if (!out.length || Math.hypot(p[0] - out[out.length - 1][0], p[1] - out[out.length - 1][1]) >= min) out.push(p);
  if (s.length && out[out.length - 1] !== s[s.length - 1]) out.push(s[s.length - 1]);
  return out;
}

// The teacher's recording, scaled to this layout's box if the aspect differs.
export function fitRecord(r, L) {
  if (!r || !r.strokes || !r.strokes.length) return null;
  const k = r.aspect && L.aspect && r.aspect !== L.aspect ? L.aspect / r.aspect : 1;
  return { ...r, strokes: decodeStrokes(r.strokes).map((s) => s.map(([x, y]) => [x * k, y])) };
}

// ---------- Easy tracing: dots along the middle of each line ----------
function skeleton(mask, W, H) {
  const m = Uint8Array.from(mask);
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : m[y * W + x]);
  let changed = true, guard = 0;
  while (changed && guard++ < 60) {
    changed = false;
    for (const pass of [0, 1]) {
      const del = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (!m[y * W + x]) continue;
        const P = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
        const B = P[0] + P[1] + P[2] + P[3] + P[4] + P[5] + P[6] + P[7]; if (B < 2 || B > 6) continue;
        let A = 0; for (let k = 0; k < 8; k++) if (!P[k] && P[(k + 1) % 8]) A++; if (A !== 1) continue;
        if (pass === 0 ? (P[0] * P[2] * P[4] || P[2] * P[4] * P[6]) : (P[0] * P[2] * P[6] || P[0] * P[4] * P[6])) continue;
        del.push(y * W + x);
      }
      if (del.length) { changed = true; for (const i of del) m[i] = 0; }
    }
  }
  return m;
}

const dotCache = new Map();
// Dots (in box units) along the centre of the letter, spaced evenly. If the teacher has
// recorded the letter, the dots follow the teacher's strokes instead (in order).
export function centreDots(L, model = null, spacing = 0.05) {
  if (model && model.strokes && model.strokes.length) {
    const out = [];
    model.strokes.forEach((s, k) => {
      let acc = spacing; // always put a dot at the start
      for (let i = 0; i < s.length; i++) {
        if (i > 0) acc += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
        if (acc >= spacing || i === s.length - 1) { out.push({ x: s[i][0], y: s[i][1], stroke: k, first: out.length === 0 || out[out.length - 1].stroke !== k }); acc = 0; }
      }
    });
    return out;
  }
  const key = L.text + "|" + L.aspect + "|" + spacing;
  if (dotCache.has(key)) return dotCache.get(key);
  const G = 160, W = Math.round(G * L.aspect);
  const c = document.createElement("canvas"); c.width = W; c.height = G;
  const g = c.getContext("2d"); drawGlyph(g, L, G, { fill: "#000" });
  const px = g.getImageData(0, 0, W, G).data;
  const mask = new Uint8Array(W * G);
  for (let i = 0; i < W * G; i++) mask[i] = px[i * 4 + 3] > 110 ? 1 : 0;
  const sk = skeleton(mask, W, G);
  const pts = [];
  for (let y = 0; y < G; y++) for (let x = 0; x < W; x++) if (sk[y * W + x]) pts.push([x / G, y / G]);
  const out = [];
  for (const [x, y] of pts) if (!out.some((d) => Math.hypot(d.x - x, d.y - y) < spacing)) out.push({ x, y, stroke: 0 });
  dotCache.set(key, out);
  return out;
}

// Which dots the child's ink has passed over.
export function litDots(dots, strokes, tol = 0.045) {
  // tol is in box units (the box is 1 tall); easy mode passes a wider one
  const lit = new Array(dots.length).fill(false);
  for (const s of strokes) for (const [x, y] of s) for (let i = 0; i < dots.length; i++) if (!lit[i] && Math.abs(dots[i].x - x) < tol && Math.abs(dots[i].y - y) < tol && Math.hypot(dots[i].x - x, dots[i].y - y) < tol) lit[i] = true;
  return lit;
}

// ---------- Automatic writing path (used when the teacher hasn't recorded the letter) ----------
// Thins the letter to its centre line, trims tiny spurs, then walks it into strokes:
// start at the leftmost free end (Kannada letters are mostly begun on the left), keep going
// in the straightest direction, and start a new stroke from the next leftmost end when stuck.
const autoCache = new Map();
export function autoPath(L) {
  const key = L.text + "|" + L.aspect;
  if (autoCache.has(key)) return autoCache.get(key);
  const G = 160, W = Math.round(G * L.aspect);
  let sk;
  try {
    const c = document.createElement("canvas"); c.width = W; c.height = G;
    const g = c.getContext("2d"); drawGlyph(g, L, G, { fill: "#000" });
    const px = g.getImageData(0, 0, W, G).data;
    const mask = new Uint8Array(W * G);
    for (let i = 0; i < W * G; i++) mask[i] = px[i * 4 + 3] > 110 ? 1 : 0;
    sk = skeleton(mask, W, G);
  } catch { return null; }
  const N8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  const on = (x, y) => x >= 0 && y >= 0 && x < W && y < G && sk[y * W + x];
  const nbrs = (i) => { const x = i % W, y = (i / W) | 0, out = []; for (const [dx, dy] of N8) if (on(x + dx, y + dy)) out.push((y + dy) * W + x + dx); return out; };
  // trim spurs shorter than 7 px (skeleton noise at corners)
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < sk.length; i++) {
      if (!sk[i] || nbrs(i).length !== 1) continue;
      const path = [i]; let prev = -1, cur = i;
      while (path.length < 8) {
        const nb = nbrs(cur).filter((j) => j !== prev && !path.includes(j));
        if (nb.length !== 1 || nbrs(nb[0]).length > 2) break;
        prev = cur; cur = nb[0]; path.push(cur);
      }
      if (path.length < 7) for (const j of path) sk[j] = 0;
    }
  }
  const seen = new Uint8Array(W * G);
  const leftmost = (pred) => { let best = -1; for (let x = 0; x < W && best < 0; x++) for (let y = 0; y < G; y++) { const i = y * W + x; if (sk[i] && !seen[i] && pred(i)) { best = i; break; } } return best; };
  const strokes = [];
  for (let guard = 0; guard < 12; guard++) {
    let start = leftmost((i) => nbrs(i).filter((j) => !seen[j]).length === 1);
    if (start < 0) start = leftmost(() => true);
    if (start < 0) break;
    const pts = [start]; seen[start] = 1;
    let dir = [0, -1]; // for a loop, go up first (clockwise from the left)
    let cur = start;
    for (;;) {
      const cand = nbrs(cur).filter((j) => !seen[j]);
      if (!cand.length) break;
      const cx = cur % W, cy = (cur / W) | 0;
      let best = cand[0], bestDot = -9;
      for (const j of cand) { const dx = (j % W) - cx, dy = ((j / W) | 0) - cy, l = Math.hypot(dx, dy); const d = (dx * dir[0] + dy * dir[1]) / l; if (d > bestDot) { bestDot = d; best = j; } }
      // mark the other candidates seen too, so the line doesn't split into hairs
      for (const j of cand) if (j !== best && nbrs(j).every((q) => q === cur || q === best || seen[q] || cand.includes(q))) seen[j] = 1;
      seen[best] = 1; pts.push(best);
      const back = pts[Math.max(0, pts.length - 5)];
      const vx = (best % W) - (back % W), vy = ((best / W) | 0) - ((back / W) | 0), vl = Math.hypot(vx, vy) || 1;
      dir = [vx / vl, vy / vl]; cur = best;
    }
    // close a loop if we ended next to where we started
    const sx = start % W, sy = (start / W) | 0, ex = cur % W, ey = (cur / W) | 0;
    if (pts.length > 20 && Math.hypot(sx - ex, sy - ey) <= 2) pts.push(start);
    let s = pts.map((i) => [(i % W) / G, ((i / W) | 0) / G]);
    if (s.length < 2) continue;
    // smooth
    s = s.map((p, i) => { let x = 0, y = 0, n = 0; for (let k = Math.max(0, i - 3); k <= Math.min(s.length - 1, i + 3); k++) { x += s[k][0]; y += s[k][1]; n++; } return [x / n, y / n]; });
    const len = s.slice(1).reduce((t, p, i) => t + Math.hypot(p[0] - s[i][0], p[1] - s[i][1]), 0);
    if (len < 0.06) continue;
    strokes.push(thin(s, 0.01));
  }
  // The top hook (talakattu) is written last: move strokes that sit only in the top band to the end.
  const top = L.bbox.y0 + 0.36 * (L.bbox.y1 - L.bbox.y0);
  const isTop = (st) => st.every(([, y]) => y < top);
  const ordered = strokes.length > 1 ? [...strokes.filter((st) => !isTop(st)), ...strokes.filter(isTop)] : strokes;
  const out = ordered.length ? { strokes: ordered, auto: true } : null;
  autoCache.set(key, out);
  return out;
}

// Easy tracing verdict, from how many dots were passed. Any real attempt earns a star.
export function easyTraceScore(f) {
  const stars = f >= 0.9 ? 3 : f >= 0.75 ? 2 : 1;
  return { stars, coverage: f, precision: 1, tips: stars < 3 ? ["Next time, go over every dot!"] : [], orderOk: true };
}
