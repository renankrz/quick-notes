const js = require('@eslint/js');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const importPlugin = require('eslint-plugin-import');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|^next$' }],
    },
  },
  prettierRecommended,
];
