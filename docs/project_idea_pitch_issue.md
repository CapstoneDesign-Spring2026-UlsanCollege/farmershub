# Project Idea Pitch

**Document Created:** 2026-03-25 at 15:30  
**Submitted to Instructor:** 2026-03-25 at 16:00  
**Status:** Final (Ready for Review)

## Team

**Team Name**

Farmers Hub

**Members**

- Codingpowerplant
- DJTwoTone
- lama
- sthasagar236
- TAMANG SONAM
- yubarajsubedi07

**Repository (if created)**

https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub

---

# 1. Project Title

Farmers Hub: Smart Rural Marketplace

---

# 2. Problem

Describe the **real problem** your project solves.

Focus on a situation someone experiences.

Your answer:

Rural farmers often struggle to access nearby buyers and track produce demand efficiently. They lose time and profit due to fragmented ordering channels and unclear logistics.

---

# 3. Target Users

Who will use this system?

Your users:

- Smallholder farmers looking to sell produce
- Local buyers (markets, restaurants, distributors)
- Farm co-op administrators managing orders
- Agricultural extension workers and analysts

---

# 4. What the System Will Do

Explain **what the system will allow users to do**.

Your description:

The system provides a web dashboard for farmers to list available produce and prices, receive orders from buyers, and track delivery status. Buyers can search by crop type, place orders, and get notifications. Admins can monitor inventory, sales, and user activity.

---

# 5. Core Features (First Version)

List **3-5 key features**.

Your features:
- User login and role-based access (farmer/buyer/admin)
- Produce listing and order placement
- Order management dashboard with status updates
- Basic search and filter by product and location
- Evidence logging in GitHub for sprint tracking

---

# 6. Demo Scenario

Describe **exactly what will happen during your demo**.

Your demo:
Step 1: Team opens Farmers Hub landing page and logs in as a farmer.
Step 2: Farmer creates a new produce listing (e.g., tomatoes, 100kg, 5,000 KRW).
Step 3: Buyer logs in and searches for tomatoes, places an order.
Step 4: Farmer marks order as accepted and prepared; admin sees order status update.

---

# 7. Minimum Viable Product (MVP)

Describe the **smallest version of your system that still works**.

Your MVP:

A login-enabled web application where a farmer can create produce listings and a buyer can place orders. Includes a simple order status workflow and a basic dashboard to verify features.

---

# 8. Technology Plan

List the tools you expect to use.

| Area | Tool |
| --- | --- |
| Frontend | HTML/CSS/JavaScript (existing login.html, index.html), possibly React later |
| Backend | Node.js + Express or Flask |
| Database | SQLite or MongoDB |
| Hosting | GitHub Pages for static, or Heroku/Render for full stack |

---

# 9. Risks or Unknowns

List anything that might make the project difficult.

Your risks:
- Frequent folder restructuring causing broken routes (seen in commits de3f989, 7ee7d32, etc.)
- Unclear backend plan and no API implementation yet.
- Synchronizing frontend and backend asset paths after reorganization.

---

# 10. Scope Check

Confirm that your project is (verified 2026-03-25 at 16:00):

- [x] Demoable in 1-2 minutes with clear steps (Demo scheduled for 2026-03-25 at 18:00)
- [x] Buildable with team skills (HTML/CSS/JS, Git workflow confirmed)
- [x] Feasible for one semester (Timeline: Sprint 1-12, completion by May 2026)

---

# 11. Next Step

**Approval Timeline:**
- Sprint 3: Planning and documentation (complete 2026-03-25)
- Sprint 4-5: Branch setup and initial implementations
  - Frontend branch: Component development (start 2026-03-26)
  - Backend branch: API endpoints (start 2026-03-26)
- Sprint 6-12: Feature completion and integration

**Immediate Actions (by 2026-03-27):**
1. Fix login page path issues (create hotfix branch 2026-03-26)
2. Create stable frontend branch from main (2026-03-27 12:00)
3. Create backend branch for API development (2026-03-27 13:00)
4. Begin feature implementation (2026-03-28 start)

**Branch Development Plan:**
- Fork frontend branch from main for UI components and user interaction
- Fork backend branch from main for API server and database
- Maintain main as stable integration branch
- Use pull requests for all merges back to main
- Enforce code reviews (2 reviewers minimum for main merges)

**Expected Deliverables by Sprint 12:**
- Working Farmers Hub web application deployed
- Full feature set from MVP plus stretch goals
- 90%+ test coverage
- Production-ready deployment on Heroku/Render
