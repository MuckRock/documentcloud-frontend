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
      "@/config": "./src/config",
      "@/config/*": "./src/config/*",
      "@/embed": "./src/embed",
      "@/embed/*": "./src/embed/*",
      "@/langs": "./src/langs",
      "@/langs/*": "./src/langs/*",
      "@/legacy": "./src/legacy",
      "@/legacy/*": "./src/legacy/*",
      "@/routes": "./src/routes",
      "@/routes/*": "./src/routes/*",
      "@/style": "./src/style",
      "@/style/*": "./src/style/*",
      "@/test": "./src/test",
      "@/test/*": "./src/test/*",
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
