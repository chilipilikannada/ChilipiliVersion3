// POST /api/speak { text, lang: "kn" | "en" } -> { audio: base64 mp3, type }
// Google Cloud Text-to-Speech. Most iPhones have no Kannada voice built in; this fills the gap. Needs GOOGLE_API_KEY.
import { voiceAccess } from "./_lib.js";

const env = process.env;
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    if (!env.GOOGLE_API_KEY) return res.status(501).json({ error: "The voice isn't set up yet", code: "not_configured" });
    const acc = await voiceAccess(req, "sp");
    if (acc.error) return res.status(429).json({ error: "Lots of listening! Try again in a little while." });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const text = String(body.text || "").trim().slice(0, 300);
    if (!text) return res.status(400).json({ error: "Nothing to say" });
    const en = body.lang === "en";
    const voice = en ? { languageCode: "en-US", name: env.GOOGLE_TTS_VOICE_EN || "en-US-Standard-F" } : { languageCode: "kn-IN", name: env.GOOGLE_TTS_VOICE || "kn-IN-Standard-A" };
    const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: { text }, voice, audioConfig: { audioEncoding: "MP3", speakingRate: en ? 1 : 0.85 } }),
    });
    if (!r.ok) return res.status(502).json({ error: `Voice service error ${r.status}` });
    const j = await r.json();
    res.setHeader("Cache-Control", "private, max-age=86400");
    return res.status(200).json({ audio: j.audioContent, type: "audio/mpeg" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
