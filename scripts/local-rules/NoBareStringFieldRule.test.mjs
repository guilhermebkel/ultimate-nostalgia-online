import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";
import { noBareStringField } from "./NoBareStringFieldRule.mjs";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: { parser: tseslint.parser, ecmaVersion: 2024, sourceType: "module" },
});

ruleTester.run("no-bare-string-field", noBareStringField, {
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
