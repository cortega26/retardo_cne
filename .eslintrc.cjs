module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  globals: {
    AOS: 'readonly',
    gtag: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  ignorePatterns: ['assets/vendor/**/*.js'],
  overrides: [
    {
      files: ['playwright.config.js', 'scripts/**/*.js', 'tests/**/*.js'],
      env: {
        node: true,
        commonjs: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  rules: {},
};
