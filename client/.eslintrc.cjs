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
    {
      files: ['Form.jsx'],
      rules: {
        'react/jsx-props-no-spreading': 'off',
      },
    },
    {
      files: ['Notes.jsx'],
      rules: {
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
      },
    },
    {
      files: ['StyledTreeItem.jsx'],
      rules: {
        'react/jsx-props-no-spreading': 'off',
      },
    },
  ],
};
