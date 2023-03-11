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