import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment:  'jsdom',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testMatch: ['**/tests/**/*.test.ts?(x)', '**/__tests__/**/*.test.ts?(x)'],
}

export default createJestConfig(config)
