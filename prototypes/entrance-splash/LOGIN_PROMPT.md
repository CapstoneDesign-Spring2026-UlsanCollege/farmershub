# Prompt — FarmersHub v2 Login Page (UI only)

> Build a login screen for the standalone entrance prototype. **UI and background only — no
> authentication, no validation, no backend, no real functionality.** Just an attractive screen.

## WHERE TO WORK
- Same folder as the splash prototype: `C:\Users\Sonam Tamang\farmershub-rebuild\`
  (on the `rebuild` branch this is `prototypes/entrance-splash/`).
- Extend the existing files — do **not** create a new project:
  - `index.html` — add a login view inside the hero/page.
  - `style.css` — add login styles (reuse the existing `:root` variables).
  - `script.js` — add only the show/hide toggle wiring.
- Keep it vanilla HTML/CSS/JS, no framework, no build step — must still open by double-clicking
  `index.html`.

## BEHAVIOUR
- The login screen **appears when the "Get Started" button is clicked**.
- The **same looping farm video background stays** (do not reload or change it) — the login UI sits
  on top of it with the same scrim treatment, so the moment feels continuous.
- A smooth transition: the hero content fades/scales out, the login card fades/scales in
  (reuse the existing easing `cubic-bezier(0.16,1,0.3,1)` and timing feel).
- Provide a small **back arrow / "← Back"** to return to the hero (visual nicety; just toggles views).
- The form does nothing on submit — `preventDefault()` only. No fields are validated, no requests made.

## THE LOGIN UI (visual only)
- A centered **glass / frosted card** (subtle blur, semi-transparent white, rounded corners, soft
  shadow) over the video — keep text readable.
- Inside the card, top to bottom:
  - Small **FarmersHub logo badge** (reuse `logo.png`) + a short heading like “Welcome back”.
  - **Email** field (label + input, leading icon optional).
  - **Password** field (label + input, with a show/hide eye toggle that is purely visual/UI).
  - A row: **“Remember me”** checkbox (left) + **“Forgot password?”** link (right) — non-functional.
  - Primary **“Log in”** button (full-width, brand green/white, matches the hero CTA style).
  - A subtle divider (“or”) and a secondary **“Continue with Google”** style button (UI only).
  - Footer line: **“Don’t have an account? Sign up”** (link is a placeholder).

## STYLE / SYSTEM
- Reuse the existing design system: **Sora** font, the green palette and CSS variables, the scrim,
  rounded pill buttons, soft shadows, `clamp()` sizing.
- Fully **mobile-responsive**; the card must look good at 360px width (full-width with margins).
- Polished focus-visible states on all inputs/buttons; proper `<label>`s tied to inputs.

## ACCESSIBILITY
- `prefers-reduced-motion: reduce` → no transition animation; switching views is instant; video stays
  paused on its poster (consistent with the splash).
- Inputs are keyboard-focusable with visible focus rings; the back control is a real `<button>`.

## ACCEPTANCE
- Clicking **Get Started** reveals the login screen over the same, still-playing video.
- The login card looks attractive and is readable; layout holds at 360px.
- “← Back” returns to the hero. Submitting the form does nothing (no errors, no navigation).
- Reduced-motion shows the login screen with no animation.
- No console errors; logo and video still load.

## CONSTRAINTS
- **UI only** — no auth, no validation, no fetch/storage, no real “features”.
- Do not modify the v1 repo/worktrees. Do not commit/push unless asked.
