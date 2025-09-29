import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/?(*.)+(spec|test).ts?(x)'],
    exclude: ['node_modules'],
    coverage: {
      provider: 'v8',
      exclude: [
        '__tests__',
        'node_modules',
        '*.config.js',
        '*.config.ts',
        'dist',
        'coverage',
        /**
         * Exclude test fixtures and sample files
         */
        '**/*.fixtures.ts',
        '**/*.samples.ts',
        '**/fixtures/**',
        '**/samples/**',
        '**/__tests__/**/*.ts',
        '**/__mocks__/**/*.ts',
        '**/*.results.ts'
      ],
      thresholds: {
        branches: 65,
        functions: 80,
        lines: 80,
        statements: 80
      },
      reporter: ['text', 'lcov']
    },
    testTimeout: 10000,
    pool: 'forks',
    clearMocks: true,
    silent: false,
    globals: true
  }
})
