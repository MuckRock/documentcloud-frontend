/** @type {import('jest').Config} */
export default {
  extensionsToTreatAsEsm: [".svelte", ".ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  moduleFileExtensions: ["js", "ts", "svelte"],
  rootDir: "src",
  setupFiles: ["dotenv/config", "<rootDir>/langs/i18n.js"],
  setupFilesAfterEnv: ["<rootDir>/../jest-setup.js"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.svelte$": ["svelte-jester", { preprocess: true }],
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  transformIgnorePatterns: ["/node_modules/(?!svue).+\\.js$"],
  collectCoverageFrom: ["./**/*.{js,ts,svelte}"],
  coverageReporters: ["html", "text-summary"],
};
