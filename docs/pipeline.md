# Project Pipeline Documentation

## 1. Project Overview

- **Project name:** FarmersHub
- **Purpose and problem it solves:**
  - FarmersHub is a digital platform connecting local farmers directly with consumers, streamlining the process of buying and selling agricultural products. It addresses the inefficiency and lack of transparency in traditional agricultural supply chains by providing a user-friendly marketplace for both parties.
- **Target users:**
  - Local farmers seeking to sell their produce
  - Consumers looking to buy fresh farm products directly
  - (Future) Admins for platform management
- **Key features and functionalities:**
  - User authentication (farmer/customer roles)
  - Farmer and customer profile management
  - Product listing and browsing
  - Order placement and management (planned)
  - Messaging and notifications (planned)
  - Dashboard for user data
  - Secure password handling (bcrypt)

## 2. Technology Stack

| Layer      | Technology        |
|------------|-------------------|
| Frontend   | HTML, CSS, JavaScript (Vanilla) |
| Backend    | Node.js + Express |
| Database   | MongoDB (Mongoose ODM) |
| Auth       | Role-based, bcrypt password hashing |
| Dev Tools  | VS Code, Git, GitHub |

- **Frontend:**
  - HTML/CSS/JS (no framework yet, React planned)
  - Responsive design, modular CSS
- **Backend:**
  - Express.js REST API
  - Mongoose for MongoDB
  - CORS, JSON parsing
- **Database:**
  - MongoDB (local, planned for cloud)
  - Schemas: Farmer, Customer, User
- **APIs:**
  - Internal REST endpoints for auth, user listing
- **Dev Environment:**
  - VS Code, GitHub, MongoDB Compass

## 3. Complete File & Folder Structure

```
farmershub/
├── backend/
│   ├── databases/           # (empty, placeholder)
│   ├── models/
│   │   ├── Customer.js      # Customer schema/model
│   │   ├── Farmer.js        # Farmer schema/model
│   │   └── User.js          # Base user schema/model
│   ├── node_modules/        # Backend dependencies
│   ├── package.json         # Backend dependencies/config
│   ├── routes/
│   │   ├── auth.js          # Auth/signup/login routes
│   │   └── users.js         # User listing routes
│   └── server.js            # Express server entry point
├── docs/
│   ├── architecturesketch.md
│   ├── backup-demoidea.md
│   ├── Design Docv1.md
│   ├── futurestep.md
│   ├── project_idea_pitch_issue.md
│   ├── questions.md
│   ├── sprint-packets/
│   │   └── SPRINT_1.md/
│   │       ├── weekly Sprint packet-week 1.md
│   │       ├── ...
│   ├── sprints/
│   ├── TEAM_AGREEMENT .md
│   ├── testing-checkingplan.md
│   ├── week-1 - Retro Issue.md
│   ├── week-1_sprint_packet_issue.md
│   ├── weekly-sprint-packets/
│   │   ├── weekly Sprint packet-week 1.md
│   │   ├── ...
│   ├── week_1 - Risk Blocker Issue.md
│   ├── week_1-Bug Issue.md
│   └── wireframes.md
├── frontend/
│   ├── farmer-profile.css
│   ├── farmers-profile.css
│   ├── farmers-profile.html
│   ├── Home/
│   │   ├── Aboutus.html
│   │   ├── home.css
│   │   ├── home.html
│   │   └── home.js
│   ├── index.html
│   ├── login/
│   │   ├── createAccount.css
│   │   ├── createAccount.html
│   │   ├── createAccount.js
│   │   ├── dashboard.css
│   │   ├── dashboard.html
│   │   ├── dashboard.js
│   │   ├── login.css
│   │   ├── login.html
│   │   ├── login.js
│   │   ├── sell_crops.css
│   │   ├── sell_crops.html
│   │   └── sell_crops.js
│   ├── logo.png
│   ├── messages.html
│   ├── notifications.html
│   ├── product.css
│   ├── product.html
│   ├── profile.css
│   ├── profile.html
│   ├── profile.js
│   └── style.css
└── ...
```

