// Why: Oxlint loads this file as a JS plugin (.oxlintrc.json), so each rule is written once, here, for both linters. zerod keeps its rules in one file too.
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import tseslint from "typescript-eslint";

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

// Why: the map is the only list of folders the rule covers. `src/components/`, `src/app/`, `src/data/`, `src/locales/`, `src/scripts/`, `scripts/`, `tests/` and `e2e/` are outside it (ADR 0008), like `scripts/` and `e2e/` in tocomevidencia.
const SUFFIX_BY_FOLDER = {
  Adapters: "Adapter",
  Builders: "Builder",
  Protocols: "Protocol",
  Utils: "Util",
};
// Why: `index` is a barrel with no role of its own.
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

const getFileStem = (filename) => {
  const base = filename.split(/[\\/]/).at(-1) ?? "";
  return base.replace(/\.[^.]+$/, "");
};

const DESCRIBE_TARGET = /^([A-Z]\w*)\.(\w+)\(\)$/;

const HIDDEN_ACCESSIBILITY = new Set(["private", "protected"]);

const TEST_SUFFIX = /\.test$/;

const SOURCE_EXTENSION = ".ts";

const isPublicMember = (member) => {
  const isNamed = member.key?.type === "Identifier";
  return isNamed && !HIDDEN_ACCESSIBILITY.has(member.accessibility) && member.kind !== "constructor";
};

const listPublicMethods = (sourcePath, className) => {
  const { ast: program } = tseslint.parser.parseForESLint(readFileSync(sourcePath, "utf8"), { sourceType: "module" });
  const declarations = program.body.map((node) => node.declaration ?? node);
  const classNode = declarations.find((node) => node.type === "ClassDeclaration" && node.id?.name === className);
  const members = classNode?.body.body ?? [];
  return new Set(members.filter((member) => isPublicMember(member)).map((member) => member.key.name));
};

const getCalleeName = (statement) => {
  return statement.expression?.callee?.name;
};

const describeTarget = {
  meta: {
    type: "suggestion",
    messages: {
      format:
        'Name the outer describe "{{className}}.<method>()": the class this file tests and the public method the tests go through.',
      otherClass: 'This file tests {{className}}; the outer describe names "{{named}}".',
      notPublic: '{{className}} has no public method "{{method}}" in {{source}}; test through a public method.',
      outside: 'Put this test inside a describe named "{{className}}.<method>()".',
    },
  },
  create(context) {
    const className = getFileStem(context.filename).replace(TEST_SUFFIX, "");
    const testFolder = dirname(resolve(context.filename));
    const sourcePath = join(testFolder, `${className}${SOURCE_EXTENSION}`);
    let publicMethods;
    const listMethodsOfSource = () => {
      publicMethods ??= existsSync(sourcePath) ? listPublicMethods(sourcePath, className) : new Set();
      return publicMethods;
    };
    const checkDescribe = (call) => {
      const title = call.arguments[0];
      const match = DESCRIBE_TARGET.exec(typeof title?.value === "string" ? title.value : "");
      if (!match) {
        context.report({ node: title ?? call, messageId: "format", data: { className } });
        return;
      }
      const [, named, method] = match;
      if (named !== className) {
        context.report({ node: title, messageId: "otherClass", data: { className, named } });
        return;
      }
      if (!listMethodsOfSource().has(method)) {
        context.report({
          node: title,
          messageId: "notPublic",
          data: { className, method, source: `${className}${SOURCE_EXTENSION}` },
        });
      }
    };
    const reportOutside = (call) => {
      context.report({ node: call, messageId: "outside", data: { className } });
    };
    const CALLEE_TO_CHECK = { describe: checkDescribe, it: reportOutside, test: reportOutside };
    return {
      Program(program) {
        for (const statement of program.body) {
          const name = getCalleeName(statement);
          const check = Object.hasOwn(CALLEE_TO_CHECK, name ?? "") ? CALLEE_TO_CHECK[name] : undefined;
          check?.(statement.expression);
        }
      },
    };
  },
};

const EXPORT_TYPES = new Set(["ExportNamedDeclaration", "ExportDefaultDeclaration"]);

const FUNCTION_TYPES = new Set(["ArrowFunctionExpression", "FunctionExpression"]);

const COMPONENT_NAME = /^[A-Z]/;

const findTopLevelDeclaration = (node) => {
  let current = node;
  while (current.parent && current.parent.type !== "Program") {
    current = current.parent;
  }
  return current;
};

const DECLARATION_TO_COMPONENT = new Map([
  [
    "VariableDeclaration",
    (declaration) => {
      const [variable] = declaration.declarations;
      return FUNCTION_TYPES.has(variable?.init?.type) ? variable.id : undefined;
    },
  ],
  ["FunctionDeclaration", (declaration) => declaration.id ?? undefined],
]);

