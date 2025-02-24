import adapter from "@sveltejs/adapter-cloudflare";
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

      // cloudflare
      routes: {
        include: ["/*"],
        exclude: ["<all>"],
      },
      platformProxy: {
        configPath: "wrangler.toml",
        environment: undefined,
        experimentalJsonConfig: false,
        persist: false,
      },
    }),
    alias: {
      "@": "./src",
      "@/*": "./src/*",
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
