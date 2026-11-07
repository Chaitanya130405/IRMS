export default {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/config/db.js",
  ],
  coverageDirectory: "coverage",
  verbose: true,
  testTimeout: 30000,
  // Handle ES modules
  transform: {},
  moduleFileExtensions: ["js", "json"],
};
