module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/forbid-prop-types': ['error', {
      forbid: ['any', 'array'],
      checkContextTypes: true,
      checkChildContextTypes: true,
    }],
  },
  overrides: [
    {
      files: ['Content.jsx'],
      rules: {
        'react/jsx-props-no-spreading': 'off',
        'no-param-reassign': 'off',
        'react/prop-types': 'off',
      },
    },
  ],
};
