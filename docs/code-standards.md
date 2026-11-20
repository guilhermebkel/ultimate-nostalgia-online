# Code standards

The site is small on purpose: data and texts go in, static HTML comes out. Keep it that way.

## Where things go

- A fact about a game (its id, its status, its url) is in `src/data/games.json`. Its words are in `src/locales/<locale>.json`. Its art is in `src/art/`. The template reads all three; nothing else lists a game.
- The template is a pure function: no file reads, no clock, no network. `scripts/build.mjs` does the IO and passes data in.
- A new language is a new file in `src/locales/` plus its code in `site.json`. The tests fail until it has every key.

## Markup and styles

- Style with Tailwind utilities in the markup. Use `src/input.css` only for what utilities cannot say: theme tokens (`@theme`), `@font-face`, keyframes, and art that needs pseudo-elements or computed variables (the card fan, the status label).
- Colors, fonts, the breakpoint and the animations are tokens in `@theme`. Do not write a hex value in the markup when a token exists. The one breakpoint is `hub:` (900 px): below it the layout is a single column.
- Responsive means mobile first: write the phone layout, then add `hub:` for the desktop one. Check every change at 390 px and at 1440 px, and keep 320 px free of horizontal scroll.
- Animations are `motion-safe:` or inside `prefers-reduced-motion: no-preference`. Motion never carries meaning.
- Transforms use the individual properties (`translate`, `rotate`, `scale`) so that an animation and a hover do not fight.
- Use semantic elements: one `h1`, `h2` per card, `header`, `main`, `footer`. Decorative art has `aria-hidden="true"`; a soon game has no button and no link.
- Text colors must reach WCAG AA contrast on their background (4.5:1 for small text). The accessibility test fails otherwise; change the color, not the test.

## JavaScript

- The build is Node ESM (`.mjs`), one export per concern, no classes unless state needs one.
- The browser gets one tiny script (`src/scripts/fan-tilt.js`), loaded with `defer`, that only adds a pointer tilt to the art of the cards (`data-tilt-card`, `data-tilt-target`). The page works without it.
- No framework, no bundler, no runtime dependency: everything in `package.json` is a dev dependency.
- Names say what a thing is. Booleans are `is`, `has` or `should`. Units are in the name (`delayMs`).

## Before committing

Run `pnpm check`. Prettier sorts the Tailwind classes; do not fight it. Never raise a limit or add an ignore to make a check pass.
