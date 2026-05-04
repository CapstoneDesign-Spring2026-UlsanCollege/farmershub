# Farmers Hub

Farmers Hub is a web platform that connects farmers and customers through profiles, product listings, and post-based community updates.

## Features
- Authentication with role-aware access
- Farmer and customer user flows
- Product CRUD for farmers
- Farmer feed/posts with image uploads
- Profile management with avatar and cover uploads
- Dashboard-oriented frontend pages

## Tech Stack
- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: HTML, CSS, vanilla JavaScript (ES modules)
- Auth: JWT
- Deployment: GitHub Pages (frontend only)

## Key Folders
- backend/: API server and database logic
- backend/src/: runtime entrypoint location
- frontend/: static frontend app served on GitHub Pages
- docs/: project evidence and documentation
- archive/: old demos and test artifacts

## Local Setup
1. Backend setup:
   - cd backend
   - npm install
   - copy .env.example to .env and fill values
2. Run backend:
   - npm run dev
3. Frontend:
   - open frontend/index.html with a static server (Live Server recommended)

## Environment Variables
Set in backend/.env (do not commit real values):
- PORT
- MONGO_URI
- JWT_SECRET
- CLIENT_ORIGIN

## Frontend API Configuration
Frontend API base is centralized in:
- frontend/assets/js/config/api.config.js

Behavior:
- localhost/127.0.0.1 -> http://localhost:5000/api
- production -> window.FARMERSHUB_API_BASE override or configured fallback URL

## Deployment
- .github/workflows/deploy-pages.yml deploys only frontend/ to GitHub Pages.
- Backend must be deployed separately (Render/Railway or equivalent Node hosting).

## Testing
From backend/:
- npm test

If tests fail due environment or dependency mismatch, verify MongoDB connectivity and JWT env values.
