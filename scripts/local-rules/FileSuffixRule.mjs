import { basename, extname } from "node:path";

const SUFFIX_BY_FOLDER = {
  Adapters: "Adapter",
  Builders: "Builder",
  Protocols: "Protocol",
  Utils: "Util",
};
// Why: `index` is a barrel with no role of its own. `components/`, `app/`, `data/`, `locales/` and `scripts/` are outside the map, so this map is the only list of folders the rule covers.
const EXEMPT_STEMS = new Set(["index"]);
const SOURCE_FOLDER = /(?:^|\/)src\/([^/]+)\/(?:[^/]+\/)*([^/]+)$/;
const NAME_PARTS = /\.(?:test|d)$/;

export const fileSuffix = {
  meta: {
    type: "suggestion",
    messages: {
      missing:
        '"{{file}}" is in src/{{folder}}/, so its name must end with "{{suffix}}" (before the extension, and before ".test").',
    },
  },
  create(context) {
    const match = SOURCE_FOLDER.exec(context.filename.replaceAll("\\", "/"));
    const folder = match?.[1] ?? "";
    const suffix = Object.hasOwn(SUFFIX_BY_FOLDER, folder) ? SUFFIX_BY_FOLDER[folder] : undefined;
    const file = match?.[2] ?? "";
    const stem = basename(file, extname(file)).replace(NAME_PARTS, "");
    return {
      "Program:exit"(node) {
        if (suffix !== undefined && !EXEMPT_STEMS.has(stem) && !stem.endsWith(suffix)) {
          context.report({ node, messageId: "missing", data: { file, folder, suffix } });
        }
      },
    };
  },
};
