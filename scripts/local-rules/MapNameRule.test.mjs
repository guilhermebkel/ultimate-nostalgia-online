import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";
import { mapName } from "./MapNameRule.mjs";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: { parser: tseslint.parser, ecmaVersion: 2024, sourceType: "module" },
});

ruleTester.run("map-name", mapName, {
  valid: [
    {
      name: "a property named after key and value",
      code: "interface R { suggestionIdToCost: Record<string, number> }",
    },
    { name: "a constant map", code: "const STATUS_TO_RECORD: Record<string, () => void> = {};" },
    { name: "a new Map named after key and value", code: "const pathToDate = new Map<string, number>();" },
    { name: "a record of unknown values is a plain object", code: "type UnknownRecord = Record<string, unknown>;" },
    { name: "a list is not a map", code: "interface R { costs: number[] }" },
  ],
  invalid: [
    {
      name: "a Record property",
      code: "interface R { costs: Record<string, number> }",
      errors: [{ messageId: "unnamed" }],
    },
    {
      name: "a type alias of a Record",
      code: "type PriceTable = Record<string, number>;",
      errors: [{ messageId: "unnamed" }],
    },
    {
      name: "a Map inside Partial, and a Map parameter",
      code: "interface R { counters: Partial<Record<string, number>> }\nfunction f(seen: Map<string, number>) {}",
      errors: [{ messageId: "unnamed" }, { messageId: "unnamed" }],
    },
    {
      name: "a new Map without a type",
      code: "const seen = new Map();",
      errors: [{ messageId: "unnamed" }],
    },
  ],
});
