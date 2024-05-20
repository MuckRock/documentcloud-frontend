import path from "node:path";
import url from "node:url";

import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, configDefaults } from "vitest/config";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    sourcemap: true,
    target: "esnext",
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    "process.env.DEPLOY_PRIME_URL": JSON.stringify(
      process.env.DEPLOY_PRIME_URL,
    ),
  },

  envPrefix: "DC_",

  plugins: [sveltekit()],

  // allow top-level await
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },

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
    setupFiles: ["./vitest-setup.js"],
    include: [
      "src/lib/**/*.{test,spec}.{js,ts}",
      "src/routes/**/*.{test,spec}.{js,ts}",
      "src/api/pageSize.test.js",
    ],
    exclude: [
      ...configDefaults.exclude,
      "storybook-static",
      "node_modules",
      "./src/config/*",
      "./src/**/*.stories.@(js|jsx|ts|tsx|svelte)",
    ],
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/routes/**"],
      exclude: ["src/**/*.stories.@(js|jsx|ts|tsx|svelte)"],
      reporter: ["text", "html", "lcov", "clover", "json", "json-summary"],
    },
  },
});
