# FarmersHub v2 — Engineered Rebuild Plan

> A clean rebuild of FarmersHub. Goal: a **strong, reactive, real** marketplace + community
> app for farmers and customers — without the bloat (virtual money, admin panel, 4th role,
> abandoned rewrites) that made v1 buggy and hard to maintain.

---

## Decisions & rationale

| Decision | Choice | Why |
|---|---|---|
| Frontend | **React + Vite + TypeScript** | "Reactive" = React. Vite = fast dev. TypeScript catches wrong shapes / typos / undefined fields at compile time — a whole class of v1 bugs gone. |
| Server state | **TanStack Query** | This *is* the reactive layer: caching, auto-refetch, loading/error states, optimistic updates. Manual `fetch` + `useState` is where v1 bugs bred. |
| Styling | **Tailwind CSS** | One system instead of 55 drifting CSS files. Consistency by default. |
| Forms / validation | **React Hook Form + Zod** | One Zod schema validates the form *and* (reused) the API body. Single source of truth. |
| Backend | **Express + Mongoose, rebuilt clean, TypeScript** | The v1 API already works and deploys on Render/Atlas. Keep the proven patterns (JWT, multer uploads); rewrite the structure clean. Not reinventing auth/deploy. |
| Auth | **JWT in an httpOnly cookie** | Kills the recurring "401 no token provided" bug — the browser sends the cookie automatically, so no frontend code can forget the header. |
| Database | **MongoDB Atlas** (keep) | Already provisioned and working. |
| Money | **Cash-on-Delivery orders, no virtual currency** | "Real, not fake." Real gateways (eSewa/Khalti) are a clearly-scoped later phase, not MVP. |
| Roles | **`farmer` + `customer` only** | Drop `provider` and `admin`. That 4th role + admin panel was the bulk of v1 bloat. |

### Two principles the whole plan obeys
1. **Vertical slices, not layers.** Build one feature *fully* (DB → API → tested → UI → working in browser) before starting the next. The app is shippable at the end of every phase. This is *the* rule that stops it becoming "bad" again.
2. **Backend-first within each slice.** The API contract is the source of truth; the UI consumes it. Build + test the endpoint, *then* build the UI against the real thing.

---

## Part A — Target architecture

```
farmershub/                  (rebuild branch, clean tree)
  server/                    Express + TS API  -> deploy: Render
    src/
      config/                env, db connection
      models/                Mongoose schemas
      modules/               feature-first: each feature owns route+controller+validation
        auth/  users/  products/  posts/  orders/
      middleware/            auth (verify cookie), error handler, upload (multer)
      lib/                   token, apiResponse, asyncHandler
      app.ts  server.ts
    uploads/                 (gitignored; Cloudinary later)
    tests/
  client/                    React + Vite + TS  -> deploy: static host
    src/
      app/                   router, providers (QueryClient, Auth)
      features/              mirrors server modules: auth/ products/ posts/ orders/
        <feature>/api.ts     typed query/mutation hooks (TanStack)
        <feature>/components
        <feature>/pages
      components/ui/         shared primitives (Button, Input, Card...)
      lib/                   axios instance, zod schemas, helpers
  shared/                    TS types shared by both (the API contract, in code)
```

**Why feature-first folders:** v1 scattered each feature across `routes/`, `controllers/`, `models/`, `services/`. When a feature lives in one folder per side, you change it in one place and can delete it cleanly.

**Why a `shared/` types folder:** request/response types are written once and imported by both sides. The frontend literally cannot send a wrong shape.

---

## Part B — Final data model (lean: 5 collections vs v1's 22)

- **User** — `email, passwordHash, role('farmer'|'customer'), fullName, phone, address, avatar{url}, coverImage{url}, bio, createdAt`
- **Product** — `owner->User, title, description, category, price, unit, quantityAvailable, images[{url}], isActive, createdAt`
- **Post** — `author->User, text, images[{url}], likes[->User], createdAt`
- **Comment** *(optional v1)* — `post->Post, author->User, text, createdAt`
- **Order** *(v2)* — `customer->User, items[{product, qty, priceAtPurchase}], status('pending'|'confirmed'|'fulfilled'|'cancelled'), deliveryAddress, paymentMethod('cod'), createdAt`

