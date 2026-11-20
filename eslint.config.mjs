import globals from "globals";
import tseslint from "typescript-eslint";

// Why: Oxlint (`.oxlintrc.json`) runs every other rule; this config holds only the naming rules, which Oxlint cannot express.
const BOOLEAN_PREFIXES = ["is", "has", "should", "can", "must", "was", "did"];

export default tseslint.config(
  {
    ignores: [
      "dist/",
      ".next/",
      "node_modules/",
      "next-env.d.ts",
      "test-results/",
      "playwright-report/",
      "design/",
      "public/",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.node,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      "id-length": ["error", { min: 2, exceptionPatterns: ["^_$"], properties: "never" }],
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "default", format: ["camelCase"], leadingUnderscore: "allow" },
        { selector: "import", format: ["camelCase", "PascalCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
        // Why: a component is a PascalCase function, and a module-level constant is UPPER_CASE.
        { selector: "variable", modifiers: ["const"], format: ["camelCase", "PascalCase", "UPPER_CASE"] },
        {
          selector: "variable",
          modifiers: ["const", "global"],
          types: ["boolean", "number", "string", "array"],
          format: ["UPPER_CASE"],
        },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        { selector: "classProperty", modifiers: ["static", "readonly"], format: ["UPPER_CASE", "camelCase"] },
        { selector: ["variable", "parameter"], types: ["boolean"], format: ["PascalCase"], prefix: BOOLEAN_PREFIXES },
        // Why: object keys are data (game ids, JSON-LD and CSS variable names), so they keep the spelling of what they describe.
        { selector: ["objectLiteralProperty", "typeProperty"], format: null },
        { selector: "parameter", format: ["camelCase", "PascalCase"] },
      ],
    },
  },
  {
    // Why: Next.js requires PascalCase default-exported components and exports named `metadata`, `viewport` and `GET` in route files.
    files: ["src/app/**/*.{ts,tsx}"],
    rules: { "@typescript-eslint/naming-convention": "off" },
  },
);
