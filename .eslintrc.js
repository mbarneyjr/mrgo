module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    project: './jsconfig.json',
  },
  rules: {
    'max-len': ['error', 512],
    'yoda': 'off',
    'prefer-destructuring': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
    'indent': ['error', 2],
    'quotes': ['error', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true,
    }],
    'quote-props': ['error', 'consistent-as-needed'],
    'arrow-body-style': 'off',
    'no-restricted-syntax': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
      packageDir: [__dirname, `${__dirname}/src`, `${__dirname}/frontend`, `${__dirname}/integration-tests`],
    }],
  },
  overrides: [{
    files: [
      'frontend/*.*js',
    ],
    rules: {
      'no-alert': 'off',
      'no-restricted-globals': 'off',
      'implicit-arrow-linebreak': 'off',
    },
  }],
};
