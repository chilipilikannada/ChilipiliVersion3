import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);

// Installable app: register the service worker on the live site.
if ("serviceWorker" in navigator && import.meta.env.PROD && location.protocol === "https:" && !import.meta.env.VITE_SINGLE) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
