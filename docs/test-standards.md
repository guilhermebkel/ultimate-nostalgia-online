# Test standards

## Which level

| What must be proven                                                                                          | Level               | Where                                  |
| ------------------------------------------------------------------------------------------------------------ | ------------------- | -------------------------------------- |
| The data are valid: unique ids, statuses, the same keys in every locale                                      | Vitest              | `tests/games.test.mjs`                 |
| The README table of games says what the site says (names, texts, status, links)                              | Vitest              | `tests/readme.test.mjs`                |
| The cards do what they say: link a live game twice, give a soon game no link, escape text, one card per game | Vitest              | `src/components/GameCard/*.test.ts(x)` |
| The helpers behind the metadata, JSON-LD, sitemap and `llms.txt`                                             | Vitest              | `src/Utils/*.test.ts`                  |
| The layers, the file suffixes and the tests next to their source                                             | Vitest              | `tests/architecture.test.mjs`          |
| What search engines and AI assistants read in the built files                                                | Vitest over `dist/` | `tests/seo.test.mjs`                   |
| The markup and the script agree with the tracking catalog                                                    | Vitest over `dist/` | `tests/tracking.test.mjs`              |
| A click and a hover push the right events into `dataLayer`                                                   | Playwright          | `e2e/tracking.spec.mjs`                |
| The page works at real widths: no horizontal scroll, the fan below the button, the 404                       | Playwright          | `e2e/responsive.spec.mjs`              |
| Nothing breaks WCAG A or AA                                                                                  | Playwright with axe | `e2e/accessibility.spec.mjs`           |

A unit test sits next to its source file (`Foo.test.ts`); a test in `tests/` or `e2e/` is in kebab-case (`seo.test.mjs`, `tracking.spec.mjs`; ADR 0008); a test across files, over the data or over `dist/` is in `tests/`. Tests read `dist/` through `tests/read-html.mjs`, which writes React's HTML in its plain form (`/>`, `hrefLang`). Pick the lowest level that can prove it. A rule about the HTML text is a Vitest test over `dist/`, not a browser test.

## Rules

- A rule that cannot fail is a test, not a comment: add the test in the same pull request as the rule.
- Expected values are written by hand in the test, never computed with the code under test.
- Assertions are exact (`toBe`, `toEqual`), not `toBeTruthy` where a value is known.
- A test has no `if` and no loop that hides which case failed; use `describe.each` or `it.each`.
- Tests do not touch the network: the Playwright base test (`e2e/fixtures.mjs`) aborts every request that leaves localhost, which includes the GTM script.
- A bug gets a failing test first, then the fix.
- Visual changes are looked at by a person or an agent in 390 px and 1440 px; the tests above catch what a screenshot does not (overflow, overlap, contrast), not the look.
- **Every e2e test carries a tag (lint `local/e2e-tag`).** `CRITICAL_FLOW` for a flow that proves the page works across components, `NEEDS_BROWSER` for what only a real browser provides (layout, overflow, contrast); the constants are in `e2e/tags.mjs`.
- **Wait for the condition, never for time (lint `local/no-fixed-wait`).** In `e2e/`, `tests/` and unit tests, use an `expect` that retries, `waitForFunction` or `expect.poll`, never `waitForTimeout` or `setTimeout`.
- **A flaky test is fixed, not retried (lint `local/no-test-retries`).** `retries` stays at 0.
- **A test of a `Utils` class is named by its method (lint `local/describe-target`).** The outer `describe` is `"SitemapUtil.build()"`: the class and a public method it has.
