# AI Code Ownership

## 1) Team + Project

- **Team:** FarmersHub Team
- **Project name:** FarmersHub
- **Current repo:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub
- **Current demo link:** https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/
- **Date updated:** 4/29/2026

## 2) What Our App Currently Does

- Feature / flow 1: User login and account creation flow is available.
- Feature / flow 2: Farmer profile pages and profile updates are implemented.
- Feature / flow 3: Product upload and listing flow is available.
- Feature / flow 4: Messaging and notifications pages are available in frontend.

### Current MVP flow

Our main user can:

1. Open the live site and navigate key pages.
2. Login or create an account from the auth flow.
3. Upload product/media from sell crops or product flow.
4. View profiles, products, and message page UI.

## 3) What Works Right Now

| Working item | Evidence link | Owner who can explain it |
|---|---|---|
| Live site is deployed and accessible | https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/ | Sonam |
| Login and account UI flow | Live create account page screenshot attached on 4/29/2026 + `frontend/login/login.html`, `frontend/login/createAccount.html`, `frontend/login/login.js` | Sonam |
| Product upload UI and page flow | `frontend/login/sell_crops.html`, `frontend/login/sell_crops.js`, `frontend/product.html` | Sonam |
| Backend auth and route structure exists | MongoDB Compass screenshot showing saved farmer records + `backend/routes/auth.js`, `backend/controllers/profileController.js`, `backend/server.js` | Sonam |

## 4) Code We Understand

| Code area | File / folder | What it does | Who can explain it? | Evidence |
|---|---|---|---|---|
| Frontend routing and page structure | `frontend/` | Main pages and navigation flow for product/profile/login/message | Sonam | `frontend/index.html`, `frontend/product.html`, `frontend/profile.html` |
| Frontend service layer | `frontend/js/` | API configuration and service wrappers for auth, users, products, posts, profile | Sonam | `frontend/js/api.config.js`, `frontend/js/authService.js` |
| Backend API setup | `backend/server.js`, `backend/routes/` | Express app, route mounting, endpoint organization | Sonam | `backend/server.js`, `backend/routes/products.js` |
| Upload handling | `backend/middleware/upload.js`, `backend/controllers/productController.js` | File upload middleware and product upload handling | Sonam | `backend/middleware/upload.js` |

## 5) Code We Do NOT Fully Understand Yet

| Code area | What is confusing? | Risk level | Owner | Next step |
|---|---|---|---|---|
| Production/deployment behavior vs local API calls | Some frontend flows depend on backend availability and environment URLs | High | Sonam | Verify `frontend/js/api.config.js`, document production API strategy |
| Incomplete edge-case validation | Some forms and route error states are not fully validated end to end | Medium | Sonam | Add test checklist and negative test cases in Sprint packet |
| Messaging backend linkage | Message UI exists, but full backend integration status needs verification | Medium | Sonam | Trace message endpoints and test with seeded data |

## 6) AI-Assisted Work

| Area | AI tool used | What AI helped with | What humans checked/changed | Evidence |
|---|---|---|---|---|
| Project cleanup and file organization | GitHub Copilot | Proposed archive flow, branching flow, and folder organization | Human verified moved files, preserved code behavior, reviewed `CLEANUP_LOG.md` | `CLEANUP_LOG.md`, commit `d680ed4` |
| Frontend/backend refactor support | GitHub Copilot | Suggested service-layer alignment and path fixes | Human reviewed pages and kept working flows before push | Commit history and changed files in `frontend/` |
| Documentation organization | GitHub Copilot | Structured docs into `docs/class library/` | Human verified matching class library layout and pushed branch | commit `7709c32` |

## Screenshot Evidence Added

### 1) Live Create Account Page Evidence

- Evidence type: Browser screenshot
- Source: Live deployed site
- Link used in audit: https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/login/createAccount.html
- What it shows: The create account page is publicly deployed and the farmer signup form renders with fields for full name, email, password, age, gender, address, contact number, and payment method.
- Why it matters: Confirms the signup UI is live and supports the ownership claims in sections 2 and 3.

### 2) Database Record Evidence

- Evidence type: MongoDB Compass screenshot
- Source: Local database view
- What it shows: Records exist in the `farmers` collection, including saved email, full name, age, gender, address, contact, payment method, and timestamps.
- Why it matters: Confirms account-related data is being persisted in the database and supports the claim that the backend auth/data flow exists.

## 7) Bugs / Unreliable Features

| Bug / problem | Severity | Evidence link | Owner | Next action |
|---|---|---|---|---|
| Backend-dependent flows may fail when server is not running | P1 | `frontend/js/api.config.js`, manual testing on live vs local | Sonam | Add clear fallback message and environment handling |
| Upload and media display consistency across pages needs retest | P2 | `frontend/login/sell_crops.js`, `backend/services/mediaUrlService.js` | Sonam | Run upload regression checklist and log findings |
| Some pages are UI-complete but integration status not fully documented | P2 | `frontend/notifications.html`, `frontend/Message/messages.html` | Sonam | Add integration status table in weekly sprint packet |

## 8) Risk List

| Risk | Why it matters | Mitigation | Owner |
|---|---|---|---|
| API endpoint mismatch between environments | Can break login/upload in production | Centralize base URL strategy and verify all service files | Sonam |
| Unclear ownership for some modules | Slows debugging and demo confidence | Maintain this audit weekly and assign explicit owners per module | Sonam |
| Limited automated test coverage | Regressions can slip into demo branch | Add lightweight smoke test checklist for critical user flows | Sonam |

## 9) Team Ownership Map

| Student | Owned area | Can explain? | Evidence link | Needs help with |
|---|---|---|---|---|
| Sonam | Frontend flow, upload flow, deployment checks, docs cleanup | Clear | `frontend/`, `backend/routes/`, `CLEANUP_LOG.md`, live demo link | Full end-to-end test automation and message integration verification |

## 10) Top 3 Stabilization Goals

1. Verify and document all core MVP paths on live site and local backend.
2. Resolve P1/P2 integration gaps and produce evidence links for each fix.
3. Ensure each owned module has a clear human explanation and test receipt.

## 11) Definition of Done for Sprint 3

- [x] Core MVP flow works.
- [x] Core MVP flow has evidence.
- [x] P0 bugs are fixed or clearly documented.
- [ ] Every member can explain one code/doc/test area.
- [x] AI-assisted work has been reviewed by humans.
- [ ] Weekly Sprint Packet links this audit.