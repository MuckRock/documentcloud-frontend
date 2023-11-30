import path from "node:path";
import url from "node:url";

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sentryVitePlugin } from "@sentry/vite-plugin";

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
      minify: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },

      /*
      lib: {
        entry: {
          // embeds
          enhance: path.resolve(__dirname, "./src/embed/enhance.js"),
          notes: path.resolve(__dirname, "./src/embed/noteLoader.js"),
          documentLoader: path.resolve(
            __dirname,
            "./src/embed/documentLoader.js",
          ),
          projectLoader: path.resolve(
            __dirname,
            "./src/embed/projectLoader.js",
          ),
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
    plugins: [
      svelte(),

      // Put the Sentry vite plugin after all other plugins
      sentryVitePlugin({
        org: "muckrock",
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
      }),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),

        // these packages don't export correctly, so we use an alias to fix imports
        "axios-retry": path.resolve(
          __dirname,
          "node_modules/axios-retry/es/index.mjs",
        ),
        "marked-gfm-heading-id": path.resolve(
          __dirname,
          "node_modules/marked-gfm-heading-id/src/index.js",
        ),
        "magic-string": path.resolve(
          __dirname,
          "node_modules/magic-string/dist/magic-string.es.mjs",
        ),
        svue: path.resolve(__dirname, "node_modules/svue/dist/svue.js"),
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
