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

/* https://github.com/sveltejs/svelte-preprocess/blob/main/docs/migration-guide.md */
const preprocessOptions = {
  scss: {
    includePaths: ["node_modules", "src"],
    importer: [
      scssAliases({
        "@": process.cwd() + "/src",
      }),
    ],
    prependData: '@import "@/style/variables.scss";',
  },
  postcss: {
    plugins: [require("autoprefixer")],
  },
  typescript: {
    compilerOptions: {
      target: "es2018",
    },
  },
};

module.exports = { preprocessOptions };
