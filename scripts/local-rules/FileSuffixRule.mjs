import { basename, extname } from "node:path";

// Why: the map is the only list of folders the rule covers. `src/components/`, `src/app/`, `src/data/`, `src/locales/`, `src/scripts/` and the top of `scripts/` are named by content or by a fixed convention (ADR 0008).
const SUFFIXES_BY_FOLDER = {
  "src/Adapters": ["Adapter"],
  "src/Builders": ["Builder"],
  "src/config": ["Config"],
  "src/constants": ["Constant"],
  "src/Protocols": ["Protocol"],
  "src/Utils": ["Util"],
  "scripts/local-rules": ["Rule", "Helper"],
  tests: ["Helper"],
  e2e: ["Helper"],
};
// Why: in these folders the `.test` / `.spec` part already says the file is a test, so a test is named by its subject (`Seo.test.mjs`) and only the helpers carry a suffix.
const TEST_PART_BY_FOLDER = { tests: "test", e2e: "spec" };
const DOUBLED_SUFFIXES = /(?:Test|Spec)$/;
// Why: `index` is a barrel with no role of its own.
const EXEMPT_STEMS = new Set(["index"]);
const MAPPED_FOLDER = /(?:^|\/)(src\/[^/]+|scripts\/local-rules|tests|e2e)\/(?:[^/]+\/)*([^/]+)$/;
const NAME_PARTS = /\.(?:test|spec|d)$/;

export const fileSuffix = {
  meta: {
    type: "suggestion",
    messages: {
      missing:
        '"{{file}}" is in {{folder}}/, so its name must end with {{suffix}} (before the extension, and before ".test").',
      doubled:
        '"{{file}}" repeats its role: a test in {{folder}}/ is named by its subject, so drop the "Test" or "Spec" from the name.',
    },
  },
  create(context) {
    const match = MAPPED_FOLDER.exec(context.filename.replaceAll("\\", "/"));
    const folder = match?.[1] ?? "";
    const suffixes = Object.hasOwn(SUFFIXES_BY_FOLDER, folder) ? SUFFIXES_BY_FOLDER[folder] : [];
    const file = match?.[2] ?? "";
    const parts = basename(file, extname(file));
    const stem = parts.replace(NAME_PARTS, "");
    const testPart = Object.hasOwn(TEST_PART_BY_FOLDER, folder) ? TEST_PART_BY_FOLDER[folder] : undefined;
    const isTest = testPart !== undefined && parts.endsWith(`.${testPart}`);
    return {
      "Program:exit"(node) {
        if (suffixes.length === 0 || EXEMPT_STEMS.has(stem)) {
          return;
        }
        if (isTest && DOUBLED_SUFFIXES.test(stem)) {
          context.report({ node, messageId: "doubled", data: { file, folder } });
          return;
        }
        if (!isTest && !suffixes.some((suffix) => stem.endsWith(suffix))) {
          const suffix = suffixes.map((name) => `"${name}"`).join(" or ");
          context.report({ node, messageId: "missing", data: { file, folder, suffix } });
        }
      },
    };
  },
};
