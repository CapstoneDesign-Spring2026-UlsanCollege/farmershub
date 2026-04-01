# Weekly Sprint Packet

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

TAMANG SONAM

---

# Team Roles (This Sprint)

| Role | Assigned To | Responsibility | Start Date | End Date |
| --- | --- | --- | --- | --- |
| PM (Project Manager) | TAMANG SONAM | Sprint coordination, task assignment, updates | 2026-03-25 | 2026-04-01 |
| Scribe | DJTwoTone | Meeting notes, decision logging, documentation | 2026-03-25 | 2026-04-01 |
| QA Lead | lama | Testing, quality verification, bug reports | 2026-03-25 | 2026-04-01 |
| Demo Driver | sthasagar236 | Demo preparation, presentation, live testing | 2026-03-25 | 2026-04-01 |
| Support | Codingpowerplant, yubarajsubedi07 | Code review, debugging, pair programming | 2026-03-25 | 2026-04-01 |

---

# Demo

Demo scheduled for 2026-04-01 at 18:00 UTC+9 (KST)

Demo showing GitHub Pages deployment, updated documentation structure, and project architecture/wireframe documents.

## Demo Script

Estimated duration: 5-7 minutes

Step 1 (0:00-1:30): Show GitHub Pages live site with landing page (index.html, style.css).  
Step 2 (1:30-3:00): Walk through the new docs/ folder structure — architecturesketch.md and wireframes.md.  
Step 3 (3:00-5:00): Show the updated Docv1.md with separated architecture and wireframe references.  
Step 4 (5:00-7:00): Demonstrate GitHub Pages deployment workflow and CNAME configuration.

---

## Backup Plan

If the live demo fails, what will you show instead?

- Screenshots of GitHub Pages site
- Pre-recorded walkthrough of docs/ folder
- Document previews of architecturesketch.md and wireframes.md
- Commit history showing Sprint 4 work

---

# Project Board Snapshot

https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/projects

## Sprint Goal

Set up GitHub Pages deployment, reorganize documentation into docs/ folder, and create architecture sketch and wireframe documents.

---

## Current Board State

### To Do

- Implement backend API endpoints
- Start frontend component development (React)
- Set up CI/CD pipeline for automated testing

### Doing

- Stabilize frontend landing page
- Backend branch setup with Node.js + Express

### Done

- GitHub Pages deployment workflow created (2026-03-27)
- CNAME configured for custom domain (2026-03-27)
- Architecture sketch document created (2026-04-01)
- Wireframes document created with 8 page layouts (2026-04-01)
- Docv1.md updated — separated architecture and wireframes into standalone files (2026-04-01)
- Documents folder renamed to docs/ (2026-04-01)
- Landing page updated (index.html) (2026-03-28, 2026-04-01)

---

# Branch Updates (All Branches)

## Main Branch

- **Status:** Protected, documentation and integration trunk
- **Total Commits (All Time):** 20+
- **Commits This Sprint:** 15
- **Last Update:** 2026-04-01 09:36
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
- **Current Files:**
  - docs/ (architecturesketch.md, wireframes.md, Docv1.md, sprint1-4.md, issue templates)
  - .github/workflows/deploy-pages.yml
  - CNAME, index.html, style.css, logo.png
  - messages.html, notifications.html, profile.html
- **Next Sprint:** Merge feature branches, keep docs updated

---

## Frontend Branch

- **Status:** Active — login system built, UI structure in place
- **Total Commits (All Time):** 10+
- **Commits This Sprint:** 0 (no new commits between Mar 25 - Apr 1)
- **Last Update:** 2026-03-23 11:32 (sthasagar236: updated JS file)
- **Current Files:**
  - login/login.html — Login page with form
  - login/login.js — Connected to backend /api/login endpoint
  - login/style.css — Login page styling
- **Full Commit History:**
  - 7513e71 - 2026-03-23 01:33 - TAMANG SONAM: Delete all files from frontend branch
  - 3954f45 - 2026-03-23 01:34 - TAMANG SONAM: Add login folder
  - 9451d07 - 2026-03-23 01:35 - TAMANG SONAM: Add login.html and login.css
  - c9a2082 - 2026-03-23 01:36 - TAMANG SONAM: Add login.js and link it
  - 939688f - 2026-03-23 01:48 - TAMANG SONAM: Connect login.js to backend /api/login
  - 9f91b70 - 2026-03-23 10:35 - yubarajsubedi07: Deleted css for reform
  - 2e3eac5 - 2026-03-23 11:16 - yubarajsubedi07: updated login.html
  - d70b7e7 - 2026-03-23 11:24 - yubarajsubedi07: added css
  - 631af81 - 2026-03-23 11:32 - sthasagar236: updated JS file
- **Next Sprint (Sprint 5):**
  - Migrate to React.js framework
  - Build farmer profile component
  - Build consumer browse/search page
  - Implement navigation and routing

---

## Backend Branch

- **Status:** Active — basic Express server with login endpoint
- **Total Commits (All Time):** 10+
- **Commits This Sprint:** 0 (no new commits between Mar 25 - Apr 1)
- **Last Update:** 2026-03-23 01:52 (TAMANG SONAM: Add databases folder)
- **Current Files:**
  - server.js — Express server with CORS support
  - routes/auth.js — Authentication router with /api/login endpoint
  - databases/.gitkeep — Database folder placeholder
