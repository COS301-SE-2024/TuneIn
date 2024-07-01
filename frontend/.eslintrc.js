const { rules } = require("eslint-config-prettier");

// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  ignorePatterns: [".eslintrc.js", "node_modules/", "api-client/", "babel.config.js"],
  rules: {
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
    "new-cap": "error",
    "no-empty-function": ["error", { allow: ["arrowFunctions"] }],
    "no-undef-init": "error",
    "no-var": "error",

    // Prevent conflicts with Prettier
    ...rules,
    "prettier/prettier": "error",
  },
};
