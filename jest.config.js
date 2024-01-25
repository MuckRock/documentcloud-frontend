/** @type {import('jest').Config} */
export default {
  extensionsToTreatAsEsm: [".svelte"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  moduleFileExtensions: ["js", "svelte"],
  rootDir: "src",
  setupFiles: ["dotenv/config"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.svelte$": ["svelte-jester", { preprocess: true }],
  },
  transformIgnorePatterns: ["/node_modules/(?!svue).+\\.js$"],
  collectCoverageFrom: ["./**/*.{js,svelte}"],
  coverageReporters: ["html", "text-summary"],
};
