# Design Spec — Marketplace · Product Detail · Basket

> **Phase:** 3 (Design) → carried into 4 (Development)
> **Owners:** UX + FE · **Reviewed by:** Arch
> **Screens:** customer marketplace, product detail, basket
> **Deliverable file:** `farmershub_shopping_flow.html`
> **Date:** 2026-08-05

---

## 1. Direction

These three screens extend the **existing approved home-screen identity** — they do not introduce a new look. Consistency across the customer flow was the governing constraint.

**Design tokens**

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F1EBDC` | Page background (bone) |
| `--card` | `#F6F1E6` | Product cards, panels |
| `--ink` | `#1B1915` | Text, primary buttons, line-art |
| `--red` | `#BE3A2B` | Single accent — price, active state, hero CTA |
| `--line` | `rgba(27,25,21,.15)` | Hairline dividers |
| Display | Instrument Serif | Headlines, product names, prices |
| Body/UI | Inter | Everything functional |

**Signature element:** hand-drawn produce line-art (ink strokes, red accents) that recurs at three scales — catalog thumbnail → product hero → basket thumbnail. It is the one memorable, unmistakably-FarmersHub device; everything around it stays quiet.

**Currency:** KRW (`₩`, `ko-KR` locale). **Copy:** written for a real Ulsan/Nakdong-valley farm-direct market — named farms, real produce, plain active-voice labels ("Add to basket", "Go to checkout").

---

## 2. Screen specs

### Marketplace
- Editorial hero: seasonal eyebrow + serif headline + one-line value statement.
- Category filter row (All / Vegetables / Fruit / Dairy & eggs) with a red underline on the active tab. **No decorative 01/02 numbering** — a catalog is not a sequence.
- 4-col product grid (3 at ≤1000px, 2 at ≤680px) on a hairline lattice. Each card: line-art, category, name, farm, price+unit, **Add** button.
- Interactions: card hover lifts the art and draws a red underline under the name; **Add** gives inline "Added ✓" feedback and pulses the header count.

### Product detail
- Two-column split (stacks on mobile): square hero panel with the line-art + "Farm direct" badge on the left; info column on the right.
- Info: category eyebrow → serif product name → farm line → price (rule-bracketed) → description → quantity stepper + red **Add to basket** button showing the live line total → "About the farm" note.

### Basket
- Line items on a hairline list: thumbnail, name, farm + unit price, quantity stepper, remove, right-aligned line total.
- Sticky **Order summary** rail: subtotal, delivery (free over ₩30,000), red serif total, checkout button, and a "add ₩X more for free delivery" hint.
- **Empty state** is directional, not decorative: line-art + "Your basket is empty" + a "Browse the market →" link.

---

## 3. Shared behaviour
- One in-memory basket object drives all three screens; header count, basket view, and totals stay in sync. (No `localStorage` — matches the artifact sandbox and keeps state explicit.)
- The demo routes between views client-side so the full **market → detail → basket** flow is clickable in one file.

## 4. Quality floor
- Responsive to mobile (2-col grid, stacked detail/basket, hidden secondary nav).
- Visible keyboard focus (red outline), `aria-label`s on icon buttons, `prefers-reduced-motion` disables all animation.
- Motion is restrained and purposeful — view rise, hover micro-interactions, add feedback, count pulse — nothing ambient.

## 5. Integration note (for FE, next cycle)
This is delivered as one self-contained demo. To fold into the real multi-page frontend: lift `CATALOG` + `ART` into a shared `data.js`/`catalog.js`, split each `.view` into its page (`marketplace.html`, `product.html`, `basket.html`), and swap the in-memory `basket` for the real cart source (backend cart endpoint or persisted store). Design tokens should move into a shared `:root` stylesheet reused across all customer pages.

---

*Phase 3 deliverable complete. Home + these three screens now share one system.*
