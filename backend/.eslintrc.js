module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:node/recommended",
    "prettier",
  ],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules"] },
    ],
  },
  settings: {
    node: {
      resolvePaths: [__dirname],
      tryExtensions: [".js", ".json", ".node", ".ts"]
    }
  }
};
