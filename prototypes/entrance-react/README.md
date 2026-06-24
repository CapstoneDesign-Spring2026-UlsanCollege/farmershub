# FarmersHub v2 — Entrance (React)

The FarmersHub entrance experience — **intro animation → hero → login** — built in
**React + Vite + TypeScript**. This is the React port of the approved vanilla prototype in
`../entrance-splash/`, matching its visuals 1:1.

> **Why React:** the v2 app is React + Vite + TS (see `rebuild.md`). Building the entrance in
> React means one codebase that can later be wrapped for **Android** (see below) — no rewrite.

## Run it

```bash
npm install
npm run dev      # dev server (HMR)
npm run build    # type-check (tsc) + production build to dist/
npm run preview  # serve the production build
```

Open the printed `localhost` URL.

## Structure

```
src/
  main.tsx                  app entry
  App.tsx                   intro overlay + entrance
  index.css                 all styles (ported from the vanilla prototype's :root + classes)
  components/
    IntroOverlay.tsx        logo shine/glow + letter-by-letter "FarmersHub", then fades out
    Entrance.tsx            hero over the looping farm video; toggles the login view
    Login.tsx               frosted-glass login card (UI only)
  hooks/
    usePrefersReducedMotion.ts
public/
  logo.png  farm.jpg (poster)  farm.mp4 (looping background)
```

## Behaviour

- Intro plays once on load, then reveals the hero over the looping video.
- **Get Started** reveals the login card over the *same* still-playing video; **← Back** / **Esc**
  returns to the hero. Focus moves into the form on open and back to the CTA on close; the inactive
  view is `inert`.
- **Login is UI only** — no auth, no validation, no requests. Submit is `preventDefault()`. The
  password eye toggle is a visual convenience.
- Honors `prefers-reduced-motion`: the intro is skipped, view changes are instant, and the video
  stays paused on its poster.

## Converting to Android (later)

This is a standard Vite web build, so it wraps cleanly with **[Capacitor](https://capacitorjs.com/)**
— one React codebase for web **and** Android (Capacitor runs the web build inside a native WebView):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init FarmersHub com.farmershub.app --web-dir dist
npm run build && npx cap add android && npx cap sync
npx cap open android   # opens Android Studio to build the APK
```

> Note: `farm.mp4` is ~42 MB (kept full-quality intentionally). Fine for a bundled Android app, but
> compress it before any bandwidth-sensitive web deploy.
