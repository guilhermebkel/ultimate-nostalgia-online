# 0003. One URL per language

Status: accepted

## Context

The page is in English and pt-BR. A script that swaps the text would hide it from crawlers, and the owner will add their own language switch later.

## Decision

English is `/` and pt-BR is `/pt-br/`, each a full static page with `hreflang` alternates and `x-default`. There is no switch in the page. The locale files have the same keys, checked by a test.

## Consequences

Each language is indexable on its own. A switch can be added later as plain links to the other URL. A new language is a new locale file and a code in `site.json`.
