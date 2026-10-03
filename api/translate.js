// POST /api/translate { text, from: "en" | "kn" | "auto", audience: "kid" | "adult" }
//   -> { from, kn, roman, en, words: [[kn, roman, en]], note }
// Claude (ANTHROPIC_API_KEY) gives natural, spoken Kannada and English; Google Translate (GOOGLE_API_KEY)
// is the fallback. Signed-in learners, plus a few goes for visitors trying the front-page demo.
import { voiceAccess } from "./_lib.js";

const env = process.env;
const isKn = (t) => /[ಀ-೿]/.test(t);

const SYSTEM = `You are the voice translator in Chili Pili, where families in the USA learn Kannada: children aged 5 to 12, and grown-ups learning to talk with a Kannada-speaking partner, in-laws, grandparents and close friends.
Translate between English and Kannada.
- English to Kannada: the Kannada a Karnataka family would naturally SAY (standard Bengaluru or Mysuru spoken usage), short and warm, not bookish. Use respectful ನೀವು forms for elders (parents, in-laws, grandparents) or people you don't know; use ನೀನು when clearly speaking to a partner, a child, a sibling or a close friend.
- Kannada to English: natural, everyday English. The Kannada may come from speech recognition: silently fix obvious spelling mistakes in it.
- "roman": easy pronunciation of the Kannada in English letters (double long vowels: aa ii uu ee oo; capitals for retroflex T D N L; e.g. "nanage niiru beeku").
- "words": up to 6 useful words from the Kannada, each [kannada, roman, english].
- "note": one short, friendly tip about grammar, politeness or culture if useful, else "".
Reply with ONLY a JSON object, no other text:
{"from": "en" or "kn", "kn": "<Kannada script>", "roman": "...", "en": "<English>", "words": [["...","...","..."]], "note": "..."}
If the text is sexual, hateful, violent, or asks for someone's personal details (address, phone, passwords), reply {"blocked": true}.`;

async function viaClaude(text, from, audience) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001", max_tokens: 500, system: SYSTEM,
      messages: [{ role: "user", content: `Direction: ${from === "kn" ? "Kannada to English" : from === "en" ? "English to Kannada" : "detect the language, then translate to the other one"}. Speaker: ${audience === "adult" ? "a grown-up" : "a child or their parent"}.\nText: ${text}` }],
    }),
  });
  if (!r.ok) throw new Error(`Translation service error ${r.status}`);
  const j = await r.json();
  const out = (j.content || []).map((c) => c.text || "").join("").trim().replace(/^```(json)?|```$/g, "").trim();
  const m = out.match(/\{[\s\S]*\}/);
  return JSON.parse(m ? m[0] : out);
}

async function viaGoogle(text, from) {
  const src = from === "auto" ? (isKn(text) ? "kn" : "en") : from;
  const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${env.GOOGLE_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: src, target: src === "kn" ? "en" : "kn", format: "text" }),
  });
  if (!r.ok) throw new Error(`Translation service error ${r.status}`);
  const t = ((await r.json()).data || {}).translations?.[0]?.translatedText || "";
  return src === "kn" ? { from: "kn", kn: text, en: t } : { from: "en", kn: t, en: text };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    if (!env.ANTHROPIC_API_KEY && !env.GOOGLE_API_KEY) return res.status(501).json({ error: "The translator isn't switched on yet.", code: "not_configured" });
    const acc = await voiceAccess(req, "tr");
    if (acc.error) return res.status(429).json({ error: "Lots of translating! Take a little break and try again soon." });
    const text = String(body.text || "").trim().slice(0, acc.demo ? 120 : 300);
    if (!text) return res.status(400).json({ error: "Say or type something first" });
    const from = ["en", "kn"].includes(body.from) ? body.from : "auto";
    const out = env.ANTHROPIC_API_KEY
      ? await viaClaude(text, from, body.audience).catch((e) => (env.GOOGLE_API_KEY ? viaGoogle(text, from) : Promise.reject(e)))
      : await viaGoogle(text, from);
    if (out.blocked) return res.status(200).json({ blocked: true });
    const dir = out.from === "kn" || out.from === "en" ? out.from : from !== "auto" ? from : isKn(text) ? "kn" : "en";
    const words = Array.isArray(out.words) ? out.words.filter((w) => Array.isArray(w) && w.length >= 3).slice(0, 6).map((w) => w.slice(0, 3).map(String)) : [];
    return res.status(200).json({ from: dir, kn: String(out.kn || (dir === "kn" ? text : "")), roman: String(out.roman || ""), en: String(out.en || (dir === "en" ? text : "")), words, note: String(out.note || ""), demo: !!acc.demo });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
