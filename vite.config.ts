import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    // Development mode: HTTPS server with certificates enabled
    // Production mode: Server config is not included (not needed for build)
    ...(isDevelopment && {
      server: {
        port: 5173,
        https: {
          key: fs.readFileSync(resolve(__dirname, "./certs/localhost-key.pem")),
          cert: fs.readFileSync(
            resolve(__dirname, "./certs/localhost-cert.pem")
          ),
        },
        open: true,
      },
    }),
    build: {
      outDir: "dist",
      minify: "terser",
      sourcemap: true,
    },
  };
});
