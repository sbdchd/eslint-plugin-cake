module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "import"],
  settings: {},
  env: {
    browser: true,
  },
  rules: {
    "no-restricted-globals": [
      "error",
      "close",
      "closed",
      "status",
      "name",
      "length",
      "origin",
      "event",
    ],
    "import/no-duplicates": "error",
    "no-unneeded-ternary": ["error", { defaultAssignment: false }],
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/prefer-reduce-type-parameter": "error",
    "init-declarations": ["error", "always"],
    "no-lonely-if": "error",
    "no-debugger": "error",
    "object-shorthand": ["error", "always"],
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      {
        assertionStyle: "never",
      },
    ],
    eqeqeq: ["error", "smart"],
  },
}