**No wallet / transaction / recharge** — that was the fake-money engine. Orders carry a price and a COD status; nothing simulates a bank.

---

## Part C — API & error conventions (decide once)

- All responses: `{ success: boolean, message: string, data?: T }`.
- Auth: cookie `token` (httpOnly, SameSite, Secure in prod). `protect` middleware reads it.
- Validation: every write endpoint validated with Zod **before** the controller. Invalid -> `400` with field errors.
- One central `errorHandler`; controllers `throw`, never `try/catch` + `res.json` by hand. Wrap async handlers so rejections always reach it.
- **Why:** a uniform shape means the frontend has one way to read success/error. Half of v1's UI bugs were inconsistent response handling.

---

## Part D — Phased delivery

### Phase 0 — Foundation & guardrails (~half day)
**Goal:** an empty repo that runs, lints, and deploys "hello world" on both ends.

- **Branch first:** create the rebuild branch so all v1 code stays as backup. *Reversible.*
- **Backend:** init `server/` with TS, Express, Mongoose, helmet, cors(credentials), cookie-parser, the `{success,message,data}` helper, `errorHandler`, `asyncHandler`, `/api/health`. Connect to Atlas. Run it.
- **Frontend:** scaffold `client/` (Vite+React+TS, Tailwind, React Router, `QueryClientProvider`, one axios instance with `withCredentials: true`). Render a shell that calls `/api/health` and shows "API: healthy".
- **Why first:** proves cookie/CORS/deploy wiring on the simplest possible call. Debug the plumbing once, here.
- **DoD:** health shows green in the browser; both apps run with one command; lint passes.

### Phase 1 — Auth (backend, then frontend)
**Goal:** register, login, logout, "who am I", protected routes.

- **Backend (build + test before any UI):**
  1. `User` model with bcrypt `passwordHash`, unique email.
  2. `auth` module: `POST /register`, `POST /login` (sets httpOnly cookie), `POST /logout` (clears cookie), `GET /me`.
  3. `protect` middleware: read cookie -> verify JWT -> attach `req.user`.
  4. Zod schemas for register/login.
  5. **Test with curl / REST client** — cookie set, `/me` works with it, 401 without it.
- **Frontend:**
  1. `AuthProvider` backed by a TanStack `useMe()` hook — single source of "is logged in."
  2. Login & Register pages (RHF + Zod, reusing shared schema).
  3. `useLogin`/`useRegister`/`useLogout` mutations that invalidate `useMe()` on success -> UI reacts.
  4. `<ProtectedRoute>` redirecting anonymous users to `/login`.
- **Why backend-first here especially:** a flaky auth layer makes every later feature look broken.
- **DoD:** register, refresh and stay logged in, log out, protected pages bounce anonymous users.

### Phase 2 — Profiles & image upload
**Goal:** view/edit own profile, upload avatar + cover; view others' public profiles.

- **Backend:** `users` module — `GET /users/:id` (public), `PATCH /users/me`, `POST /users/me/avatar` + `/cover` via multer; serve `/uploads` statically; validate file type/size. *Upload as its own middleware: reused by products and posts.*
- **Frontend:** Profile page (own = editable), an `ImageUploader` used everywhere later, mutations that optimistically update the cached profile.
- **Why now:** uploads are the second-trickiest plumbing after auth. Prove it before products/posts depend on it.
- **DoD:** edit profile + upload avatar; persists after refresh; another account sees your public profile.

### Phase 3 — Products marketplace (the core)
**Goal:** farmers CRUD listings with images; customers browse/search/filter/view detail.

