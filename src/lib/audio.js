// Listening and recording.
// Words play in the teacher's own recorded voice when available, otherwise the device's Kannada voice.
import { useEffect, useRef, useState } from "react";
import { store } from "./store/index.js";

export function voiceKey(text) {
  let h = 5381;
  for (const ch of String(text)) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0;
  return "v" + h.toString(36);
}

// Device voices. Most phones and computers have no Kannada voice, but nearly all have Hindi
// (Chrome, Edge, Safari, Android), so we fall back to Hindi reading the same word in Devanagari.
let knVoice = null, hiVoice = null;
function findVoice() {
  try {
    const vs = speechSynthesis.getVoices();
    const pick = (re) => vs.find((v) => re.test(v.lang) && /google|natural|online|enhanced|premium/i.test(v.name)) || vs.find((v) => re.test(v.lang)) || null;
    knVoice = pick(/^kn/i); hiVoice = pick(/^hi/i);
  } catch { knVoice = null; hiVoice = null; }
}
if (typeof window !== "undefined" && window.speechSynthesis) { findVoice(); speechSynthesis.addEventListener ? speechSynthesis.addEventListener("voiceschanged", findVoice) : (speechSynthesis.onvoiceschanged = findVoice); }
export const hasDeviceVoice = () => true; // there is always a voice to try now; playWord says so if none works

// Kannada → Devanagari, letter for letter (the two Unicode blocks are parallel, 0x380 apart).
const KN_FIX = { 0x0C8E: 0x090F, 0x0C92: 0x0913, 0x0CC6: 0x0947, 0x0CCA: 0x094B, 0x0CB1: 0x0930, 0x0CDE: 0x0933 };
export function knToDeva(text) {
  let out = "";
  for (const ch of String(text)) {
    const c = ch.codePointAt(0);
    if (c < 0x0C80 || c > 0x0CFF) { out += ch; continue; }
    if (c === 0x0CD5 || c === 0x0CD6 || c === 0x0C80 || c >= 0x0CF1) continue;
    out += String.fromCodePoint(KN_FIX[c] || c - 0x380);
  }
  return out;
}

function speakWith(text, voice, lang, rate) {
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice ? voice.lang : lang; u.rate = rate;
  try { speechSynthesis.cancel(); } catch {}
  speechSynthesis.speak(u);
}

let current = null;
export function stopAudio() {
  try { current && current.pause(); } catch {}
  try { window.speechSynthesis && speechSynthesis.cancel(); } catch {}
}

// lib: { [voiceKey]: storagePath }
// One shared player, unlocked during the tap itself, so iPhones still play it after the voice arrives from the server.
const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
let player = null;
function unlock() {
  if (typeof Audio === "undefined") return null;
  if (!player) player = new Audio();
  try { player.src = SILENT; player.play().catch(() => {}); } catch {}
  return player;
}
async function playOn(url) {
  const a = player || new Audio();
  current = a; a.src = url;
  try { await a.play(); return true; } catch { return false; }
}

export async function playWord(text, lib) {
  stopAudio();
  unlock();
  const path = lib && lib[voiceKey(text)];
  if (path) {
    const url = await store.url(path);
    if (url && (await playOn(url))) return "teacher";
  }
  const synth = typeof window !== "undefined" && !!window.speechSynthesis;
  if (synth) findVoice(); // Chrome fills the voice list late; look again on each tap
  try {
    const { serverSpeechUrl, serverEngineKnown } = await import("./voice.js");
    // Order: Google's natural voice > the device's own Kannada voice > the built-in robotic voice.
    if (!(knVoice && serverEngineKnown() === "builtin")) {
      const u = await serverSpeechUrl(text);
      if (u && !(knVoice && serverEngineKnown() === "builtin") && (await playOn(u))) return "server";
    }
  } catch {}
  if (!synth) return null;
  if (knVoice) { speakWith(text, knVoice, "kn-IN", 0.8); return "device"; }
  const hasKannada = /[ಀ-೿]/.test(text);
  if (hiVoice) { speakWith(hasKannada ? knToDeva(text) : text, hiVoice, "hi-IN", 0.8); return "device-hi"; }
  // No list yet (some Android phones): ask for Kannada by language and let the phone choose.
  if (speechSynthesis.getVoices().length === 0) { speakWith(text, null, "kn-IN", 0.8); return "device"; }
  return null;
}

export async function playUrl(url) {
  stopAudio(); if (!url) return;
  current = new Audio(url); await current.play().catch(() => {});
}

export const canRecord = () =>
  typeof window !== "undefined" && window.isSecureContext && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && typeof MediaRecorder !== "undefined";

function pickType() {
  const types = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg"];
  for (const t of types) { try { if (MediaRecorder.isTypeSupported(t)) return t; } catch {} }
  return "";
}

// Recorder hook: start(), stop(), blob, url, recording, error, seconds.
export function useRecorder(maxSeconds = 60) {
  const [state, setState] = useState({ recording: false, blob: null, url: null, error: null, seconds: 0 });
  const rec = useRef(null), stream = useRef(null), timer = useRef(null);
  useEffect(() => () => { clearInterval(timer.current); try { stream.current && stream.current.getTracks().forEach((t) => t.stop()); } catch {} }, []);
  async function start() {
    stopAudio();
    if (!canRecord()) { setState((s) => ({ ...s, error: "unsupported" })); return false; }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = pickType();
      const r = new MediaRecorder(stream.current, type ? { mimeType: type } : undefined);
      const chunks = [];
      r.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data);
      r.onstop = () => {
        clearInterval(timer.current);
        stream.current && stream.current.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: r.mimeType || type || "audio/webm" });
        setState({ recording: false, blob, url: URL.createObjectURL(blob), error: null, seconds: 0 });
      };
      rec.current = r; r.start();
      setState({ recording: true, blob: null, url: null, error: null, seconds: 0 });
      const t0 = Date.now();
      timer.current = setInterval(() => {
        const s = Math.floor((Date.now() - t0) / 1000);
        setState((st) => ({ ...st, seconds: s }));
        if (s >= maxSeconds) stop();
      }, 250);
      return true;
    } catch (e) {
      setState((s) => ({ ...s, error: e && (e.name === "NotAllowedError" || e.name === "SecurityError") ? "denied" : e && e.name === "NotFoundError" ? "nomic" : "unsupported" }));
      return false;
    }
  }
  function stop() { try { rec.current && rec.current.state === "recording" && rec.current.stop(); } catch {} }
  function reset() { setState({ recording: false, blob: null, url: null, error: null, seconds: 0 }); }
  function useFile(file) { if (file) setState({ recording: false, blob: file, url: URL.createObjectURL(file), error: null, seconds: 0 }); }
  return { ...state, start, stop, reset, useFile };
}

export const audioExt = (type) => (/mp4|m4a|aac/.test(type) ? "m4a" : /ogg/.test(type) ? "ogg" : /mpeg|mp3/.test(type) ? "mp3" : /wav/.test(type) ? "wav" : "webm");
