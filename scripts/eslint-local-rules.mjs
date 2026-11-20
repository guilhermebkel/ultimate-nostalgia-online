// Why: Oxlint loads this file as a JS plugin (.oxlintrc.json), so each rule is written once, here, for both linters. zerod keeps its rules in one file too.
import { basename, extname } from "node:path";

const WRAPPER_TYPE_NAMES = new Set(["Partial", "Readonly", "Required"]);

const isStringKeyword = (typeNode) => {
  return typeNode?.type === "TSStringKeyword";
};

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

// Why: the map is the only list of folders the rule covers. `src/components/`, `src/app/`, `src/data/`, `src/locales/`, `src/scripts/` and the top of `scripts/` are named by content or by a fixed convention (ADR 0008).
const SUFFIXES_BY_FOLDER = {
  "src/Adapters": ["Adapter"],
  "src/Builders": ["Builder"],
  "src/config": ["Config"],
  "src/constants": ["Constant"],
  "src/Protocols": ["Protocol"],
  "src/Utils": ["Util"],
  tests: ["Helper"],
  e2e: ["Helper"],
};
// Why: in these folders the `.test` / `.spec` part already says the file is a test, so a test is named by its subject (`Seo.test.mjs`) and only the helpers carry a suffix.
const TEST_PART_BY_FOLDER = { tests: "test", e2e: "spec" };
const DOUBLED_SUFFIXES = /(?:Test|Spec)$/;
// Why: `index` is a barrel with no role of its own.
const EXEMPT_STEMS = new Set(["index"]);
const MAPPED_FOLDER = /(?:^|\/)(src\/[^/]+|tests|e2e)\/(?:[^/]+\/)*([^/]+)$/;
const NAME_PARTS = /\.(?:test|spec|d)$/;

