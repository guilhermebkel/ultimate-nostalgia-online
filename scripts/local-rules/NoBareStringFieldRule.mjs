import { isStringKeyword } from "./TypeNodeHelper.mjs";

const BARE_STRING_FIELD_NAMES = new Set(["type", "kind", "state", "status", "role", "mode", "phase"]);
const NULLISH_TYPE_KEYWORDS = new Set(["TSNullKeyword", "TSUndefinedKeyword"]);

const hasBareString = (typeNode) => {
  if (typeNode?.type === "TSUnionType") {
    const isStringOrNullish = (member) => isStringKeyword(member) || NULLISH_TYPE_KEYWORDS.has(member.type);
    return typeNode.types.some(isStringKeyword) && typeNode.types.every(isStringOrNullish);
  }
  return isStringKeyword(typeNode);
};

export const noBareStringField = {
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
