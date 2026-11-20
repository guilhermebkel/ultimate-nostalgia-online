import { RuleTester } from "eslint";
import { afterAll, describe, it } from "vitest";
import { fileSuffix } from "./FileSuffixRule.mjs";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2024, sourceType: "module" } });

const at = (name, filename) => ({ name, filename, code: "export const value = 1;" });
const missing = (name, filename) => ({ ...at(name, filename), errors: [{ messageId: "missing" }] });
const doubled = (name, filename) => ({ ...at(name, filename), errors: [{ messageId: "doubled" }] });

ruleTester.run("file-suffix", fileSuffix, {
  valid: [
    at("an adapter", "/repo/src/Adapters/GitAdapter.ts"),
    at("a builder", "/repo/src/Builders/GameBuilder.ts"),
    at("a protocol", "/repo/src/Protocols/SiteProtocol.ts"),
    at("a util and its test", "/repo/src/Utils/SitemapUtil.test.ts"),
    at("a file in a subfolder of a mapped folder", "/repo/src/Utils/Deep/ThingUtil.ts"),
    at("a barrel", "/repo/src/Utils/index.ts"),
    at("a rule", "/repo/scripts/local-rules/MapNameRule.mjs"),
    at("a rule test", "/repo/scripts/local-rules/MapNameRule.test.mjs"),
    at("a rule helper", "/repo/scripts/local-rules/TypeNodeHelper.mjs"),
    at("a test helper", "/repo/tests/HtmlHelper.mjs"),
    at("a test named by its subject", "/repo/tests/Seo.test.mjs"),
    at("an e2e helper", "/repo/e2e/BaseHelper.mjs"),
    at("an e2e spec named by its subject", "/repo/e2e/Tracking.spec.mjs"),
    at("a component, outside the map", "/repo/src/components/GameCard/LiveGameCard.tsx"),
    at("a route, outside the map", "/repo/src/app/(en)/page.tsx"),
    at("a browser script, outside the map", "/repo/src/scripts/fan-tilt.js"),
    at("a tool script, outside the map", "/repo/scripts/prepare.mjs"),
  ],
  invalid: [
    missing("an adapter without the suffix", "/repo/src/Adapters/Git.ts"),
    missing("a builder without the suffix", "/repo/src/Builders/Game.ts"),
    missing("a protocol without the suffix", "/repo/src/Protocols/Site.ts"),
    missing("a util with a plural suffix", "/repo/src/Utils/SitemapUtils.ts"),
    missing("a rule without the suffix", "/repo/scripts/local-rules/MapName.mjs"),
    missing("a rule helper in the plural", "/repo/scripts/local-rules/TypeNodeHelpers.mjs"),
    missing("a test helper without the suffix", "/repo/tests/ReadHtml.mjs"),
    missing("an e2e helper without the suffix", "/repo/e2e/BaseTest.mjs"),
    doubled("a test with a doubled suffix", "/repo/tests/ArchitectureTest.test.mjs"),
    doubled("an e2e spec with a doubled suffix", "/repo/e2e/TrackingSpec.spec.mjs"),
  ],
});
