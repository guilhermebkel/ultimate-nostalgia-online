// Why: Oxlint loads this file as a JS plugin (.oxlintrc.json), so each rule is written once, in scripts/local-rules/, for both linters.
import { commentMarker } from "./local-rules/CommentMarkerRule.mjs";
import { fileSuffix } from "./local-rules/FileSuffixRule.mjs";
import { knownKeys } from "./local-rules/KnownKeysRule.mjs";
import { literalDispatch } from "./local-rules/LiteralDispatchRule.mjs";
import { mapName } from "./local-rules/MapNameRule.mjs";
import { noBareStringField } from "./local-rules/NoBareStringFieldRule.mjs";

export default {
  meta: { name: "local" },
  rules: {
    "comment-marker": commentMarker,
    "file-suffix": fileSuffix,
    "literal-dispatch": literalDispatch,
    "map-name": mapName,
    "known-keys": knownKeys,
    "no-bare-string-field": noBareStringField,
  },
};
