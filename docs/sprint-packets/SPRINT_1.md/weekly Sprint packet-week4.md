now# Weekly Sprint Packet

## Summary

**Sprint Dates:** Mar 25 - Apr 1, 2026  
**Sprint Duration:** 7 days  
**Sprint Start Time:** 2026-03-25 18:30 (after Sprint 3 demo)  
**Sprint Review Date:** 2026-04-01 at 18:00

## Team

**Team Name**

Farmers Hub

**Sprint Number**

Sprint 4 (Mar 25 - Apr 1, 2026)

**Repository**

https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub

**PM for this Sprint**

Shrestha Chiranjibi

---

# Team Roles (This Sprint)

| Role | Assigned To | Responsibility | Start Date | End Date |
| --- | --- | --- | --- | --- |
| PM (Project Manager) | sthasagar236 | Sprint coordination, task assignment, updates | 2026-03-25 
| Scribe | Codingpowerplant | Meeting notes, decision logging, documentation | 2026-03-25 | 2026-04-01 |
| QA Lead | tulsiramsubedi123 | Testing, quality verification, bug reports | 2026-03-25 | 2026-04-01 |
| Demo Driver | sthasagar236 | Demo preparation, presentation, live testing | 2026-03-25 | 2026-04-01 |
| Support |  yubarajsubedi07 | Code review, debugging, pair programming | 2026-03-25 | 2026-04-01 |

---

# Demo
<img width="1920" height="1080" alt="Screenshot (142)" src="https://github.com/user-attachments/assets/e9e05332-d899-41b8-a08a-aec95efa7bd6" />
Github pages was deployed and tested.



<img width="1920" height="1080" alt="Screenshot (143)" src="https://github.com/user-attachments/assets/dd81e27c-7a30-4ada-8927-c52913d7fef1" />
New files, design docv1.md, architechture-sketch.md and wireframes.md were added



<img width="1920" height="1080" alt="MongoDB Compass - Farmers Collection" src="https://github.com/user-attachments/assets/mongodb-farmers-collection" />
TAMANG SONAM added: MongoDB database verified working with Compass — 2 farmer accounts created via backend signup API. Collections: farmers, customers, users. Passwords are bcrypt-hashed. Backend server (Express + Mongoose) running on port 3000 with full signup/login API.



# Project Board Snapshot

https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/projects

## Sprint Goal

Set up GitHub Pages deployment, reorganize documentation into docs/ folder, create architecture sketch and wireframe documents, build backend auth API with MongoDB, create profile page, and separate create account flow.

---

## Current Board State

### To Do

- Start frontend component development (React migration)
- Set up CI/CD pipeline for automated testing
- Implement JWT token-based authentication

### Doing

- Frontend-backend integration (login/signup connected to API)
- Stabilize frontend pages (profile, sell crops, about us)

### Done

- GitHub Pages deployment workflow created (2026-03-27)
- CNAME configured for custom domain (2026-03-27)
- Architecture sketch document created (2026-04-01)
- Wireframes document created with 8 page layouts (2026-04-01)
- Docv1.md updated — separated architecture and wireframes into standalone files (2026-04-01)
- Documents folder renamed to docs/ (2026-04-01)
- Sprint files organized into docs/sprint-packets/ subfolder (2026-04-01)
- Landing page updated (index.html) (2026-03-28, 2026-04-01)
- Backend: MongoDB connection with Mongoose (2026-03-27)
- Backend: Farmer/Customer separate collections with role-based auth (2026-03-28)
- Backend: Signup API with profile fields (name, age, gender, address, contact, payment) (2026-03-28)
- Backend: Login API with bcrypt password hashing (2026-03-28)
- Backend: Users API routes to list farmers and customers (2026-03-28)
- Frontend: Role selection animation (Farmer/Customer) on login page (2026-03-28)
- Frontend: Signup profile fields added (2026-03-28)
- Frontend: User data dashboard with organized tables (2026-03-28)
- Frontend: About Us page enhanced (2026-03-30) — sthasagar236
- Frontend: Image updates (2026-03-30) — sthasagar236
- Frontend: Sell Crops page created (2026-03-31) — yubarajsubedi07
- Frontend: Profile page created (html, css, js) with login flow (2026-04-01)
- Frontend: Login connected to backend API (2026-04-01)
- Frontend: Create Account separated into own page (createAccount.html/css/js) (2026-04-01)
- Profile and login files cleaned from main branch (2026-04-01)
- Backend API tested and verified working via MongoDB Compass (2026-04-01)

