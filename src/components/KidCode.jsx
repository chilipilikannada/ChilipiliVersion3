import { useEffect, useRef, useState } from "react";
import { RefreshCw, Copy, Mail } from "lucide-react";
import { store } from "../lib/store/index.js";
import { useApp, firstName } from "../lib/hooks.js";
import { friendlyError } from "../App.jsx";
import { SITE_URL } from "./MicHelp.jsx";
import { notifyServer } from "../lib/config.js";

export const cleanCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
export const isPin = (c) => /^\d{4}$/.test(String(c || ""));

// Skip codes a kid (or a stranger) would guess first: 1111, 1234, 4321, 2020...
function randomPin() {
  for (;;) {
    const p = String(Math.floor(1000 + Math.random() * 9000));
    const d = p.split("").map(Number);
    if (new Set(d).size < 3) continue;
    if (d.every((x, i) => i === 0 || x - d[i - 1] === 1) || d.every((x, i) => i === 0 || d[i - 1] - x === 1)) continue;
    if (/^(19|20)\d\d$/.test(p)) continue;
    return p;
  }
}

// Gives the child a 4-digit sign-in number. The kidCodes entry is created first; if that number
// is already someone else's, the create is refused (Firestore) or seen (on-device), and we try another.
export async function makeKidCode(child) {
  for (let tries = 0; tries < 8; tries++) {
    const pin = randomPin();
    if (store.mode === "device") { const hit = await store.get("kidCodes", pin); if (hit) continue; }
    try { await store.set("kidCodes", pin, { childId: child.id, parentEmails: child.parentEmails || [], at: Date.now() }); }
    catch (e) { if (tries < 7) continue; throw e; }
    const old = child.kidCode;
    await store.update("children", child.id, { kidCode: pin });
    if (old && cleanCode(old) !== pin) store.remove("kidCodes", cleanCode(old)).catch(() => {});
    return pin;
  }
  throw new Error("Couldn't make a code. Try again.");
}

// Makes a number for any listed child who doesn't have one yet (or still has an old word code).
export function useAutoKidCodes(children) {
  const asked = useRef(new Set());
  useEffect(() => {
    (children || []).forEach((c) => {
      if (!c || !c.id || isPin(c.kidCode) || asked.current.has(c.id)) return;
      asked.current.add(c.id);
      makeKidCode(c).catch(() => {});
    });
  }, [children]);
}

// The child's own sign-in number: type it on any phone, iPad or computer to open their space.
export default function KidCode({ child, compact = false }) {
  const { say } = useApp();
  const [busy, setBusy] = useState(false);
  const nm = firstName(child.name);
  useAutoKidCodes([child]);
  async function renew() {
    if (!confirm(`Give ${nm} a new number? The old one stops working on every device.`)) return;
    setBusy(true);
    try {
      const pin = await makeKidCode(child);
      const r = await notifyServer({ type: "kidcode", childId: child.id });
      say(`${nm}'s new number is ${pin}.${r && r.sent ? " We've emailed it to you." : ""}`);
    } catch (e) { say(friendlyError(e), true); }
    setBusy(false);
  }
  async function email() {
    setBusy(true);
    const r = await notifyServer({ type: "kidcode", childId: child.id });
    say(r && r.sent ? `Sent to ${(child.parentEmails || []).join(", ")}.` : `Email isn't switched on yet${r && (r.skipped || r.error) ? ` (${r.skipped || r.error})` : ""}. Copy the number instead.`, !(r && r.sent));
    setBusy(false);
  }
  const device = store.mode === "device";
  async function copy() {
    const text = `${nm}'s Chili Pili number: ${child.kidCode}\nOpen ${SITE_URL}, tap "I'm a kid", and type the number.`;
    try { await navigator.clipboard.writeText(text); say("Copied."); } catch { say(text); }
  }
  const pin = isPin(child.kidCode) ? child.kidCode : "";
  if (compact) return (
    <div className="kid-code compact">
      <span className="small">{nm}'s number for <b>I'm a kid</b>{store.mode === "cloud" && pin ? <> · <button className="link-btn" disabled={busy} onClick={email}><Mail size={14} /> Email it to me</button></> : null}</span>
      <b className="kc-code">{pin || "…"}</b>
    </div>
  );
  return (
    <div className="kid-code">
      <span className="small">{nm}'s number</span>
      <b className="kc-code">{pin || "Making it…"}</b>
      <span className="small muted">On any phone, iPad or computer: open the website, tap <b>I'm a kid</b>, type this number. {nm} stays signed in on that device, and all stars and work come along.</span>
      <div className="row">
        <button className="btn ghost small" disabled={!pin} onClick={copy}><Copy size={16} /> Copy with instructions</button>
        {!device && <button className="btn ghost small" disabled={busy || !pin} onClick={email}><Mail size={16} /> Email it to me</button>}
        <button className="btn quiet small" disabled={busy || !pin} onClick={renew}><RefreshCw size={16} /> New number</button>
      </div>
      <span className="tiny muted">A new number stops the old one working (handy if it's shared by mistake).</span>
      {device && <span className="tiny" style={{ color: "var(--red-deep)" }}>Preview mode: this number only works on this device. On the live website connected to Google (Firebase), it works on every device.</span>}
    </div>
  );
}
