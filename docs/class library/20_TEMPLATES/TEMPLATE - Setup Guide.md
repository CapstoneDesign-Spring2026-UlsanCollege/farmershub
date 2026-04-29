# TEMPLATE - Setup Guide

> Save as `docs/SETUP.md`.

## Project

- FarmersHub (Frontend + Node.js/Express Backend)

## Requirements

- Node / Python / Java version: Node.js 18+ recommended
- Database: MongoDB (as configured in backend env)
- API keys: None required for basic local run (use local env values)
- Other tools: Git, VS Code, modern browser

## Install

```bash
cd backend
npm install
```

## Environment Variables

Create `.env`:

```txt
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Do not commit real secrets.

## Run Locally

```bash
cd backend
npm start
```

Open frontend using static hosting or VS Code Live Server:

```bash
# from project root
# open frontend/index.html in browser
```

## Test

```bash
# manual smoke checks
# 1) login/create account UI
# 2) upload flow
# 3) profile/product/message page navigation
```

## Common Problems

| Problem | Fix |
|---|---|
| Backend not starting | Check `.env` values and MongoDB availability |
| Upload/login API errors | Verify `frontend/js/api.config.js` and backend server status |
| CORS/network issue | Ensure backend is running on expected host/port |

## Demo Account / Seed Data

- Use seeded or manually created local test account.
- Optional: run seed script if available (`backend/seed.js`).

## Last Verified

- Date: 4/29/2026
- Verified by: Sonam
