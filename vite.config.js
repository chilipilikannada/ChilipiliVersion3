import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build` -> normal site for Vercel.
// `npm run build:single` -> one self-contained HTML file (used for previews).
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === "single" ? [viteSingleFile()] : [])],
  define: mode === "single" ? { "import.meta.env.VITE_SINGLE": JSON.stringify("1") } : {},
  build: mode === "single" ? { outDir: "dist-single", assetsInlineLimit: 100000000, cssCodeSplit: false } : { outDir: "dist" },
}));
