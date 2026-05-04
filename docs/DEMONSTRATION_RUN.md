# FarmersHub Demonstration Run

Date: 2026-05-04

## Environment

- Backend: Node.js + Express API on port `5000`
- Runtime mode used for demo: `USE_IN_MEMORY_DB=true`
- Frontend: static files from `farmershub/index.html`

## Start Application

1. Open terminal in `backend/`
2. Run:

```powershell
$env:USE_IN_MEMORY_DB='true'
npm.cmd start
```

Expected output includes:

- `FarmersHub API running on port 5000 (memory mode)`

## Demonstration Steps and Results

1. Register a new farmer

Request:

- `POST /api/auth/register`

Expected:

- `success: true`
- `token` returned
- `user.role = farmer`

Result:

- Passed

2. Login with same account

Request:

- `POST /api/auth/login`

Expected:

- `success: true`
- JWT token returned

Result:

- Passed

3. Load profile/dashboard identity

Request:

- `GET /api/users/me` with `Authorization: Bearer <token>`

Expected:

- User profile JSON returned

Result:

- Passed (`demo.farmer@example.com`)

4. Add product/crop

Request:

- `POST /api/products`

Expected:

- Product created with normalized fields

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