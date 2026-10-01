// The printable packet as a real PDF (US Letter). Pages are drawn on a canvas, which shapes
// Kannada correctly, then placed into a PDF with pdf-lib.
import { ensureFont, layout, drawGlyph, fitRecord, PAD_FONT } from "./strokes.js";
import { TRACKS, KAG_GRID_CONS, LETTER_WORD, SOUND, tiles } from "./course.js";
import { voiceKey } from "./audio.js";

const PW = 1275, PH = 1650, M = 80; // 150 dpi, margins
const RED = "#c8102e", DEEP = "#8a0d1f", YEL = "#ffc72c", INK = "#2a0f0c", MUTE = "#7b5b52", LINE = "#d9c7a0", GHOST = "#d7d0c2";
const EN = (px, w = 700) => `${w} ${px}px Nunito, "${PAD_FONT}", Arial, sans-serif`;
const KN = (px) => `500 ${px}px ${PAD_FONT}, "Noto Sans Kannada", sans-serif`;
const shuffleSeeded = (a, seed) => { const b = [...a]; let s = seed || 1; for (let i = b.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function newPage() {
  const c = document.createElement("canvas"); c.width = PW; c.height = PH;
  const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, PW, PH);
  return { c, g, y: 0 };
}

function header(p, { child, week, n, title, sub, page, pages, school }) {
  const { g } = p;
  g.fillStyle = RED; g.fillRect(0, 0, PW, 110);
  g.fillStyle = YEL; g.fillRect(0, 110, PW, 10);
  g.fillStyle = "#fff"; g.font = EN(40, 800); g.textBaseline = "middle"; g.fillText(`${school || "Chili Pili"} · Kannada`, M, 56);
  g.textAlign = "right"; g.font = EN(28, 700); g.fillText(`Week ${week} · Packet ${n} · page ${page} of ${pages}`, PW - M, 56); g.textAlign = "left";
  g.fillStyle = INK; g.font = EN(38, 800); g.textBaseline = "alphabetic"; g.fillText(title, M, 188);
  if (sub) { g.fillStyle = MUTE; g.font = EN(24, 600); g.fillText(sub, M, 224); }
  g.fillStyle = INK; g.font = EN(24, 700);
  g.fillText(`Name: ${child.name || "______________________"}`, M, 268);
  g.fillText("Date: ______________", M + 620, 268);

}
function footer(p, text) {
  const { g } = p;
  g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(M, PH - 80); g.lineTo(PW - M, PH - 80); g.stroke();
  g.fillStyle = MUTE; g.font = EN(20, 600); g.textBaseline = "alphabetic"; g.fillText(text, M, PH - 48);
}
function section(p, label) {
  const { g } = p;
  p.y += 12;
  g.fillStyle = "#fff4cf"; roundRect(g, M, p.y, PW - 2 * M, 46, 12); g.fill();
  g.fillStyle = DEEP; g.font = EN(24, 800); g.textBaseline = "middle"; g.fillText(label, M + 16, p.y + 24); g.textBaseline = "alphabetic";
  p.y += 64;
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function wrap(g, text, x, y, maxW, lh) {
  const words = String(text).split(/\s+/); let line = "", yy = y;
  for (const w of words) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = t; }
  if (line) g.fillText(line, x, yy);
  return yy + lh;
}
// Handwriting lines: top, dashed middle, baseline.
function lines(p, count, h = 70) {
  const { g } = p;
  for (let i = 0; i < count; i++) {
    const y0 = p.y + i * (h + 16);
    g.strokeStyle = LINE; g.lineWidth = 2; g.setLineDash([]);
    g.beginPath(); g.moveTo(M, y0); g.lineTo(PW - M, y0); g.moveTo(M, y0 + h); g.lineTo(PW - M, y0 + h); g.stroke();
    g.setLineDash([8, 8]); g.strokeStyle = "#eadcb8"; g.beginPath(); g.moveTo(M, y0 + h / 2); g.lineTo(PW - M, y0 + h / 2); g.stroke(); g.setLineDash([]);
  }
  p.y += count * (h + 16) + 6;
}

// One tracing row: model (with the teacher's start dots), ghost letters, dotted outlines, empty boxes.
function traceRow(p, text, rec) {
  const { g } = p;
  const L = layout(text);
  const avail = PW - 2 * M, gap = 12;
  const cols = [...text].length <= 3 ? 8 : L.aspect > 2 ? 3 : 4;
  const bw = (avail - gap * (cols - 1)) / cols;
  const bh = cols === 8 ? bw : Math.min(bw / L.aspect, 140);
  const H = Math.min(bw / L.aspect, bh);
  const kinds = cols === 8 ? ["model", "ghost", "ghost", "ghost", "dash", "dash", "empty", "empty"] : cols === 4 ? ["model", "ghost", "dash", "empty"] : ["model", "ghost", "empty"];
  kinds.forEach((k, i) => {
    const x = M + i * (bw + gap), ox = x + (bw - H * L.aspect) / 2, y = p.y, oy = y + (bh - H) / 2;
    g.fillStyle = k === "model" ? "#fff4cf" : "#fff"; roundRect(g, x, y, bw, bh, 12); g.fill();
    g.strokeStyle = LINE; g.lineWidth = 2; roundRect(g, x, y, bw, bh, 12); g.stroke();
    g.setLineDash([6, 7]); g.strokeStyle = "#efe3c6"; g.beginPath(); g.moveTo(x + 6, y + bh / 2); g.lineTo(x + bw - 6, y + bh / 2); g.stroke(); g.setLineDash([]);
    if (k === "model") {
      drawGlyph(g, L, H, { fill: DEEP, ox, oy });
      const m = rec ? fitRecord(rec, L) : null;
      if (m) m.strokes.forEach((s, j) => {
        const [sx, sy] = s[0];
        g.fillStyle = "#1f8a4c"; g.beginPath(); g.arc(ox + sx * H, oy + sy * H, Math.max(11, H * 0.085), 0, Math.PI * 2); g.fill();
        g.fillStyle = "#fff"; g.font = EN(Math.max(12, H * 0.09), 800); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(j + 1), ox + sx * H, oy + sy * H + 1); g.textAlign = "left"; g.textBaseline = "alphabetic";
      });
    }
    if (k === "ghost") drawGlyph(g, L, H, { fill: GHOST, ox, oy });
    if (k === "dash") drawGlyph(g, L, H, { stroke: "#b8ab92", dash: [5, 6], width: 2.2, ox, oy });
  });
  p.y += bh + 10;
  const word = LETTER_WORD[text];
  if (word || SOUND[text]) {
    g.fillStyle = MUTE; g.font = EN(22, 600);
    g.fillText(`${SOUND[text] ? `"${SOUND[text]}"` : ""}${word ? `  as in ${word[0]} (${word[1]}, ${word[2]})` : ""}`, M + 4, p.y + 18);
    p.y += 30;
  }
  p.y += 16;
}

