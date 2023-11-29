import path from "node:path";
import url from "node:url";

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

export default {
  compilerOptions: {
    accessors: true,
  },

  onwarn(warning, handler) {
    if (process.env.SUPPRESS_WARNINGS) return;

    handler(warning);
  },

  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    scss: {
      includePaths: ["documentcloud-frontend/src"],
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
