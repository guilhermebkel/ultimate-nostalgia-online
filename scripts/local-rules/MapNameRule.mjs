import { WRAPPER_TYPE_NAMES } from "./TypeNodeHelper.mjs";

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

export const mapName = {
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
