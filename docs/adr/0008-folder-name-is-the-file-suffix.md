# 0008. Every file in a mapped folder carries the folder's name

Status: accepted

## Context

With the move to TypeScript and components (ADR 0007), `src/` has folders with a clear job. A file name that does not say its job (`Json.ts` in `Utils/`) is found only by opening it.

## Decision

- A file in `src/Adapters/`, `src/Builders/`, `src/Protocols/` or `src/Utils/` ends its name with the folder's name, singular (`GitAdapter.ts`, `GameBuilder.ts`, `SiteProtocol.ts`, `SitemapUtil.ts`), before `.test`. The lint rule is `local/file-suffix`; the map is in `scripts/local-rules/FileSuffixRule.mjs`. A new folder needs its entry before its first file.
- `src/app/` (Next.js fixes the names), `src/components/`, `src/data/`, `src/locales/` and `src/scripts/` are outside the map. The two browser scripts keep the names they are served under.
- A comment starts with `Why:` and the hidden rule it protects, or `@legacy:` (`local/comment-marker`). A comment that only says what the next line does is deleted.
- Typed maps (from zerod): `local/literal-dispatch` (a decision made by comparing with fixed strings is a `Record<Key, Handler>`), `local/map-name` (a map is named `keyToValue`), `local/known-keys` and `local/no-bare-string-field` (known values are unions, not `string`). Each rule has its own file in `scripts/local-rules/`, with a `RuleTester` test beside it, and `scripts/eslint-local-rules.mjs` only lists them.
- A unit test sits next to its source (`Foo.ts`, `Foo.test.ts`). Tests of the built site (`dist/`) and of the data live in `tests/`. `tests/ArchitectureTest.test.mjs` fails on a test with no source beside it, on an import that goes up a layer (`Protocols` and `Utils` first, then `Adapters`, `components` and `app`), and on `Builders` imported by shipped code.

## Consequences

The conventions of zerod carry over with a shorter map. `pnpm lint` and `pnpm quality` (knip, jscpd, dpdm) run in CI.
