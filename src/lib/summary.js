// Class summary: used by the teacher's Summary page and by the emails (server side).
// Plain JavaScript, no browser APIs, so the Vercel functions can import it too.
import { SKILLS, SKILL, STAGES } from "./content.js";
import { childWeek, PLAN_WEEKS, isMeetWeek } from "./plan.js";
import { TRACKS, trackOf, PACES, paceOf, UNDERSTAND, SPEAK } from "./course.js";

export const STAGE_ICON = ["🥚", "🐣", "🐦", "🦜", "🐦‍⬛", "🦚", "🦅"];
const DAY = 864e5;

export function buildSummary({ children = [], activity = [], subs = [], now = Date.now() }) {
  const weekAgo = now - 7 * DAY;
  const active = children.filter((c) => c.status === "active");
  const rows = active.map((c) => {
    const w = Math.max(1, childWeek(c, now));
    const acts = activity.filter((a) => a.childId === c.id && a.at >= weekAgo);
    const handedIn = subs.some((s) => s.childId === c.id && s.kind === "packet" && s.week === w);
    const stages = c.stages || c.startStages || {};
    const goals = c.goals || {};
    return {
      id: c.id, name: c.name, age: c.age, group: c.group || "", track: trackOf(c), lettersDone: Object.values(c.letters || {}).filter((v) => v >= 2).length, week: w, meetWeek: isMeetWeek(w),
      stages, goals, confirmed: !!c.stagesConfirmed,
      stars: c.stars || 0, weekStars: acts.reduce((t, a) => t + (a.stars || 0), 0), weekActs: acts.length,
      kinds: [...new Set(acts.map((a) => a.kind))], handedIn, lastActive: c.lastActive || 0,
      quiet: !c.lastActive || c.lastActive < weekAgo, parentEmails: c.parentEmails || [],
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
  const head = ["Child", "Age", "Group", "Path", "Letters written well", "Week", ...SKILLS.flatMap((k) => [`${SKILL[k].en} now`, `${SKILL[k].en} goal`]), "Stars (total)", "Activities this week", "Packet handed in", "Last active"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [head.map(esc).join(",")];
  for (const r of s.rows) {
    lines.push([r.name, r.age, r.group, TRACKS[r.track].en, r.lettersDone, `${r.week}/${PLAN_WEEKS}`, ...SKILLS.flatMap((k) => [STAGES[r.stages[k] || 0].en, STAGES[r.goals[k] ?? r.stages[k] ?? 0].en]), r.stars, r.weekActs, r.handedIn ? "yes" : "no", r.lastActive ? new Date(r.lastActive).toISOString().slice(0, 10) : ""].map(esc).join(","));
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
    <td style="${cell}"><b>${h(r.name)}</b><br><span style="color:#7b5b52">age ${h(r.age)} · week ${r.week}${r.meetWeek ? " (meet)" : ""}<br>${TRACKS[r.track].icon} ${TRACKS[r.track].en} · ${r.lettersDone} letters</span></td>
    ${SKILLS.map((k) => `<td style="${cell}">${stageText(r.stages[k])}<br><span style="color:#7b5b52">goal ${STAGES[r.goals[k] ?? 0].en}</span></td>`).join("")}
    <td style="${cell}">${r.weekActs} ${r.weekActs === 1 ? "activity" : "activities"} · ${r.weekStars} ⭐<br><span style="color:${r.handedIn ? "#1f8a4c" : "#8a0d1f"}">${r.handedIn ? "packet handed in" : r.meetWeek ? "meet week" : "no packet yet"}</span></td>
  </tr>`).join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#2a0f0c;max-width:720px">
  <div style="background:#c8102e;color:#fff;padding:16px 18px;border-radius:12px 12px 0 0"><div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#ffc72c">${h(schoolName)} · weekly summary</div><div style="font-size:22px;font-weight:bold">${s.total} ${s.total === 1 ? "child" : "children"} · ${s.weekActs} ${s.weekActs === 1 ? "activity" : "activities"} this week</div></div>
  <div style="background:#fff4cf;padding:14px 18px">
    <b>${s.handedIn}</b> of ${s.total} handed in this week's packet · <b>${s.toReview}</b> hand-ins waiting for you${s.pending ? ` · <b>${s.pending}</b> families waiting for approval` : ""}${s.newThisWeek.length ? `<br>New this week: ${s.newThisWeek.map((c) => h(c.name)).join(", ")}` : ""}
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
  <div style="font-size:22px;font-weight:bold">${h(child.name)}, age ${h(child.age)}, has joined</div></div>
  <div style="padding:14px 18px;border:1px solid #f0dfbb;border-top:0;border-radius:0 0 12px 12px">
    <p>Parent: <b>${h(parentName || "")}</b> · ${h(parentEmail || "")}<br>Path: <b>${TRACKS[trackOf(child)].icon} ${TRACKS[trackOf(child)].en}</b> (${TRACKS[trackOf(child)].who.toLowerCase()})<br>Group: ${h(child.group || "-")} · Status: ${child.status === "active" ? "started week 1" : "waiting for your approval"}</p>
    <p>Letters: <b>${PACES[paceOf(child)].en}</b> pace${child.intake && child.intake.speak ? `<br>Understands: ${h((UNDERSTAND.find((x) => x[0] === child.intake.understand) || [0, "-"])[1])} · Replies: ${h((SPEAK.find((x) => x[0] === child.intake.speak) || [0, "-"])[1])}` : ""}${child.placedAs && child.placedAs !== child.track ? `<br><span style="color:#8a0d1f">The parent changed the suggested path (${TRACKS[child.placedAs].en}) to ${TRACKS[trackOf(child)].en}.</span>` : ""}</p>
    <p>Hears Kannada at home: ${home} · Practice time: ${h(child.intake?.practiceMinutes || "-")} min a day</p>
    <table style="border-collapse:collapse;width:100%">${SKILLS.map((k) => `<tr><td style="padding:6px 0"><b>${SKILL[k].en}</b></td><td>${stageText(st[k])} (parent's estimate)</td><td style="color:#7b5b52">goal ${STAGES[g[k] ?? 0].en}</td></tr>`).join("")}</table>
    <p style="color:#7b5b52;font-size:13px">Confirm or adjust the stages at the first month-end meet, or any time under Children.</p>
    ${appUrl ? `<p><a href="${h(appUrl)}" style="background:#c8102e;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:bold">Open Chili Pili</a></p>` : ""}
  </div></div>`;
}
