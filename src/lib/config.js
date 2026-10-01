// Firebase connection comes from environment variables (set them in Vercel).
// Without them the app runs "on this device": everything works, but data stays in this browser.
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const hasFirebase = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Defaults the teacher can change in Settings (stored in the database).
export const DEFAULT_SCHOOL = {
  schoolName: "Chili Pili",
  tagline: "Kannada at home, at your child's own pace",
  timeZone: "America/Chicago",
  tzLabel: "CT",
  groups: ["Saturday group"],
  venue: "",
  contactEmail: "",
  practiceMinutes: 15,
  openSignup: true, // anyone with the link can join and start straight away
};

// Tell the server (Vercel function) something happened, e.g. a new family joined. Best effort.
export async function notifyServer(body) {
  try {
    const { store } = await import("./store/index.js");
    if (store.mode !== "cloud" || !store.idToken) return;
    const token = await store.idToken();
    if (!token) return;
    const r = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    return r.ok ? r.json() : { error: (await r.json().catch(() => ({}))).error || r.status };
  } catch (e) { console.warn("notify failed", e); return { error: String(e.message || e) }; }
}
