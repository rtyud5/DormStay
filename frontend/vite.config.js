import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ["@payos/payos-checkout"],
    },
  },
  optimizeDeps: {
    exclude: ["@payos/payos-checkout"],
  },
});