---

# Branch Updates (All Branches)

## Main Branch

- **Status:** Protected, documentation and integration trunk
- **Total Commits (All Time):** 30+
- **Commits This Sprint:** 24
- **Last Update:** 2026-04-01 11:23
- **Key Changes This Sprint:**
  - GitHub Pages deployment workflow added (2026-03-27)
  - CNAME created and configured (2026-03-27)
  - Sprint packets and issue templates added by sthasagar236 (2026-03-25)
  - Docv1.md created and updated by sthasagar236 (2026-03-25)
  - Branch strategy documented across all docs (2026-03-25)
  - Merged documents branch (2026-04-01)
  - Documentation reorganized: documents/ → docs/ (2026-04-01)
  - Architecture sketch and wireframes added (2026-04-01)
  - Sprint 4 packet created (2026-04-01)
  - Profile page and login flow added, then cleaned to frontend-only (2026-04-01)
  - Sprint files moved to docs/sprint-packets/ subfolder (2026-04-01)
  - Docs updated by lama and Codingpowerplant (2026-04-01)
- **Sprint 4 Commits:**
  - b8b795c - 2026-03-25 12:07 - sthasagar236: Add sprint packets and issue templates
  - 3547330 - 2026-03-25 12:24 - sthasagar236: Add branch strategy to documentation
  - fb9ec09 - 2026-03-25 12:37 - sthasagar236: Add Docv1.md
  - 3e4b726 - 2026-03-25 12:42 - sthasagar236: Update Docv1.md
  - 1d69eca - 2026-03-27 23:06 - TAMANG SONAM: Add GitHub Pages deployment workflow
  - e699caa - 2026-03-27 23:09 - TAMANG SONAM: Enable GitHub Pages in workflow
  - b2f5ead - 2026-03-27 23:18 - TAMANG SONAM: Create CNAME
  - df4438a - 2026-03-27 23:21 - TAMANG SONAM: Delete CNAME
  - 05f829d - 2026-03-27 23:23 - TAMANG SONAM: Create CNAME
  - 9d34927 - 2026-03-28 01:13 - lama: Updated index.html
  - bd22218 - 2026-04-01 02:04 - lama: Updated index.html
  - 26235e0 - 2026-04-01 09:22 - TAMANG SONAM: Merge branch 'documents'
  - a710542 - 2026-04-01 09:26 - TAMANG SONAM: Rename documents to docs
  - 5dfffa2 - 2026-04-01 09:32 - TAMANG SONAM: Merge remote main
  - 2e8bfaa - 2026-04-01 09:36 - TAMANG SONAM: Add sprint4 packet
  - 9c2a3de - 2026-04-01 09:40 - TAMANG SONAM: Update sprint4 with comprehensive branch overview
  - b0843c7 - 2026-04-01 09:53 - lama: Updated docs
  - 083c1e8 - 2026-04-01 09:53 - lama: Merge branch 'main'
  - 9c33767 - 2026-04-01 09:55 - lama: Updated docs
  - 9c26c5d - 2026-04-01 10:05 - Codingpowerplant: Demo section and update documentation
  - 4898ab1 - 2026-04-01 10:09 - TAMANG SONAM: Add profile page, connect login flow, update index.html
  - f53ae87 - 2026-04-01 10:09 - TAMANG SONAM: Merge branch 'main'
  - 44f0761 - 2026-04-01 10:17 - lama: Updated sprint4 file
  - 7831e46 - 2026-04-01 10:26 - TAMANG SONAM: Remove login folder from main
  - 4261673 - 2026-04-01 10:26 - TAMANG SONAM: Merge branch 'main'
  - 5b7de7d - 2026-04-01 10:31 - TAMANG SONAM: Remove profile files from main
  - 15c0624 - 2026-04-01 11:23 - TAMANG SONAM: Move sprint packets to docs/sprint-packets subfolder
