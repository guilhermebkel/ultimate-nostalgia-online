# Adding a game

1. Add an entry to `src/data/games.json`: `{ "id": "my-game", "status": "soon" }`. A `live` game also has `"url"`. Keep live games first.
2. Add `games.my-game.name` and `games.my-game.text` to **every** file in `src/locales/` (the tests fail if one is missing).
3. Draw its card: add one entry for the id in `GAME_ID_TO_CARD_THEME` (`src/components/GameCard/GameCardTheme.ts`) with its status, tilt, classes and art. A `live` game uses `LiveGameCard` (heading, text, banner link and button); a `soon` game uses `SoonGameCard` (no link, no button). Art that is an SVG goes in `src/components/Icons/` as a component; an image goes in `public/img/`. The tests fail when a game has no card or a card has no game.
4. Run `pnpm check`. The structured data, the sitemap and `llms.txt` follow from `games.json`; the `soon` game stays out of the structured data until it is `live`.
5. When a game goes live: set `"status": "live"` and its `"url"` in `games.json`, and read the page at 390 px and 1440 px (the featured card is the first live game).
6. Add its `game:<id>` label (`docs/agents/triage-labels.md`) and its name to the dropdowns of `.github/ISSUE_TEMPLATE/bug.yml` and `feature.yml`.
7. Update `GLOSSARY.md` and the README if the vocabulary or the table of games changes.
