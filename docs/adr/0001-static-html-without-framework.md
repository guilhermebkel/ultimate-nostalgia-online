# 0001. Static HTML, no framework

Status: superseded by [0007](0007-next-static-export.md)

## Context

The hub is one page in two languages whose first job is to be found by search engines and AI assistants. It has no accounts, no state and no data that changes per visit. We considered Next.js (what the games use for tooling habits) and a static generator such as Astro.

## Decision

The HTML is built once by a small Node script (`scripts/build.mjs`) from data, locales and a pure template, and served as it is. There is no framework and no client-side rendering. The only browser script is a pointer tilt that the page does not need.

## Consequences

The text is always in the first response, the page weighs a few kilobytes, and there is nothing to upgrade. Interactivity beyond the tilt (a game search, a login) would need a new ADR. Adding a language or a game is a data change, not a code change.
