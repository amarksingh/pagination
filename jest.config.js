module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.js'],
    transform: {},
    moduleNameMapper: {
        '^@ostro/support/(.*)$': '<rootDir>/../support/$1',
        '^@ostro/support$': '<rootDir>/../support'
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'clover'],
    collectCoverageFrom: [
        '<rootDir>/**/*.js',
        '!<rootDir>/node_modules/**',
        '!<rootDir>/test/**',
        '!<rootDir>/coverage/**',
        '!<rootDir>/jest.config.js'
    ]
};