- **Backend (contract first):** `products` module — `GET /products` (search, category, page), `GET /products/:id`, `POST /products` (farmer only), `PATCH /:id`, `DELETE /:id` (owner only). Ownership + role checks in middleware. **Pagination from day one** — retrofitting it later breaks every list UI.
- **Frontend:**
  - Customer: marketplace grid (`useProducts` with filters as query keys -> changing a filter auto-refetches), product detail page.
  - Farmer: "my listings" page, create/edit form (reuse `ImageUploader`), delete with optimistic removal + confirm.
- **Why the centerpiece:** it's the actual product; everything before made it safe to build.
- **DoD:** farmer creates a listing with photos -> appears in customer marketplace; search/filter/pagination work; only owner edits/deletes.

### Phase 4 — Social feed
**Goal:** create posts with images, like/unlike, comment (optional), delete own.

- **Backend:** `posts` module — `GET /posts` (paginated), `POST /posts`, `POST /:id/like` (toggle), `DELETE /:id` (author only); optional comments sub-resource.
- **Frontend:** feed page, composer (reuse uploader), like button with **optimistic toggle** (instant UI, rollback on error), delete own post.
- **DoD:** new post appears at top instantly; like count updates without full refetch; non-authors can't delete.

### Phase 5 — Messaging + Notifications (v2 — after 1-4 are solid)
- **Backend:** `Message`/`Conversation` models; REST first (`GET /conversations`, `GET /messages/:id`, `POST /messages`). Notifications created server-side on key events.
- **Frontend:** start with **polling** (`refetchInterval`). Upgrade to WebSocket (Socket.IO) *only if* polling feels slow. *Don't pay WebSocket complexity until the simple version proves insufficient.*
- **DoD:** two accounts chat; unread badge updates; notifications reflect real events.

### Phase 6 — Orders (real, Cash-on-Delivery) (v2)
- **Backend:** `orders` module — `POST /orders` (from cart, snapshots price), `GET /orders` (mine), `PATCH /orders/:id/status` (farmer advances pending->confirmed->fulfilled). Decrement `quantityAvailable` on confirm. **No wallet — payment is COD.**
- **Frontend:** cart (client state via Zustand), checkout with delivery address, order history with live status.
- **DoD:** customer places a COD order; farmer advances status; stock decrements; nothing references fake money.
- **Later (explicit, not now):** real gateway (eSewa/Khalti) as its own isolated phase behind the order flow.

### Phase 7 — Hardening & deploy
- Rate limiting (kept from v1 — it was sound), input limits, secure cookie flags in prod, CORS locked to the real origin.
- Backend tests (Jest + supertest) for auth + products + orders happy/sad paths.
- Frontend: error boundaries, empty/loading states everywhere, 404 page.
- Deploy: `client/` -> static host, `server/` -> Render (reuse the working `render.yaml` pattern). Verify live (live files + hard refresh).
- **DoD:** green health check in prod; login works cross-origin with cookies; core flows pass on the deployed site.

---

## Part E — The frontend <-> backend rhythm

For **every** feature, in this order:
1. **Backend** — model, then endpoint + validation, then **test with curl/Postman**. Don't open the React file yet.
2. **Shared types** — add/confirm the request + response type in `shared/`.
3. **Frontend** — typed TanStack hook (`api.ts`) against the *real, tested* endpoint, then components/pages, then verify in the browser.
4. **Stop** — don't start the next feature until this one works end-to-end in the browser.

**Why this order:** UI built before the API gets thrown away when the shape differs. Testing the endpoint alone means a misbehaving UI is provably a UI bug. That discipline is what separates "strong app" from "too many bugs."

---

## Definition of "strong, reactive, real"
- **Strong:** TypeScript end-to-end, Zod validation, uniform API shape, tests on critical paths, one central error handler.
- **Reactive:** TanStack Query everywhere — caching, auto-refetch, optimistic updates; UI derives from server state, never hand-synced.
- **Real:** real auth (httpOnly JWT), real persisted data, real uploads, real COD orders. No virtual money, no fake balances.