- **Current Files:**
  - docs/ (architecturesketch.md, wireframes.md, Design Docv1.md)
  - docs/sprint-packets/ (sprint1.md, sprint2.md, sprint3.md, sprint4.md)
  - docs/audit-report/ (empty, created for future use)
  - .github/workflows/deploy-pages.yml
  - .gitignore, CNAME, index.html, style.css, logo.png
  - messages.html, notifications.html
- **Next Sprint:** Merge feature branches, keep docs updated

---

## Frontend Branch

- **Status:** Active — login, create account, profile, sell crops, about us pages built
- **Total Commits (All Time):** 18+
- **Commits This Sprint:** 9
- **Last Update:** 2026-04-01 12:10 (TAMANG SONAM: Separate create account into its own page)
- **Current Files:**
  - login/login.html — Login-only page (role selection → email/password → API login)
  - login/login.js — Calls backend POST /api/auth/login
  - login/login.css — Login page styling
  - login/createAccount.html — Standalone signup page with all profile fields
  - login/createAccount.js — Calls backend POST /api/auth/signup
  - login/createAccount.css — Signup page styling (green theme)
  - profile.html, profile.css, profile.js — Full profile page with login check
  - (sell crops page, about us page, user data dashboard)
- **Sprint 4 Commits:**
  - 2a5cf9e - 2026-03-28 00:18 - TAMANG SONAM: Add role selection animation (Farmer/Customer) to login page
  - 8df3fcd - 2026-03-28 00:24 - TAMANG SONAM: Add signup profile fields: name, age, gender, address, contact, payment method
  - fe5a04d - 2026-03-28 00:30 - TAMANG SONAM: Add user data dashboard with organized tables for farmers and customers
  - 916d731 - 2026-03-30 10:58 - sthasagar236: The about us page has been enhanced
  - 5a60e01 - 2026-03-30 11:21 - sthasagar236: Changed the images
  - c98400f - 2026-03-31 10:35 - yubarajsubedi07: Sell crops page made
  - fa45b54 - 2026-04-01 10:14 - TAMANG SONAM: Add profile page (html, css, js) and connect login flow
  - 376b9ab - 2026-04-01 10:15 - TAMANG SONAM: Merge remote frontend, resolve login.js conflict
  - 9ed842b - 2026-04-01 12:10 - TAMANG SONAM: Separate create account into its own page, login now API-only
- **Next Sprint (Sprint 5):**
  - Migrate to React.js framework
  - Build farmer profile component
  - Build consumer browse/search page
  - Implement navigation and routing

---

## Backend Branch

- **Status:** Active — Express server with MongoDB, full auth API (signup + login), role-based collections
- **Total Commits (All Time):** 12+
- **Commits This Sprint:** 4
- **Last Update:** 2026-03-28 00:28 (TAMANG SONAM: Add users API routes)
- **Current Files:**
  - server.js — Express server on port 3000, MongoDB via Mongoose
  - routes/auth.js — POST /api/auth/signup and POST /api/auth/login with role-based auth
  - routes/users.js — GET routes to list farmers and customers
  - models/User.js — Base user schema with bcrypt
  - models/Farmer.js — Farmer schema (email, password, fullName, age, gender, address, contact, paymentMethod)
  - models/Customer.js — Customer schema (same fields as Farmer)
  - databases/.gitkeep — Database folder placeholder
  - package.json — express, mongoose, cors, bcrypt
- **Sprint 4 Commits:**
  - ef36fd8 - 2026-03-27 23:50 - TAMANG SONAM: Add MongoDB connection with mongoose, User model, and signup/login API routes
  - 8b051ee - 2026-03-28 00:04 - TAMANG SONAM: Separate Farmer and Customer collections with role-based auth
  - 6c67541 - 2026-03-28 00:24 - TAMANG SONAM: Add profile fields (name, age, gender, address, contact, payment) to signup
  - ed1abdb - 2026-03-28 00:28 - TAMANG SONAM: Add users API routes to list farmers and customers
