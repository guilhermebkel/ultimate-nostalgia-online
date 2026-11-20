# Code standards

The site is small on purpose: data and texts go in, static HTML comes out. Keep it that way.

## Where things go

- A fact about a game (its id, its status, its url) is in `src/data/games.json`. Its words are in `src/locales/<locale>.json`. Its card (the art and the classes) is one entry in `src/components/GameCard/GameCardConfig.ts`. The page reads all three; nothing else lists a game.
- Components are pure Server Components: no file reads, no clock, no network. The only `git` call is `GitAdapter`, used by the sitemap route; the data are imported through `SiteDataUtil`.
- The code is TypeScript. Names, layers and comments follow ADR 0008 (`file-suffix` with one written pattern per folder, `Why:` comments, tests next to the file).
- A new language is a new file in `src/locales/` plus its code in `site.json`. The tests fail until it has every key.

## Markup and styles

- Style with Tailwind utilities in the markup. Use `src/app/globals.css` only for what utilities cannot say: theme tokens (`@theme`), `@font-face`, keyframes, and art that needs pseudo-elements or computed variables (the card fan, the status label).
- Colors, fonts, the breakpoint and the animations are tokens in `@theme`. Do not write a hex value in the markup when a token exists. The one breakpoint is `hub:` (900 px): below it the layout is a single column.
- Responsive means mobile first: write the phone layout, then add `hub:` for the desktop one. Check every change at 390 px and at 1440 px, and keep 320 px free of horizontal scroll.
- Animations are `motion-safe:` or inside `prefers-reduced-motion: no-preference`. Motion never carries meaning.
- Transforms use the individual properties (`translate`, `rotate`, `scale`) so that an animation and a hover do not fight.
- Use semantic elements: one `h1`, `h2` per card, `header`, `main`, `footer`. Decorative art has `aria-hidden="true"`; a soon game has no button and no link.
- Text colors must reach WCAG AA contrast on their background (4.5:1 for small text). The accessibility test fails otherwise; change the color, not the test.

## JavaScript

- The build scripts in `scripts/` are Node ESM (`.mjs`). The app is TypeScript: a helper is a static class in `Utils/` (no dependencies), a component is an arrow function, and a component that takes more than one part is a folder with a root and one file per part (`GameCard/`).
- The browser gets two tiny scripts, both loaded with `defer`: `src/scripts/fan-tilt.js` adds a pointer tilt to the art of the cards (`data-tilt-card`, `data-tilt-target`), and `src/scripts/tracking.js` sends events to GTM (`docs/tracking-standards.md`). The page works without them.
- No client component: the React runtime that Next ships is the whole client JavaScript besides the two scripts. A change that adds client code states its cost in the pull request (ADR 0007).
- Names say what a thing is. Booleans are `is`, `has` or `should`. Units are in the name (`delayMs`).
- **Known values are typed, never `string` (lint: `local/known-keys`, `local/no-bare-string-field`).** When every key of a `Record` or every item of an array or `Set` is written in the code, type it with a union (`Record<GameId, CardConfig>`, `readonly GameId[]`). A property named `type`, `kind`, `state`, `status`, `role`, `mode` or `phase` is typed with a declared union, not `string`.
- **Maps are named `keyToValue` (lint: `local/map-name`).** Every `Record` or `Map` is `GAME_ID_TO_CARD_CONFIG` or `localeKeyToLocale`. A `Record<string, unknown>` is a plain object and is exempt.
- **A map, not a chain of comparisons (lint: `local/literal-dispatch`).** When code decides what to do by comparing a value with fixed strings (`art.kind === "fan"`, then `"image"`, then the rest), the decision is a `Record<Union, Handler>`, so a new member of the union does not compile until it has its handler (`ART_KIND_TO_RENDERER`, `STATUS_TO_CARD`). A single guard that leaves early is allowed, and so is a comparison that only becomes a value (`isMouse`). The rule applies to tests too.
- **Arrow functions (lint `local/arrow-function`, autofix).** A function is an arrow unless it reads `this`, is a generator or declares an assertion signature; Next.js default exports are `const Page = () => ...; export default Page;`.
- **One component per file (lint `local/one-component-per-file`).** A second component gets its own file in the same folder.
- **Inline `<svg>` only in `src/components/Icons/` (lint `local/no-inline-svg`).**

## Before committing

Before the commit run `pnpm check:changed`; CI runs the full `pnpm check` (format, types, Oxlint, ESLint, build, knip, jscpd, dpdm, tests and e2e). Prettier sorts the Tailwind classes; do not fight it. Never raise a limit or add an ignore to make a check pass.

## Hover motion

Every card lifts a little (`SLAB`). The art inside tells the state of the game:

- **Out now:** the art follows the pointer (`data-tilt-card` and `data-tilt-target`, set by `fan-tilt.js`), and the arrow of the button slides forward.
- **Coming soon:** the art floats (`bob`), follows the pointer less strictly and grows by 5% ("peeks"). There is no button to move.

All of it respects `prefers-reduced-motion` and is skipped on devices that cannot hover.
