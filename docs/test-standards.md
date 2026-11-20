# Test standards

## Which level

| What must be proven                                                                                                    | Level               | Where                             |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------- |
| The data are valid: unique ids, statuses, the same keys in every locale                                                | Vitest              | `tests/GamesTest.test.mjs`        |
| The README table of games says what the site says (names, texts, status, links)                                        | Vitest              | `tests/ReadmeTest.test.mjs`       |
| The template does what it says: links a live game, disables a soon game, escapes text, keeps soon games out of JSON-LD | Vitest              | `tests/PageTemplateTest.test.mjs` |
| What search engines and AI assistants read in the built files                                                          | Vitest over `dist/` | `tests/SeoTest.test.mjs`          |
| The page works at real widths: no horizontal scroll, the fan below the button, the 404                                 | Playwright          | `e2e/ResponsiveSpec.spec.mjs`     |
| Nothing breaks WCAG A or AA                                                                                            | Playwright with axe | `e2e/AccessibilitySpec.spec.mjs`  |

Pick the lowest level that can prove it. A rule about the HTML text is a Vitest test over `dist/`, not a browser test.

## Rules

- A rule that cannot fail is a test, not a comment: add the test in the same pull request as the rule.
- Expected values are written by hand in the test, never computed with the code under test.
- Assertions are exact (`toBe`, `toEqual`), not `toBeTruthy` where a value is known.
- A test has no `if` and no loop that hides which case failed; use `describe.each` or `it.each`.
- Tests do not touch the network: the Playwright base test (`e2e/BaseTest.mjs`) aborts every request that leaves localhost, which includes the GTM script.
- A bug gets a failing test first, then the fix.
- Visual changes are looked at by a person or an agent in 390 px and 1440 px; the tests above catch what a screenshot does not (overflow, overlap, contrast), not the look.