const findDeclaredComponent = (statement) => {
  const declaration = EXPORT_TYPES.has(statement.type) ? statement.declaration : statement;
  const identifier = declaration ? DECLARATION_TO_COMPONENT.get(declaration.type)?.(declaration) : undefined;
  return identifier && COMPONENT_NAME.test(identifier.name) ? { name: identifier.name, node: identifier } : undefined;
};

const findMainComponentName = (filename) => {
  const parts = filename.replaceAll("\\", "/").split("/");
  const stem = (parts.pop() ?? "").replace(/\.tsx$/, "");
  if (stem !== "index") {
    return stem;
  }
  return parts.pop();
};

const oneComponentPerFile = {
  meta: {
    type: "suggestion",
    messages: {
      extra:
        '"{{name}}" is a second component in this file. Make a folder named after the main component: Main/index.tsx plus one file per subcomponent (Main/{{name}}.tsx).',
    },
  },
  create(context) {
    const statementToComponent = new Map();
    const record = (node) => {
      const statement = findTopLevelDeclaration(node);
      const component = findDeclaredComponent(statement);
      if (component && !statementToComponent.has(statement)) {
        statementToComponent.set(statement, component);
      }
    };
    return {
      JSXElement(node) {
        record(node);
      },
      JSXFragment(node) {
        record(node);
      },
      "Program:exit"() {
        const components = [...statementToComponent.values()];
        const mainName = findMainComponentName(context.filename);
        const hasMain = components.some(({ name }) => name === mainName);
        const extras = hasMain ? components.filter(({ name }) => name !== mainName) : components.slice(1);
        for (const { name, node } of extras) {
          context.report({ node, messageId: "extra", data: { name } });
        }
      },
    };
  },
};

const OWN_ICONS_FOLDER = "components/Icons/";

