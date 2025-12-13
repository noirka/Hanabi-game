/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
   preset: 'ts-jest',
   testEnvironment: 'node',
   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
   rootDir: 'src',
   testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
   transform: {
      '^.+\\.ts$': 'ts-jest',
   },
};