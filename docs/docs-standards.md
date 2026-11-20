# Docs standards

What goes in `docs/` and where everything else goes.

## Two kinds of file

- **Standard.** A rule that applies to every file of its kind. Each rule is one line a reviewer or a tool can answer yes or no, and says how it is checked. The file is `docs/<topic>-standards.md`. Harness changes follow `docs/harness-standards.md`.
- **Guide.** How to do a recurring job (adding a game, deploying). A guide is listed in the table below.

`docs/adr/` and `docs/agents/` keep their own rules and are not classified here.

| File                    | Kind  |
| ----------------------- | ----- |
| `docs/adding-a-game.md` | guide |
| `docs/deploying.md`     | guide |

## What a standard never contains

- A component, route, constant, screen or piece of copy as the rule. An example may name one, as an example: inside a fenced block, or on a line that says "e.g." or "example".
- A description of the product. The product and its terms are in `GLOSSARY.md`.

Test for a new line: **would it stay true if the component or copy it mentions were renamed or deleted?** If not, it does not go in a standard.

## Where the other content goes

- What the product does, and its terms: `GLOSSARY.md`.
- Why a choice was made: `docs/adr/`.
- Tokens, such as colors, fonts and animations: `src/app/globals.css`, which already holds them.
- A rule a tool can check is a tool (`docs/code-standards.md`); the standard then says which tool and keeps the line.
