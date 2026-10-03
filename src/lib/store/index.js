import { firebaseConfig, hasFirebase } from "../config.js";
import { createLocalStore } from "./local.js";
import { createFirebaseStore } from "./firebase.js";

export const store = hasFirebase ? createFirebaseStore(firebaseConfig) : createLocalStore();
if (typeof window !== "undefined") window.__chiliCloud = !!hasFirebase;
