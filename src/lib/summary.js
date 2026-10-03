// Class summary: used by the teacher's Summary page and by the emails (server side).
// Plain JavaScript, no browser APIs, so the Vercel functions can import it too.
import { SKILLS, SKILL, STAGES } from "./content.js";
import { childWeek, PLAN_WEEKS, isMeetWeek } from "./plan.js";
import { TRACKS, trackOf, PACES, paceOf, UNDERSTAND, SPEAK, LEVELS, levelOf } from "./course.js";
import { journeyOf, JOURNEY_DAYS } from "./journey.js";
import { ADULT_LEVELS, ADULT_GOALS, UNITS, nextUnit, unitNo } from "./adult.js";

export const STAGE_ICON = ["🥚", "🐣", "🐦", "🦜", "🐦‍⬛", "🦚", "🦅"];
const DAY = 864e5;

export function buildSummary({ children = [], activity = [], subs = [], now = Date.now() }) {
  const weekAgo = now - 7 * DAY;
  const active = children.filter((c) => c.status === "active");
  const rows = active.map((c) => {
    const w = Math.max(1, childWeek(c, now));
    const acts = activity.filter((a) => a.childId === c.id && a.at >= weekAgo);
    const handedIn = subs.some((s) => s.childId === c.id && s.kind === "packet" && s.week === w);
    const wd = (c.weekDone || {})[w] || {};
    const missions = [1, 2, 3, 4, 5, 6].filter((d) => wd["d" + d]).length;
    const talked = acts.filter((a) => a.kind === "talk" || a.kind === "speak" || a.kind === "say").length;
    const stages = c.stages || c.startStages || {};
    const goals = c.goals || {};
    return {
      id: c.id, name: c.name, age: c.adult ? "adult" : c.age, adult: !!c.adult, lessons: Object.keys(c.adultDone || {}).length, group: c.group || "", track: trackOf(c), level: levelOf(c), lettersDone: Object.values(c.letters || {}).filter((v) => v >= 2).length, week: w, meetWeek: isMeetWeek(w),
      stages, goals, confirmed: !!c.stagesConfirmed,
      stars: c.stars || 0, weekStars: acts.reduce((t, a) => t + (a.stars || 0), 0), weekActs: acts.length,
      kinds: [...new Set(acts.map((a) => a.kind))], handedIn, missions, talked, journeyDay: journeyOf(c).day, journeyDone: Object.keys(journeyOf(c).done).length, lastActive: c.lastActive || 0,
      quiet: !c.lastActive || c.lastActive < weekAgo, parentEmails: c.parentEmails || [], kidCode: /^\d{4}$/.test(c.kidCode || "") ? c.kidCode : "",
      replies: subs.filter((s) => s.childId === c.id && s.status === "reviewed" && (s.reviewedAt || 0) >= weekAgo).length,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  const dist = Object.fromEntries(SKILLS.map((k) => [k, STAGES.map((_, L) => rows.filter((r) => (r.stages[k] || 0) === L).length)]));
  return {
    rows, dist,
    total: rows.length,
    pending: children.filter((c) => c.status === "pending").length,
    newThisWeek: children.filter((c) => (c.createdAt || 0) >= weekAgo),
    quiet: rows.filter((r) => r.quiet),
    toReview: subs.filter((s) => s.status === "sent").length,
    handedIn: rows.filter((r) => r.handedIn).length,
    weekActs: rows.reduce((t, r) => t + r.weekActs, 0),
  };
}

export const stageText = (L) => `${STAGE_ICON[L || 0]} ${STAGES[L || 0].en}`;

// CSV for spreadsheets.
export function summaryCSV(s) {
  const head = ["Child", "Age", "Group", "Path", "Letters written well", "Week", ...SKILLS.flatMap((k) => [`${SKILL[k].en} now`, `${SKILL[k].en} goal`]), "Stars (total)", "Activities this week", "Missions this week", "Times talked", "Letter journey day", "Pages sent", "Last active"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [head.map(esc).join(",")];
  for (const r of s.rows) {
    lines.push([r.name, r.age, r.group, TRACKS[r.track].en, r.lettersDone, `${r.week}/${PLAN_WEEKS}`, ...SKILLS.flatMap((k) => [STAGES[r.stages[k] || 0].en, STAGES[r.goals[k] ?? r.stages[k] ?? 0].en]), r.stars, r.weekActs, r.missions, r.talked, r.journeyDay, r.handedIn ? "yes" : "no", r.lastActive ? new Date(r.lastActive).toISOString().slice(0, 10) : ""].map(esc).join(","));
  }
  return lines.join("\n");
}

const h = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Email-safe HTML (tables, inline styles).
export function summaryHTML(s, { schoolName = "Chili Pili", appUrl = "" } = {}) {
  const cell = "padding:8px 10px;border-bottom:1px solid #f0dfbb;font-size:14px;vertical-align:top";
  const th = "padding:8px 10px;text-align:left;font-size:12px;color:#7b5b52;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #f0dfbb";
  const distRows = SKILLS.map((k) => `<tr><td style="${cell}"><b>${SKILL[k].en}</b></td>${STAGES.map((st, L) => `<td style="${cell};text-align:center">${s.dist[k][L] ? `${STAGE_ICON[L]}<br><b>${s.dist[k][L]}</b>` : `<span style="color:#ccb">·</span>`}</td>`).join("")}</tr>`).join("");
  const kidRows = s.rows.map((r) => `<tr>
    <td style="${cell}"><b>${h(r.name)}</b><br><span style="color:#7b5b52">${r.adult ? `grown-up · ${r.lessons} lessons` : `age ${h(r.age)}`} · week ${r.week}${r.meetWeek ? " (meet)" : ""}<br>level ${r.level} · ${TRACKS[r.track].en} · letter journey day ${r.journeyDay}/${JOURNEY_DAYS}</span></td>
    ${SKILLS.map((k) => `<td style="${cell}">${stageText(r.stages[k])}<br><span style="color:#7b5b52">goal ${STAGES[r.goals[k] ?? 0].en}</span></td>`).join("")}
    <td style="${cell}">${r.weekActs} ${r.weekActs === 1 ? "activity" : "activities"} · ${r.weekStars} ⭐<br><span style="color:${r.missions >= 4 ? "#1f8a4c" : r.missions ? "#7b5b52" : "#8a0d1f"}">${r.missions}/6 missions · talked ${r.talked}×${r.handedIn ? " · pages sent" : ""}</span></td>
  </tr>`).join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#2a0f0c;max-width:720px">
  <div style="background:#c8102e;color:#fff;padding:16px 18px;border-radius:12px 12px 0 0"><div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#ffc72c">${h(schoolName)} · weekly summary</div><div style="font-size:22px;font-weight:bold">${s.total} ${s.total === 1 ? "child" : "children"} · ${s.weekActs} ${s.weekActs === 1 ? "activity" : "activities"} this week</div></div>
  <div style="background:#fff4cf;padding:14px 18px">
    <b>${s.rows.filter((r) => r.missions >= 4).length}</b> of ${s.total} did 4 or more daily missions · <b>${s.rows.reduce((t, r) => t + r.talked, 0)}</b> times children talked in Kannada · <b>${s.toReview}</b> recordings and pages waiting for you${s.pending ? ` · <b>${s.pending}</b> families waiting for approval` : ""}${s.newThisWeek.length ? `<br>New this week: ${s.newThisWeek.map((c) => h(c.name)).join(", ")}` : ""}
    ${s.quiet.length ? `<br><span style="color:#8a0d1f">No activity for 7 days: ${s.quiet.map((r) => h(r.name)).join(", ")}</span>` : ""}
  </div>
  <h3 style="margin:18px 0 6px">Where the class is</h3>
  <table style="border-collapse:collapse;width:100%"><tr><th style="${th}"></th>${STAGES.map((st) => `<th style="${th};text-align:center">${st.en}</th>`).join("")}</tr>${distRows}</table>
  <h3 style="margin:18px 0 6px">Child by child</h3>
  <table style="border-collapse:collapse;width:100%"><tr><th style="${th}">Child</th>${SKILLS.map((k) => `<th style="${th}">${SKILL[k].en}</th>`).join("")}<th style="${th}">This week</th></tr>${kidRows || `<tr><td style="${cell}" colspan="5">No children yet.</td></tr>`}</table>
  ${appUrl ? `<p style="margin-top:18px"><a href="${h(appUrl)}" style="background:#c8102e;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:bold">Open Chili Pili</a></p>` : ""}
  </div>`;
}

export function registrationHTML({ child, parentName, parentEmail, appUrl = "", schoolName = "Chili Pili" }) {
  const st = child.stages || child.startStages || {};
  const g = child.goals || {};
  const home = { never: "rarely", sometimes: "sometimes", daily: "every day" }[child.intake?.homeKannada] || "not given";
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#2a0f0c;max-width:600px">
  <div style="background:#ffc72c;padding:16px 18px;border-radius:12px 12px 0 0"><div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8a0d1f">${h(schoolName)} · new family</div>
  <div style="font-size:22px;font-weight:bold">${h(child.name)}${child.adult ? " (grown-up learner)" : `, age ${h(child.age)}`}, has joined</div></div>
  <div style="padding:14px 18px;border:1px solid #f0dfbb;border-top:0;border-radius:0 0 12px 12px">
    <p>Parent: <b>${h(parentName || "")}</b> · ${h(parentEmail || "")}<br>Level: <b>${levelOf(child)} · ${(child.adult ? ADULT_LEVELS : LEVELS)[levelOf(child) - 1].en}</b>${child.adult && child.intake ? `<br>Wants Kannada for: ${h((child.intake.goals || []).map((g) => (ADULT_GOALS.find((x) => x[0] === g) || [0, g])[1]).join(", ") || "not given")}<br>Understands: ${h(child.intake.understand || "-")} · speaks: ${h(child.intake.speak || "-")} · reads script: ${h(child.intake.read || "-")}` : ""}${typeof child.placedAs === "number" && child.placedAs !== levelOf(child) ? ` (we suggested level ${child.placedAs}; the family chose ${levelOf(child)})` : ""}${child.adult ? "" : `<br>Path: <b>${TRACKS[trackOf(child)].icon} ${TRACKS[trackOf(child)].en}</b> (${TRACKS[trackOf(child)].who.toLowerCase()})`}<br>Group: ${h(child.group || "-")} · Status: ${child.status === "active" ? "started week 1" : "waiting for your approval"}</p>
    <p>Letters: <b>${PACES[paceOf(child)].en}</b> pace${child.intake && child.intake.speak ? `<br>Understands: ${h((UNDERSTAND.find((x) => x[0] === child.intake.understand) || [0, "-"])[1])} · Replies: ${h((SPEAK.find((x) => x[0] === child.intake.speak) || [0, "-"])[1])}` : ""}</p>
    <p>Hears Kannada at home: ${home} · Practice time: ${h(child.intake?.practiceMinutes || "-")} min a day</p>
    <table style="border-collapse:collapse;width:100%">${SKILLS.map((k) => `<tr><td style="padding:6px 0"><b>${SKILL[k].en}</b></td><td>${stageText(st[k])} (parent's estimate)</td><td style="color:#7b5b52">goal ${STAGES[g[k] ?? 0].en}</td></tr>`).join("")}</table>
    <p style="color:#7b5b52;font-size:13px">Confirm or adjust the stages at the first month-end meet, or any time under Children.</p>
    ${appUrl ? `<p><a href="${h(appUrl)}" style="background:#c8102e;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:bold">Open Chili Pili</a></p>` : ""}
  </div></div>`;
}

// ---- Emails to parents ----
const wrap = (schoolName, top, title, body, appUrl) => `<div style="font-family:Arial,Helvetica,sans-serif;color:#2a0f0c;max-width:600px">
  <div style="background:#ffc72c;padding:16px 18px;border-radius:12px 12px 0 0"><div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8a0d1f">${h(schoolName)} · ${h(top)}</div>
  <div style="font-size:22px;font-weight:bold">${title}</div></div>
  <div style="padding:14px 18px;border:1px solid #f0dfbb;border-top:0;border-radius:0 0 12px 12px">${body}
    ${appUrl ? `<p><a href="${h(appUrl)}" style="background:#c8102e;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:bold">Open Chili Pili</a></p>` : ""}
    <p style="color:#7b5b52;font-size:12px">Reply to this email to reach the teacher.</p>
  </div></div>`;
const numberBox = (nm, pin, appUrl) => `<p>${h(nm)}'s number for <b>I'm a kid</b>:</p>
  <p style="font-size:34px;font-weight:bold;letter-spacing:.2em;color:#1d5fa8;margin:6px 0">${h(pin)}</p>
  <p>On any phone, iPad or computer: open ${appUrl ? `<a href="${h(appUrl)}">${h(appUrl.replace(/^https?:\/\//, ""))}</a>` : "Chili Pili"}, tap <b>I'm a kid</b> and type the 4 numbers. ${h(nm)} stays signed in on that device, and stars and work carry across every device.</p>`;
const first = (n) => String(n || "").split(" ")[0];

export function parentWelcomeHTML({ child, appUrl = "", schoolName = "Chili Pili" }) {
  const nm = first(child.name), L = levelOf(child);
  if (child.adult) {
    const u = nextUnit(child);
    return wrap(schoolName, "welcome", `Welcome, ${h(nm)}! 🙏`, `
    <p>You start at <b>level ${L}: ${h(ADULT_LEVELS[L - 1].en)}</b>${child.status === "active" ? "" : " once the teacher approves your sign-up"}. Change level any time with ◀ ▶ on your Home page.</p>
    ${u ? `<p><b>Your first lesson:</b> ${h(u.en)}. ${h(u.goal)}</p><p style="font-size:20px">${u.phrases.slice(0, 3).map((p) => `${h(p[0])} <span style="font-size:14px;color:#7b5b52">${h(p[1])} · ${h(p[2])}</span>`).join("<br>")}</p>` : ""}
    <p><b>Each day (15 to 20 minutes):</b> one conversation lesson, and one letter-journey day when you're ready for the script. Use one new phrase with a real person before the next lesson.</p>
    <p>On another phone or computer, just sign in with this same Google account.</p>`, appUrl);
  }
  return wrap(schoolName, "welcome", `Welcome, ${h(nm)}! 🦜`, `
    <p>${h(nm)} starts at <b>level ${L}: ${h(LEVELS[L - 1].en)}</b>${child.status === "active" ? ", and week 1 is ready." : ". The teacher will approve the sign-up soon."} You can move the level up or down any time with ◀ ▶ on your Home page.</p>
    ${/^\d{4}$/.test(child.kidCode || "") ? numberBox(nm, child.kidCode, appUrl) : ""}
    <p><b>Each day (about 15 minutes):</b> open ${h(nm)}'s space, do today's mission with Gini, then a Letter journey day. Paper pages are in <b>Packets</b>; snap a photo whenever one is done.</p>`, appUrl);
}
export function kidNumberHTML({ child, appUrl = "", schoolName = "Chili Pili" }) {
  const nm = first(child.name);
  return wrap(schoolName, "sign-in number", `${h(nm)}'s new number`, numberBox(nm, child.kidCode, appUrl) + `<p style="color:#7b5b52;font-size:13px">The old number no longer works.</p>`, appUrl);
}
export function parentWeekHTML(r, { appUrl = "", schoolName = "Chili Pili" } = {}) {
  const nm = first(r.name);
  if (r.adult) return wrap(schoolName, `week ${r.week}`, `Your Kannada week`, `
    <p>${r.weekActs ? "Nice work this week. Keep the streak going." : "A quiet week. Ten minutes today gets you back on track."}</p>
    <table style="border-collapse:collapse;width:100%;font-size:15px">
      <tr><td style="padding:5px 0">⭐ Stars this week</td><td><b>${r.weekStars}</b> (total ${r.stars})</td></tr>
      <tr><td style="padding:5px 0">📚 Lessons done</td><td><b>${r.lessons}</b> of ${UNITS.length}</td></tr>
      <tr><td style="padding:5px 0">🗣️ Times speaking Kannada</td><td><b>${r.talked}</b></td></tr>
      <tr><td style="padding:5px 0">✏️ Letter journey</td><td>day <b>${r.journeyDay}</b></td></tr>
      ${r.replies ? `<tr><td style="padding:5px 0">💬 Replies from the teacher</td><td><b>${r.replies}</b> new</td></tr>` : ""}
    </table>`, appUrl);
  const cheer = r.missions >= 4 ? "What a week! 🎉" : r.weekActs ? "Good going. A few minutes a day makes the biggest difference." : `Gini missed ${h(nm)} this week. Even 10 minutes today gets things moving again.`;
  return wrap(schoolName, `week ${r.week}`, `${h(nm)}'s week`, `
    <p>${cheer}</p>
    <table style="border-collapse:collapse;width:100%;font-size:15px">
      <tr><td style="padding:5px 0">⭐ Stars this week</td><td><b>${r.weekStars}</b> (total ${r.stars})</td></tr>
      <tr><td style="padding:5px 0">📅 Daily missions</td><td><b>${r.missions}</b> of 6</td></tr>
      <tr><td style="padding:5px 0">🗣️ Times talking in Kannada</td><td><b>${r.talked}</b></td></tr>
      <tr><td style="padding:5px 0">✏️ Letter journey</td><td>day <b>${r.journeyDay}</b> · ${r.lettersDone} letters written well</td></tr>
      <tr><td style="padding:5px 0">🦚 Level</td><td>${r.level}: ${h(LEVELS[r.level - 1].en)}</td></tr>
      ${r.replies ? `<tr><td style="padding:5px 0">💬 Replies from the teacher</td><td><b>${r.replies}</b> new: open the app to see them</td></tr>` : ""}
    </table>
    ${r.kidCode ? `<p style="color:#7b5b52;font-size:13px">${h(nm)}'s number for <b>I'm a kid</b>: <b>${h(r.kidCode)}</b></p>` : ""}`, appUrl);
}