- **Full Commit History:**
  - 3122751 - 2026-03-23 00:44 - TAMANG SONAM: managing repo struc
  - 80017d9 - 2026-03-23 01:00 - TAMANG SONAM: Delete codes directory
  - 94c2483 - 2026-03-23 01:00 - TAMANG SONAM: Delete login.html
  - ceeb091 - 2026-03-23 01:29 - TAMANG SONAM: Delete documents folder from backend
  - 1eb4e7b - 2026-03-23 01:46 - TAMANG SONAM: Add server.js
  - 0e1aff0 - 2026-03-23 01:48 - TAMANG SONAM: Add /api/login endpoint with CORS
  - 0bdb02f - 2026-03-23 01:51 - TAMANG SONAM: Add routes/auth.js and refactor server.js
  - 4c927a0 - 2026-03-23 01:52 - TAMANG SONAM: Add databases folder
- **Next Sprint (Sprint 5):**
  - Set up PostgreSQL database connection
  - Implement JWT authentication
  - Create product listing CRUD endpoints
  - Create order management endpoints

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
| main | Active | 20+ | 15 | Apr 1 | TAMANG SONAM |
| frontend | Active | 10+ | 0 | Mar 23 | yubarajsubedi07, sthasagar236 |
| backend | Active | 10+ | 0 | Mar 23 | TAMANG SONAM |
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
- Landing page (index.html) updated by lama — 2026-03-28 and 2026-04-01
- Sprint packets and documentation templates added by sthasagar236 — 2026-03-25

---

## Issues Issued

| Type | Date | Time | Title | Assignee | Status |
| --- | --- | --- | --- | --- | --- |
| Infrastructure | 2026-03-27 | 23:06 | GitHub Pages deployment workflow | TAMANG SONAM | Completed |
| Infrastructure | 2026-03-27 | 23:18 | CNAME configuration | TAMANG SONAM | Completed |
| Documentation | 2026-04-01 | 09:00 | Architecture sketch document | TAMANG SONAM | Completed |
| Documentation | 2026-04-01 | 09:00 | Wireframes document | TAMANG SONAM | Completed |
| Documentation | 2026-04-01 | 09:25 | Rename documents to docs | TAMANG SONAM | Completed |
| Documentation | 2026-03-25 | 12:07 | Sprint packets and issue templates | sthasagar236 | Completed |
| Documentation | 2026-03-25 | 12:37 | Docv1.md project status documentation | sthasagar236 | Completed |
| Frontend | 2026-03-28 | 01:13 | Update index.html | lama | Completed |

---

## Commits This Sprint

### By Author with Timestamps

**TAMANG SONAM**
- 2026-03-27 23:06 - 1d69eca: Add GitHub Pages deployment workflow
- 2026-03-27 23:09 - e699caa: Enable GitHub Pages in workflow setup
- 2026-03-27 23:18 - b2f5ead: Create CNAME
- 2026-03-27 23:21 - df4438a: Delete CNAME
- 2026-03-27 23:23 - 05f829d: Create CNAME
- 2026-04-01 09:22 - 26235e0: Merge branch 'documents'
- 2026-04-01 09:26 - a710542: Rename documents to docs, add architecturesketch and wireframes
- 2026-04-01 09:32 - 5dfffa2: Merge remote main, rename documents to docs, add architecturesketch and wireframes

**sthasagar236**
- 2026-03-25 12:07 - b8b795c: Add sprint packets and issue templates with dated evidence
- 2026-03-25 12:24 - 3547330: docs: Add comprehensive branch strategy to all documentation
- 2026-03-25 12:37 - fb9ec09: Add Docv1.md - Project status documentation
- 2026-03-25 12:42 - 3e4b726: Update Docv1.md - Simplify architecture

**lama**
- 2026-03-28 01:13 - 9d34927: Updated index.html
- 2026-04-01 02:04 - bd22218: Updated index.html

**Codingpowerplant**
- (No commits this sprint)

**DJTwoTone**
- (No commits this sprint)

**yubarajsubedi07**
- (No commits this sprint)

---

## What Broke

- Merge conflicts when pushing docs changes to main (documents/ vs docs/ folder rename conflict with remote) — resolved 2026-04-01
- CNAME had to be deleted and recreated due to configuration issue (2026-03-27)
- Git index lock file caused temporary blocking during branch switch (2026-04-01) — resolved by clearing lock

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
- 3 team members (Codingpowerplant, DJTwoTone, yubarajsubedi07) had no commits this sprint

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

**TAMANG SONAM Receipts:**
- Commit: 2026-03-27 1d69eca (Add GitHub Pages deployment workflow)
- Commit: 2026-03-27 e699caa (Enable GitHub Pages in workflow setup)
- Commit: 2026-03-27 b2f5ead (Create CNAME)
- Commit: 2026-03-27 df4438a (Delete CNAME)
- Commit: 2026-03-27 05f829d (Create CNAME)
- Commit: 2026-04-01 26235e0 (Merge branch 'documents')
- Commit: 2026-04-01 a710542 (Rename documents to docs, add architecturesketch and wireframes)
- Commit: 2026-04-01 5dfffa2 (Merge remote main)
- Created: architecturesketch.md, wireframes.md
- Updated: Docv1.md
- Role: PM (Project Manager) for Sprint 4

**sthasagar236 Receipts:**
- Commit: 2026-03-25 b8b795c (Add sprint packets and issue templates)
- Commit: 2026-03-25 3547330 (Add branch strategy to documentation)
- Commit: 2026-03-25 fb9ec09 (Add Docv1.md)
- Commit: 2026-03-25 3e4b726 (Update Docv1.md)
- Assigned as Demo Driver for Sprint 4

**lama Receipts:**
- Commit: 2026-03-28 9d34927 (Updated index.html)
- Commit: 2026-04-01 bd22218 (Updated index.html)
- Assigned as QA Lead for Sprint 4

**DJTwoTone Receipts:**
- Assigned as Scribe for Sprint 4
- (No commits this sprint)

**Codingpowerplant Receipts:**
- (No contributions this sprint)

**yubarajsubedi07 Receipts:**
- (No contributions this sprint)

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
