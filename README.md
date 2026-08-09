# FarmersHub

Farm-direct marketplace for Ulsan, South Korea. Capstone project, `CapstoneDesign-Spring2026-UlsanCollege`.

**Live:** https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/

---

## What this repository is right now

As of 2026-08-07 this repo holds the **design system and the customer-facing screens**. There is no application code and no API yet — that is the next phase, planned in [`03-docs/ENGINEERING_PLAN.md`](03-docs/ENGINEERING_PLAN.md).

One warm editorial identity runs across every screen: paper `#F1EBDC`, ink `#1B1915`, red `#BE3A2B`, gold `#C9A24A`, Instrument Serif + Inter.

## Layout

| Path | What it is |
|---|---|
| `index.html` | **What GitHub Pages serves.** Self-contained entrance: intro animation → hero → login. Loads only `assets/`. |
| `01-home/farmershub_home_v3.html` | Cinematic home page — animated wheat field, parallax scroll, cow portrait. |
| `01-home/farmershub_shopping_flow.html` | Marketplace → product detail → basket as one clickable flow with a live basket (KRW). |
| `02-entrance-login/index.html` | The same entrance as the root, but referencing `../assets/`. Source of the root copy. |
| `02-entrance-login/login_reskin_preview.html` | Quick preview of the reskinned login card. |
| `02-entrance-login/to-commit/` | **Reference only — not wired up.** A drop-in kit built for the pre-reset repo layout. |
| `assets/` | Shared vector shovel cursor (`.css` + `.js`) and the previous raster sprite. |
| `03-docs/` | Working model, engineering plan, design spec, changelog, decision records. |
| `logo.png` | The farmer/harvest emblem. |

## Running it

Everything is static — no build, no dependencies. Open any HTML file directly in a browser.

The pages load `assets/shovel-cursor.*` as a sibling, so **keep the folder structure**. If you open a file from `01-home/` or `02-entrance-login/` the relative paths resolve; the root `index.html` uses `assets/` directly.

For a local server (some browsers restrict local file loads):

```bash
python -m http.server 8000
```

## Known gaps

- `02-entrance-login/to-commit/index.html` references `farm.mp4` and `script.js`, which no longer exist in this repository. Its `style.css` is still useful — it is the design system expressed as a modular stylesheet, and it is the intended starting point for the component port in Milestone 1.
- There is no backend, no persistence and no real authentication. The login is UI only.
- The basket is in-memory and resets on reload.

## Where to start reading

1. [`03-docs/ENGINEERING_PLAN.md`](03-docs/ENGINEERING_PLAN.md) — where the project stands and what happens next.
2. [`03-docs/FarmersHub_SDLC_Working_Model.md`](03-docs/FarmersHub_SDLC_Working_Model.md) — how work is run.
3. [`03-docs/design-spec_marketplace-detail-basket.md`](03-docs/design-spec_marketplace-detail-basket.md) — the design tokens and screen specs.
4. [`03-docs/CHANGELOG.md`](03-docs/CHANGELOG.md) — what changed, newest first.

---

Copyright © 2026 TAMANG SONAM. See the ownership notice for terms.
