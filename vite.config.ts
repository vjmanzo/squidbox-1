import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Adjust Vites dev server to work with Arduino Cloud Agent
  // https://vitejs.dev/config/server-options.html
  server: {
    port: 5173,
    strictPort: true,
  },
});
