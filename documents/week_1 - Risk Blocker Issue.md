---
name: Risk / Blocker
about: Report something slowing down or blocking progress
title: "[Blocker] Login route and page stability after structural reorganization"
labels: blocker
assignees: 'TAMANG SONAM'
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

List attempts to fix it.

- Reviewed commit history (7ee7d32, de3f989, f427665) to identify when files were moved/deleted.
- Verified that main is up-to-date with remote and team setup is synchronized.
- Reviewed current login.html and style sheet references in the repository structure.

---

## What help do you need?

Be specific.

- Confirm the final intended file structure (root vs login folder) for login and CSS assets.
- Restore or re-create login.html in the correct path and update all references.
- Assign a peer for 1-hour focused pair debugging to verify the login route in browser for Windows and cross-platform.

---

## Evidence

Add links if possible:

- Issue: #1 (dependencies on file structure and missing login route testing - reported 2026-03-25)
- PR: frontend merge PR (contains commit f427665 on 2026-03-23 and related file-move changes from 2026-03-23)
- Screenshot: login page blank/404 resource failures after page load (occurred after 2026-03-23 structural moves)
- Error message: "GET /login.html 404" and "GET /style.css 404" in browser console after structural changes (2026-03-23 onwards)

---

## Owner

Who is responsible for handling this?

TAMANG SONAM (Team Leader, PM)

