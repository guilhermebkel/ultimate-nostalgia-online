import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";
import { knownKeys } from "./KnownKeysRule.mjs";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: { parser: tseslint.parser, ecmaVersion: 2024, sourceType: "module" },
});

ruleTester.run("known-keys", knownKeys, {
  valid: [
    { name: "a record keyed by a union", code: "const LEVEL_TO_RANK: Record<Level, number> = { low: 1, high: 2 };" },
    { name: "a list typed with a union", code: 'const LEVELS: readonly Level[] = ["low", "high"];' },
    {
      name: "a set typed with a union",
      code: 'const OPEN: ReadonlySet<Status> = new Set(["submitted", "streaming"]);',
    },
    {
      name: "a record whose keys are computed",
      code: "const KEY_TO_VALUE: Record<string, number> = { [first]: 1, [second]: 2 };",
    },
    { name: "a list that is not all literals", code: 'const NAMES: string[] = [first, "b"];' },
    { name: "a set built from a variable", code: "const SEEN: ReadonlySet<string> = new Set(names);" },
    {
      name: "a map keyed by a union",
      code: 'const NAME_TO_TEXT = new Map<SkillName, string>([["analyze-case", "x"]]);',
    },
    {
      name: "a map built from computed keys",
      code: "const IDS = new Map<string, number>(items.map((item) => [item.id, 1]));",
    },
    { name: "a map keyed by free text, filled later", code: "const doiToRanked = new Map<string, Ranked>();" },
    {
      name: "a map keyed by free text entries",
      code: "const doiToRanked = new Map<string, Ranked>([[first.doi, first]]);",
    },
  ],
  invalid: [
    {
      name: "a record keyed by string with all keys known",
      code: 'class A { static readonly CODE_TO_TEXT: Record<string, string> = { a: "x", b: "y" }; }',
      errors: [{ messageId: "keys" }],
    },
    {
      name: "a list of string with all values known",
      code: 'const LEVELS: string[] = ["low", "high"];',
      errors: [{ messageId: "values" }],
    },
    {
      name: "a readonly list of string",
      code: 'const LEVELS: readonly string[] = ["low", "high"];',
      errors: [{ messageId: "values" }],
    },
    {
      name: "a set of string with all values known",
      code: 'const KEYS: ReadonlySet<string> = new Set(["Escape"]);',
      errors: [{ messageId: "values" }],
    },
    {
      name: "a new Map keyed by string with fixed keys",
      code: 'const NAME_TO_TEXT = new Map<string, string>([["analyze-case", "x"]]);',
      errors: [{ messageId: "keys" }],
    },
    {
      name: "an annotated Map built from fixed keys",
      code: 'const NAME_TO_TEXT: ReadonlyMap<string, string> = new Map([["a", "x"], ["b", "y"]]);',
      errors: [{ messageId: "keys" }],
    },
  ],
});
