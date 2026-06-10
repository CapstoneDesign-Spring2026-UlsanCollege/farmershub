# Setup and Run Guide

## Required Software

- Git
- Node.js 18 or newer and npm
- Access to the team's private MongoDB Atlas database
- A modern browser

## Clone

```powershell
git clone https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub.git
cd farmershub
```

## Backend Setup

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Edit `backend/.env` privately. Never commit it.

```dotenv
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/farmershub?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5000
ADMIN_EMAIL=sonam@gmail.com
ADMIN_PASSWORD=replace-with-a-strong-private-password
ADMIN_NAME=FarmersHub Administrator
```

The admin variables are optional for the core farmer/customer app. Without them, the server starts but does not create or recognize a configured admin account.

## Run

```powershell
cd backend
npm start
```

Then open:

- App served by the backend in development: `http://localhost:5000/index.html`
- API health: `http://localhost:5000/api/health`

`npm run dev` starts `backend/src/server.js` through nodemon.

## Demo Seed Data

```powershell
cd backend
npm run seed
```

The seed script clears and recreates its intentional local demo accounts and sample product/post data. Run it only against a database where replacing those demo records is safe.

## Tests

```powershell
cd backend
npm test -- --runInBand
```

As of June 10, 2026, the three existing API tests fail because they target an older in-memory response/data path and do not match the current MongoDB-backed app. See the [QA report](../05-qa-and-stabilization/QA_REPORT.md). There is no tracked build step for the static `frontend/`.

## Common Errors

| Error | Likely cause | Fix |
|---|---|---|
| MongoDB connection failure | `MONGO_URI` is missing/incorrect or Atlas access is blocked | Set the valid private Atlas URI and verify database network access |
| `401` on protected API | Missing/expired JWT | Log in again and confirm the frontend/API base |
| CORS error | Frontend origin is absent from `CLIENT_ORIGIN` | Add the exact origin, comma-separated |
| Upload missing after redeploy | Local upload storage is ephemeral | Use local demo evidence or migrate to persistent object storage |
| Admin access unavailable | Admin environment variables are not configured | Set private `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then restart |
| Live API responds slowly | Render cold start/network delay | Wait, retry health endpoint, or use local fallback |

## Deployment Notes

The GitHub Pages workflow deploys `frontend/`. The frontend API configuration currently points to the Render API. Production secrets belong in the backend hosting dashboard, never in frontend files or git.
