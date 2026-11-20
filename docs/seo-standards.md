# SEO standards

The site must be easy for search engines and AI assistants to read, because that is how people find a hub of games. Most of this is enforced by `tests/seo.test.mjs`; the rest is care.

## Every page has

- One `h1` (today the name of the featured game), a unique `title` of 10 to 65 characters, and a `description` of 70 to 175 characters that says what the hub is and which game is live.
- A canonical, absolute, `https`, with the host `uno.guilherr.me`, equal to `og:url`.
- `hreflang` alternates for every locale and `x-default` pointing at `/`, on every page (the alternates are reciprocal).
- Open Graph and Twitter tags, with `og.png` at 1200×630 and an `og:image:alt`.
- `<html lang>` equal to the language of the text. `robots` never has `noindex` or `nosnippet` (only `404.html` has `noindex`).
- One JSON-LD `@graph` with `WebSite`, `Person`, `WebPage` and a `WebApplication` for each **live** game. Everything in it is visible on the page. A soon game is not marked up as an application.

## The text

- All the text is in the static HTML. No script builds, translates or reveals it.
- The first thing on the page says what it is: the intro line. Keep it a plain sentence, not a slogan.
- Facts that change (a game going live) change in `games.json` and the locales, and `lastmod` follows the last commit.
- Use real names: "Zerod", "Pebo", "Ogro Party". The name of the hub is written "uno - Ultimate Nostalgia Online".

## Site files (all generated)

- `sitemap.xml` lists every locale with `xhtml:link` alternates and a `lastmod`.
- `robots.txt` allows everything and points at the sitemap. Do not block AI crawlers here without an ADR.
- `llms.txt` lists the live and soon games. It is hygiene, not a ranking factor; keep it only while it costs nothing.
- `404.html` is `noindex`. GitHub Pages cannot send a 301: old URLs of the previous uno game answer 404 and drop out of the index over time.

## Speed

- Fonts are self-hosted (`/fonts`), preloaded and `font-display: swap`. Images have `width` and `height`. The only external request is the GTM script, loaded with `async`.
- No framework JavaScript. Keep it that way: the page should score near 100 in Lighthouse on mobile, and `.github/workflows/ci.yml` asserts a floor (`lighthouserc.json`). The Lighthouse job blocks the GTM script (`blockedUrlPatterns` for `static.guilherr.me`) and takes the median of three runs, since one cold run on the CI runner can spike the blocking time: the owner's container is outside this repository and its third-party chain alone moves LCP in the CI runner (issue #2). The script is still on every page for visitors, and the floor guards what the repository controls.

## What is not promised

Markup does not create demand or authority. These rules remove obstacles; a game page that people link to and search for is what brings visitors. Measure with Search Console and Bing Webmaster (sitemap submitted) and with the referrals of AI assistants in the analytics.
