module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  modulePaths: ["src"],
  transformIgnorePatterns: ["/node_modules/(?!svue).+\\.js$"],
  setupFiles: ["dotenv/config"],
};
