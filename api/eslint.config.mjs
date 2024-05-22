import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.browser },
    ignores: ['node_modules/', '*.mjs'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^(parent|args|db|session)$',
        },
      ],
      'no-console': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['..*'],
        },
      ],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          endOfLine: 'auto',
        },
      ],
    },
  },
  eslintPluginPrettierRecommended,
];
