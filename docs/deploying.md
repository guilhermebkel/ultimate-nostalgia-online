# Deploying

The site is static files in `dist/`, published to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main` (and by hand with "Run workflow").

## One-time setup

1. **Pages source.** Settings, Pages, Build and deployment, Source: **GitHub Actions**.
2. **Custom domain.** `public/CNAME` holds `uno.guilherr.me` and is copied to `dist/`. In the DNS of `guilherr.me`, point `uno` to `guilhermebkel.github.io` with a `CNAME` record. In Settings, Pages, Custom domain, enter `uno.guilherr.me` and, when the certificate is ready, turn on **Enforce HTTPS**.
3. **The old site.** `uno.guilherr.me` still serves the previous uno game until the DNS changes. Change the record only when the first deploy is green. After the change, old paths answer the `404.html`: Pages cannot redirect.
4. **Social preview.** Upload `design/png/social-preview.png` in Settings, General, Social preview (GitHub has no API for it).

## Each deploy

`deploy.yml` runs `pnpm build`, uploads `dist/` with `actions/upload-pages-artifact` and publishes it with `actions/deploy-pages`. A pull request does not deploy: look at it with `pnpm dev`, or download the `dist` artifact of its CI run.

## After the first deploy

- Open `https://uno.guilherr.me/` and `/pt-br/`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`.
- Validate the structured data in the Rich Results Test and validator.schema.org.
- Add the domain to Google Search Console and Bing Webmaster and submit `sitemap.xml`.
- Check that the GTM script loads: the owner's file is `https://static.guilherr.me/js/gtm.js`.
