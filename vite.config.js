import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

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
    alias: {},
  },

  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
