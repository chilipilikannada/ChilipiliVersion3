// Server-side voice features (Vercel functions): English -> Kannada translation, and Kannada
// speech for phones without a Kannada voice. Plus the browser's speech recognition.
import { useEffect, useRef, useState } from "react";

async function api(path, body) {
  if (typeof window !== "undefined" && window.__chiliApiMock) return window.__chiliApiMock(path, body); // tests only
  const { store } = await import("./store/index.js");
  if (store.mode !== "cloud" || !store.idToken) throw Object.assign(new Error("This works on the live site."), { code: "offline" });
  const token = await store.idToken(); // null for visitors trying the front-page demo
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || `Error ${r.status}`), { code: j.code || r.status });
  return j;
}

// { from, kn, roman, en, words, note }. from: "en", "kn" or "auto".
export const translate = (text, from = "en", audience = "kid") => api("/api/translate", { text, from, audience });

// Turn any recording (webm, mp4, wav) into 16 kHz mono 16-bit PCM, which Google's speech service reads.
async function toPcm16k(blob) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const data = await blob.arrayBuffer();
  const decoded = await new Promise((res, rej) => { const p = ctx.decodeAudioData(data, res, rej); if (p && p.then) p.then(res, rej); });
  try { ctx.close(); } catch {}
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const off = new OAC(1, Math.max(1, Math.ceil(decoded.duration * 16000)), 16000);
  const src = off.createBufferSource(); src.buffer = decoded; src.connect(off.destination); src.start(0);
  const out = await off.startRendering();
  const f = out.getChannelData(0), pcm = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) pcm[i] = Math.max(-1, Math.min(1, f[i])) * 0x7fff;
  return new Uint8Array(pcm.buffer);
}
function b64(bytes) {
  let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
// Speech to text on the server: Kannada (kn), English (en) or auto. -> { text, lang }
let serverEars = null; // null unknown, false not set up
export async function transcribe(blob, lang = "kn") {
  const audio = b64(await toPcm16k(blob));
  try { const r = await api("/api/transcribe", { audio, lang }); serverEars = true; return r; }
  catch (e) { if (e.code === "not_configured" || e.code === 501 || e.code === "offline") serverEars = false; throw e; }
}
export const serverEarsKnown = () => serverEars;

// English out loud: the device's English voice (every phone has one), else the server's.
export function speakEnglish(text) {
  try {
    if (typeof speechSynthesis !== "undefined") {
      const v = speechSynthesis.getVoices().find((x) => /^en[-_](US|GB|IN)/i.test(x.lang)) || speechSynthesis.getVoices().find((x) => /^en/i.test(x.lang));
      if (v || speechSynthesis.getVoices().length === 0) {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-US"; u.rate = 0.95;
        speechSynthesis.speak(u); return Promise.resolve("device");
      }
    }
  } catch {}
  return serverSpeechUrl(text, "en").then((u) => { if (u) { new Audio(u).play().catch(() => {}); return "server"; } return null; });
}

// Kannada speech from the server (Google voice). Returns an object URL, cached per text.
const cache = new Map();
let serverVoice = null; // null = unknown, false = not set up
export async function serverSpeechUrl(text, lang = "kn") {
  if (serverVoice === false) return null;
  const key = lang + ":" + text;
  if (cache.has(key)) return cache.get(key);
  try {
    const { audio, type } = await api("/api/speak", { text, lang });
    const bin = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bin], { type: type || "audio/mpeg" }));
    cache.set(key, url); serverVoice = true; return url;
  } catch (e) { if (e.code === "offline" || e.code === "not_configured" || e.code === 501) { serverVoice = false; try { window.__chiliCloud = false; } catch {} } return null; }
}
export const serverVoiceKnown = () => serverVoice;

// Browser speech recognition (Chrome, Edge, Safari on iPhone and iPad). lang: "en-US" or "kn-IN".
export const canListen = () => typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
export function useListen(lang = "en-US") {
  const [state, setState] = useState({ listening: false, text: "", final: false, error: null });
  const rec = useRef(null);
  useEffect(() => () => { try { rec.current && rec.current.abort(); } catch {} }, []);
  function start() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setState((s) => ({ ...s, error: "unsupported" })); return; }
    try { rec.current && rec.current.abort(); } catch {}
    const r = new SR(); r.lang = lang; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
    r.onresult = (e) => { let t = ""; let fin = false; for (const res of e.results) { t += res[0].transcript; fin = res.isFinal; } setState((s) => ({ ...s, text: t, final: fin })); };
    r.onerror = (e) => setState((s) => ({ ...s, listening: false, error: e.error === "not-allowed" ? "denied" : e.error === "service-not-allowed" ? "dictation" : e.error === "no-speech" ? "nospeech" : e.error || "error" }));
    r.onend = () => setState((s) => ({ ...s, listening: false, final: true }));
    rec.current = r;
    setState({ listening: true, text: "", final: false, error: null });
    try { r.start(); } catch { setState((s) => ({ ...s, listening: false, error: "error" })); }
  }
  function stop() { try { rec.current && rec.current.stop(); } catch {} }
  function reset() { setState({ listening: false, text: "", final: false, error: null }); }
  return { ...state, start, stop, reset, setText: (text) => setState((s) => ({ ...s, text, final: true })) };
}
