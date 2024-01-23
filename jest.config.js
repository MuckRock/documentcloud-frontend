/** @type {import('jest').Config} */
export default {
  extensionsToTreatAsEsm: [".svelte", ".ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  moduleFileExtensions: ["js", "ts", "svelte"],
  rootDir: "src",
  setupFiles: ["dotenv/config"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.svelte$": ["svelte-jester", { preprocess: true }],
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  transformIgnorePatterns: ["/node_modules/(?!svue).+\\.js$"],
  collectCoverageFrom: ["./**/*.{js,svelte}"],
  coverageReporters: ["html", "text-summary"],
};
