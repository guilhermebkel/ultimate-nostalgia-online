# 0002. GitHub Pages hosting

Status: accepted

## Context

The site is public, static and free to host. The owner already uses GitHub for every project, and the games run elsewhere (CapRover, Cloudflare).

## Decision

Host on GitHub Pages, published by GitHub Actions (`upload-pages-artifact` and `deploy-pages`) on every push to `main`, with the custom domain `uno.guilherr.me` in `public/CNAME`.

## Consequences

No server to keep. Pages cannot send a 301, so the URLs of the previous uno game answer 404 (`404.html`, noindex) and leave the index with time. A pull request has no preview; `pnpm dev` and the CI artifact stand in for it.
