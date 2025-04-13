import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Sync with shadcn/ui's components.json
      "@": path.resolve(__dirname, "./"), // Root directory
      "@components": path.resolve(__dirname, "./components"), // Explicitly map shadcn aliases
      "@ui": path.resolve(__dirname, "./components/ui"),
      "@lib": path.resolve(__dirname, "./lib"),
      "@utils": path.resolve(__dirname, "./lib/utils"),
      "@hooks": path.resolve(__dirname, "./hooks"),
    },
  },
});