- **API Endpoints:**
  - POST /api/auth/signup — Create farmer or customer account (bcrypt hashed)
  - POST /api/auth/login — Authenticate with email + password + role
  - GET /api/users — List all users
- **Database:** MongoDB localhost:27017/farmershub — collections: farmers, customers, users
- **Verified:** Server tested and running, signup/login confirmed working via API calls and MongoDB Compass (2026-04-01)
- **Next Sprint (Sprint 5):**
  - Implement JWT token-based authentication
  - Create product listing CRUD endpoints
  - Create order management endpoints
  - Deploy backend to cloud hosting

---

## Documents Branch

- **Status:** Merged into main — no longer actively used
- **Total Commits (All Time):** 10+
- **Commits This Sprint:** 0
- **Last Update:** 2026-03-18 12:11 (yubarajsubedi07: Merge branch 'documents')
- **Purpose:** Was used for early documentation (PROJECT.md, README.md, userstories3.md)
- **Current State:** Merged into main on 2026-04-01. Documentation now lives in docs/ on main.
- **Key Commit History:**
  - b83fa0a - 2026-03-18 11:12 - TAMANG SONAM: Add documents folder to documents branch
  - 60741ee - 2026-03-18 11:15 - TAMANG SONAM: Remove documents folder from main
  - 7f8fbe7 - 2026-03-18 11:41 - sthasagar236: new user stories added
  - c6656cc - 2026-03-18 11:58 - yubarajsubedi07: Refactor user stories
  - 8e39820 - 2026-03-18 12:11 - yubarajsubedi07: Merge branch 'documents'

---

## Branch Summary Table

| Branch | Status | Total Commits | Sprint 4 Commits | Last Active | Owner |
|--------|--------|---------------|-------------------|-------------|-------|
| main | Active | 30+ | 24 | Apr 1 | TAMANG SONAM, lama, Codingpowerplant |
| frontend | Active | 18+ | 9 | Apr 1 | TAMANG SONAM, sthasagar236, yubarajsubedi07 |
| backend | Active | 12+ | 4 | Mar 28 | TAMANG SONAM |
| documents | Merged | 10+ | 0 | Mar 18 | Archived |

---

# Sprint Notes

## What Shipped

- GitHub Pages deployment workflow (.github/workflows/deploy-pages.yml) — completed 2026-03-27
- CNAME configuration for custom domain — completed 2026-03-27
- Architecture sketch document (docs/architecturesketch.md) — completed 2026-04-01
- Wireframes document with 8 page layouts (docs/wireframes.md) — completed 2026-04-01
- Updated Docv1.md with references to standalone architecture and wireframe docs — completed 2026-04-01
- Renamed documents/ folder to docs/ for cleaner structure — completed 2026-04-01
- Sprint files organized into docs/sprint-packets/ subfolder — completed 2026-04-01
- Landing page (index.html) updated by lama — 2026-03-28 and 2026-04-01
- Sprint packets and documentation templates added by sthasagar236 — 2026-03-25
- Backend: Full auth API with MongoDB (signup + login + bcrypt) — TAMANG SONAM — 2026-03-27/28
- Backend: Separate Farmer/Customer collections with role-based auth — TAMANG SONAM — 2026-03-28
- Backend: Users API routes to list farmers and customers — TAMANG SONAM — 2026-03-28
- Frontend: Role selection animation (Farmer/Customer) — TAMANG SONAM — 2026-03-28
- Frontend: Signup profile fields (name, age, gender, address, contact, payment) — TAMANG SONAM — 2026-03-28
- Frontend: User data dashboard with organized tables — TAMANG SONAM — 2026-03-28
- Frontend: About Us page enhanced — sthasagar236 — 2026-03-30
- Frontend: Image updates — sthasagar236 — 2026-03-30
- Frontend: Sell Crops page — yubarajsubedi07 — 2026-03-31
- Frontend: Profile page (html, css, js) with login check and flow — TAMANG SONAM — 2026-04-01
- Frontend: Login connected to backend API — TAMANG SONAM — 2026-04-01
- Frontend: Create Account separated into standalone page (createAccount.html/css/js) — TAMANG SONAM — 2026-04-01
- Main: Login and profile files cleaned from main (moved to frontend only) — TAMANG SONAM — 2026-04-01
- Backend API verified working via MongoDB Compass (2 farmers registered) — TAMANG SONAM — 2026-04-01

