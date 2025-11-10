import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // server: {
  //   port: 5173,
  //   https: {
  //     key: fs.readFileSync(resolve(__dirname, "./certs/localhost-key.pem")),
  //     cert: fs.readFileSync(resolve(__dirname, "./certs/localhost-cert.pem")),
  //   },
  //   open: true,
  // },
  build: {
    outDir: "dist",
    minify: "terser",
    sourcemap: true,
  },
});
