import { readFileSync } from "node:fs";

// Why: React writes void tags with a slash, empty attributes as ="" and a few attribute names in camelCase; the tests compare the plain HTML form.
export const normalizeHtml = (html) =>
  html
    .replaceAll("/>", ">")
    .replaceAll('=""', "")
    .replaceAll("hrefLang=", "hreflang=")
    .replaceAll("charSet=", "charset=")
    .replaceAll("tabIndex=", "tabindex=");

export const readFile = (url) => {
  const text = readFileSync(url, "utf8");
  return String(url).endsWith(".html") ? normalizeHtml(text) : text;
};
