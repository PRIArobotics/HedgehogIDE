/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// ESLint configuration
// http://eslint.org/docs/user-guide/configuring
module.exports = {
  parser: 'babel-eslint',

  extends: [
    'airbnb',
    'plugin:flowtype/recommended',
    'plugin:css-modules/recommended',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
  ],

  plugins: ['flowtype', 'css-modules', 'prettier', 'react-hooks'],

  globals: {
    __DEV__: true,
  },

  env: {
    browser: true,
  },

  rules: {
    // Forbid the use of extraneous packages
    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md
    'import/no-extraneous-dependencies': ['error', { packageDir: __dirname }],

    'no-unused-vars': [
      'warn',
      {
        args: 'all',
        // effectively force unused vars to use an underscore
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        // disallow variables that are allowed by default
        caughtErrors: 'all',
      },
    ],
    'class-methods-use-this': 'warn',
    'lines-between-class-members': 'off',
    'max-classes-per-file': 'off',
    'no-continue': 'off',
    'no-else-return': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',

    'react/no-unused-prop-types': 'warn',
    'react/no-multi-comp': 'off',
    'react/state-in-constructor': ['error', 'never'],
    'react/static-property-placement': ['error', 'static public field'],
    // Checks rules of Hooks
    'react-hooks/rules-of-hooks': 'error',
    // Checks effect dependencies
    'react-hooks/exhaustive-deps': 'warn',

    // Recommend not to leave any console.log in your code
    // Use console.error, console.warn and console.info instead
    // https://eslint.org/docs/rules/no-console
    'no-console': [
      'error',
      {
        allow: ['warn', 'error', 'info'],
      },
    ],

    // Allow only special identifiers
    // https://eslint.org/docs/rules/no-underscore-dangle
    'no-underscore-dangle': [
      'error',
      {
        // these exceptions are from Apollo, Mongoose, and this template,
        // respectively
        allow: ['__typename', '_id', '__DEV__'],
      },
    ],

    'no-restricted-syntax': ['off', { selector: 'ForOfStatement' }],
    'no-inner-declarations': 'off',

    // Prefer destructuring from arrays and objects
    // http://eslint.org/docs/rules/prefer-destructuring
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: false,
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],

    // Ensure <a> tags are valid
    // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/anchor-is-valid.md
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],

    // Allow .js files to use JSX syntax
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx'] }],

    // Functional and class components are equivalent from React’s point of view
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prefer-stateless-function.md
    'react/prefer-stateless-function': 'off',

    // ESLint plugin for prettier formatting
    // https://github.com/prettier/eslint-plugin-prettier
    'prettier/prettier': 'error',

    'react/forbid-prop-types': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/sort-comp': 'off',

    // PropTypes and states are typed by Flow basically, but Flow cannot type defaultProps.
    'react/require-default-props': 'off',
    // see https://medium.freecodecamp.org/incrementally-add-flow-type-checking-react-261fee015f80
    'react/default-props-match-prop-types': ['error', { allowRequiredDefaults: true }],
  },
};
