const { rules } = require("eslint-config-prettier");

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin", "prettier"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js", "node_modules/", "dist/"],
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",

    // Possible problems
    "no-constructor-return": "error",
    "no-duplicate-imports": "error",
    "no-self-compare": "error",
    "no-unmodified-loop-condition": "error",
    "no-unreachable-loop": "error",

    // Suggestions
    "block-scoped-var": "error",
    "default-case": "error",
    "default-case-last": "error",
    "default-param-last": "error",
    eqeqeq: "error",
    "logical-assignment-operators": ["error", "never"],
    "no-undef-init": "error",
    "no-var": "error",

    // Prevent conflicts with Prettier
    ...rules,
    "prettier/prettier": "error",
  },
};