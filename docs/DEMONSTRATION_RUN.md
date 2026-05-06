# FarmersHub — Demonstration Run Guide

**Last updated:** 2026-05-04  
**Project:** FarmersHub — Connecting Farmers Directly with Consumers  
**Stack:** Node.js + Express backend · Vanilla JS frontend · MongoDB / in-memory mode

---

## 1. Prerequisites

| Tool | Required version |
|---|---|
| Node.js | v18 or later |
| npm | v8 or later |
| Browser | Any modern browser (Chrome, Edge, Firefox) |
| Live Server | VS Code extension (recommended for frontend) |

MongoDB is **not required** for the demo — use in-memory mode instead.

---

## 2. Start the Backend

Open a terminal and run:

```powershell
cd backend
npm install
copy .env.example .env
```

Edit `.env` and set:

```
PORT=5000
USE_IN_MEMORY_DB=true
JWT_SECRET=farmershub-demo-secret
CLIENT_ORIGIN=http://127.0.0.1:5500,http://localhost:5500
```

Then start the server:

```powershell
# Development (auto-restart on file change):
npm run dev

# Or production-style:
npm start
```

Expected terminal output:

```
FarmersHub API running on port 5000 (memory mode)
```

When `USE_IN_MEMORY_DB=true`, the server automatically seeds **2 demo farmers, 1 demo customer, and 6 demo product listings** so the app looks populated immediately.

---

## 3. Verify Backend Health

Open in browser or run in terminal:

```
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "inMemoryMode": true,
    "mongoConnected": false
  }
}
```

---

## 4. Open the Frontend

Open `farmershub/index.html` using **VS Code Live Server** (right-click → Open with Live Server).

- Default URL: `http://127.0.0.1:5500/farmershub/index.html`

The header will show a small **API Online (in-memory)** status badge in green when the backend is reachable, or **API Offline** in red if the backend is not running.

---

## 5. Demo Flow

### 5.1 Homepage

- The page loads with a **"Farmers near you"** section and a **Browse Products** section.
- Product listings from the backend appear immediately (6 seeded products).
- Use the **search bar** (top or in Browse Products) to filter by name.
- Use the **category dropdown** to filter by Vegetable / Fruit / Grain / General.

### 5.2 Register as a Farmer

1. Click **Login** in the top-right corner.
2. Click **"Need an account? Register"**.
3. Fill in all fields — select role **Farmer**.
4. Click **Create Account**.
5. You are now logged in as a Farmer. The button changes to **Logout**.

### 5.3 Login as a Farmer

1. Click **Login**.
2. Enter email and password.
3. Click **Login**.
4. Your profile is shown in the left sidebar under **Profile**.

### 5.4 Create a Product Listing (Farmer only)

1. Log in as a Farmer.
2. Click **Add Product** in the Browse Products toolbar.
3. Fill in: Name, Brand, Description, Category, Selling Price, Discount, Stock, Unit, Harvest Date.
4. Click **Save Product**.
5. Your product appears at the top of the listing.

### 5.5 Edit a Product (Farmer only)

1. Find your product in the listing.
2. Click **Edit** on your own product card.
3. Update fields and click **Save Product**.

### 5.6 Delete a Product (Farmer only)

1. Find your product.
2. Click **Delete** → confirm the dialog.
3. Product is removed from the listing.

### 5.7 Logout

1. Click **Logout** in the top-right corner.
2. Token is cleared from localStorage.
3. Edit/Delete buttons disappear from all product cards.

### 5.8 Register / Login as a Customer

1. Click **Login** → **Register**.
2. Select role **Customer**.
3. Fill in fields and create account.
4. Customers can browse and search products but cannot create/edit/delete them.
5. The **Add Product** button shows a message if clicked without farmer role.

### 5.9 Search Products

- Type in the **search bar** (top of page or in Browse Products section).
- Both bars are linked — typing in either searches products.
- Results filter in real-time by name, brand, or description.

### 5.10 View Profile

