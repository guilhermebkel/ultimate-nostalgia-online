# Tracking standards

The page tells the owner's Google Tag Manager container what visitors do with the cards, so the owner can see which games get attention. The events go to `window.dataLayer` through one small script, `src/scripts/tracking.js` (ADR 0006). The container, and what it sends to Google Analytics, live outside this repository.

## Rules

- Only the events below exist. A new event goes into this catalog first, then into the markup and the script, then into a test, in one pull request.
- Names are `snake_case`, at most 40 characters, in the form `<thing>_<action>` (`game_card_click`).
- Parameters are only the ones the catalog lists. Never send a nickname, an e-mail, an IP address, text a visitor typed, or a URL with a query string.
- Events are described in the markup with `data-track-*` attributes, not in the script. Adding a game needs no change in the script.
- The script sends nothing by itself on load, and it works without GTM: `dataLayer` is created when it is missing.
- Every event carries `locale` (the `lang` of the page).

## Markup

| Attribute                                                         | Where                                             |
| ----------------------------------------------------------------- | ------------------------------------------------- |
| `data-track-card="<game id>"` and `data-track-status` (live/soon) | The card of a game (`section` or `article`).      |
| `data-track-click` (`banner` or `button`)                         | The link that covers a live card, and its button. |
| `data-track-link` (`feedback`, `issue` or `github`)               | A link of the footer.                             |

## Events

### `game_card_click`

A click, or a middle click, on the banner or the button of a live game.

| Parameter   | Value                   |
| ----------- | ----------------------- |
| `game_id`   | The id in `games.json`. |
| `status`    | `live`.                 |
| `placement` | `banner` or `button`.   |

### `game_card_hover`

The pointer stayed over a card. Sent when it leaves, when the tab is hidden or when the page is left. Only for a mouse on a device that can hover.

| Parameter     | Value                                                     |
| ------------- | --------------------------------------------------------- |
| `game_id`     | The id in `games.json`.                                   |
| `status`      | `live` or `soon`.                                         |
| `duration_ms` | Time over the card, rounded to 100 ms, from 500 to 30000. |

Less than 500 ms is not sent (the pointer only passed by). Each card sends at most 5 hovers per visit.

### `footer_link_click`

A click, or a middle click, on a link of the footer.

| Parameter | Value                            |
| --------- | -------------------------------- |
| `link`    | `feedback`, `issue` or `github`. |

## In the GTM container (not in this repository)

1. Variables of type "Data Layer Variable" for `game_id`, `status`, `placement`, `duration_ms`, `link` and `locale`.
2. A trigger of type "Custom Event" with the regex `^(game_card_|footer_link_)`.
3. A GA4 event tag that sends the event name (`{{Event}}`) and those variables as parameters.
4. In GA4, register `game_id`, `placement` and `link` as custom dimensions, and `duration_ms` as a custom metric, to use them in reports.

Check with GTM's Preview mode and GA4's DebugView. The container is not verified by the tests.

## Tests

- `tests/TrackingTest.test.mjs`: the markup has the attributes, and the events of the script are the ones of this catalog.
- `e2e/TrackingSpec.spec.mjs`: a click and a hover push the right events into `dataLayer`.
