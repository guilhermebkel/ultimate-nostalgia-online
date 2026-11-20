import { isStringKeyword, WRAPPER_TYPE_NAMES } from "./TypeNodeHelper.mjs";

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

export const knownKeys = {
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