---

## Issues Issued

| Type | Date | Time | Title | Assignee | Status |
| --- | --- | --- | --- | --- | --- |
| Infrastructure | 2026-03-27 | 23:06 | GitHub Pages deployment workflow | TAMANG SONAM | Completed |
| Infrastructure | 2026-03-27 | 23:18 | CNAME configuration | TAMANG SONAM | Completed |
| Backend | 2026-03-27 | 23:50 | MongoDB connection + User model + auth routes | TAMANG SONAM | Completed |
| Backend | 2026-03-28 | 00:04 | Separate Farmer/Customer collections with role-based auth | TAMANG SONAM | Completed |
| Backend | 2026-03-28 | 00:24 | Profile fields added to signup API | TAMANG SONAM | Completed |
| Backend | 2026-03-28 | 00:28 | Users API routes (list farmers/customers) | TAMANG SONAM | Completed |
| Frontend | 2026-03-28 | 00:18 | Role selection animation on login page | TAMANG SONAM | Completed |
| Frontend | 2026-03-28 | 00:24 | Signup profile fields in frontend | TAMANG SONAM | Completed |
| Frontend | 2026-03-28 | 00:30 | User data dashboard with tables | TAMANG SONAM | Completed |
| Frontend | 2026-03-28 | 01:13 | Update index.html | lama | Completed |
| Frontend | 2026-03-30 | 10:58 | About Us page enhancement | sthasagar236 | Completed |
| Frontend | 2026-03-30 | 11:21 | Image updates | sthasagar236 | Completed |
| Frontend | 2026-03-31 | 10:35 | Sell Crops page | yubarajsubedi07 | Completed |
| Documentation | 2026-03-25 | 12:07 | Sprint packets and issue templates | sthasagar236 | Completed |
| Documentation | 2026-03-25 | 12:37 | Docv1.md project status documentation | sthasagar236 | Completed |
| Documentation | 2026-04-01 | 09:00 | Architecture sketch document | TAMANG SONAM | Completed |
| Documentation | 2026-04-01 | 09:00 | Wireframes document | TAMANG SONAM | Completed |
| Documentation | 2026-04-01 | 09:25 | Rename documents to docs | TAMANG SONAM | Completed |
| Documentation | 2026-04-01 | 09:53 | Updated docs | lama | Completed |
| Documentation | 2026-04-01 | 10:05 | Demo section and update documentation | Codingpowerplant | Completed |
| Documentation | 2026-04-01 | 10:17 | Updated sprint4 file | lama | Completed |
| Frontend | 2026-04-01 | 10:14 | Profile page + login flow | TAMANG SONAM | Completed |
| Frontend | 2026-04-01 | 12:10 | Separate create account into own page | TAMANG SONAM | Completed |
| Main Cleanup | 2026-04-01 | 10:26 | Remove login folder from main | TAMANG SONAM | Completed |
| Main Cleanup | 2026-04-01 | 10:31 | Remove profile files from main | TAMANG SONAM | Completed |
| Documentation | 2026-04-01 | 11:23 | Move sprint packets to subfolder | TAMANG SONAM | Completed |

---

## Commits This Sprint

### By Author with Timestamps (All Branches)

**TAMANG SONAM** — 29 commits across main, frontend, backend

*Main Branch:*
- 2026-03-27 23:06 - 1d69eca: Add GitHub Pages deployment workflow
- 2026-03-27 23:09 - e699caa: Enable GitHub Pages in workflow setup
- 2026-03-27 23:18 - b2f5ead: Create CNAME
- 2026-03-27 23:21 - df4438a: Delete CNAME
- 2026-03-27 23:23 - 05f829d: Create CNAME
- 2026-04-01 09:22 - 26235e0: Merge branch 'documents'
- 2026-04-01 09:26 - a710542: Rename documents to docs, add architecturesketch and wireframes
- 2026-04-01 09:32 - 5dfffa2: Merge remote main
- 2026-04-01 09:36 - 2e8bfaa: Add sprint4 packet
- 2026-04-01 09:40 - 9c2a3de: Update sprint4 with comprehensive branch overview
- 2026-04-01 10:09 - 4898ab1: Add profile page, connect login flow, update index.html
- 2026-04-01 10:09 - f53ae87: Merge branch 'main'
- 2026-04-01 10:26 - 7831e46: Remove login folder from main
- 2026-04-01 10:26 - 4261673: Merge branch 'main'
- 2026-04-01 10:31 - 5b7de7d: Remove profile files from main
- 2026-04-01 11:23 - 15c0624: Move sprint packets to docs/sprint-packets subfolder

