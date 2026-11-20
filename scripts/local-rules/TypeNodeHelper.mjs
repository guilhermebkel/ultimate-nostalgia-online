export const WRAPPER_TYPE_NAMES = new Set(["Partial", "Readonly", "Required"]);

export const isStringKeyword = (typeNode) => {
  return typeNode?.type === "TSStringKeyword";
};
