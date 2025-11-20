const nx = require('@nx/eslint-plugin');
const js = require('@eslint/js');
const eslintConfigPrettier = require('eslint-config-prettier');

const ronasitConfig = require('./.eslint.ronasit.cjs');
const constraints = require('./eslint.constraints.json');

module.exports = [
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
      'apps/*/app.config.ts',
    ],
  },
  ...ronasitConfig,
  {
    plugins: {
      '@nx': nx,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: constraints,
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],

    rules: {
      '@stylistic/array-bracket-newline': 'off',
      '@stylistic/implicit-arrow-linebreak': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/jsx-indent': 'off',
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/newline-per-chained-call': 'off',
      '@stylistic/function-paren-newline': 'off',
      '@stylistic/function-call-argument-newline': 'off',
    },
  },
  eslintConfigPrettier,
];
