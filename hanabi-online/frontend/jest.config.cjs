/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
   preset: 'ts-jest',
   testEnvironment: 'jsdom',
   testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
   moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
   },
   transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {
         tsconfig: 'tsconfig.test.json',
      }],
   },
   setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
};