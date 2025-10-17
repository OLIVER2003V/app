import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  // si vas a publicar bajo un subdirectorio (ej: /jardin-app/), cambia base:
  // base: "/jardin-app/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@context": fileURLToPath(new URL("./src/context", import.meta.url)),
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 5173,
  },
});
