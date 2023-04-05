module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  preset: "@shelf/jest-mongodb",
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
  testTimeout: 20000
};

process.env = Object.assign(process.env, {
  TARGETSERVICE_DB_CONNECTION: "mongodb://localhost:27017/target",
  TESTING: true
});