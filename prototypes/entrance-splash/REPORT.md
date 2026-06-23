# FarmersHub v2 — Entrance / Splash Prototype (Report)

**Status:** ✅ Approved (design prototype)
**Type:** Standalone, vanilla HTML/CSS/JS — opens by double-clicking `index.html`, no build step.
**Purpose:** Establish the first-impression entrance for the v2 rebuild before it is ported to the
real React + Vite + TypeScript `client/` (see `rebuild.md`).

---

## What it does

1. On load, a full-screen **intro overlay** plays once:
   - Green brand gradient background (`linear-gradient(160deg,#1b5e20,#2e7d32,#388e3c)`).
   - Circular white **logo badge** (~140px) with a diagonal **shine sweep** and a one-shot **glow pulse**.
   - **"FarmersHub"** wordmark revealed **letter-by-letter** (~45ms stagger, each letter rises +
     scales in, `cubic-bezier(0.16,1,0.3,1)`), Sora 700 from Google Fonts.
   - After ~2.6s the overlay **fades + scales to 1.04**; total ~3s, then it is removed.
2. The overlay lifts to reveal the **hero**: logo badge, **FarmersHub** title, a short tagline, and a
   **"Get Started"** button (placeholder — no action yet).
3. Behind the hero, a **looping farm video** plays (muted, auto-loop) with a soft scrim + text-shadow
   for readability.

Faithful to the v1 intro (`frontend/assets/js|css/intro-animation.*`) but rebuilt cleaner:
palette + timings centralized in CSS variables, `clamp()` typography (works at 360px), small readable JS.

## Accessibility

- `prefers-reduced-motion: reduce` → the intro is skipped, the video stays **paused on its poster**,
  and the hero shows immediately.
- Focus-visible styles on the CTA; semantic landmarks; `aria-hidden` on decorative layers.

---

## Background exploration (4 directions tried)

| # | Direction | Outcome | Saved at |
|---|-----------|---------|----------|
| 1 | Flat green gradient | Baseline; felt static | — (original) |
| 2 | Animated vector farm scene (SVG): tractor driving, swaying wheat, clouds, barn | Liked, parked | `_variants/vector-farm-scene/` |
| 3 | Real photo (golden wheat) + Ken Burns pan/zoom | Clashed with green intro | `_variants/photo-kenburns/` |
| 4 | Looping farm **video** | **Chosen** | live |

A short detour also put the video *behind the intro* (intro became a translucent veil) for one
continuous shot — reverted, because the **green intro is the brand moment**.

### Final decision
- **Green intro overlay** (unchanged brand animation) **→** reveals **hero with a looping farm video**.
- The green wheat video (Mixkit) is parked at `_variants/video-wheat/`; the live video is the
  user-supplied clip.

---

## Files

```
index.html     # hero markup + <video> background; intro built in JS
style.css      # :root palette/timings, hero, intro animation, reduced-motion
script.js      # builds the intro (letters + timings), plays/loops the video
logo.png       # reused v1 logo (~1.8 MB)
farm.jpg       # video poster / reduced-motion still (~356 KB)
farm.mp4       # looping hero background video (~42 MB)
_variants/     # parked design directions (kept locally, not all pushed)
```

## How to run
Double-click `index.html`. Fonts load from Google Fonts (offline → system-sans fallback, no errors).

---

## Known issues / next steps
- **Video weight:** `farm.mp4` is ~42 MB — fine for local testing, **too heavy for web deploy**.
  Before production: trim/compress (e.g. 1080p, ~3–6 MB) or move to a CDN.
- **Poster mismatch:** the poster (`farm.jpg`, golden) differs from the live clip; for perfect
  reduced-motion consistency, replace it with a still frame extracted from the chosen video.
- **Port to React:** reimplement as the `client/` landing route (Tailwind + a small intro component)
  during the rebuild; keep the same beats and timings.
- **Next:** Login page UI that appears when **Get Started** is clicked, over the same background —
  see `LOGIN_PROMPT.md`.
