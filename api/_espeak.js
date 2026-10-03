// Built-in voice that needs no key: eSpeak NG (open source) running inside the server function.
// It sounds robotic, but it reads Kannada script correctly on every phone and computer.
import path from "node:path";

let ready = null;
function engine() {
  if (!ready) ready = (async () => {
    const dir = path.join(process.cwd(), "node_modules", "@echogarden", "espeak-ng-emscripten");
    const { default: Module } = await import("@echogarden/espeak-ng-emscripten");
    const m = await Module({ locateFile: (f) => path.join(dir, f) });
    return new m.eSpeakNGWorker();
  })().catch((e) => { ready = null; throw e; });
  return ready;
}

function wav(pcm, sr) {
  const buf = Buffer.alloc(44 + pcm.length * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + pcm.length * 2, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(pcm.length * 2, 40);
  Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength).copy(buf, 44);
  return buf;
}

// Returns a WAV Buffer. lang: "kn" or "en".
export async function espeakWav(text, lang = "kn") {
  const w = await engine();
  w.set_voice(lang === "en" ? "en-us" : "kn");
  w.rate = lang === "en" ? 165 : 125; // words per minute; slower for learners
  w.pitch = 55;
  const chunks = [];
  w.synthesize(text, (samples) => { if (samples && samples.length) chunks.push(new Int16Array(samples)); return false; });
  const total = chunks.reduce((a, c) => a + c.length, 0);
  const pcm = new Int16Array(total);
  let o = 0; for (const c of chunks) { pcm.set(c, o); o += c.length; }
  return wav(pcm, w.samplerate);
}
