# Ultimate Nostalgia Online (uno)

The hub of games at https://uno.guilherr.me: famous games remastered with multiplayer and new mechanics. A static site: a Next.js app exported to plain HTML (`output: "export"`) and styled with Tailwind CSS, hosted on GitHub Pages, English by default and pt-BR second. The page lists the games ([Zerod](https://github.com/guilhermebkel/zerod) is live; Pebo and Ogro Party are coming soon). Vocabulary is in `GLOSSARY.md`; decisions are in `docs/adr/`; planned work is in GitHub issues. It follows the conventions of [zerod](https://github.com/guilhermebkel/zerod).

## Layout

One pnpm package. Next.js with a static export: Server Components only, the HTML is built once and served as it is (ADR 0007).

- `src/data/`: `site.json` (url, repository, locales, the GTM script) and `games.json` (the registry: id, `live` or `soon`, url of a live game). The single source of truth for which games exist.
- `src/locales/`: one typed JSON per language (`en.json`, `pt-br.json`), same keys in both (tested).
- `src/app/`: routes. One root layout per language (`(en)`, `(pt-br)`), the pages, `global-not-found.tsx` (the 404), and the static route handlers `sitemap.xml/` and `llms.txt/`. `globals.css` is the Tailwind theme (`@theme` tokens, fonts, animations) and the few pieces that utilities cannot say (the card fan, the status label).
- `src/components/`: `HubPage`, `HubLayout`, `SiteHeader`, `SiteFooter`, `Icons/` (our own SVGs) and `GameCard/` (a root that picks `LiveGameCard` or `SoonGameCard` from `GameCardConfig.ts`, plus one file per part).
- `src/Protocols/`, `src/Utils/`, `src/Adapters/`, `src/Builders/`: types, pure helpers (metadata, JSON-LD, sitemap, `llms.txt`), the one `git` call, and test data. A layer imports only the ones before it in that list; `Builders` are imported by tests only (architecture test).
- `src/scripts/`: the only browser scripts (`fan-tilt.js`, a pointer tilt for the art of the cards, and `tracking.js`, the events for GTM). No bundler; `scripts/prepare.mjs` copies them to `public/`.
- `scripts/`: `build.mjs` and `dev.mjs` (copy the files outside the app into `public/`, then run Next), `prepare.mjs`, and `eslint-local-rules.mjs` (lists our lint rules, one file each in `scripts/local-rules/`: `file-suffix`, `comment-marker`, `literal-dispatch`, `map-name`, `known-keys`, `no-bare-string-field`).
- `public/`: files served as they are (`CNAME`, `.nojekyll`, `robots.txt`, `og.png`, `img/`). `scripts/prepare.mjs` also copies `design/web/`, the two fonts and the browser scripts here; those copies are git-ignored.
- `design/`: the brand kit (logo, icons, web files; `design/README.md`).
- Every file in a mapped folder (`Adapters`, `Builders`, `Protocols`, `Utils`, `scripts/local-rules/` as `Rule` or `Helper`, `tests/` and `e2e/` helpers as `Helper`) ends its name with the folder's name, singular (`SitemapUtil.ts`; lint `local/file-suffix`, ADR 0008). A test in `tests/` or `e2e/` is named by its subject (`Seo.test.mjs`, `Tracking.spec.mjs`). Tests sit next to the file they test (`*.test.ts`); tests of the built site and of the data are in `tests/`. `e2e/`: Playwright (responsive, accessibility, tracking, 404).
- `docs/`: standards, guides and decisions. `.github/`: workflows, issue forms and the pull request template.

## Commands

    nvm use            # Node 22
    pnpm install
    pnpm dev           # Next dev server on :3000
    pnpm build         # static export into dist/
    pnpm format        # Prettier (with the Tailwind class sorter)
    pnpm typecheck     # tsc
    pnpm lint          # Prettier check, tsc, Oxlint, a minimal ESLint, build and html-validate on dist/
    pnpm quality       # knip, jscpd, dpdm (cycles)
    pnpm test          # Vitest (builds first)
    pnpm test:e2e      # Playwright on dist/ (builds first)
    pnpm check         # everything: lint, quality, test and e2e (CI runs it)

## How to act on a task

| When                                                                                    | Read                                                | Run                            |
| --------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| Starting a session                                                                      | `README.md`, `GLOSSARY.md`                          | `nvm use`, `pnpm install`      |
| Given a GitHub issue number                                                             | `docs/agents/issue-tracker.md`                      | `gh issue view <n> --comments` |
| Triage labels on an issue                                                               | `docs/agents/triage-labels.md`                      | none                           |
| Domain terms or an ADR                                                                  | `docs/agents/domain.md`, `GLOSSARY.md`, `docs/adr/` | none                           |
| Writing or changing code or markup                                                      | `docs/code-standards.md`                            | `pnpm check`                   |
| Writing or changing tests                                                               | `docs/test-standards.md`                            | `pnpm test`                    |
| Text the visitor reads                                                                  | `docs/copy-standards.md`                            | none                           |
| Anything that search engines or AI assistants read (head, JSON-LD, sitemap, `llms.txt`) | `docs/seo-standards.md`                             | `pnpm test`                    |
| Adding a game                                                                           | `docs/adding-a-game.md`                             | `pnpm check`                   |
| Brand, logo or icons                                                                    | `design/README.md`                                  | none                           |
| Events sent to GTM or Google Analytics                                                  | `docs/tracking-standards.md`                        | `pnpm test`                    |
| Deploying or changing the domain                                                        | `docs/deploying.md`                                 | none                           |

## Rules

- Commit once per task, after a clean `pnpm check`; CI runs it as the gate. Never raise a limit or add an ignore to pass.
- Start new work on a branch from `main` and open a pull request; `.github/PULL_REQUEST_TEMPLATE.md` has the checklist.
- Branch names are `<type>/<short-name>` in lowercase kebab-case: `feat` (new behavior), `fix` (bug fix) or `chore` (anything else). For issue work the name starts with the issue number: `feat/<n>-short-slug`.
- The pull request body starts with `Closes #<n>`; one pull request closes one issue.
- Code, tools, docs and ADRs are in English. Text the visitor reads is in English and pt-BR, both through `src/locales/`, never inline in the template, and follows `docs/copy-standards.md`.
- A game exists in one place, `src/data/games.json`. The page, the structured data, the sitemap and `llms.txt` are built from it; never list a game by hand elsewhere.
- Rules that cannot fail live in code with a test, never only in a comment: a `soon` game has no link and no structured data; every page has one `h1`, a canonical, `hreflang` alternates and a 1200×630 share image; no horizontal scroll from 320 px; no accessibility violation at WCAG AA.
- The text of the page is in the static HTML. No script builds, translates or reveals content, and every component is a Server Component (client JavaScript costs the Lighthouse margin, ADR 0007).
- No tracking beyond the owner's GTM script (`site.json`, ADR 0005) and the events that `src/scripts/tracking.js` pushes into its `dataLayer` (ADR 0006, `docs/tracking-standards.md`). Do not add other third-party scripts, fonts or images. Fonts are self-hosted.
- Brand kit files are copied, not edited by hand: change `design/` on purpose and keep `design/README.md` in step.
- When behavior or vocabulary changes, update `GLOSSARY.md`, the docs or an ADR in the same pull request.
