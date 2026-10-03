// POST /api/speak { text, lang: "kn" | "en" } -> { audio: base64, type, engine: "google" | "builtin" }
// Google Cloud Text-to-Speech when GOOGLE_API_KEY is set (natural voice). Otherwise, or if Google fails,
// the built-in eSpeak voice: robotic but needs no key, so every device can hear Kannada.
import { voiceAccess } from "./_lib.js";
import { espeakWav } from "./_espeak.js";

const env = process.env;
async function builtin(res, text, lang) {
  const buf = await espeakWav(text, lang);
  res.setHeader("Cache-Control", "private, max-age=86400");
  return res.status(200).json({ audio: buf.toString("base64"), type: "audio/wav", engine: "builtin" });
}
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const acc = await voiceAccess(req, "sp");
    if (acc.error) return res.status(429).json({ error: "Lots of listening! Try again in a little while." });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const text = String(body.text || "").trim().slice(0, 300);
    if (!text) return res.status(400).json({ error: "Nothing to say" });
    const en = body.lang === "en";
    if (!env.GOOGLE_API_KEY) return builtin(res, text, en ? "en" : "kn");
    const voice = en ? { languageCode: "en-US", name: env.GOOGLE_TTS_VOICE_EN || "en-US-Standard-F" } : { languageCode: "kn-IN", name: env.GOOGLE_TTS_VOICE || "kn-IN-Standard-A" };
    const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: { text }, voice, audioConfig: { audioEncoding: "MP3", speakingRate: en ? 1 : 0.85 } }),
    });
    if (!r.ok) return builtin(res, text, en ? "en" : "kn");
    const j = await r.json();
    res.setHeader("Cache-Control", "private, max-age=86400");
    return res.status(200).json({ audio: j.audioContent, type: "audio/mpeg", engine: "google" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
