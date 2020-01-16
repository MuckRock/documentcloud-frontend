const scssAliases = aliases => {
  return url => {
    for (const [alias, aliasPath] of Object.entries(aliases)) {
      if (url.indexOf(alias) === 0) {
        return {
          file: url.replace(alias, aliasPath),
        };
      }
    }
    return url;
  };
};

const preprocessOptions = {
  transformers: {
    scss: {
      includePaths: [
        'node_modules',
        'src'
      ],
      importer: [
        scssAliases({
          '@': process.cwd() + '/src',
        }),
      ],
      data: '@import "@/style/variables.scss";'
    },
    postcss: {
      plugins: [
        require('autoprefixer'),
      ]
    }
  },
}

module.exports = { preprocessOptions };
