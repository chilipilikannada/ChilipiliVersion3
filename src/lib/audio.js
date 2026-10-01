// Listening and recording.
// Words play in the teacher's own recorded voice when available, otherwise the device's Kannada voice.
import { useEffect, useRef, useState } from "react";
import { store } from "./store/index.js";

export function voiceKey(text) {
  let h = 5381;
  for (const ch of String(text)) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0;
  return "v" + h.toString(36);
}

let knVoice = null;
function findVoice() {
  try { knVoice = speechSynthesis.getVoices().find((v) => /^kn/i.test(v.lang)) || null; } catch { knVoice = null; }
}
if (typeof window !== "undefined" && window.speechSynthesis) { findVoice(); speechSynthesis.onvoiceschanged = findVoice; }
export const hasDeviceVoice = () => !!knVoice;

let current = null;
export function stopAudio() {
  try { current && current.pause(); } catch {}
  try { window.speechSynthesis && speechSynthesis.cancel(); } catch {}
}

// lib: { [voiceKey]: storagePath }
export async function playWord(text, lib) {
  stopAudio();
  const path = lib && lib[voiceKey(text)];
  if (path) {
    const url = await store.url(path);
    if (url) { current = new Audio(url); await current.play().catch(() => {}); return "teacher"; }
  }
  if (knVoice) {
    const u = new SpeechSynthesisUtterance(text); u.voice = knVoice; u.lang = knVoice.lang; u.rate = 0.8;
    speechSynthesis.speak(u); return "device";
  }
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
      setState((s) => ({ ...s, error: e && e.name === "NotAllowedError" ? "denied" : "unsupported" }));
      return false;
    }
  }
  function stop() { try { rec.current && rec.current.state === "recording" && rec.current.stop(); } catch {} }
  function reset() { setState({ recording: false, blob: null, url: null, error: null, seconds: 0 }); }
  function useFile(file) { if (file) setState({ recording: false, blob: file, url: URL.createObjectURL(file), error: null, seconds: 0 }); }
  return { ...state, start, stop, reset, useFile };
}

export const audioExt = (type) => (/mp4|m4a|aac/.test(type) ? "m4a" : /ogg/.test(type) ? "ogg" : /mpeg|mp3/.test(type) ? "mp3" : /wav/.test(type) ? "wav" : "webm");
