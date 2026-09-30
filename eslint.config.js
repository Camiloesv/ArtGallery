import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: [
      'src/config/**/*.{ts,tsx}',
      'src/navigation/**/*.{ts,tsx}',
      'src/surfaces/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../scene/*', './scene/*', '@/scene/*'],
              message:
                'Configuration, navigation, and surfaces cannot import scene components.',
            },
          ],
        },
      ],
    },
  },
);
