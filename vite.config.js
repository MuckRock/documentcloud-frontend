import path from "node:path";
import url from "node:url";

import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, configDefaults } from "vitest/config";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localServer = {
  host: "0.0.0.0",
  port: process.env.DOCKER ? 80 : 5173,
  origin: "https://www.dev.documentcloud.org",
};

const remoteServer = {
  host: "0.0.0.0",
  port: 5173,
  origin: "https://local.muckcloud.com:5173",
  https: {
    key: path.resolve(__dirname, "certs/local.muckcloud.com-key.pem"),
    cert: path.resolve(__dirname, "certs/local.muckcloud.com.pem"),
  },
};

const plugins = [sveltekit()];

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

  plugins,

  // allow top-level await
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
    include: ["svelte-fast-dimension/action"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: process.env.NODE_ENV === "remote" ? remoteServer : localServer,

  test: {
    setupFiles: ["./vitest-setup.js"],
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: [
      ...configDefaults.exclude,
      "storybook-static",
      "./src/legacy",
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
