import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { store } from "./store/index.js";

// Live list of documents. filters: [[field, op, value], ...]; pass null to skip.
export function useWatch(col, filters = []) {
  const key = filters === null ? null : col + JSON.stringify(filters);
  const [state, setState] = useState({ rows: [], loading: key !== null });
  useEffect(() => {
    if (key === null) { setState({ rows: [], loading: false }); return; }
    setState((s) => ({ ...s, loading: true }));
    const un = store.watch(col, filters, (rows) => setState({ rows, loading: false }), () => setState({ rows: [], loading: false }));
    return () => un && un();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [state.rows, state.loading];
}

export function useDoc(col, id) {
  const [d, setD] = useState(undefined);
  useEffect(() => {
    if (!id) { setD(null); return; }
    let live = true;
    const un = store.watchDoc(col, id, (row) => { if (live) setD(row); });
    return () => { live = false; un && un(); };
  }, [col, id]);
  return d;
}

export function useUrl(path) {
  const [u, setU] = useState(null);
  useEffect(() => { let on = true; setU(null); if (path) store.url(path).then((x) => on && setU(x)).catch(() => {}); return () => { on = false; }; }, [path]);
  return u;
}

export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// Voice library: text key -> storage path of the teacher's recording.
export function useVoiceLib() {
  const [rows] = useWatch("voice", []);
  return useMemo(() => Object.fromEntries(rows.map((r) => [r.id, r.path])), [rows]);
}

// Handwriting library: text key -> the teacher's recorded strokes.
export function useStrokeLib() {
  const [rows] = useWatch("strokes", []);
  return useMemo(() => Object.fromEntries(rows.map((r) => [r.id, r])), [rows]);
}

// The teacher's own worksheets (PDFs or images) attached to packet weeks.
export function usePacketFiles() {
  const [rows] = useWatch("packetFiles", []);
  return rows;
}

// Tiny hash router: #/section/sub
export function useRoute() {
  const read = () => { const h = (typeof location !== "undefined" ? location.hash : "").replace(/^#\/?/, ""); return h ? h.split("/") : []; };
  const [r, setR] = useState(read);
  useEffect(() => { const on = () => setR(read()); window.addEventListener("hashchange", on); return () => window.removeEventListener("hashchange", on); }, []);
  const go = (...parts) => {
    const h = "#/" + parts.filter((p) => p !== undefined && p !== null && p !== "").join("/");
    try { if (location.hash !== h) location.hash = h; } catch {}
    setR(h.replace(/^#\//, "").split("/").filter(Boolean));
    try { window.scrollTo({ top: 0 }); } catch {}
  };
  return [r, go];
}

export const initials = (n) => String(n || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
export const firstName = (n) => String(n || "").trim().split(/\s+/)[0];
const PALETTE = ["#c8102e", "#e0610e", "#1f8a4c", "#2563a8", "#8a0d1f", "#b7791f", "#7b3fa0"];
export const colorFor = (s) => { let h = 0; for (const c of String(s || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; };
