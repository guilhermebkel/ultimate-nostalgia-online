# Copy standards

Text the visitor reads lives in `src/locales/<locale>.json`, in English and pt-BR, and is never written in the template.

- Plain, friendly, short. One idea per sentence. No hype words ("amazing", "revolutionary").
- Say what the game is and how to start: "A card game for up to 12 friends. Open a room, send the code and play in the browser."
- Statuses are two words or fewer: "Out now", "Coming soon". The button of a soon game says what is true: "Not playable yet".
- Numbers are exact and match the game (12 players, 9 minigames, up to 8 players). If a game changes, change the text in the same pull request.
- pt-BR is written, not translated word by word: "Pebolim 3D online", not "Futebol de mesa 3D online". Use "você", the short form of the verb and no regional slang.
- Names are not translated: Zerod, Pebo, Ogro Party, uno.
- The expansion is "Ultimate Nostalgia Online" in both languages, with the three initials in bold in the footer.
- Alt text: decorative art has an empty `alt`; the share image has its own text in `ogImageAlt`.
