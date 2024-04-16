import path from "node:path";
import url from "node:url";

import adapter from "@sveltejs/adapter-netlify";
import sveltePreprocess from "svelte-preprocess";
import autoprefixer from "autoprefixer";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function scssAliases(aliases) {
  return (url) => {
    for (const [alias, aliasPath] of Object.entries(aliases)) {
      if (url.indexOf(alias) === 0) {
        return {
          file: url.replace(alias, aliasPath),
        };
      }
    }
    return url;
  };
}

/** @type {import('@sveltejs/kit').Config} */
export default {
  compilerOptions: {
    accessors: true,
  },

  kit: {
    adapter: adapter({}),
    alias: {
      "@": "./src",
      "@/*": "./src/*",
    },
    csrf: {
      // BUG: https://github.com/sveltejs/kit/issues/8026
      checkOrigin: process.env.NODE_ENV === "development" ? false : true,
    },
  },

  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    scss: {
      includePaths: ["./src"],
      importer: [
        scssAliases({
          "@": path.resolve(__dirname, "src"),
        }),
      ],
      prependData: '@import "@/style/variables.scss";',
    },
    postcss: {
      plugins: [autoprefixer],
    },
    typescript: {
      compilerOptions: {
        target: "es2020",
      },
    },
  }),
};
