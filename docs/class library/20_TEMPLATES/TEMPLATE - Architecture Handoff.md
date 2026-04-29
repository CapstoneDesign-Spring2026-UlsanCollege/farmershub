# TEMPLATE - Architecture Handoff

> Save as `docs/ARCHITECTURE.md`.

## Project Overview

- FarmersHub is a web platform where users can create accounts, manage profiles, upload products/media, and use messaging-related UI flows.
- Frontend is static pages with JavaScript service modules.
- Backend is an Express API with route/controller/model structure.

## Main User Flow

1. User opens the live app and lands on the main page.
2. User logs in or creates an account.
3. User navigates to sell/product flow and uploads item/media data.
4. User views profile, product listings, and message/notification pages.

## System Parts

| Part | Purpose | Key files |
|---|---|---|
| Frontend | UI pages, form handling, API calls through service layer | `frontend/index.html`, `frontend/product.html`, `frontend/js/*.js` |
| Backend | API routes, controllers, auth, upload pipeline | `backend/server.js`, `backend/routes/*.js`, `backend/controllers/*.js` |
| Database | Persistent storage through backend models | `backend/models/*.js` |
| External APIs | Media URL/path transformation and deployment hosting | `backend/services/mediaUrlService.js`, GitHub Pages demo link |

## Important Files

| File/folder | What it does | Owner who can explain it |
|---|---|---|
| `frontend/js/api.config.js` | Central frontend API endpoint configuration | Sonam |
| `frontend/login/sell_crops.js` | Sell crops flow and upload-related UI behavior | Sonam |
| `backend/server.js` | Express server bootstrapping and route registration | Sonam |
| `backend/middleware/upload.js` | Upload middleware used in product/media flow | Sonam |

## Data Model / Main Objects

- User
- Profile
- Product
- Post
- Customer/Farmer role-specific data

## Risks / Known Weak Areas

- Environment mismatch between local backend URLs and live frontend hosting.
- Some UI pages exist but need stronger backend integration verification.
- Regression risk if service-layer paths are changed without smoke testing.

## AI-Assisted Areas

| Area | AI helped with | Human review evidence |
|---|---|---|
| Structure cleanup | Suggested folder reorganization and archive workflow | `CLEANUP_LOG.md`, cleanup commit review |
| Service flow alignment | Suggested script/path consistency improvements | Manual checks in frontend pages and Git history |

## How to Extend Safely

- Add new API endpoints only through `routes -> controllers -> models` pattern.
- Update frontend calls through `frontend/js/*Service.js` instead of direct fetch scattered in pages.
- Run smoke test on login, upload, profile, and product flows before merge.
