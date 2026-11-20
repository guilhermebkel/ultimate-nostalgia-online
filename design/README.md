# Brand kit

Logo, icons and web files for uno (Ultimate Nostalgia Online). The kit was made once; change it only on purpose, and keep this guide in step.

## Files

- `svg/`: vector originals. The letters are outlines, so no font needs to be installed.
- `png/`: ready images. Horizontal logos (1200 px wide, transparent), the symbol and the app icon at 1024 px, and `social-preview.png` (1280×640, the image of the repository's social preview).
- `web/`: favicon, app icons, `site.webmanifest` and `head-snippet.html`. They are copied to `public/` by `pnpm build` (copy, do not move); the tags of `head-snippet.html` are in `src/templates/PageTemplate.mjs`.
- `reference/`: `social-preview.html` and `og-image.html`, the sources of `png/social-preview.png` (1280×640) and `public/og.png` (1200×630). Open one at its size and take a screenshot to redo the image.

| File in `web/` | Served as |
| --- | --- |
| `favicon.ico`, `favicon.svg` | the browser tab icon |
| `apple-touch-icon.png` | the iPhone home screen icon |
| `icon-192.png`, `icon-512.png`, `maskable-512.png` | the manifest icons |
| `site.webmanifest` | `/site.webmanifest` |
| `favicon-16.png`, `favicon-32.png`, `favicon-48.png` | not used by the site; for tools that ask for a size |

The social preview is not a file the repository reads: upload `png/social-preview.png` in the repository's Settings, General, Social preview (GitHub has no API for it).

## The logo

Three game tiles in a pyramid spell the name: the yellow "n" on top rests on the "u" and the "o". Many games, one place. The tiles are Lilita One letters, already converted to curves.

| File | Use |
| --- | --- |
| `svg/logo-light.svg`, `svg/logo-dark.svg` | symbol plus the word "uno", on light and on dark backgrounds |
| `svg/logo-black.svg`, `svg/logo-white.svg` | when only one color is available |
| `svg/symbol-light.svg`, `svg/symbol-dark.svg` | the tiles alone, on light and on dark backgrounds (the site header uses this one) |
| `svg/symbol-small-light.svg`, `svg/symbol-small-dark.svg` | for 16 to 48 px: thicker outline, larger letters |
| `svg/symbol-black.svg`, `svg/symbol-white.svg` | the tiles in one color, letters cut out |
| `svg/app-icon.svg`, `svg/app-icon-maskable.svg` | the symbol on the indigo tile (rounded, and full bleed with the symbol inside the safe zone) |

## Rules

- **Clear space:** half a tile (about 1/5 of the symbol's width) free on every side.
- **Minimum size:** the logo with the word, 96 px wide; the symbol, 32 px (below that, use `symbol-small-*`); the favicon is `web/favicon.svg`.
- **Do not:** rotate or tilt the tiles, change their order (u bottom left, n on top, o bottom right), recolor outside the palette, use the normal symbol under 32 px, add shadow or glow, or type "uno" in a font (use the finished logo).
- **Approved pairs:** the light version on cream or white; the dark version on indigo; solid black or white on a photo, in a calm area.

## Colors

| Name | HEX | RGB |
| --- | --- | --- |
| Indigo (outline, letters, dark background) | `#17123A` | 23, 18, 58 |
| Yellow (the "n" tile) | `#FFBB00` | 255, 187, 0 |
| Cream (the "u" and "o" tiles) | `#FFF1C9` | 255, 241, 201 |
| Outline black on dark | `#0B0820` | 11, 8, 32 |

The site's own tokens (paper, ink, the card colors) are in `src/input.css`, not here.

## Font license

The letters are Lilita One, under the SIL Open Font License, which allows use in a logo.

## Trademark warning

"UNO" is a registered trademark of Mattel for card games. Search the INPI (Brazil) and other registries, and ask for legal advice, before using the name commercially. The Ultimate Nostalgia Online expansion does not change the risk of the short name.
