# Adding a game

1. Add an entry to `src/data/games.json`: `{ "id": "my-game", "status": "soon" }`. A `live` game also has `"url"`. Keep live games first.
2. Add `games.my-game.name` and `games.my-game.text` to **every** file in `src/locales/` (the tests fail if one is missing).
3. Draw its card. Put the art in `src/art/` and add a branch for the id in `gameHtml` of `src/templates/PageTemplate.mjs`. A `live` game uses the featured card; a `soon` game uses the small card with the disabled button.
4. Run `pnpm check`. The structured data, the sitemap and `llms.txt` follow from `games.json`; the `soon` game stays out of the structured data until it is `live`.
5. When a game goes live: set `"status": "live"` and its `"url"` in `games.json`, and read the page at 390 px and 1440 px (the featured card is the first live game).
6. Add its `game:<id>` label (`docs/agents/triage-labels.md`) and its name to the dropdowns of `.github/ISSUE_TEMPLATE/bug.yml` and `feature.yml`.
7. Update `GLOSSARY.md` and the README if the vocabulary or the table of games changes.
