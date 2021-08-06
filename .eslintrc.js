module.exports = {
  extends: [
    `plugin:sonarjs/recommended`,
    `plugin:unicorn/recommended`,
    `plugin:import/errors`,
    `plugin:import/warnings`,
    `plugin:import/typescript`,
  ],
  globals: {
    bridgeApi: `readonly`,
  },
  parser: `@typescript-eslint/parser`,
  plugins: [
    `@typescript-eslint`,
    `sonarjs`,
    `sort-keys-fix`,
    `import`,
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      `warn`,
      { ignoreRestSiblings: true },
    ],
    "comma-dangle": [
      `warn`,
      `always-multiline`,
    ],
    "import/no-named-as-default": `off`,
    "prefer-const": `warn`,
    "quote-props": [
      `error`,
      `as-needed`,
    ],
    quotes: [
      `error`,
      `backtick`,
    ],
    semi: [
      `warn`,
      `never`,
    ],
    "sonarjs/cognitive-complexity": [`warn`, 18],
    "sort-keys-fix/sort-keys-fix": `warn`,
    "unicorn/consistent-function-scoping": `off`,
    "unicorn/filename-case": [
      `error`,
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
        ignore: [
          `[A-Z]{2,4}`,
          `webextension-polyfill-ts`,
        ],
      },
    ],
    "unicorn/no-array-reduce": `off`,
    "unicorn/no-null": 0,
    "unicorn/prefer-module": `off`,
    "unicorn/prefer-node-protocol": `off`,
    "unicorn/prevent-abbreviations": [
      `warn`,
      {
        allowList: {
          Props: true,
          props: true,
        },
      },
    ],
  },
  settings: {
    node: {
      tryExtensions: [`.js`, `.ts`, `.tsx`],
    },
  },
}