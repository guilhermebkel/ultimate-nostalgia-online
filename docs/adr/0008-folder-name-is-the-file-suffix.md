# 0008. Every file in a mapped folder carries the folder's name

Status: accepted

## Context

With the move to TypeScript and components (ADR 0007), `src/` has folders with a clear job. A file name that does not say its job (`Json.ts` in `Utils/`) is found only by opening it.

## Decision

- A file in a mapped folder ends its name with the folder's suffix, before `.test`. The lint rule is `local/file-suffix`; the map is in `scripts/local-rules/FileSuffixRule.mjs`, and a new folder needs its entry before its first file.

  | Folder                 | Name                                                             | Example                                 |
  | ---------------------- | ---------------------------------------------------------------- | --------------------------------------- |
  | `src/Adapters/`        | `<Name>Adapter`                                                  | `GitAdapter.ts`                         |
  | `src/Builders/`        | `<Name>Builder`                                                  | `GameBuilder.ts`                        |
  | `src/Protocols/`       | `<Name>Protocol`                                                 | `SiteProtocol.ts`                       |
  | `src/Utils/`           | `<Name>Util`                                                     | `SitemapUtil.ts`                        |
  | `scripts/local-rules/` | `<Name>Rule`, or `<Name>Helper` for shared code                  | `MapNameRule.mjs`, `TypeNodeHelper.mjs` |
  | `tests/`               | `<Subject>.test.mjs` for a test, `<Name>Helper.mjs` for a helper | `Seo.test.mjs`, `HtmlHelper.mjs`        |
  | `e2e/`                 | `<Subject>.spec.mjs` for a spec, `<Name>Helper.mjs` for a helper | `Tracking.spec.mjs`, `BaseHelper.mjs`   |

  `src/config/` is the only place in `src/` that reads `process.env` (`tests/Architecture.test.mjs`); it has no file until a variable needs one. `src/constants/` holds values that more than one file uses; a value used by one file stays in that file.

  In `tests/` and `e2e/` the `.test` or `.spec` part already says the file is a test, so the name does not repeat it (`Seo.test.mjs`, not `SeoTest.test.mjs`).

- Folders outside the map, and why:
  - `src/app/`: Next.js fixes the names (`page.tsx`, `layout.tsx`, `route.ts`, `global-not-found.tsx`).
  - `src/components/`: named by what the component shows, in PascalCase (`SiteHeader.tsx`, `GameCard/LiveGameCard.tsx`). A folder with parts has an `index.tsx` root.
  - `src/data/` and `src/locales/`: named by content (`games.json`) or by language code (`pt-br.json`).
  - `src/scripts/`: kebab-case (`fan-tilt.js`), because the name is the URL the browser loads.
  - `scripts/` (top level): the verb of the task (`build.mjs`, `dev.mjs`, `prepare.mjs`) and `eslint-local-rules.mjs`, the name the lint tools expect.
  - `docs/`: kebab-case Markdown; ADRs are `NNNN-kebab-title.md`.
  - `design/`: copied from the brand kit, never renamed here (`design/README.md`).
- Compared with zerod (`SUFFIX_BY_FOLDER`): the shared entries (`Adapters`, `Builders`, `Protocols`, `Utils`, and `Rules`, here `scripts/local-rules/`) have the same suffixes. zerod has more folders because it has more layers (`Services`, `Schemas`, `Stores`, ...); uno has none of them. zerod's rule reads only `src/`; uno's also reads `scripts/local-rules/`, `tests/` and `e2e/`, which is the one difference that is new here.
- A comment starts with `Why:` and the hidden rule it protects, or `@legacy:` (`local/comment-marker`). A comment that only says what the next line does is deleted.
- Typed maps (from zerod): `local/literal-dispatch` (a decision made by comparing with fixed strings is a `Record<Key, Handler>`), `local/map-name` (a map is named `keyToValue`), `local/known-keys` and `local/no-bare-string-field` (known values are unions, not `string`). Each rule has its own file in `scripts/local-rules/`, with a `RuleTester` test beside it, and `scripts/eslint-local-rules.mjs` only lists them.
- A unit test sits next to its source (`Foo.ts`, `Foo.test.ts`). Tests of the built site (`dist/`) and of the data live in `tests/`. `tests/Architecture.test.mjs` fails on a test with no source beside it, on an import that goes up a layer (`Protocols` and `Utils` first, then `Adapters`, `components` and `app`), and on `Builders` imported by shipped code.

## Consequences

The conventions of zerod carry over with a shorter map. `pnpm lint` and `pnpm quality` (knip, jscpd, dpdm) run in CI.
