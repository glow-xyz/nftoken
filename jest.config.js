// Inspired by https://github.com/arcatdmz/nextjs-with-jest-typescript/blob/master/jest.config.js
module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testTimeout: 10_000,
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: ["**/tests/*.test.(ts|tsx)"],
  testPathIgnorePatterns: ["./node_modules/"],
  collectCoverage: true,
  coverageReporters: ["json", "html"],
  globals: {
    "ts-jest": {
      // This helps the tests run faster
      // But it skips typechecking, so that should be a different step on CI
      // https://huafu.github.io/ts-jest/user/config/isolatedModules
      isolatedModules: true,
    },
  },
};
