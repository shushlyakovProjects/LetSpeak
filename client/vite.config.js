import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // target: "http://46.63.231.39:3000",
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/socket": {
        target: "http://localhost:4000",
        changeOrigin: true,
        ws: true,
        // rewrite: (path) => path.replace(/^\/socket\.io/, ""),
      },
    },
  },
});