1. Click **Profile** in the left sidebar.
2. Your name, email, role, phone, and address are displayed.

---

## 6. Demo Seed Accounts (in-memory mode only)

These accounts are available automatically when `USE_IN_MEMORY_DB=true`:

| Role | Email | Password |
|---|---|---|
| Farmer | green.valley@farmershub.demo | Demo1234! |
| Farmer | sunny.acres@farmershub.demo | Demo1234! |
| Customer | demo.customer@farmershub.demo | Demo1234! |

---

## 7. API Endpoints Reference

| Method | Path | Auth required | Description |
|---|---|---|---|
| GET | /api/health | No | Server status check |
| POST | /api/auth/register | No | Register farmer or customer |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/users/me | Yes | Current user profile |
| GET | /api/users/farmers | No | List all farmers |
| GET | /api/users/customers | No | List all customers |
| GET | /api/products | No | List/search products |
| POST | /api/products | Yes (farmer) | Create product |
| PUT | /api/products/:id | Yes (owner) | Update product |
| DELETE | /api/products/:id | Yes (owner) | Delete product |

---

## 8. Run Tests

```powershell
cd backend
npm test
```

Tests use in-memory mode automatically (`USE_IN_MEMORY_DB=true` is set inside the test file).

Expected: all tests pass, covering health, auth, product CRUD, and search.

---

## 9. Troubleshooting

| Problem | Solution |
|---|---|
| API Offline badge showing | Backend is not running. Run `npm run dev` in `backend/` |
| CORS error in browser | Add `http://127.0.0.1:5500` to `CLIENT_ORIGIN` in `.env` |
| Wrong port | Ensure backend is on port 5000. Check `PORT=5000` in `.env` |
| Missing `.env` | Run `copy .env.example .env` and edit the file |
| MongoDB errors | Set `USE_IN_MEMORY_DB=true` in `.env` to skip MongoDB entirely |
| Products not loading | Check backend terminal for errors. Visit `/api/health` to confirm server is up |
| Login failing | Confirm you registered with the correct role. Email is case-insensitive |

---

## 10. Project Structure Summary

```
farmershub/           ← Frontend (open index.html in browser)
  index.html          ← Main app page
  app.js              ← All frontend logic (auth, products, search, UI)
  style.css           ← Styles (green/earth theme)

backend/              ← API server (Node.js + Express)
  server.js           ← Entry point, route mounting, DB connection
  store.js            ← Data access layer + in-memory fallback + seed data
  middleware/auth.js  ← JWT Bearer token verification
  models/             ← Mongoose schemas (Farmer, Customer, Product)
  routes/             ← auth.js, products.js, users.js
  tests/api.test.js   ← API tests (Node built-in test runner)
  .env.example        ← Environment variable template

docs/                 ← Project documentation
.github/workflows/    ← GitHub Actions (deploys frontend to GitHub Pages)
```

Result:

- Passed (`Demo Cabbage`)

5. Edit product

Request:

- `PUT /api/products/:id`

Expected:

- Updated product data returned

Result:

- Passed (`Demo Cabbage Premium`)

6. Search/filter product

Request:

- `GET /api/products?search=cabbage&category=Vegetable`

Expected:

- Matching list with count >= 1

Result:

- Passed (`SearchResultCount = 1`)

7. Delete product

Request:

- `DELETE /api/products/:id`

Expected:

- `success: true`

Result:

- Passed

8. Logout

Request:

- `POST /api/auth/logout`

Expected:

- `success: true`

Result:

- Passed

## Frontend Smoke Check

Validated in browser:

- `farmershub/index.html` loads
- Login/Register modal opens and submits to API
- Product list/search/filter UI renders
- Product add/edit/delete controls visible for farmer owner
- Demo mode launcher (`demo.html`) opens

## Notes

- Current run used in-memory mode for deterministic demo.
- To demo with MongoDB persistence, set valid `MONGO_URI` and run with `USE_IN_MEMORY_DB=false`.