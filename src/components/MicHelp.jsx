import { useState } from "react";
import { Mic, ExternalLink } from "lucide-react";

export const SITE_URL = import.meta.env.VITE_SITE_URL || "https://chilipilikannada.vercel.app";
const inFrame = () => { try { return window.self !== window.top; } catch { return true; } };
const device = () => {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "computer";
};

// Ask for the microphone once, so the browser shows its permission question.
export async function askMic() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach((t) => t.stop());
    return "ok";
  } catch (e) { return e && e.name === "NotAllowedError" ? "denied" : e && e.name === "NotFoundError" ? "nomic" : "unsupported"; }
}

// Shown when recording or listening can't start. error: denied | unsupported | nomic | dictation
export default function MicHelp({ error, onRetry }) {
  const [state, setState] = useState(null);
  if (!error) return null;
  const d = device();
  if (inFrame()) return (
    <div className="mic-help">
      <b>🎤 The microphone works on the Chili Pili website</b>
      <span className="small">This preview can't use the microphone. Open the website in Safari or Chrome and sign in there.</span>
      <a className="btn primary small" href={SITE_URL} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> Open the website</a>
    </div>
  );
  const steps = error === "dictation" ? [
    "On iPhone or iPad: Settings → General → Keyboard → turn on Enable Dictation.",
    "Then come back and try again. You can also type instead.",
  ] : error === "nomic" ? [
    "No microphone was found. Plug in headphones with a mic, or use a phone or tablet.",
  ] : error === "unsupported" ? [
    d === "ios" ? "Please open Chili Pili in Safari (not inside another app)." : "Please open Chili Pili in Chrome or Safari.",
    "Recording needs the secure website address (https).",
  ] : d === "ios" ? [
    "Tap aA (or the page icon) in Safari's address bar → Website Settings → Microphone → Allow.",
    "Or open the Settings app → Safari → Microphone → Ask or Allow.",
    "Then tap Try again.",
  ] : d === "android" ? [
    "Tap the icon to the left of the web address → Permissions → Microphone → Allow.",
    "Then tap Try again.",
  ] : [
    "Click the icon to the left of the web address → Microphone → Allow.",
    "Then click Try again.",
  ];
  return (
    <div className="mic-help" role="alert">
      <b>🎤 {error === "dictation" ? "Turn on dictation to talk to Gini" : "Let's turn on the microphone"}</b>
      <span className="small">A grown-up can help:</span>
      <ol className="small">{steps.map((s) => <li key={s}>{s}</li>)}</ol>
      {error !== "unsupported" && error !== "nomic" && (
        <button className="btn primary small" onClick={async () => { const r = error === "dictation" ? "ok" : await askMic(); setState(r); if (r === "ok") onRetry && onRetry(); }}>
          <Mic size={16} /> {error === "dictation" ? "Try again" : "Allow microphone and try again"}
        </button>
      )}
      {state && state !== "ok" && <span className="tiny" style={{ color: "var(--red-deep)" }}>Still blocked. Follow the steps above, then try again.</span>}
    </div>
  );
}
