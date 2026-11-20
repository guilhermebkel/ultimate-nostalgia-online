// Why: Oxlint loads these as a JS plugin (.oxlintrc.json), so the rules are written once for both linters.
import { basename, extname } from "node:path";

const COMMENT_MARKER = /^(Why|@legacy): \S/;
const TOOL_DIRECTIVE = /^(eslint-disable|eslint-enable|oxlint-disable|@ts-expect-error|global )/;
const LINE_COMMENT_TYPE = "Line";

const getFirstLine = (comment) =>
  comment.value
    .split("\n")
    .map((line) => line.replace(/^\s*\*?\s?/, "").trim())
    .find(Boolean) ?? "";

const commentMarker = {
  meta: {
    type: "suggestion",
    messages: {
      missing:
        'Delete this comment, or start it with "Why:" and the hidden rule it protects (or "@legacy:" for code that keeps old data working).',
    },
  },
  create(context) {
    return {
      "Program:exit"() {
        let previousLineCommentEnd = -1;
        for (const comment of context.sourceCode.getAllComments()) {
          const isLine = comment.type === LINE_COMMENT_TYPE;
          // Why: consecutive line comments are one comment; only the first line carries the marker.
          const isContinuation = isLine && comment.loc.start.line === previousLineCommentEnd + 1;
          previousLineCommentEnd = isLine ? comment.loc.end.line : -1;
          const firstLine = getFirstLine(comment);
          const isAllowed =
            comment.type === "Shebang" || COMMENT_MARKER.test(firstLine) || TOOL_DIRECTIVE.test(firstLine);
          if (!isContinuation && !isAllowed) {
            context.report({ loc: comment.loc, messageId: "missing" });
          }
        }
      },
    };
  },
};

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

const fileSuffix = {
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

export default { meta: { name: "local" }, rules: { "comment-marker": commentMarker, "file-suffix": fileSuffix } };
