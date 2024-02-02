import path from "node:path";
import url from "node:url";

import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    sourcemap: true,
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },

  envPrefix: "DC_",

  plugins: [sveltekit()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    host: "0.0.0.0",
    port: process.env.DOCKER ? 80 : 5173,
    origin: "https://www.dev.documentcloud.org",
  },

  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
