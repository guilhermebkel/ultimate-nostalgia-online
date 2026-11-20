const COMMENT_MARKER = /^(Why|@legacy): \S/;
const TOOL_DIRECTIVE = /^(eslint-disable|eslint-enable|oxlint-disable|@ts-expect-error|global )/;
const LINE_COMMENT_TYPE = "Line";

const getFirstLine = (comment) =>
  comment.value
    .split("\n")
    .map((line) => line.replace(/^\s*\*?\s?/, "").trim())
    .find(Boolean) ?? "";

export const commentMarker = {
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
