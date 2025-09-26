import adapter from "@sveltejs/adapter-netlify";
import sveltePreprocess from "svelte-preprocess";
import { fastDimension } from "svelte-fast-dimension";
import autoprefixer from "autoprefixer";

/** @type {import('@sveltejs/kit').Config} */
export default {
  compilerOptions: {
    accessors: true,
  },

  kit: {
    adapter: adapter({
      preprocess: true,
    }),
    alias: {
      "@/routes": "./src/routes",
      "@/routes/*": "./src/routes/*",
      "@/config": "./src/config",
      "@/config/*": "./src/config/*",
      "@/langs": "./src/langs",
      "@/langs/*": "./src/langs/*",
      "@/legacy": "./src/legacy",
      "@/legacy/*": "./src/legacy/*",
      "@/embed": "./src/embed",
      "@/embed/*": "./src/embed/*",
      "@/test": "./src/test",
      "@/test/*": "./src/test/*",
    },
    csrf: {
      // BUG: https://github.com/sveltejs/kit/issues/8026
      checkOrigin: process.env.DOCKER === "true" ? false : true,
    },
  },

  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    fastDimension(),
    sveltePreprocess({
      postcss: {
        plugins: [autoprefixer],
      },
      typescript: {
        compilerOptions: {
          target: "es2020",
        },
      },
    }),
  ],
};