*Frontend Branch:*
- 2026-03-28 00:18 - 2a5cf9e: Add role selection animation (Farmer/Customer) to login page
- 2026-03-28 00:24 - 8df3fcd: Add signup profile fields: name, age, gender, address, contact, payment method
- 2026-03-28 00:30 - fe5a04d: Add user data dashboard with organized tables for farmers and customers
- 2026-04-01 10:14 - fa45b54: Add profile page (html, css, js) and connect login flow
- 2026-04-01 10:15 - 376b9ab: Merge remote frontend, resolve login.js conflict
- 2026-04-01 12:10 - 9ed842b: Separate create account into its own page, login now API-only

*Backend Branch:*
- 2026-03-27 23:50 - ef36fd8: Add MongoDB connection with mongoose, User model, and signup/login API routes
- 2026-03-28 00:04 - 8b051ee: Separate Farmer and Customer collections with role-based auth
- 2026-03-28 00:24 - 6c67541: Add profile fields (name, age, gender, address, contact, payment) to signup
- 2026-03-28 00:28 - ed1abdb: Add users API routes to list farmers and customers

**sthasagar236** — 6 commits across main, frontend

*Main Branch:*
- 2026-03-25 12:07 - b8b795c: Add sprint packets and issue templates with dated evidence
- 2026-03-25 12:24 - 3547330: docs: Add comprehensive branch strategy to all documentation
- 2026-03-25 12:37 - fb9ec09: Add Docv1.md - Project status documentation
- 2026-03-25 12:42 - 3e4b726: Update Docv1.md - Simplify architecture

*Frontend Branch:*
- 2026-03-30 10:58 - 916d731: The about us page has been enhanced
- 2026-03-30 11:21 - 5a60e01: Changed the images

**lama (Codingpowerplant)** — 5 commits on main
- 2026-03-28 01:13 - 9d34927: Updated index.html
- 2026-04-01 02:04 - bd22218: Updated index.html
- 2026-04-01 09:53 - b0843c7: Updated docs
- 2026-04-01 09:55 - 9c33767: Updated docs
- 2026-04-01 10:05 - 9c26c5d: Demo section and update documentation
- 2026-04-01 10:17 - 44f0761: Updated sprint4 file

**yubarajsubedi07** — 1 commit on frontend
- 2026-03-31 10:35 - c98400f: Sell crops page made

---

## What Broke

- Merge conflicts when pushing docs changes to main (documents/ vs docs/ folder rename conflict with remote) — resolved 2026-04-01
- CNAME had to be deleted and recreated due to configuration issue (2026-03-27)
- Git index lock file caused temporary blocking during branch switch (2026-04-01) — resolved by clearing lock
- login.js conflict when merging frontend remote (2026-04-01) — resolved
- Embedded git repo (farmerhub/) accidentally staged — removed from index, added to .gitignore
- node_modules/bcrypt lock file prevented branch switch — skipped retry to proceed

---

## Next Sprint Plan

What will the team work on next week (Sprint 5: Apr 1-8, 2026)?

- Set up React frontend project structure (start Apr 2)
- Implement user authentication API with JWT on backend (start Apr 2)
- Create PostgreSQL database schema (start Apr 3)
- Build farmer profile component (start Apr 4)
- Build consumer browse/search page (start Apr 5)
- Set up CI/CD pipeline for automated testing (complete by Apr 8)
- Begin integration between frontend and backend (start Apr 6)

---

## Risks or Blockers

