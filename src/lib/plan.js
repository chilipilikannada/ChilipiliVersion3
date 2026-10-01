// The 6-month rhythm: each month = 3 packet weeks at home + a month-end meet in week 4.
import { SKILLS, MONTHS } from "./content.js";
import { lesson, trackOf, paceOf, monthFocus } from "./course.js";
import { DAY } from "./time.js";

export const PLAN_WEEKS = 24;
export const isMeetWeek = (w) => w % 4 === 0;
export const packetNo = (w) => w - Math.floor(w / 4); // 1..18
export const monthOfWeek = (w) => Math.max(1, Math.min(6, Math.ceil(w / 4)));

export function weekStart(child, w) {
  const [y, m, d] = (child.startDate || "2000-01-01").split("-").map(Number);
  return new Date(y, m - 1, d + (w - 1) * 7).getTime();
}
export function childWeek(child, now = Date.now()) {
  if (!child || !child.startDate) return 0;
  const d = Math.floor((now - weekStart(child, 1)) / DAY + 1 / 24);
  if (d < 0) return 0;
  return Math.min(PLAN_WEEKS, Math.floor(d / 7) + 1);
}
export const childMonth = (child) => monthOfWeek(Math.max(1, childWeek(child)));
export const monthInfo = (m) => MONTHS[Math.max(1, Math.min(6, m)) - 1];

// Stages recorded at or before a moment (falls back to the starting stages).
export function stagesAt(child, logs, ms) {
  const past = (logs || []).filter((l) => l.childId === child.id && (l.at || 0) <= ms).sort((a, b) => a.at - b.at);
  return past.length ? past[past.length - 1].stages : child.stages || child.startStages || { speaking: 0, reading: 0, writing: 0 };
}

// Stage expected by the end of week w if the child keeps pace to the goal.
export const paceStage = (child, k, w) => {
  const s = (child.startStages || {})[k] || 0, g = (child.goals || {})[k] ?? s;
  return s + Math.floor(((g - s) * Math.min(w, PLAN_WEEKS)) / PLAN_WEEKS);
};

// A week's packet: the child's path decides the letters and the sentence pattern.
export function packetFor(child, w) {
  const n = packetNo(w);
  const track = trackOf(child), pace = paceOf(child), opts = child.intake || {};
  if (isMeetWeek(w)) return { week: w, n, meet: true, month: w / 4, track, ...lesson(track, Math.max(1, n), pace, opts) };
  return { week: w, ...lesson(track, n, pace, opts) };
}

// What the kids' space practises this week (meet week repeats the last packet).
export function kidWeek(child) {
  const w = Math.max(1, childWeek(child));
  const pw = isMeetWeek(w) ? w - 1 : w;
  const pk = packetFor(child, Math.max(1, pw));
  return { week: w, meet: isMeetWeek(w), packet: pk, track: pk.track, pattern: pk.pattern, unit: pk.unit, words: pk.pattern.words, letters: pk.unit.items || [] };
}

export const monthFor = (child, m) => ({ ...monthInfo(m), ...monthFocus(trackOf(child), m, paceOf(child)) });

export const SKILL_KEYS = SKILLS;
