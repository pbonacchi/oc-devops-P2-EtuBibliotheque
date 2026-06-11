
module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  coverageReporters: process.env.CI
    ? ['text-summary', 'lcov', 'html']
    : ['html', 'text-summary'],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
    },
  },
};
