# FarmersHub v2 — Prototype Progress (handoff prompt)

> Paste this into a fresh session to continue the design-prototype work with full context.

## Context
We are building the **FarmersHub v2** product (see `rebuild.md` for the full stack/phase plan:
React + Vite + TS client, Express + TS server, Atlas; roles `farmer` + `customer`; COD orders).
Before wiring the real React app, we are prototyping the **entrance experience** as a **standalone
vanilla HTML/CSS/JS** page so it can be opened by double-clicking `index.html` — no build step.

Local working folder: `C:\Users\Sonam Tamang\farmershub-rebuild\`
Pushed to: `rebuild` branch under `prototypes/entrance-splash/`.

## Done so far
- **Entrance / splash page** — ✅ approved. Green intro animation (logo badge shine + glow, "FarmersHub"
  revealed letter-by-letter) that lifts to reveal a **hero** (logo, title, tagline, "Get Started"
  button) over a **looping farm video** background. Reduced-motion supported. Details in `REPORT.md`.
- **Background explored 4 ways**; chose the looping video. Parked alternatives in `_variants/`
  (`vector-farm-scene/`, `photo-kenburns/`, `video-wheat/`).

## Conventions to keep
- Vanilla only, double-click to open, **no framework / no build**.
- Palette + timings live in `:root` CSS variables. Font: **Sora** (Google Fonts), weight 700 wordmark.
- `clamp()` typography, works down to 360px width.
- Always honor `prefers-reduced-motion`. No console errors. Don't modify the v1 repo/worktrees.

## Current live state
- Green intro overlay → hero with the user-supplied looping video (`farm.mp4`).
- `farm.jpg` is the poster / reduced-motion still. `logo.png` is the v1 logo.

## Next up
1. **Login page UI** — appears when **Get Started** is clicked, same video background, attractive but
   **UI only** (no auth logic). Spec in `LOGIN_PROMPT.md`.
2. Later: optimize `farm.mp4` for web; extract a matching poster; port the whole entrance to the React
   `client/` landing route.
