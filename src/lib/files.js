// Photos, downloads, calendar files.
export const safeName = (n) => String(n || "file").replace(/[^\w.\-]+/g, "_").slice(-60);

// Shrink phone photos so uploads are quick on mobile data.
export async function compressImage(file, max = 1800) {
  if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 600 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.82));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch { return file; }
}

// Save a generated file. Works on the live site; inside a Claude preview it uses the host's save dialog.
export async function saveFile(filename, data, mime) {
  try {
    const dl = window.claude && (await window.claude.use("downloads"));
    if (dl) { await dl.save({ filename, data }); return "saved"; }
  } catch (e) { if (e && e.code === "declined") return "declined"; if (e && e.code) return "unavailable"; }
  const url = URL.createObjectURL(new Blob([data], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 8000);
  return "saved";
}

export function calendarICS(events) {
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = (ms) => { const d = new Date(ms); return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`; };
  const txt = (v) => String(v || "").replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Chili Pili//Kannada//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const e of events) {
    out.push("BEGIN:VEVENT", `UID:${e.uid}@chilipili`, `DTSTAMP:${stamp(Date.now())}`, `DTSTART:${stamp(e.start)}`, `DTEND:${stamp(e.start + e.minutes * 60e3)}`,
      `SUMMARY:${txt(e.title)}`, `DESCRIPTION:${txt(e.desc)}`);
    if (e.where) out.push(`LOCATION:${txt(e.where)}`);
    out.push("BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY", `DESCRIPTION:${txt(e.title)}`, "END:VALARM", "END:VEVENT");
  }
  out.push("END:VCALENDAR");
  return out.join("\r\n");
}

export const isImage = (t) => /^image\//.test(t || "");
export const isAudio = (t) => /^audio\//.test(t || "");