const noInlineSvg = {
  meta: {
    type: "problem",
    messages: {
      inlineSvg:
        'An inline <svg> belongs only in components/Icons/. For a standard icon use the icon library (lucide-react, through <Icon name="..." />); for an icon of our own add a file to components/Icons/ and say in it why the library has no equal.',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll("\\", "/");
    if (filename.includes(OWN_ICONS_FOLDER)) {
      return {};
    }
    return {
      "JSXOpeningElement[name.name='svg']"(node) {
        context.report({ node, messageId: "inlineSvg" });
      },
    };
  },
};

const E2E_TAGS = ["@critical-flow", "@needs-browser"];

// Why: the same tag repeats in every test, so specs may name it through the constants of e2e/tags.ts.
const E2E_TAG_CONSTANTS = ["CRITICAL_FLOW", "NEEDS_BROWSER"];

const tagValues = (tagProperty) => {
  return tagProperty.value.elements ?? [tagProperty.value];
};

const NODE_TYPE_TO_IS_ALLOWED_TAG = new Map([
  ["Literal", (node) => E2E_TAGS.includes(node.value)],
  ["Identifier", (node) => E2E_TAG_CONSTANTS.includes(node.name)],
]);

const isAllowedTag = (value) => {
  return NODE_TYPE_TO_IS_ALLOWED_TAG.get(value?.type)?.(value) ?? false;
};

const e2eTag = {
  meta: {
    type: "problem",
    messages: {
      missing: `Give this test a tag: test("...", { tag: "@critical-flow" }, ...). Allowed tags: ${E2E_TAGS.join(", ")}.`,
      unknown: `Use only these tags: ${E2E_TAGS.join(", ")}.`,
    },
  },
  create(context) {
    return {
      "CallExpression[callee.type='Identifier'][callee.name='test']"(node) {
        const options = node.arguments.find((argument) => argument.type === "ObjectExpression");
        const tagProperty = options?.properties.find(
          (property) => property.type === "Property" && property.key.name === "tag",
        );
        if (tagProperty === undefined) {
          context.report({ node, messageId: "missing" });
          return;
        }
        for (const value of tagValues(tagProperty).filter((candidate) => !isAllowedTag(candidate))) {
          context.report({ node: value ?? tagProperty, messageId: "unknown" });
        }
      },
    };
  },
};

const noFixedWait = {
  meta: {
    type: "problem",
    messages: {
      fixed:
        "Wait for the condition, not for time: use an expect that retries (toBeVisible, expect.poll) or a fake timer.",
    },
  },
  create(context) {
    return {
      "CallExpression[callee.name=/^(waitForTimeout|setTimeout)$/], CallExpression[callee.property.name=/^(waitForTimeout|setTimeout)$/]"(
        node,
      ) {
        context.report({ node, messageId: "fixed" });
      },
    };
  },
};

const noTestRetries = {
  meta: {
    type: "problem",
    messages: {
      retries:
        "Do not retry tests: a test that passes on a rerun hides a flaky test. Fix its cause and keep `retries` at 0.",
    },
  },
  create(context) {
    return {
      "Property[key.name='retries']"(node) {
        const isZero = node.value.type === "Literal" && node.value.value === 0;
        if (!isZero) {
          context.report({ node, messageId: "retries" });
        }
      },
    };
  },
};

const NOT_OWN_THIS_SCOPE_TYPES = new Set(["FunctionDeclaration", "FunctionExpression", "ClassBody"]);

const IGNORED_NODE_KEYS = new Set(["parent", "loc", "range", "typeAnnotation"]);

const getChildNodes = (node) => {
  return Object.entries(node)
    .filter(([key]) => !IGNORED_NODE_KEYS.has(key))
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .filter((value) => typeof value?.type === "string");
};

const isPropertyName = (node) => {
  const { parent } = node;
  return !parent.computed && (parent.property === node || parent.key === node);
};

const isOwnThisOrArguments = (node) => {
  const isArgumentsName = node.name === "arguments" && !isPropertyName(node);
  return node.type === "ThisExpression" || isArgumentsName;
};

const readOwnThisOrArguments = (node) => {
  // Why: an arrow has no `this` or `arguments` of its own, so a function that reads them has to stay a function.
  if (isOwnThisOrArguments(node)) {
    return true;
  }
  if (NOT_OWN_THIS_SCOPE_TYPES.has(node.type)) {
    return false;
  }
  return getChildNodes(node).some(readOwnThisOrArguments);
};

const isAssertionSignature = (node) => {
  return node.returnType?.typeAnnotation?.type === "TSTypePredicate" && node.returnType.typeAnnotation.asserts === true;
};

const isConvertible = (node) => {
  // Why: an arrow cannot be a generator, cannot declare an assertion signature and has its own `this`, so these stay functions.
  return !node.generator && !isAssertionSignature(node) && !getChildNodes(node).some(readOwnThisOrArguments);
};

const arrowFunction = {
  meta: {
    type: "suggestion",
    fixable: "code",
    messages: {
      declaration: 'Use an arrow function instead of the function declaration "{{ name }}".',
      expression: 'Use an arrow function instead of the function expression assigned to "{{ name }}".',
    },
  },
  create(context) {
    const { sourceCode } = context;

    const buildArrow = (node, afterName) => {
      // Why: an arrow keeps the parameters, the return type and the body text; only the `function` keyword goes.
      const asyncPrefix = node.async ? "async " : "";
      const signature = sourceCode.text.slice(afterName, node.body.range[0]).trim();
      return `${asyncPrefix}${signature} => ${sourceCode.getText(node.body)}`;
    };

    const reportDeclaration = (node) => {
      const { id } = node;
      // Why: an overloaded function needs its signatures declared with `function`, so the implementation keeps the form too.
      const isOverloaded = id && sourceCode.getDeclaredVariables(node)[0]?.defs.length > 1;
      if (isOverloaded || !isConvertible(node)) {
        return;
      }
      const name = id?.name ?? "default";
      const arrow = buildArrow(
        node,
        id ? id.range[1] : sourceCode.getFirstToken(node, { filter: (token) => token.value === "function" }).range[1],
      );
      const isDefaultExport = node.parent.type === "ExportDefaultDeclaration";
      const fix = (fixer) => {
        if (isDefaultExport && id) {
          return fixer.replaceText(node.parent, `const ${name} = ${arrow};\n\nexport default ${name};`);
        }
        if (isDefaultExport) {
          return fixer.replaceText(node.parent, `export default ${arrow};`);
        }
        return fixer.replaceText(node, `const ${name} = ${arrow};`);
      };
      context.report({ node: id ?? node, messageId: "declaration", data: { name }, fix });
    };

    const reportExpression = (declarator, node) => {
      if (!isConvertible(node)) {
        return;
      }
      const name = declarator.id.name;
      const functionKeyword = sourceCode.getFirstToken(node, { filter: (token) => token.value === "function" });
      const arrow = buildArrow(node, node.id ? node.id.range[1] : functionKeyword.range[1]);
      context.report({
        node,
        messageId: "expression",
        data: { name },
        fix: (fixer) => fixer.replaceText(node, arrow),
      });
    };

    return {
      FunctionDeclaration: reportDeclaration,
      "VariableDeclarator[id.type='Identifier'][init.type='FunctionExpression']": (node) =>
        reportExpression(node, node.init),
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
    "describe-target": describeTarget,
    "one-component-per-file": oneComponentPerFile,
    "no-inline-svg": noInlineSvg,
    "e2e-tag": e2eTag,
    "no-fixed-wait": noFixedWait,
    "no-test-retries": noTestRetries,
    "arrow-function": arrowFunction,
  },
};
