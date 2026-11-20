# 0007. Next.js with a static export

Status: accepted. Replaces [0001](0001-static-html-without-framework.md).

## Context

The page grew: four cards with their own art, hover motion, two scripts and a registry. The Node template (`PageTemplate.mjs`) kept one branch per game inside a string, and nothing in it could be linted, typed or tested by part. The other repositories (zerod, tocomevidencia) already use React, Tailwind and the same lint and test conventions. The first job of the page is still to be found by search engines and AI assistants, so the text must stay in the first response.

## Decision

- The site is a Next.js app with `output: "export"`: `pnpm build` writes plain files into `dist/` (`distDir: "dist"`), and GitHub Pages serves them as before (ADR 0002). There is no server.
- Every component is a Server Component. The text of the page is in the static HTML. The two browser scripts (`fan-tilt.js`, `tracking.js`) stay plain files, copied to `public/` by `scripts/prepare.mjs`.
- Each language is its own root layout (`src/app/(en)`, `src/app/(pt-br)`), because `<html lang>` belongs to the root layout. The metadata, `hreflang` and `canonical` come from `MetadataUtil`.
- `sitemap.xml` and `llms.txt` are static route handlers built from `games.json` (`SitemapUtil`, `LlmsUtil`). `robots.txt` and `CNAME` are in `public/`.
- A card is data plus a component: `src/components/GameCard/GameCardTheme.ts` has one entry per game, `GameCard` reads it, and a test fails when a game of `games.json` has no card (or a card has no game).
- Files are linked from the site root (`/img/...`, `/_next/...`). The site lives at the root of its own domain, so the old rule of relative links (for a project site under `github.io/<repo>/`) is dropped.

## Consequences

- The first response has the same text and the screenshots at 390 px and 1440 px, in both languages, are pixel-identical to the old build. The page now ships the React runtime: about 136 KB of JavaScript (transfer) and a Lighthouse performance score of 93 to 94 (the gate is 90). A change that adds client JavaScript must watch that margin. If it is lost, the fallback is to render the same components with `renderToStaticMarkup` in a build script, with no client JavaScript.
- `html-validate` ignores five style rules about how React writes HTML (`/>` on void tags, `hidden=""`, `hrefLang`, `noModule`, the `_R_` id). The rules about structure, accessibility and content stay on.
- The standards of zerod and tocomevidencia now apply: Oxlint with our local rules, a minimal ESLint, knip, jscpd and dpdm, folder names as file suffixes (ADR 0008) and tests next to the file they test.
- Adding a language or a game is still a data change (plus one card entry for a game).