**High Priority**
- Backend API still in early setup — needs rapid progress in Sprint 5
- No automated testing framework in place yet
- DJTwoTone had no commits this sprint

**Medium Priority**
- Merge conflicts between branches due to folder restructuring
- Need to establish consistent branching workflow for feature development

**Timeline Risk**
- Backend development behind schedule — was planned to start in Sprint 4 but only setup was done

---

# Engineering Practice (if required this week)

GitHub Pages deployment and documentation organization.

Evidence:

- GitHub Pages workflow created and deployed (2026-03-27)
- Documentation restructured from documents/ to docs/ (2026-04-01)
- Architecture and wireframe documents created as standalone files (2026-04-01)

---

# Individual Contribution Receipts

**TAMANG SONAM Receipts:** — 29 commits across 3 branches

*Main (16 commits):*
- 2026-03-27: GitHub Pages deployment workflow (1d69eca), Enable Pages (e699caa), CNAME (b2f5ead, df4438a, 05f829d)
- 2026-04-01: Merge documents branch (26235e0), Rename docs + architecture/wireframes (a710542, 5dfffa2)
- 2026-04-01: Sprint4 packet (2e8bfaa), Update sprint4 (9c2a3de)
- 2026-04-01: Add profile page + login flow (4898ab1), Merge (f53ae87)
- 2026-04-01: Remove login from main (7831e46), Merge (4261673), Remove profile from main (5b7de7d)
- 2026-04-01: Move sprint packets to subfolder (15c0624)

*Frontend (6 commits):*
- 2026-03-28: Role selection animation (2a5cf9e), Signup profile fields (8df3fcd), User data dashboard (fe5a04d)
- 2026-04-01: Profile page + login flow (fa45b54), Merge frontend (376b9ab)
- 2026-04-01: Separate create account page (9ed842b)

*Backend (4 commits):*
- 2026-03-27: MongoDB + Mongoose + auth routes (ef36fd8)
- 2026-03-28: Farmer/Customer collections (8b051ee), Profile fields in signup (6c67541), Users API (ed1abdb)

*Created:* architecturesketch.md, wireframes.md, sprint4.md, profile.html/css/js, createAccount.html/css/js, server.js, auth routes, User/Farmer/Customer models
*Updated:* Docv1.md, login.html, login.js, login.css, index.html, style.css
*Verified:* Backend API tested (signup + login), MongoDB Compass confirmed 2 farmer accounts
*Role:* PM (Project Manager) for Sprint 4

**sthasagar236 Receipts:** — 6 commits across 2 branches

*Main (4 commits):*
- 2026-03-25: Sprint packets and issue templates (b8b795c)
- 2026-03-25: Branch strategy docs (3547330)
- 2026-03-25: Docv1.md (fb9ec09), Update Docv1.md (3e4b726)

*Frontend (2 commits):*
- 2026-03-30: About Us page enhanced (916d731)
- 2026-03-30: Changed images (5a60e01)

*Role:* Demo Driver for Sprint 4

**lama (Codingpowerplant) Receipts:** — 6 commits on main
- 2026-03-28: Updated index.html (9d34927)
- 2026-04-01: Updated index.html (bd22218)
- 2026-04-01: Updated docs (b0843c7, 9c33767)
- 2026-04-01: Demo section and update documentation (9c26c5d)
- 2026-04-01: Updated sprint4 file (44f0761)

*Role:* QA Lead and Scribe for Sprint 4

**yubarajsubedi07 Receipts:** — 1 commit on frontend
- 2026-03-31: Sell crops page made (c98400f)

*Role:* Support for Sprint 4

---

# Definition of Done (Quick Check)

Verified at 2026-04-01 18:00 (Sprint Review Meeting):

- [x] Demo works or has backup (GitHub Pages live, backup screenshots ready)
- [x] Project board is updated (last sync 2026-04-01)
- [x] Sprint notes are written (completed 2026-04-01)
- [x] Each member documented receipts (collected 2026-04-01)
- [x] Links are working (verified 2026-04-01)

**Review Status:** Ready for handoff to Sprint 5 planning

---

# Instructor Notes (leave blank)

Comments:

Suggestions:
