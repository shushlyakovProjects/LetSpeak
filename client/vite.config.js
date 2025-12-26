import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // resolve: {
  //   alias: {
  //     "~": path.resolve(__dirname, "./src"),
  //   },
  // },
  server: {
    proxy: {
      "/api": {
        // target: "https://5.175.97.131:3000",
        // target: "https://46.63.199.88:3000",
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/socket.io": {
        target: "http://localhost:4000",
        changeOrigin: true,
        ws: true,
        // rewrite: (path) => path.replace(/^\/socket\.io/, ""),
      },
    },
  },
});
