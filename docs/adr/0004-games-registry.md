# 0004. `games.json` is the only list of games

Status: accepted

## Context

The same games appear in the cards, the structured data, the sitemap and `llms.txt`. Lists kept by hand drift apart.

## Decision

`src/data/games.json` is the registry: id, status (`live` or `soon`) and, for a live game, its url. Everything else is built from it. A `soon` game has no link and no structured data (tested).

## Consequences

Going live is a two-line change plus the texts. The page never promises a game that cannot be opened.
