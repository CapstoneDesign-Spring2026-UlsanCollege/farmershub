# FarmersHub — CHANGELOG

Progress log for the customer-facing redesign. Newest first.
Phases refer to the 7-phase SDLC working model.

---

## 2026-08-06 — Shovel cursor rebuilt as a two-state vector pointer (Phase 3–4)

**Deliverables:** `assets/shovel-cursor.css` + `assets/shovel-cursor.js`, wired into every page

- **Two states, as asked.** Idle is a clean trowel; pressing the mouse loads the blade
  with soil and drops a heap under the tip, with a few crumbs kicked loose. Releasing
  empties it again.
- **Redrawn as SVG.** The old cursor was a single embedded PNG that already had soil
  baked into it, so a clean idle state could not be cut out of it. Both states are now
  vector: transparent by construction, crisp at any rotation or display density, and a
  few KB instead of 15. The previous sprite is kept at
  `assets/shovel-previous-sprite.png` for reference.
- **Smoother follow.** Position runs through a frame-rate-independent lerp, and the
  angle through a second one on top of the first, so the tilt eases in and settles
  instead of snapping. The tool leans into whichever way it is travelling (±17°) and
  presses into the ground on click — all pivoting about the blade tip, which is the
  pointer hotspot.
- **Shared, not copy-pasted.** One CSS + JS pair now serves the home page, shopping
  flow, entrance/login, and the login preview. The old inline implementation in
  `farmershub_home_v3.html` was removed. For the repo drop-in, the styles are folded
  into `to-commit/style.css`.
- **Manners.** Mouse-only (hidden on touch), text fields keep their caret, the native
  cursor is left alone if the script never runs, and reduced-motion turns off the
  smoothing rather than the cursor.

## 2026-08-05 — Login/entrance re-skin + real brand pulled from repo (Phase 3–4)

**Deliverables:** `index.html`, `style.css` (reskinned, committable) + `login_reskin_preview.html`

- Cloned the repo (`github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub`) and read the real entrance/login page. **Discovered the true cause of the colour mismatch:** the real brand is green (`#1b5e20`→`#43a047`, ink `#14321a`, white cards), not the warm look built for home/shopping.
- Found and adopted the **real logo** (`logo.png`, the farmer/harvest emblem) — placed in the home header as an emblem + wordmark lockup.
- **Decision:** keep the warm identity and re-skin the login to match (not vice-versa).
- Re-skinned `style.css` + `index.html` in place: warm `:root` (paper/ink/red/gold), red CTAs, Instrument-Serif headings + Inter body, golden-hour intro/hero, gold accent links. Structure, animation, and `script.js` untouched. Preview provided.

## 2026-08-05 — Customer home page, cinematic pass (Phase 3–4)

**Deliverable:** `farmershub_home_v3.html` (self-contained; all assets embedded)

- Built an immersive home page in the FarmersHub editorial identity (bone paper, deep ink, single brick-red accent, Instrument Serif + Inter).
- **Living crop field** — animated golden **wheat** (redrawn from the reference) that sways on a travelling wind; leaves lean away from the pointer and settle back. Sits behind content, does not affect readability.
- **Custom shovel cursor** — the user's shovel image as a buttery, tip-pinned cursor (lerped follow, tilt into motion, slight press on click). Reverted to the original full shovel at ~78px after trialling a click-to-reveal-soil variant.
- **Scroll flow** (technique vocabulary studied from epic.net, rebuilt originally) — three-depth hill parallax, header fade transparent→solid, section reveals, and an overlap panel that slides over the hero.
- **Cow portrait** — supplied photo, background removed via AI matting + edge de-halo, placed in the right of the statement panel with a grounding shadow; stacks below text on mobile.
- **Logo** — FarmersHub wordmark lifted from the supplied screenshot (transparent background) and placed in the header.
- Photo slots remain in the harvest strip and farms band for real farm imagery.

## 2026-08-05 — Customer shopping flow (Phase 3–4)

**Deliverable:** `farmershub_shopping_flow.html` + `design-spec_marketplace-detail-basket.md`

- Marketplace, product detail, and basket as one clickable flow with a shared live basket; KRW pricing; hand-drawn produce line-art signature; category filters; quantity steppers; empty/filled states.

## 2026-08-05 — Working model established (Phase 1)

**Deliverable:** `FarmersHub_SDLC_Working_Model.md`

- Adopted the 7-phase SDLC as the standing process; defined the team, per-phase deliverables, current status, and the documentation standard.

---

## Open / next

- **Blocker — login page:** need `login.html` + CSS (or raw URL) to lock one shared palette across login, home, and shopping and resolve the reported login→app colour mismatch.
- **Photos:** paste licensed farm image URLs to fill the harvest and farms slots.
- **Track B (backend):** paste source files for line-level review + the 10 deferred issues.
- **Track C (frontend audit):** provide raw GitHub blob URLs for `customer.html` / `main.js`.
- **QA (Phase 5):** click-through review of home + shopping, then integration into the multi-page frontend.
