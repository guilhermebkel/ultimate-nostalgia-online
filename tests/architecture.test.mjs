import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");

const listFiles = (folder) =>
  readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });

const files = listFiles(src).map((path) => relative(root, path));
const sources = files.filter((file) => /\.(ts|tsx)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file));
const unitTests = files.filter((file) => /\.test\.(ts|tsx)$/.test(file));

// Why: a layer imports only the layers below it, so a util never reaches into a component and a protocol stays types only.
const LAYERS_BELOW = {
  Protocols: [],
  Utils: ["Protocols"],
  Adapters: ["Protocols", "Utils"],
  Builders: ["Protocols"],
  components: ["Protocols", "Utils", "components"],
  app: ["Protocols", "Utils", "Adapters", "components"],
};
const IMPORT = /from "@\/([^/"]+)/g;

describe("the layers of src/", () => {
  it.each(sources.filter((file) => file.split("/")[1] in LAYERS_BELOW))(
    "%s imports only the layers below it",
    (file) => {
      const layer = file.split("/")[1];
      const imported = [...readFileSync(join(root, file), "utf8").matchAll(IMPORT)].map((match) => match[1]);
      const allowed = [...LAYERS_BELOW[layer], layer, "locales", "data"];
      expect(
        imported.filter((target) => !allowed.includes(target)),
        file,
      ).toEqual([]);
    },
  );

  it("keeps Builders out of the code the site ships", () => {
    const users = sources.filter((file) => readFileSync(join(root, file), "utf8").includes("@/Builders/"));
    expect(users.filter((file) => file.split("/")[1] !== "Builders")).toEqual([]);
  });
});

describe("the environment", () => {
  // Why: process.env is read in one file, so a variable has one name, one default and one place to look.
  it("is read only in EnvUtil", () => {
    const readers = sources.filter((file) => readFileSync(join(root, file), "utf8").includes("process.env"));
    expect(readers.filter((file) => file !== "src/Utils/EnvUtil.ts")).toEqual([]);
  });
});

describe("tests sit next to the file they test", () => {
  // Why: a unit test lives beside its source (`Foo.ts` and `Foo.test.ts`); tests of the built site and of the data live in tests/.
  it.each(unitTests)("%s has its source file beside it", (file) => {
    const stem = file.replace(/\.test\.(ts|tsx)$/, "");
    expect(existsSync(join(root, `${stem}.ts`)) || existsSync(join(root, `${stem}.tsx`)), file).toBe(true);
  });
});
