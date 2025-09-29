import epilotConfig from '@epilot/eslint-config'
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default [
  js.configs.recommended,
  ...epilotConfig,
  eslintConfigPrettier,
  {
    files: ['**/*.{js,ts,tsx}'],
    ignores: ['node_modules', 'dist'],
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 'latest'
      }
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object'
          ],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          },
          warnOnUnassignedImports: true
        }
      ],
      'spaced-comment': ['warn'],
      'padding-line-between-statements': ['off'],
      'no-unused-vars': ['off'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports'
        }
      ]
    },
    settings: {
      cache: true,
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
          paths: ['src']
        }
      }
    }
  }
]
