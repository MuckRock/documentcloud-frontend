module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["js", "svelte"],
  modulePaths: ["src"],
  transformIgnorePatterns: ["/node_modules/(?!svue).+\\.js$"],
  setupFiles: ["dotenv/config"],
};
