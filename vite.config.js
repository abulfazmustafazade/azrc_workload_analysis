import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",                       // istənilən host (Vercel, statik) üçün nisbi yollar
  server: { port: 5173, open: true },
  build: { outDir: "dist" },        // Vercel default ilə uyğundur
});
