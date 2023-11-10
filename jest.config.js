/** @type {import('jest').Config} */
export default {
  extensionsToTreatAsEsm: [".svelte"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["js", "svelte"],
  modulePaths: ["src"],
  setupFiles: ["dotenv/config"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.svelte$": ["svelte-jester", { preprocess: true }],
  },

  transformIgnorePatterns: ["/node_modules/(?!svue).+\\.js$"],
};
