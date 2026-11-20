# 0008. Every file in a mapped folder carries the folder's name

Status: accepted

## Context

With the move to TypeScript and components (ADR 0007), `src/` has folders with a clear job. A file name that does not say its job (`Json.ts` in `Utils/`) is found only by opening it.

## Decision

- A file in a mapped folder ends its name with the folder's suffix, before `.test`. The lint rule is `local/file-suffix`; the map is in `scripts/eslint-local-rules.mjs`, and a new folder needs its entry before its first file.

  | Folder           | Name             | Example           |
  | ---------------- | ---------------- | ----------------- |
  | `src/Adapters/`  | `<Name>Adapter`  | `GitAdapter.ts`   |
  | `src/Builders/`  | `<Name>Builder`  | `GameBuilder.ts`  |
  | `src/Protocols/` | `<Name>Protocol` | `SiteProtocol.ts` |
  | `src/Utils/`     | `<Name>Util`     | `SitemapUtil.ts`  |

  `process.env` is read only in `src/Utils/EnvUtil.ts` (`tests/architecture.test.mjs`), as in tocomevidencia and better-caprover-mcp; the file is created with the first variable that needs it. A value that several files use lives in the util that owns it (`SiteDataUtil.SHARE_IMAGE`); there is no `config/` or `constants/` folder.

- Folders outside the map, and why:
  - `src/app/`: Next.js fixes the names (`page.tsx`, `layout.tsx`, `route.ts`, `global-not-found.tsx`).
  - `src/components/`: named by what the component shows, in PascalCase (`SiteHeader.tsx`, `GameCard/LiveGameCard.tsx`). A folder with parts has an `index.tsx` root.
  - `src/data/` and `src/locales/`: named by content (`games.json`) or by language code (`pt-br.json`).
  - `src/scripts/`: kebab-case (`fan-tilt.js`), because the name is the URL the browser loads.
  - `scripts/` (top level): the verb of the task (`build.mjs`, `dev.mjs`, `prepare.mjs`) and `eslint-local-rules.mjs`, the name the lint tools expect.
  - `docs/`: kebab-case Markdown; ADRs are `NNNN-kebab-title.md`.
  - `tests/` and `e2e/`: kebab-case, a test named by its subject (`seo.test.mjs`, `tracking.spec.mjs`) and the shared code by its job (`read-html.mjs`, `build-setup.mjs`, `fixtures.mjs`). Same as `e2e/` and `scripts/` in tocomevidencia.
  - `design/`: copied from the brand kit, never renamed here (`design/README.md`).
- Compared with zerod and tocomevidencia (`SUFFIX_BY_FOLDER`): the shared entries (`Adapters`, `Builders`, `Protocols`, `Utils`, and `Rules`, which uno does not need) have the same suffixes. zerod has more folders because it has more layers (`Services`, `Schemas`, `Stores`, ...); uno has none of them. Both read only `src/`, and so does uno's; `scripts/` and `e2e/` stay outside, in kebab-case, in all three. tocomevidencia has the same single `scripts/eslint-local-rules.mjs`.
- A comment starts with `Why:` and the hidden rule it protects, or `@legacy:` (`local/comment-marker`). A comment that only says what the next line does is deleted.
- Typed maps (from zerod): `local/literal-dispatch` (a decision made by comparing with fixed strings is a `Record<Key, Handler>`), `local/map-name` (a map is named `keyToValue`), `local/known-keys` and `local/no-bare-string-field` (known values are unions, not `string`). All the rules are in `scripts/eslint-local-rules.mjs`, with their `RuleTester` cases in `scripts/eslint-local-rules.test.mjs`, as in zerod. Those two files are the only ones exempt from `max-lines` (`.oxlintrc.json`), because the rule is "one file", not "one file under 150 lines".
- A unit test sits next to its source (`Foo.ts`, `Foo.test.ts`). Tests of the built site (`dist/`) and of the data live in `tests/`. `tests/architecture.test.mjs` fails on a test with no source beside it, on an import that goes up a layer (`Protocols` and `Utils` first, then `Adapters`, `components` and `app`), and on `Builders` imported by shipped code.

## Consequences

The conventions of zerod carry over with a shorter map. `pnpm lint` and `pnpm quality` (knip, jscpd, dpdm) run in CI.
