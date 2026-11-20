# 0005. The owner's GTM script is the only third-party script

Status: accepted

## Context

The owner measures all their sites with Google Tag Manager, served from their own static host as `https://static.guilherr.me/js/gtm.js`.

## Decision

The page loads that script from a small inline script in the head, which adds it with `async` on the first interaction (pointer, key, scroll or touch) or after 6 s, whichever comes first. With a plain `async` tag the script ran before the page was interactive and lowered the mobile Lighthouse score to 0.57 (0.47 on the CI runner); loading it on `load` or when idle did not help the CI score, because the lab run keeps recording after `load`. A visit that ends in under 6 s without any interaction is not counted; the URL is in `site.json`. No other third-party script, font or image is allowed. Fonts are self-hosted. Tests and e2e abort every request that leaves localhost.

## Consequences

Measurement works the same as on the other sites and is disclosed in the README. Anything else that tracks visitors needs a new ADR. The content of the script is owned outside this repository and is not verified here.
