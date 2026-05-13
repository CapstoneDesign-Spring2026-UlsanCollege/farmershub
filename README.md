# FarmersHub

FarmersHub is a marketplace and community web app connecting farmers and customers through product listings, profile pages, and social-style posts.

## Project Structure
- `frontend/`: static client app for GitHub Pages
- `backend/`: Express API, auth, MongoDB models, upload handling
- `backend/uploads/`: local uploaded media files (ignored in git except `.gitkeep`)
- `docs/`: supporting project documentation
- `archive/`: archived/legacy files and experiments

## Feature Scope
- Auth: register/login/current user with JWT
- Profiles: profile data, avatar upload, cover upload
- Products: listing and CRUD with image upload
- Posts: post creation, image upload, like/delete flow

## Auth And Upload Separation
- Auth/login data is handled by `User` model and auth routes/controllers.
- Upload-related media is stored under `backend/uploads/` and referenced from profile/product/post records.
- Upload and auth logic are separated by middleware/routes/controllers, even when they use the same MongoDB connection.

## Local Development Setup

### 1) Backend setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env`
4. Update values (at minimum `JWT_SECRET` for your environment)

### 2) Run backend
1. `npm run dev`
2. API health: `http://localhost:5000/api/health`

### 3) Run frontend
Option A (recommended for this repo):
1. Keep backend running.
2. Open `http://localhost:5000/index.html`.

Option B (static server):
1. Serve `frontend/` with a static server.
2. Ensure backend is running.
3. Set `window.FARMERSHUB_API_BASE` to your API URL if needed.

## Environment Variables
Defined in `backend/.env.example`:
- `PORT`: backend port
- `MONGO_URI`: main MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `CLIENT_ORIGIN`: comma-separated allowed frontend origins

Never commit real secrets in git.

## MongoDB Notes
- Local default: `mongodb://localhost:27017/farmershub`
- Upload metadata is persisted in profile/product/post documents, separate from auth credentials in user auth fields.

## Upload Feature Notes
- Upload middleware: `backend/middleware/upload.js`
- Upload-enabled routes:
  - profile avatar/cover in `backend/routes/users.routes.js`
  - product images in `backend/routes/products.routes.js`
  - post images in `backend/routes/posts.routes.js`

## Production Deployment

### Backend Deployment
1. Deploy to a Node.js hosting service (e.g., Render, Railway, Vercel, Heroku).
2. Set environment variables in the hosting dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `CLIENT_ORIGIN`: Your deployed frontend URL (e.g., https://yourusername.github.io/farmershub)
   - `PORT`: As provided by the hosting service (or 5000)
   - `NODE_ENV`: production
3. Ensure the hosting service supports persistent file storage or migrate uploads to cloud storage (e.g., Cloudinary, AWS S3).

### Frontend Deployment
1. Deploy `frontend/` folder to static hosting (e.g., GitHub Pages, Vercel, Netlify).
2. If the API base is not the same origin, set `window.FARMERSHUB_API_BASE` in the HTML or via a script tag:
   ```html
   <script>
     window.FARMERSHUB_API_BASE = 'https://your-backend-domain.com/api';
   </script>
   ```
3. For GitHub Pages, use a custom domain or set the API base accordingly.

### MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster.
2. Whitelist your backend's IP (or 0.0.0.0/0 for testing).
3. Create a database user with read/write access.
4. Use the connection string in `MONGO_URI`.

## Frontend API Configuration For Online Deployment
Main config file:
- `frontend/assets/js/config/api.config.js`

Resolution order:
1. `window.FARMERSHUB_API_BASE` (runtime override)
2. Localhost fallback for local development
3. Same-origin `/api` fallback for deployed static frontend

For production, set `window.FARMERSHUB_API_BASE` to your deployed backend URL (for example Render/Railway/Fly).

## Backend Hosting Limitation On GitHub Pages
GitHub Pages hosts static files only.
- Frontend can be hosted on Pages.
- Backend API must be hosted separately (Render, Railway, Fly.io, Azure, etc.).

## Live Demo Placeholder
- Frontend (GitHub Pages): `https://<your-username>.github.io/<repo-name>/`
- Backend API: `<your-backend-base-url>`

## Scripts
From `backend/`:
- `npm run dev` - development server
- `npm run start` - production start
- `npm run seed` - demo data seed
- `npm run test` - test suite
