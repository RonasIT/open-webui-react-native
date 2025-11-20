const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const stylistic = require('@stylistic/eslint-plugin');
const unusedImports = require('eslint-plugin-unused-imports');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const _import = require('eslint-plugin-import');
const tseslint = require('typescript-eslint');

const { fixupPluginRules } = require('@eslint/compat');

const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const eslint = require('@eslint/js');

module.exports = [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      '@stylistic': stylistic,
      'unused-imports': unusedImports,
      react,
      'react-hooks': reactHooks,
      import: _import,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 6,
      sourceType: 'commonjs',

      parserOptions: {
        project: 'tsconfig.(base|lib).json',

        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },

      'react-native/style-sheet-object-names': ['EStyleSheet'],

      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },

      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },

        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },

    rules: {
      '@stylistic/indent': [
        'warn',
        2,
        {
          SwitchCase: 1,
        },
      ],

      '@stylistic/quotes': [
        'warn',
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],

      'react/react-in-jsx-scope': 'off',
      '@stylistic/arrow-parens': ['warn', 'always'],
      '@stylistic/arrow-spacing': ['warn', { before: true, after: true }],
      '@stylistic/block-spacing': ['warn', 'always'],
      '@stylistic/brace-style': ['warn', '1tbs'],
      '@stylistic/comma-spacing': ['warn', { before: false, after: true }],
      '@stylistic/eol-last': ['warn', 'always'],
      '@stylistic/func-call-spacing': ['warn', 'never'],
      '@stylistic/key-spacing': [
        'warn',
        { beforeColon: false, afterColon: true },
      ],
      '@stylistic/keyword-spacing': ['warn', { before: true, after: true }],
      '@stylistic/no-whitespace-before-property': 'warn',
      '@stylistic/space-before-blocks': ['warn', 'always'],
      '@stylistic/space-infix-ops': 'warn',
      '@stylistic/switch-colon-spacing': [
        'warn',
        { after: true, before: false },
      ],
      '@stylistic/member-delimiter-style': 'warn',
      '@stylistic/type-annotation-spacing': 'warn',
      '@stylistic/jsx-equals-spacing': ['warn', 'never'],
      '@stylistic/jsx-indent-props': ['warn', 2],
      '@stylistic/jsx-props-no-multi-spaces': 'warn',
      '@stylistic/type-named-tuple-spacing': 'warn',
      'no-var': 'warn',
      'no-dupe-class-members': 'off',
      'import/prefer-default-export': 'off',
      '@stylistic/implicit-arrow-linebreak': ['warn', 'beside'],

      '@stylistic/newline-per-chained-call': [
        'warn',
        {
          ignoreChainWithDepth: 2,
        },
      ],

      '@stylistic/function-call-argument-newline': ['warn', 'consistent'],
      '@stylistic/function-paren-newline': ['warn', 'consistent'],
      '@stylistic/array-element-newline': ['warn', 'consistent'],

      '@stylistic/array-bracket-newline': [
        'warn',
        {
          multiline: true,
        },
      ],

      '@stylistic/padding-line-between-statements': [
        'warn',
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: 'multiline-block-like',
        },
      ],

      '@typescript-eslint/no-use-before-define': [
        'warn',
        {
          variables: false,
        },
      ],

      '@stylistic/lines-between-class-members': [
        'warn',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],

      '@typescript-eslint/no-inferrable-types': [
        'warn',
        {
          ignoreParameters: true,
        },
      ],

      '@typescript-eslint/explicit-module-boundary-types': [
        'warn',
        {
          allowArgumentsExplicitlyTypedAsAny: true,
        },
      ],

      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        {
          accessibility: 'explicit',

          overrides: {
            constructors: 'no-public',
          },
        },
      ],

      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
        },
      ],

      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      '@typescript-eslint/array-type': [
        'warn',
        {
          default: 'generic',
          readonly: 'generic',
        },
      ],

      '@typescript-eslint/member-ordering': [
        'warn',
        {
          default: [
            'public-static-field',
            'protected-static-field',
            'private-static-field',
            'public-instance-field',
            'protected-instance-field',
            'private-instance-field',
            'public-static-accessor',
            'protected-static-accessor',
            'private-static-accessor',
            'public-instance-accessor',
            'protected-instance-accessor',
            'private-instance-accessor',
            'public-constructor',
            'protected-constructor',
            'private-constructor',
            'public-static-method',
            'public-instance-method',
            'protected-static-method',
            'protected-instance-method',
            'private-static-method',
            'private-instance-method',
          ],
        },
      ],

      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: ['parameter'],
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['classProperty'],
          format: ['camelCase', 'snake_case'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['method', 'accessor'],
          format: ['camelCase'],
        },
        {
          selector: ['function', 'typeProperty'],
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],

      'unused-imports/no-unused-imports': 'warn',

      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      '@stylistic/jsx-quotes': ['warn', 'prefer-single'],
      'react/jsx-boolean-value': 'off',

      '@stylistic/jsx-self-closing-comp': [
        'warn',
        {
          component: true,
          html: true,
        },
      ],

      '@stylistic/jsx-max-props-per-line': [
        1,
        {
          maximum: {
            single: 2,
            multi: 1,
          },
        },
      ],

      '@stylistic/jsx-first-prop-new-line': ['warn', 'multiline'],
      'react/prop-types': 'off',
      'react/jsx-fragments': ['warn', 'element'],
      'import/newline-after-import': 'warn',
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',

      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],

          alphabetize: {
            order: 'asc',
          },
        },
      ],

      'import/no-duplicates': 'warn',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    files: ['**/*.js'],

    rules: {
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    files: ['**/*actions.ts'],

    rules: {
      '@stylistic/function-call-argument-newline': ['warn', 'always'],

      '@stylistic/function-paren-newline': [
        'warn',
        {
          minItems: 1,
        },
      ],
    },
  },
  {
    files: ['**/*selectors.ts'],

    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@stylistic/function-call-argument-newline': ['warn', 'always'],
      '@stylistic/function-paren-newline': ['warn', 'multiline-arguments'],
    },
  },
];
