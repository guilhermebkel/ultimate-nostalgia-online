# Issue tracker

Issues live in GitHub: https://github.com/guilhermebkel/ultimate-nostalgia-online/issues.

- Read one with `gh issue view <n> --comments`.
- There are three forms: **Bug** (a game or the site does not work as it should), **Feature request** (something a game or the site could do) and **Task** (a spec an agent or a person can do from the issue alone). `blank_issues_enabled` is off.
- The Bug and Feature forms ask which game it is about (Zerod, Pebo, Ogro Party, a new game, or the hub site). Triage adds the matching `game:` label and, when the problem is in the code of a game, moves or links the issue to the repository of that game.
- One issue is one pull request. The pull request body starts with `Closes #<n>`.
- Never put real user data, private content or secrets in an issue.