const fileSuffix = {
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

const LIST_TYPE_NAMES = new Set(["Array", "ReadonlyArray"]);
const SET_TYPE_NAMES = new Set(["Set", "ReadonlySet"]);

const unwrapRecord = (typeNode) => {
  let current = typeNode;
  while (current?.type === "TSTypeReference" && WRAPPER_TYPE_NAMES.has(current.typeName.name)) {
    current = current.typeArguments?.params[0];
  }
  return current;
};

const isRecordOfStringKeys = (typeNode) => {
  const record = unwrapRecord(typeNode);
  return (
    record?.type === "TSTypeReference" &&
    record.typeName.name === "Record" &&
    isStringKeyword(record.typeArguments?.params[0])
  );
};

const TYPE_TO_LIST_CHECK = new Map([
  ["TSArrayType", (node) => isStringKeyword(node.elementType)],
  [
    "TSTypeReference",
    (node) =>
      (LIST_TYPE_NAMES.has(node.typeName.name) || SET_TYPE_NAMES.has(node.typeName.name)) &&
      isStringKeyword(node.typeArguments?.params[0]),
  ],
]);

const isListOfStrings = (typeNode) => {
  if (typeNode?.type === "TSTypeOperator") {
    return typeNode.operator === "readonly" && isListOfStrings(typeNode.typeAnnotation);
  }
  const check = typeNode ? TYPE_TO_LIST_CHECK.get(typeNode.type) : undefined;
  return check?.(typeNode) ?? false;
};

const hasOnlyFixedKeys = (objectNode) => {
  return (
    objectNode.properties.length > 0 &&
    objectNode.properties.every((property) => property.type === "Property" && !property.computed)
  );
};

const hasOnlyFixedStrings = (arrayNode) => {
  return (
    arrayNode.elements.length > 0 &&
    arrayNode.elements.every((element) => element?.type === "Literal" && typeof element.value === "string")
  );
};

const isNewSetOfFixedStrings = (init) => {
  const isNewSet = init.callee.name === "Set";
  const items = init.arguments[0];
  return isNewSet && items?.type === "ArrayExpression" && hasOnlyFixedStrings(items);
};

const MAP_ONLY_TYPE_NAMES = new Set(["Map", "ReadonlyMap"]);

const isMapOfStringKeys = (typeNode) => {
  return (
    typeNode?.type === "TSTypeReference" &&
    MAP_ONLY_TYPE_NAMES.has(typeNode.typeName.name) &&
    isStringKeyword(typeNode.typeArguments?.params[0])
  );
};

const hasOnlyFixedEntries = (arrayNode) => {
  return (
    arrayNode?.type === "ArrayExpression" &&
    arrayNode.elements.length > 0 &&
    arrayNode.elements.every(
      (entry) =>
        entry?.type === "ArrayExpression" &&
        entry.elements[0]?.type === "Literal" &&
        typeof entry.elements[0].value === "string",
    )
  );
};

const isNewMapOfFixedKeys = (init) => {
  return init.callee.name === "Map" && hasOnlyFixedEntries(init.arguments[0]);
};

const buildNewExpressionMessage = (typeNode, init) => {
  if (isNewSetOfFixedStrings(init) && isListOfStrings(typeNode)) {
    return "values";
  }
  const isStringKeyed = isMapOfStringKeys(typeNode) || isStringKeyword(init.typeArguments?.params[0]);
  return isStringKeyed && isNewMapOfFixedKeys(init) ? "keys" : null;
};

const INIT_TO_DECLARED_MESSAGE = new Map([
  ["ObjectExpression", (typeNode, init) => (isRecordOfStringKeys(typeNode) && hasOnlyFixedKeys(init) ? "keys" : null)],
  ["ArrayExpression", (typeNode, init) => (isListOfStrings(typeNode) && hasOnlyFixedStrings(init) ? "values" : null)],
  ["NewExpression", buildNewExpressionMessage],
]);

const knownKeys = {
  meta: {
    type: "suggestion",
    messages: {
      keys: "The keys here are all known: type them as a union (Record<SomeName, ...>) instead of string, so a typo fails to compile.",
      values:
        "The values here are all known: type the list or set with a union (readonly SomeName[], ReadonlySet<SomeName>) instead of string.",
    },
  },
  create(context) {
    const check = (typeNode, init, reportNode) => {
      const messageId = init ? INIT_TO_DECLARED_MESSAGE.get(init.type)?.(typeNode, init) : null;
      if (messageId) {
        context.report({ node: reportNode, messageId });
      }
    };
    return {
      VariableDeclarator(node) {
        check(node.id.typeAnnotation?.typeAnnotation, node.init, node.id);
      },
      PropertyDefinition(node) {
        check(node.typeAnnotation?.typeAnnotation, node.value, node.key);
      },
    };
  },
};

const EQUALITY_OPERATORS = new Set(["===", "==", "!==", "!="]);
const MIN_CASES_FOR_MAP = 2;
const PASSTHROUGH_TYPES = new Set(["LogicalExpression", "UnaryExpression"]);
const EXIT_TYPES = new Set(["ReturnStatement", "ThrowStatement", "ContinueStatement", "BreakStatement"]);

const NODE_TYPE_TO_IS_FIXED = new Map([
  ["Literal", (node) => typeof node.value === "string" && node.value !== ""],
  ["TemplateLiteral", (node) => node.expressions.length === 0 && node.quasis[0]?.value.cooked !== ""],
]);

const isFixedValue = (node) => {
  return NODE_TYPE_TO_IS_FIXED.get(node.type)?.(node) ?? false;
};

const isTypeCheck = (subject) => {
  return subject.type === "UnaryExpression" && subject.operator === "typeof";
};

const getComparedSubject = (comparison) => {
  if (!EQUALITY_OPERATORS.has(comparison.operator)) {
    return undefined;
  }
  const isRightFixed = isFixedValue(comparison.right);
  if (isRightFixed === isFixedValue(comparison.left)) {
    return undefined;
  }
  const subject = isRightFixed ? comparison.left : comparison.right;
  return isTypeCheck(subject) ? undefined : subject;
};

const getLastStatement = (statement) => {
  return Array.isArray(statement.body) ? statement.body.at(-1) : statement;
};

const isGuard = (ifStatement) => {
  const lastStatement = getLastStatement(ifStatement.consequent);
  return !ifStatement.alternate && lastStatement !== undefined && EXIT_TYPES.has(lastStatement.type);
};

const DECISION_TYPE_TO_IS_BRANCH = new Map([
  ["IfStatement", (ifStatement) => !isGuard(ifStatement)],
  ["ConditionalExpression", () => true],
]);

const isBranchCondition = (comparison) => {
  let condition = comparison;
  while (PASSTHROUGH_TYPES.has(condition.parent?.type)) {
    condition = condition.parent;
  }
  const decision = condition.parent;
  const isBranch = DECISION_TYPE_TO_IS_BRANCH.get(decision?.type);
  return decision?.test === condition && isBranch !== undefined && isBranch(decision);
};

const literalDispatch = {
  meta: {
    type: "suggestion",
    messages: {
      repeated:
        '"{{subject}}" is compared with a fixed value again in this function. Dispatch through a Record<Key, Handler> map instead.',
      branch:
        'This branch picks code by comparing "{{subject}}" with a fixed value. Dispatch through a Record<Key, Handler> map, or make it a guard that leaves early.',
      switchCases: "This switch dispatches on fixed values. Use a Record<Key, Handler> map instead.",
    },
  },
  create(context) {
    const scopes = [new Map()];
    const record = (comparison) => {
      const subject = getComparedSubject(comparison);
      if (!subject) {
        return;
      }
      const key = context.sourceCode.getText(subject).replaceAll("?.", ".");
      const seen = scopes.at(-1);
      const count = (seen.get(key) ?? 0) + 1;
      seen.set(key, count);
      if (count >= MIN_CASES_FOR_MAP) {
        context.report({ node: comparison, messageId: "repeated", data: { subject: key } });
        return;
      }
      if (isBranchCondition(comparison)) {
        context.report({ node: comparison, messageId: "branch", data: { subject: key } });
      }
    };
    return {
      ":function"() {
        scopes.push(new Map());
      },
      ":function:exit"() {
        scopes.pop();
      },
      BinaryExpression(node) {
        record(node);
      },
      SwitchStatement(node) {
        const fixedCases = node.cases.filter((switchCase) => switchCase.test && isFixedValue(switchCase.test));
        if (fixedCases.length >= MIN_CASES_FOR_MAP) {
          context.report({ node, messageId: "switchCases" });
        }
      },
    };
  },
};

const MAP_TYPE_NAMES = new Set(["Record", "Map", "ReadonlyMap"]);
const MAP_NAME = /To[A-Z0-9]|_TO_/;

const mapTypeOf = (typeNode) => {
  const name = typeNode?.typeName?.name;
  const typeArguments = typeNode?.typeArguments?.params ?? [];
  if (WRAPPER_TYPE_NAMES.has(name)) {
    return mapTypeOf(typeArguments[0]);
  }
  return MAP_TYPE_NAMES.has(name) ? typeArguments : undefined;
};

const isMapOfUnknown = (typeArguments) => {
  return typeArguments[1]?.type === "TSUnknownKeyword";
};

const isMapConstruction = (init) => {
  return init?.type === "NewExpression" && MAP_TYPE_NAMES.has(init.callee.name);
};

const mapName = {
  meta: {
    type: "suggestion",
    messages: {
      unnamed:
        'Name this map after its key and value ("{{example}}"), so a reader knows what a lookup takes and gives.',
    },
  },
  create(context) {
    const check = (nameNode, typeNode, init) => {
      const typeArguments = mapTypeOf(typeNode);
      const isMap = (typeArguments !== undefined && !isMapOfUnknown(typeArguments)) || isMapConstruction(init);
      const name = nameNode?.name;
      if (isMap && name && !MAP_NAME.test(name)) {
        context.report({ node: nameNode, messageId: "unnamed", data: { example: "suggestionIdToCost" } });
      }
    };
    return {
      VariableDeclarator(node) {
        check(node.id, node.id.typeAnnotation?.typeAnnotation, node.init);
      },
      "PropertyDefinition, TSPropertySignature"(node) {
        check(node.key, node.typeAnnotation?.typeAnnotation, node.value);
      },
      TSTypeAliasDeclaration(node) {
        check(node.id, node.typeAnnotation);
      },
      ":function > Identifier.params"(node) {
        check(node, node.typeAnnotation?.typeAnnotation);
      },
    };
  },
};

const BARE_STRING_FIELD_NAMES = new Set(["type", "kind", "state", "status", "role", "mode", "phase"]);
const NULLISH_TYPE_KEYWORDS = new Set(["TSNullKeyword", "TSUndefinedKeyword"]);

const hasBareString = (typeNode) => {
  if (typeNode?.type === "TSUnionType") {
    const isStringOrNullish = (member) => isStringKeyword(member) || NULLISH_TYPE_KEYWORDS.has(member.type);
    return typeNode.types.some(isStringKeyword) && typeNode.types.every(isStringOrNullish);
  }
  return isStringKeyword(typeNode);
};

const noBareStringField = {
  meta: {
    type: "suggestion",
    messages: {
      bare: '"{{name}}" holds one of several known values: type it with a declared union instead of string.',
    },
  },
  create(context) {
    return {
      "TSPropertySignature[computed=false]"(node) {
        const name = node.key.name ?? node.key.value;
        if (BARE_STRING_FIELD_NAMES.has(name) && hasBareString(node.typeAnnotation?.typeAnnotation)) {
          context.report({ node: node.key, messageId: "bare", data: { name } });
        }
      },
    };
  },
};

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
