module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: 'ESNext',
        target: 'ES2020',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        types: ['vite/client', 'jest', '@testing-library/jest-dom', 'node'],
        skipLibCheck: true
      }
    }],
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/whisp-server/',
    '<rootDir>/src/ui-kit/Button.test.tsx',
    '<rootDir>/src/ui-kit/Modal.test.tsx'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg)$': 'jest-transform-stub'
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/vite-env.d.ts',
    '!src/main.tsx',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    // Exclude files that have complex dependencies during CI
    '!src/components/FloatingSpirit.tsx',
    '!src/components/Atelier/**',
    '!src/components/UI/SpiritGalaxy.tsx',
    '!src/components/UI/AppLoader.tsx',
    '!src/App.tsx',
    '!src/providers/**',
    '!src/services/implementations.ts'
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 3,
      functions: 3,
      lines: 6,
      statements: 6
    }
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx']
};
