module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  // Add this block to shield Jest from Playwright files
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
};