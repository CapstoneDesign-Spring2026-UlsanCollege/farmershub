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
- **Login page (UI only)** — ✅ approved & pushed (commit `9cdccbf`). Clicking **Get Started** reveals a
  frosted-glass login card over the same, still-playing video + scrim (hero content eases out, card eases
  in with the shared `cubic-bezier(0.16,1,0.3,1)` easing). Card: logo badge + "Welcome back", email +
  password fields (leading icons, visual show/hide eye toggle), Remember me / Forgot password row,
  full-width green Log in, "or" divider, Continue with Google, Sign up footer, and a "← Back" pill (Esc
  also returns to the hero). **No auth / validation / backend** — submit is `preventDefault()` only.
  Responsive to 360px; `prefers-reduced-motion` switches views instantly. Spec in `LOGIN_PROMPT.md`.

## Conventions to keep
- Vanilla only, double-click to open, **no framework / no build**.
- Palette + timings live in `:root` CSS variables. Font: **Sora** (Google Fonts), weight 700 wordmark.
- `clamp()` typography, works down to 360px width.
- Always honor `prefers-reduced-motion`. No console errors. Don't modify the v1 repo/worktrees.

## Current live state
- Green intro overlay → hero with the user-supplied looping video (`farm.mp4`).
- **Get Started** opens the login view over the same video; **← Back** / **Esc** returns to the hero.
- `farm.jpg` is the poster / reduced-motion still. `logo.png` is the v1 logo.

## Next up
1. Optimize `farm.mp4` for web (compress / move to a CDN) and extract a matching poster — it is ~42 MB,
   too heavy to deploy as-is.
2. Port the whole entrance (intro → hero → login) to the React `client/` landing route.
3. Wire real authentication to the login UI once the backend is ready (currently UI only).
