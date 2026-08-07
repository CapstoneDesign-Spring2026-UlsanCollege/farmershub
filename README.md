# FarmersHub — Design & Front-End Package

Assembled 2026-08-05. One warm editorial identity across the customer app
(paper `#F1EBDC`, ink `#1B1915`, red `#BE3A2B`, gold `#C9A24A`; Instrument Serif + Inter).

## Contents

### assets/ — shared across every page
- **shovel-cursor.css** + **shovel-cursor.js** — the shovel pointer. Link both and it
  self-installs: a clean trowel follows the pointer with its blade tip as the hotspot,
  leaning into the direction of travel; holding the mouse down loads the blade with soil
  and drops a heap under the tip. Vector, so it stays crisp at any angle. Mouse-only —
  it does not appear on touch, and text fields keep their normal caret.
- **shovel-previous-sprite.png** — the raster shovel used before the vector rewrite, kept for reference.

### 01-home/ — customer pages (open in a browser; needs the sibling `assets/` folder)
- **farmershub_home_v3.html** — cinematic home page: animated wheat field (wind + shovel-cursor repel), the shovel cursor, parallax/overlap scroll, cow portrait, real emblem logo.
- **farmershub_shopping_flow.html** — marketplace → product detail → basket, one clickable flow with a live basket (KRW).

### 02-entrance-login/ — the re-skinned entrance + login
- **index.html** — **self-contained standalone.** Open it directly: the intro plays (logo badge + letter-by-letter wordmark), then reveals the warm hero and login. Intro and hero share the same golden backdrop. *Omits the 12 MB `farm.mp4`, so the hero uses a golden gradient instead of the video.*
- **login_reskin_preview.html** — quick preview of the reskinned login card.
- **to-commit/** — drop-in replacements for your GitHub repo:
  - **index.html** (modular) + **style.css** + **shovel-cursor.js** — drop these three at the repo root. They keep your existing `logo.png`, `script.js`, and `farm.mp4`, so on GitHub Pages the hero still plays the farm video, now with the warm theme + intro. The shovel-cursor styles are already folded into `style.css` here, so only the script is a new file.

### 03-docs/ — project documentation
- **FarmersHub_SDLC_Working_Model.md** — team + 7-phase process + status.
- **design-spec_marketplace-detail-basket.md** — shopping-screen design record.
- **CHANGELOG.md** — progress log.

## View vs. ship
- **To see it:** open anything in `01-home/`, or `02-entrance-login/index.html` (or the preview). Keep the folder structure — those pages load `assets/shovel-cursor.*` from a sibling folder.
- **To ship it:** commit `02-entrance-login/to-commit/index.html`, `style.css`, and `shovel-cursor.js` into your repo root.

## Repo
`github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub` — entrance/login lives in `index.html` + `style.css`; the home + shopping pages here are the redesign, not yet wired into the multi-page frontend (next step).
