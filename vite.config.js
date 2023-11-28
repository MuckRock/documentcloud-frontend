import dns from "node:dns";
import path from "node:path";
import url from "node:url";

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dns.setDefaultResultOrder("verbatim");

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  // serve local at 0.0.0.0:443 if running in docker
  // this runs on the Squarelet nginx network
  /** @type {import('vite').UserConfig.server} */
  const server = process.env.DOCKER
    ? {
        host: "0.0.0.0",
        port: 80,
        origin: "https://www.dev.documentcloud.org",
        strictPort: true,
      }
    : null;

  return {
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),

          // todo: embed entries
          // embed: path.resolve(__dirname, "src/embed/index.html"),
        },
      },

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
  };
});
