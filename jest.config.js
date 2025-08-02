module.exports = {
  testEnvironment: "node",
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  coveragePathIgnorePatterns: ["node_modules"],
  coverageReporters: ["text", "lcov", "html"],
};
