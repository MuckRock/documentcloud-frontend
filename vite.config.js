import path from "node:path";
import url from "node:url";

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targets = [
  ["./src/embed/enhance.js", "/public/embed", "enhance.js"] /* page embeds */,
  ["./src/embed/noteLoader.js", "/public/notes", "loader.js"] /* node embed */,
  [
    "./src/embed/documentLoader.js",
    "/public/viewer",
    "loader.js",
  ] /* document embed */,
  [
    "./src/embed/projectLoader.js",
    "/public/embed",
    "loader.js",
  ] /* was search embed, but now only project embeds */,
];

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  // serve local at 0.0.0.0:443 if running in docker
  // this runs on the Squarelet nginx network
  /** @type {import('vite').UserConfig.server} */
  const server = process.env.DOCKER
    ? {
        host: "0.0.0.0",
        port: 80,
        // origin: "https://www.dev.documentcloud.org",
        strictPort: true,
      }
    : null;

  return {
    build: {
      /*
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),

          // todo: embed entries
          // embed: path.resolve(__dirname, "src/embed/index.html"),
        },
      },
      */

      // always sourcemaps
      sourcemap: true,
    },

    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },

    envPrefix: "DC_",

    // plugin options are in svelte.config.js
    plugins: [svelte()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    server,

    test: {
      environment: "jsdom",
      root: "./src",
      mode: "test",
      setupFiles: ["dotenv/config"],
    },
  };
});
