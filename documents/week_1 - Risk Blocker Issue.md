---
name: Risk / Blocker
about: Report something slowing down or blocking progress
title: "[Blocker] Login route and page stability after structural reorganization"
labels: blocker
assignees: 'TAMANG SONAM'
date_created: 2026-03-25
time_created: 14:30
---

## What is the problem?

Multiple commits have moved and deleted key frontend files (login.html, index.html, style.css), which has created an unstable login route and inconsistent file references across the project. This makes the login path unreliable for development and demo runs.

---

## Why is it a problem?

This is critical because user authentication is a core feature for the Farmers Hub app. If login doesn’t work consistently, it blocks QA, demo readiness, and further frontend feature development.

---

## Impact

How does this affect the project?

- [x] Slows progress
- [x] Blocks progress
- [x] Affects demo

Explain:

This issue can break the entire onboarding flow for users, causing wasted effort as the team keeps rebasing around broken paths. The demo cannot be presented with confidence until the login page stability is restored.

---

## What have you tried?

List attempts to fix it (as of 2026-03-25 14:30):

- Reviewed commit history (7ee7d32 at 15:45, de3f989 at 15:15, f427665 at 14:30 all on 2026-03-23) to identify when files were moved/deleted.
- Verified that main is up-to-date with remote (last sync 2026-03-25 at 17:00) and team setup is synchronized.
- Reviewed current login.html and style sheet references in the repository structure (last checked 2026-03-25 at 14:30).

---

## What help do you need?

Be specific.

- Confirm the final intended file structure (root vs login folder) for login and CSS assets.
- Restore or re-create login.html in the correct path and update all references.
- Assign a peer for 1-hour focused pair debugging to verify the login route in browser for Windows and cross-platform.

---

## Evidence

Add links if possible:

- Issue: #1 (dependencies on file structure and missing login route testing - reported 2026-03-25 at 14:30)
- PR: frontend merge PR (contains commit f427665 on 2026-03-23 at 14:30 and related file-move changes from 2026-03-23 14:00-15:45)
- Screenshot: login page blank/404 resource failures after page load (occurred after 2026-03-23 15:45 structural moves)
- Error message: "GET /login.html 404" and "GET /style.css 404" in browser console after structural changes (2026-03-23 from 15:00 onwards)

---

## Owner

Who is responsible for handling this?

TAMANG SONAM (Team Leader, PM)

---

## Branch Impact Analysis

**Main Branch:**
- **Status:** Unstable (due to recent restructuring 2026-03-23)
- **Impact:** Cannot branch from main without inheriting path issues
- **Risk Level:** HIGH

**Frontend Branch (Pending Creation):**
- **Planned:** Create 2026-03-25 at 18:30
- **Status:** Cannot proceed until main is stable
- **Blocker:** This issue prevents clean frontend branch creation
- **Impact:** Delays start of frontend feature development (target: 2026-03-28)

**Backend Branch (Pending Creation):**
- **Planned:** Create 2026-03-26 00:00
- **Impact:** Less affected (no login dependency) but needs coordinated merge strategy
- **Risk:** High if frontend branch instability causes merge conflicts later

---

## Resolution Workflow

**Phase 1 (2026-03-25 18:30 - 2026-03-26 10:00):** Investigation & Planning
- Sprint 4 kickoff meeting at 18:30
- Decide on fix strategy during meeting
- Assign developer and timeline

**Phase 2 (2026-03-26 10:00 - 2026-03-27 10:00):** Fix & Test
- Create hotfix/login-fix branch from stable main commit
- Fix file paths (login.html, style.css references)
- Comprehensive testing on Windows/cross-platform

**Phase 3 (2026-03-27 10:00+):** Integration & Branching
- Merge hotfix to main via pull request (code review required)
- Update main branch (all files stable)
- Create clean frontend and backend branches from stable main
- Begin feature development on branches

---

## Success Criteria

- [ ] login.html loads without 404 errors (by 2026-03-27 10:00)
- [ ] style.css loads correctly (by 2026-03-27 10:00)
- [ ] All paths tested on Windows and cross-platform (by 2026-03-27 11:00)
- [ ] Frontend branch created from stable main (by 2026-03-27 12:00)
- [ ] Backend branch created from stable main (by 2026-03-27 13:00)
- [ ] Demo runs without path issues (by 2026-04-01 18:00)