function kagGrid(p, signs) {
  const { g } = p;
  const cols = 1 + signs.length, rows = KAG_GRID_CONS.length;
  const cw = Math.min(130, (PW - 2 * M) / cols), ch = 64;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = M + c * cw, y = p.y + r * ch;
    g.strokeStyle = LINE; g.lineWidth = 2; g.strokeRect(x, y, cw, ch);
    const t = c === 0 ? KAG_GRID_CONS[r] : KAG_GRID_CONS[r] + signs[c - 1];
    if (c === 0 || r < 2) { g.fillStyle = c === 0 ? DEEP : INK; g.font = KN(34); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, x + cw / 2, y + ch / 2 + 2); g.textAlign = "left"; g.textBaseline = "alphabetic"; }
  }
  p.y += rows * ch + 20;
}

function wordTiles(p, words) {
  const { g } = p;
  g.font = KN(32);
  let x = M;
  for (const w of words) {
    const tw = g.measureText(w).width + 36;
    if (x + tw > PW - M) { x = M; p.y += 66; }
    g.fillStyle = "#fff4cf"; roundRect(g, x, p.y, tw, 54, 12); g.fill(); g.strokeStyle = "#e0a100"; g.lineWidth = 2; g.setLineDash([6, 5]); roundRect(g, x, p.y, tw, 54, 12); g.stroke(); g.setLineDash([]);
    g.fillStyle = INK; g.textBaseline = "middle"; g.fillText(w, x + 18, p.y + 29); g.textBaseline = "alphabetic";
    x += tw + 14;
  }
  p.y += 70;
}

const room = (p, need) => p.y + need < PH - 110;

