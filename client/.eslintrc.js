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
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
  },
  overrides: [
    {
      files: ['*.jsx'],
      rules: {
        'no-underscore-dangle': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/interactive-supports-focus': 'off',
        'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
      },
    },
    {
      files: ['Form.jsx', 'MarkdownBlock.jsx'],
      rules: {
        'react/jsx-props-no-spreading': 'off',
      },
    },
  ],
};
