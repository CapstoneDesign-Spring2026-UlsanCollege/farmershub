# FarmersHub — Forward Engineering Plan

> **Phase:** 1 (Planning) — sets up Phases 2–6
> **Written:** 2026-08-07
> **Supersedes:** Section 4 and Section 6 of `FarmersHub_SDLC_Working_Model.md`
> **Context:** written immediately after the repository was reset to the design package.

---

## 1. Where the project actually stands

The working model's status table was written on 2026-08-05, before the reset. It is now out of date in one decisive way: **the repository no longer contains an application.**

| What exists | Where it lives |
|---|---|
| Editorial design system (paper/ink/red/gold, Instrument Serif + Inter) | `main` |
| Home page, shopping flow (marketplace → detail → basket) | `main` — `01-home/` |
| Entrance + login re-skin, self-contained | `main` — `02-entrance-login/`, `index.html` |
| Vector shovel cursor, shared across pages | `main` — `assets/` |
| Design spec, changelog, working model | `main` — `03-docs/` |
| **Express/Mongoose API, multi-page frontend, React entrance, Expo mobile app** | **Backup bundle only — not on GitHub** |

So the honest reading: **Phase 3 (Design) is the strongest part of this project and is nearly complete for the customer flow. Phase 4 (Development) is effectively at zero on `main`.** Tracks B and C in the working model are no longer actionable as written — they point at files that are not in the repository.

That is not a setback if the next move is chosen deliberately. The design work is the hard, differentiated part, and it survived intact.

---

## 2. The one decision that gates everything else

**Do we restore the old backend, or build a new one scoped to the design?**

**Option A — restore from the bundle.** Roughly 200 commits of working Express/Mongoose: auth, uploads, wallet, deliveries, admin and provider roles, a social feed.
*Cost:* it also restores the 10 deferred critical/medium issues, the duplicate auth middleware, the masked error handlers, and a product surface far wider than anything the design covers.

**Option B — build a minimal backend for the designed product.** Only what the three customer screens actually need: catalog, cart, orders, auth.

**Recommendation: Option B, mining A for reference.**

The reason is scope, not code quality. The old application served farmers, customers, providers and admins, with a wallet, delivery partners and a social feed. The design package describes a **single customer journey**: browse a marketplace, open a product, fill a basket, log in. Rebuilding only that is a small fraction of the work, is far easier to defend in a demo, and matches the identity the design already commits to. Keep the bundle as a reference implementation — the auth and upload code is worth reading before rewriting.

Everything below assumes Option B. If you prefer A, Milestones 2 and 3 change and the rest still holds.

---

## 3. Target architecture

```
client/                 Vite + React + TypeScript
  routes/               entrance · marketplace · product · basket
  components/           shared UI, shovel cursor
  styles/tokens.css     the design tokens, one source of truth
  lib/api.ts            typed fetch layer
server/                 Express + TypeScript
  routes/               /api/catalog · /api/cart · /api/orders · /api/auth
  models/               Product · Farm · Order · User
```

**Hosting:** GitHub Pages for the client, Render for the API, MongoDB Atlas for data — the arrangement that already worked for this project. Keep the API URL in a build-time env var; never hard-code `localhost` as a production fallback, which is exactly what broke the last deployment.

**Why React rather than staying static:** the basket is shared state across three screens. The design spec already prescribes the fix — *"lift `CATALOG` + `ART` into a shared `catalog.js`, split each `.view` into its page … swap the in-memory basket for the real cart source."* That is a component tree with shared state, described in longhand.

---

## 4. Milestones

Each milestone has an exit criterion, so "done" is not a judgement call.

### M0 — Secure the backup *(do this first, it is 20 minutes)*
The 139 MB bundle on one disk is currently the only copy of every prior commit. Put a second copy somewhere off the machine.
**Exit:** bundle exists in two physical locations; `git bundle verify` passes on the copy.

### M1 — Scaffold and port one screen
Vite + React + TS. Extract the design tokens into `styles/tokens.css`. Port the **marketplace** screen only, with the catalog as local typed data. Wire the shovel cursor as a component.
**Exit:** `npm run build` clean; marketplace renders at parity with `farmershub_shopping_flow.html`; Pages deploy is green.
*Note:* the current HTML files are 636 KB and 548 KB because assets are inlined. Extracting SVG line-art into components is most of this milestone's real work.

### M2 — Complete the customer flow client-side
Port product detail, basket and the entrance/login. Basket state in a shared store. Routing between views.
**Exit:** full market → detail → basket → login journey works from the built site, keyboard-accessible, `prefers-reduced-motion` honoured, responsive to 360 px.

### M3 — API and data
Express + TS, Atlas, seeded with real Ulsan/Nakdong-valley farms and produce from the design copy. Endpoints for catalog and orders. Client swaps local data for `lib/api.ts`.
**Exit:** catalog renders from the database; an order persists and is retrievable.

### M4 — Authentication
Real login behind the existing UI. Hashed passwords, JWT, sessions on the client. Read the old implementation first — the response-envelope mismatch that silently broke login last time is a documented trap.
**Exit:** register → log in → basket survives reload → log out.

### M5 — Test and harden
The first formal test plan. Cover auth, cart arithmetic, order placement, and the empty/error states the design specifies.
**Exit:** `docs/test-plan.md` written; tests run in CI on every push.

### M6 — Mobile via Capacitor *(optional, only if the capstone rewards it)*
Wrap the same client as an Android WebView app. No second codebase.
**Exit:** APK installs and completes the customer journey.

---

## 5. Documentation debt to clear

The working model commits to files that do not exist yet. In priority order:

1. `docs/requirements.md` — the SRS is still unwritten and Phase 2 is marked "mostly done" on the strength of an undocumented understanding. Write it before M3; it is what makes the API surface arguable rather than arbitrary.
2. `docs/architecture.md` — Section 3 above is the seed.
3. `docs/design-system.md` — the tokens table in the design spec, promoted to its own file.
4. `docs/backlog.md` — the milestones above, itemised.

Also: **the working model's Section 2 team table lists eight roles for a one-person project.** Rewrite it as the hats you wear per phase. A capstone reviewer will read that table literally.

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Bundle is the sole copy of all prior work | M0 — second off-machine copy |
| Rebuilding the backend runs past the capstone deadline | M1–M2 ship a complete, demoable client on their own; the API is additive |
| Design parity lost in the React port | Port one screen first (M1) and compare side by side before continuing |
| Production API URL misconfigured again | Build-time env var, and a smoke check that the deployed site is not calling `localhost` |
| Secrets committed | Root `.gitignore` now covers `.env` and `.private/`; keep it that way |

---

## 7. The next three actions

1. **Copy the backup bundle off this machine.** Nothing else matters if that file is lost.
2. **Decide Option A or B** (Section 2). Everything downstream branches here.
3. **Scaffold `client/` and port the marketplace screen** (M1).

---

*Phase 1 deliverable. Revisit at the end of each milestone and refresh Section 4 of the working model.*
