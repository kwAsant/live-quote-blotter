import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'tests']),
  
  // Block 1: Strict Type-Aware linting ONLY for your main app code
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'], // Ignore tests here!
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Block 2: Standard linting for your test files (removes unsafe call checks for Jest mocks)
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended, // Uses basic recommended rules rather than strict type-checked
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
  },
])