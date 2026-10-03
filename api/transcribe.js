// POST /api/transcribe { audio: base64 16-bit PCM, 16 kHz mono, lang: "kn" | "en" | "auto" } -> { text, lang }
// Google Cloud Speech-to-Text, which understands Kannada (kn-IN) on every phone, including iPhones
// whose browser can't. Needs GOOGLE_API_KEY with the Cloud Speech-to-Text API enabled.
import { voiceAccess } from "./_lib.js";

const env = process.env;
export const config = { api: { bodyParser: { sizeLimit: "3mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    if (!env.GOOGLE_API_KEY) return res.status(501).json({ error: "Kannada listening isn't set up yet", code: "not_configured" });
    const acc = await voiceAccess(req, "st");
    if (acc.error) return res.status(429).json({ error: "Lots of talking! Try again in a little while." });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const audio = String(body.audio || "");
    if (audio.length < 2000) return res.status(400).json({ error: "I didn't hear anything. Hold the button and speak." });
    if (audio.length > (acc.demo ? 700e3 : 1.4e6)) return res.status(413).json({ error: "That was a long one! Keep it under 30 seconds." });
    const lang = ["kn", "en"].includes(body.lang) ? body.lang : "auto";
    const config = {
      encoding: "LINEAR16", sampleRateHertz: 16000, audioChannelCount: 1, enableAutomaticPunctuation: true,
      languageCode: lang === "en" ? "en-US" : "kn-IN",
      ...(lang === "auto" ? { alternativeLanguageCodes: ["en-US", "en-IN"] } : lang === "kn" ? { alternativeLanguageCodes: [] } : {}),
    };
    const r = await fetch(`https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${env.GOOGLE_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config, audio: { content: audio } }),
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ error: /SERVICE_DISABLED|has not been used|PERMISSION_DENIED/.test(t) ? "Turn on the Cloud Speech-to-Text API for your Google key (see README)." : `Listening service error ${r.status}`, code: r.status === 403 ? "not_enabled" : undefined });
    }
    const j = await r.json();
    const results = j.results || [];
    const text = results.map((x) => (x.alternatives && x.alternatives[0] && x.alternatives[0].transcript) || "").join(" ").trim();
    const code = (results.find((x) => x.languageCode) || {}).languageCode || config.languageCode;
    return res.status(200).json({ text, lang: /^kn/i.test(code) ? "kn" : /[ಀ-೿]/.test(text) ? "kn" : "en" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