export async function packetPdf({ child, pk, strokeLib = {}, school }) {
  await ensureFont();
  try { await document.fonts.load(EN(20)); } catch {}
  const { PDFDocument } = await import("pdf-lib");
  const P = pk.pattern, U = pk.unit, track = pk.track, T = TRACKS[track];
  const pages = [];
  const meta = { child, week: pk.week, n: pk.n, school };

  // ---- Page: letters ----
  const items = [...(U.items || [])];
  const perPage = 6;
  for (let s = 0; s < Math.max(1, items.length); s += perPage) {
    const p = newPage(); pages.push(p);
    p.meta = { title: `Letters: ${U.en}`, sub: `${T.icon} ${T.en} path · trace the light letters, then write on your own. Start at the green dot.` };
    p.y = 290;
    section(p, s === 0 ? "1  Trace and write" : "1  Trace and write (continued)");
    for (const t of items.slice(s, s + perPage)) { if (!room(p, 190)) break; traceRow(p, t, strokeLib[voiceKey(t)]); }
    if (U.tip && room(p, 60)) { p.g.fillStyle = INK; p.g.font = EN(22, 600); p.y = wrap(p.g, `Tip: ${U.tip}`, M, p.y + 10, PW - 2 * M, 30); }
    if (s + perPage >= items.length && U.kind === "signs" && room(p, 300)) { section(p, "2  Fill in the vowel-sign grid"); kagGrid(p, U.signs); }
  }
  if (U.kind === "signs" && pages[pages.length - 1].y > PH - 400) {
    const p = newPage(); pages.push(p); p.meta = { title: "Vowel signs grid", sub: "Fill in every empty box." }; p.y = 290;
    section(p, "2  Fill in the vowel-sign grid"); kagGrid(p, U.signs);
  }
  if (U.words && U.words.length) {
    const last = pages[pages.length - 1];
    if (room(last, 260)) { section(last, "Words to write"); for (const w of U.words.slice(0, 2)) traceRow(last, w, strokeLib[voiceKey(w)]); }
  }

  // ---- Page: sentences ----
  {
    const p = newPage(); pages.push(p);
    p.meta = { title: `Sentences: ${P.en}`, sub: `${P.kn} · ${P.focus}` };
    p.y = 290;
    const g = p.g;
    section(p, "Read these aloud");
    for (const [kn, rom, en] of P.model) {
      g.fillStyle = INK; g.font = KN(30); g.fillText(kn, M + 8, p.y + 26);
      g.fillStyle = MUTE; g.font = EN(19, 600); g.fillText(`${rom}  ·  ${en}`, M + 8, p.y + 52);
      p.y += 66;
    }
    section(p, "Put the words in order, then write the sentence");
    const builds = track === "start" ? P.build.slice(0, 2) : P.build;
    builds.forEach(([kn, en], i) => {
      if (!room(p, 190)) return;
      g.fillStyle = MUTE; g.font = EN(20, 700); g.fillText(`${i + 1}. ${en}`, M, p.y + 4); p.y += 16;
      wordTiles(p, shuffleSeeded(tiles(kn), pk.week * 7 + i + 3));
      p.y -= 6; lines(p, 1, 58);
    });
    if (room(p, 200)) {
      section(p, "Fill the gap");
      const bank = [...new Set(P.blanks.map((b) => b[1]))];
      g.fillStyle = MUTE; g.font = EN(20, 700); g.fillText("Word box:", M, p.y + 8); p.y += 20; wordTiles(p, shuffleSeeded(bank, pk.week));
      for (const [t] of P.blanks) { if (!room(p, 44)) break; g.fillStyle = INK; g.font = KN(30); g.fillText(t.replace("___", "______________"), M + 8, p.y + 28); p.y += 52; }
    }
  }

  // ---- Page: longer sentences, your turn, dictation ----
  {
    const p = newPage(); pages.push(p);
    p.meta = { title: track === "start" ? "Your turn" : "Longer sentences", sub: track === "start" ? "Draw, say it, then copy a sentence." : "Make sentences longer, then write your own." };
    p.y = 290;
    const g = p.g;
    if (track !== "start") {
      section(p, "Make it longer: copy each step, adding the new words");
      P.ladder.forEach(([kn, en], i) => {
        if (i === 0) { g.fillStyle = INK; g.font = KN(32); g.fillText(`${kn}`, M + 8, p.y + 26); g.fillStyle = MUTE; g.font = EN(20, 600); g.fillText(en, M + 8, p.y + 54); p.y += 92; return; }
        if (!room(p, 120)) return;
        const prev = new Set(tiles(P.ladder[i - 1][0])); const add = tiles(kn).filter((w) => !prev.has(w));
        g.fillStyle = MUTE; g.font = EN(20, 700); g.fillText(`Step ${i + 1}: add `, M, p.y + 4);
        g.font = KN(26); g.fillStyle = DEEP; g.fillText(add.join("  "), M + 120, p.y + 4); p.y += 16;
        lines(p, 1, 60);
      });
    } else {
      section(p, "Draw it, say it to a grown-up, then copy the sentence");
      g.strokeStyle = LINE; g.lineWidth = 2; roundRect(g, M, p.y, PW - 2 * M, 360, 18); g.stroke(); p.y += 380;
      g.fillStyle = INK; g.font = KN(34); g.fillText(P.model[0][0], M + 8, p.y + 20); p.y += 44;
      lines(p, 2, 70);
    }
    const prompt = P.prompts[track] || P.prompts.long || P.prompts.write;
    if (room(p, 200)) {
      section(p, "Your turn");
      g.fillStyle = INK; g.font = EN(24, 700); p.y = wrap(g, prompt, M + 4, p.y + 8, PW - 2 * M - 8, 32) + 4;
      const want = track === "long" ? 8 : track === "write" ? 5 : 2;
      const fit = Math.max(1, Math.min(want, Math.floor((PH - 130 - p.y - (track === "start" ? 0 : 260)) / 76)));
      lines(p, fit, 60);
    }
    if (track !== "start" && room(p, 200)) {
      section(p, "Dictation: a grown-up reads, you write");
      lines(p, Math.min(P.dictation.length, 3), 60);
    }
  }

  // ---- Grown-ups' page ----
  {
    const p = newPage(); pages.push(p);
    p.meta = { title: "For grown-ups", sub: "Keep this page. It's the answers and how to help this week." };
    p.y = 290;
    const g = p.g;
    section(p, "This week, about 15 minutes a day");
    g.fillStyle = INK; g.font = EN(23, 600);
    for (const k of ["writing", "reading", "speaking"]) {
      const tk = pk.tasks[k];
      g.font = EN(24, 800); g.fillText(`${k[0].toUpperCase() + k.slice(1)}: ${tk.title}`, M, p.y + 6); p.y += 34;
      g.font = EN(22, 600);
      for (const s of tk.steps) p.y = wrap(g, `•  ${s}`, M + 12, p.y + 4, PW - 2 * M - 24, 30);
      p.y += 8;
    }
    if (track !== "start") {
      section(p, "Dictation: read each sentence slowly, twice");
      P.dictation.forEach((d, i) => { g.fillStyle = INK; g.font = KN(30); g.fillText(`${i + 1}.  ${d}`, M + 8, p.y + 26); p.y += 50; });
    }
    section(p, "Answers");
    g.fillStyle = INK;
    P.build.forEach(([kn, en]) => { g.font = KN(28); g.fillText(kn, M + 8, p.y + 24); g.fillStyle = MUTE; g.font = EN(20, 600); g.fillText(en, M + 620, p.y + 24); g.fillStyle = INK; p.y += 44; });
    P.blanks.forEach(([t, a]) => { g.font = KN(28); g.fillText(t.replace("___", a), M + 8, p.y + 24); p.y += 44; });
    if (track !== "start") { g.font = KN(26); p.y = wrap(g, P.ladder[P.ladder.length - 1][0], M + 8, p.y + 26, PW - 2 * M - 16, 40); }
    p.y += 10;
    section(p, "Hand it in");
    g.fillStyle = INK; g.font = EN(22, 600);
    p.y = wrap(g, "Take a photo of each finished page (or scan them to one PDF) and hand it in from the Packets page in the app. Your teacher replies there.", M + 4, p.y + 8, PW - 2 * M - 8, 30);
  }

  const doc = await PDFDocument.create();
  doc.setTitle(`${school || "Chili Pili"} Kannada · Week ${pk.week} · ${child.name}`);
  doc.setAuthor(school || "Chili Pili");
  pages.forEach((p, i) => {
    header(p, { ...meta, ...p.meta, page: i + 1, pages: pages.length });
    footer(p, i === pages.length - 1 ? "Chili Pili · ಚಿಲಿಪಿಲಿ ಕನ್ನಡ" : "Trace slowly and say each sound. Then hand in a photo from the app.");
  });
  for (const p of pages) {
    const url = p.c.toDataURL("image/jpeg", 0.86);
    const img = await doc.embedJpg(url);
    const page = doc.addPage([612, 792]);
    page.drawImage(img, { x: 0, y: 0, width: 612, height: 792 });
  }
  return await doc.save();
}

export const packetFileName = (child, week) => `ChiliPili-week-${week}-${String(child.name || "packet").trim().split(/\s+/)[0].replace(/[^\w-]/g, "") || "packet"}.pdf`;
