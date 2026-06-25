import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        gtag: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-empty": "error",
      "no-unreachable": "error",
      eqeqeq: "warn",
      "no-var": "error",
      "prefer-const": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "_site/**",
      "*.min.js",
      "sw.js",
      "js/app.js",
      "REFERENCES/**",
      ".cursor/**",
      "Plan/**",
    ],
  },
];
