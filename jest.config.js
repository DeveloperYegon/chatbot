module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};