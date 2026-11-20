import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";
import eslintLocalRules from "./eslint-local-rules.mjs";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: { parser: tseslint.parser, ecmaVersion: 2024, sourceType: "module" },
});

const plainTester = new RuleTester({ languageOptions: { ecmaVersion: 2024, sourceType: "module" } });

const { rules } = eslintLocalRules;

const at = (name, filename) => ({ name, filename, code: "export const value = 1;" });
const missing = (name, filename) => ({ ...at(name, filename), errors: [{ messageId: "missing" }] });

plainTester.run("file-suffix", rules["file-suffix"], {
  valid: [
    at("an adapter", "/repo/src/Adapters/GitAdapter.ts"),
    at("a builder", "/repo/src/Builders/GameBuilder.ts"),
    at("a protocol", "/repo/src/Protocols/SiteProtocol.ts"),
    at("a util and its test", "/repo/src/Utils/SitemapUtil.test.ts"),
    at("a file in a subfolder of a mapped folder", "/repo/src/Utils/Deep/ThingUtil.ts"),
    at("a barrel", "/repo/src/Utils/index.ts"),
    at("a component, outside the map", "/repo/src/components/GameCard/LiveGameCard.tsx"),
    at("a route, outside the map", "/repo/src/app/(en)/page.tsx"),
    at("a browser script, outside the map", "/repo/src/scripts/fan-tilt.js"),
    at("a tool script, outside the map", "/repo/scripts/prepare.mjs"),
    at("a test of the built site, outside the map", "/repo/tests/seo.test.mjs"),
    at("an e2e spec, outside the map", "/repo/e2e/tracking.spec.mjs"),
  ],
  invalid: [
    missing("an adapter without the suffix", "/repo/src/Adapters/Git.ts"),
    missing("a builder without the suffix", "/repo/src/Builders/Game.ts"),
    missing("a protocol without the suffix", "/repo/src/Protocols/Site.ts"),
    missing("a util with a plural suffix", "/repo/src/Utils/SitemapUtils.ts"),
  ],
});

ruleTester.run("known-keys", rules["known-keys"], {
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

ruleTester.run("literal-dispatch", rules["literal-dispatch"], {
  valid: [
    {
      name: "one comparison that leaves early is a guard",
      code: 'function f(threshold) { if (threshold === "always") { return true; } return false; }',
    },
    {
      name: "the same subject in different functions",
      code: 'function f(kind) { if (kind === "a") { return 1; } } function g(kind) { return kind === "b"; }',
    },
    {
      name: "comparisons with values that aren't fixed",
      code: "function f(kind, other) { if (kind === other) { return 1; } if (kind === other.kind) { return 2; } }",
    },
    {
      name: "a comparison stored once and reused",
      code: 'function f(mode) { const isText = mode === "text"; if (isText) { return 1; } return isText ? 2 : 3; }',
    },
    {
      name: "a comparison that only becomes a value, in a callback or an argument",
      code: 'function f(calls) { return calls.filter((call) => call.category === "edit"); }',
    },
    {
      name: "a guard that throws or continues",
      code: 'function f(items) { for (const item of items) { if (item.kind === "skip") continue; } if (items.mode === "x") { throw new Error(); } }',
    },
    {
      name: "type checks and emptiness checks",
      code: 'function f(value) { return typeof value === "string" && value !== "" ? value : undefined; }',
    },
    {
      name: "a lookup in a map",
      code: "const KIND_TO_HANDLER = { a: () => 1, b: () => 2 }; function f(kind) { return KIND_TO_HANDLER[kind](); }",
    },
  ],
  invalid: [
    {
      name: "if statements one after another",
      code: 'function f(lineType) { if (lineType === "user") { return 1; } if (lineType === "assistant") { return 2; } }',
      errors: [{ messageId: "repeated", data: { subject: "lineType" } }],
    },
    {
      name: "an else-if chain",
      code: 'function f(kind) { if (kind === "a") { return 1; } else if (kind === "b") { return 2; } else { return 3; } }',
      errors: [{ messageId: "branch" }, { messageId: "repeated" }],
    },
    {
      name: "a ternary after an if, through optional chaining",
      code: 'function f(match) { if (match?.kind === "none") { return []; } return match.kind === "language" ? [1] : [2]; }',
      errors: [{ messageId: "repeated", data: { subject: "match.kind" } }],
    },
    {
      name: "comparisons joined by || or &&",
      code:
        'function f(result) { return result.kind !== "interrupted" && result.kind !== "user_rejected"; }' +
        ' function g(result) { if (result.kind === "interrupted" || result.kind === "user_rejected") { return 1; } }',
      errors: [{ messageId: "repeated" }, { messageId: "repeated" }],
    },
    {
      name: "a single if that does work instead of leaving",
      code: 'function f(options) { let fingerprint; if (options.status === "applied") { fingerprint = 1; } return fingerprint; }',
      errors: [{ messageId: "branch", data: { subject: "options.status" } }],
    },
    {
      name: "a single ternary, also inside && or ||",
      code: 'function f(metadata, isOn) { return isOn && metadata?.trigger === "manual" ? "manual" : "auto"; }',
      errors: [{ messageId: "branch", data: { subject: "metadata.trigger" } }],
    },
    {
      name: "a switch over fixed values",
      code: 'function f(kind) { switch (kind) { case "a": return 1; case "b": return 2; default: return 3; } }',
      errors: [{ messageId: "switchCases" }],
    },
  ],
});

ruleTester.run("map-name", rules["map-name"], {
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

ruleTester.run("no-bare-string-field", rules["no-bare-string-field"], {
  valid: [
    { name: "a property typed with a union", code: 'type A = { state: "running" | "done" };' },
    { name: "a property typed with a declared type", code: "type A = { state: StepState; role?: Role };" },
    { name: "a property typed with a template literal", code: "type A = { type: `tool-${string}` };" },
    { name: "a free text property with another name", code: "type A = { title: string; label: string };" },
    { name: "a type literal with a declared type", code: "type A = { kind: Kind; mode?: Mode | null };" },
  ],
  invalid: [
    {
      name: "state typed string",
      code: "type A = { state: string };",
      errors: [{ messageId: "bare", data: { name: "state" } }],
    },
    {
      name: "an optional type",
      code: "type A = { type?: string };",
      errors: [{ messageId: "bare", data: { name: "type" } }],
    },
    {
      name: "string or undefined",
      code: "type A = { role: string | undefined };",
      errors: [{ messageId: "bare", data: { name: "role" } }],
    },
    {
      name: "kind, status, mode and phase",
      code: "type A = { kind: string; status: string | null; mode: string; phase: string };",
      errors: [{ messageId: "bare" }, { messageId: "bare" }, { messageId: "bare" }, { messageId: "bare" }],
    },
  ],
});