### File/Folder Purposes & Dependencies

- **backend/**: Node.js server, API, DB models, routes
  - **models/**: Mongoose schemas for Farmer, Customer, User (used by routes)
  - **routes/**: Express routers for authentication and user listing
  - **server.js**: Main server, connects all backend modules
- **frontend/**: Static HTML/CSS/JS for UI
  - **Home/**: Home page and assets
  - **login/**: Login, signup, dashboard, and related assets
  - **profile.html/js/css**: User profile page and logic
- **docs/**: All documentation, design, sprints, wireframes

## 4. System Architecture

- **Pattern:** Layered MVC (Model-View-Controller)
- **Data Flow:**
  - UI (frontend) → REST API (backend) → MongoDB (database)
  - Auth, profile, and user data flow via JSON
- **Component Interaction Diagram:**

```mermaid
graph TD
  A[Frontend (HTML/CSS/JS)] -- REST API --> B[Express Backend]
  B -- Mongoose ODM --> C[MongoDB]
  B -- Auth Routes --> D[Auth Controller]
  B -- User Routes --> E[User Controller]
  D -- Farmer Model --> F[Farmer Collection]
  D -- Customer Model --> G[Customer Collection]
  E -- Farmer Model --> F
  E -- Customer Model --> G
```

## 5. Frontend/UI Breakdown

### Home Page
- **File:** frontend/index.html
- **UI Elements:**
  - Logo, header, login button
  - Search bar
  - Sidebar navigation (Profile, Messages, Notifications)
  - Farmers near you (profile cards)
- **User Interactions:**
  - Navigation via sidebar
  - Search input (future: triggers search)
- **State Management:**
  - None (static)

### Login Page
- **File:** frontend/login/login.html
- **UI Elements:**
  - Email, password fields
  - Role selection (Farmer/Customer)
  - Login button
- **User Interactions:**
  - Form submission triggers login.js
  - Shows error/success messages
- **State Management:**
  - Stores login state in localStorage

### Create Account Page
- **File:** frontend/login/createAccount.html
- **UI Elements:**
  - All profile fields: Name, Email, Password, Confirm Password, Age, Gender, Address, Contact, Payment Method
  - Role selection
  - Signup button
- **User Interactions:**
  - Form validation (required fields, password match, age >= 16)
  - On success, redirects to login
- **State Management:**
  - None (static)

### Profile Page
- **File:** frontend/profile.html, profile.js
- **UI Elements:**
  - Profile details (name, role, location, bio, phone, farm name, products)
  - Edit profile modal
  - Logout button
- **User Interactions:**
  - Edit/save profile (localStorage)
  - Logout
- **State Management:**
  - Profile data in localStorage

### Dashboard
- **File:** frontend/login/dashboard.html, dashboard.js
- **UI Elements:**
  - Tabs for Farmers/Customers
  - Tables listing all registered users
- **User Interactions:**
  - Tab switching
  - Data loaded from backend API
- **State Management:**
  - None (data fetched on load)

## 6. Backend Architecture

- **API Endpoints:**
  - POST /api/auth/signup — Register new user (farmer/customer)
  - POST /api/auth/login — Login user
  - GET /api/users/farmers — List all farmers
  - GET /api/users/customers — List all customers
- **Controllers/Services:**
  - Logic is in route handlers (auth.js, users.js)
  - Models: Farmer, Customer, User (Mongoose)
- **Business Logic Flow:**
  - Signup: Validate input → Check for existing user → Hash password → Save user
  - Login: Validate input → Find user by role/email → Compare password
  - User listing: Fetch all users by role, exclude password
- **Authentication/Authorization:**
  - Passwords hashed with bcrypt
  - Role-based logic (farmer/customer)
  - (JWT planned for future)
- **Error Handling:**
  - Returns JSON with success/message
  - 400 for validation, 409 for conflict, 500 for server error

## 7. Database Design

- **Collections:** farmers, customers, users
- **Fields:**
  - email: String, unique, required
  - password: String, hashed, required
  - fullName: String, required
  - age: Number, min 16, required
  - gender: String, enum
  - address: String, required
  - contact: String, required
  - paymentMethod: String, enum
  - timestamps: createdAt, updatedAt
- **Relationships:** None (flat, role-based separation)
- **Constraints:** Unique email, min age, required fields, enum validation

## 8. Functional Flow (Step-by-Step)

### Signup
1. User fills signup form (role, name, email, password, etc.)
2. Frontend validates fields
3. Sends POST /api/auth/signup with JSON body
4. Backend validates, checks for existing email
5. Password is hashed, user saved to correct collection
6. Success/failure returned as JSON
7. On success, frontend redirects to login

### Login
1. User enters email, password, selects role
2. Sends POST /api/auth/login
3. Backend finds user by role/email, compares password
4. On success, frontend stores login state in localStorage
5. Redirects to home/profile/dashboard

### Dashboard
1. On load, dashboard.js fetches /api/users/farmers and /api/users/customers
2. Renders tables with user data

## 9. Bug & Error Analysis (CRITICAL SECTION)

### Bug: Login Route Instability
- **Location:** frontend/login/login.html, login.js, index.html, style.css
- **Root Cause:** File moves/deletes caused broken references and inconsistent login path
- **Reproduction:** Try to login from home or direct login URL — may fail if file not found
- **Impact:** High (blocks onboarding, demo, QA)
- **FIX:**
  - Restore login.html and login.js to frontend/login/
  - Update all references in index.html, profile.js, etc. to point to correct login path
  - Example:
    ```html
    <a href="login/login.html"><button>Login</button></a>
    ```
  - This ensures all login flows work regardless of entry point.
- **Edge Cases:**
  - User tries to access profile without login (handled by modal)
  - Duplicate email signup (409 error)
- **Performance Bottlenecks:**
  - None critical at current scale (all queries indexed by email)
- **Security Risks:**
  - No JWT/session tokens yet (planned)
  - Passwords are hashed, but no rate limiting or brute-force protection

## 10. Testing Strategy

- **Unit Testing:**
  - Backend: Test auth logic, password hashing, user CRUD
  - Frontend: Validate form logic, localStorage state
- **Integration Testing:**
  - Test API endpoints with real MongoDB
  - End-to-end: Signup → Login → Dashboard
- **Manual Test Cases:**
  - Signup with valid/invalid data
  - Login with correct/incorrect credentials
  - Access profile without login (should show modal)
  - Dashboard loads user tables

## 11. Assets & Visual Documentation

- UI Screenshots: (add as available)
  - ![Home Page](./assets/home.png)
  - ![Login Page](./assets/login.png)
  - ![Dashboard](./assets/dashboard.png)
- Architecture Diagram:
  - ![System Architecture](./assets/architecture.png)
- Flow Diagrams:
  - ![Signup Flow](./assets/signup-flow.png)

## 12. Future Improvements

- Add JWT-based authentication
- Implement product listing and order management
- Add messaging/notifications
- Refactor backend to use controllers/services
- Add React frontend
- Improve error handling and validation
- Add automated tests (Jest, Mocha)
- Add CI/CD pipeline (GitHub Actions)
- Move MongoDB to cloud (Atlas)

## 13. Deployment Pipeline

- **Build Steps:**
  - Install backend and frontend dependencies (npm install)
  - Start backend (node server.js)
  - Start frontend (open index.html or serve statically)
- **Environment Config:**
  - Backend: PORT, MONGO_URI (currently hardcoded, move to .env)
- **CI/CD Workflow:**
  - (Planned) GitHub Actions for lint/test/deploy
  - GitHub Pages for frontend static hosting
  - Backend deploy to cloud (Render/Heroku planned)
