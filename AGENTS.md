# Ultimate Nostalgia Online (uno)

The hub of games at https://uno.guilherr.me: famous games remastered with multiplayer and new mechanics. A static site, plain HTML built with a small script and styled with Tailwind CSS, hosted on GitHub Pages, English by default and pt-BR second. The page lists the games ([Zerod](https://github.com/guilhermebkel/zerod) is live; Pebo and Ogro Party are coming soon). Vocabulary is in `GLOSSARY.md`; decisions are in `docs/adr/`; planned work is in GitHub issues. It follows the conventions of [zerod](https://github.com/guilhermebkel/zerod).

## Layout

One pnpm package, no framework and no client-side rendering: the HTML is built once and served as it is.

- `src/data/`: `site.json` (url, repository, locales, the GTM script) and `games.json` (the registry: id, `live` or `soon`, url of a live game). The single source of truth for which games exist.
- `src/locales/`: one typed JSON per language (`en.json`, `pt-br.json`), same keys in both (tested).
- `src/templates/PageTemplate.mjs`: renders a page from data, locale and art. Pure; no IO. Styles are Tailwind utilities written in the markup.
- `src/art/`: the drawings (logo, card fan, ogre, Pebo wordmark, arrow) as inline SVG and HTML.
- `src/input.css`: the Tailwind theme (`@theme` tokens, fonts, animations) and the few pieces that utilities cannot say (the card fan, the status label).
- `src/scripts/`: the only browser script (`fan-tilt.js`, a pointer tilt for the card fan). No bundler.
- `scripts/`: `build.mjs` (CSS, one page per locale, `404.html`, `sitemap.xml`, `llms.txt`, copies) and `dev.mjs`.
- `public/`: files copied as they are (`CNAME`, `robots.txt`, `og.png`, `img/`).
- `design/`: the brand kit (logo, icons, web files; `design/README.md`). `design/web/` is copied to the site root by the build.
- `tests/`: Vitest (data, template and SEO tests over `dist/`). `e2e/`: Playwright (responsive, accessibility, 404).
- `docs/`: standards, guides and decisions. `.github/`: workflows, issue forms and the pull request template.

## Commands

    nvm use            # Node 22
    pnpm install
    pnpm dev           # builds, serves dist/ on :4173 and rebuilds on change
    pnpm build         # dist/
    pnpm format        # Prettier (with the Tailwind class sorter)
    pnpm lint          # Prettier check, build and html-validate on dist/
    pnpm test          # Vitest (builds first)
    pnpm test:e2e      # Playwright on dist/ (builds first)
    pnpm check         # everything (CI runs it)

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
| Deploying or changing the domain                                                        | `docs/deploying.md`                                 | none                           |

## Rules

- Commit once per task, after a clean `pnpm check`; CI runs it as the gate. Never raise a limit or add an ignore to pass.
- Start new work on a branch from `main` and open a pull request; `.github/PULL_REQUEST_TEMPLATE.md` has the checklist.
- Branch names are `<type>/<short-name>` in lowercase kebab-case: `feat` (new behavior), `fix` (bug fix) or `chore` (anything else). For issue work the name starts with the issue number: `feat/<n>-short-slug`.
- The pull request body starts with `Closes #<n>`; one pull request closes one issue.
- Code, tools, docs and ADRs are in English. Text the visitor reads is in English and pt-BR, both through `src/locales/`, never inline in the template, and follows `docs/copy-standards.md`.
- A game exists in one place, `src/data/games.json`. The page, the structured data, the sitemap and `llms.txt` are built from it; never list a game by hand elsewhere.
- Rules that cannot fail live in code with a test, never only in a comment: a `soon` game has no link and no structured data; every page has one `h1`, a canonical, `hreflang` alternates and a 1200×630 share image; no horizontal scroll from 320 px; no accessibility violation at WCAG AA.
- The text of the page is in the static HTML. No script builds, translates or reveals content.
- No tracking beyond the owner's GTM script (`site.json`, ADR 0005). Do not add other third-party scripts, fonts or images. Fonts are self-hosted.
- Brand kit files are copied, not edited by hand: change `design/` on purpose and keep `design/README.md` in step.
- When behavior or vocabulary changes, update `GLOSSARY.md`, the docs or an ADR in the same pull request.
