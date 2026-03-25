---
name: Bug
about: Report something that is not working
title: "[Bug] Login page not loading after structural changes"
labels: bug
assignees: 'TAMANG SONAM'
---

## What is the problem?

The login page (login.html) is not loading properly following recent structural changes and file deletions in the repository.

[Explain the bug clearly]

The login functionality appears broken, possibly due to the deletion of login.html in commit 7ee7d32 and subsequent structural reorganizations.

---

## Steps to Reproduce

1. Navigate to the login directory in the repository.
2. Attempt to open login.html in a browser.
3. Observe that the page does not load or displays errors.

---

## Expected Behavior

The login page should load with proper styling and functionality, allowing users to log in.

[Expected result]

Page loads with login form, styled correctly, and JavaScript functions work.

---

## Actual Behavior

Page fails to load or displays blank/incomplete content.

[Actual result]

Console errors or missing resources due to file path changes.

---

## Evidence

Add links or screenshots.

- screenshot: Screenshot of login.html showing a blank page with no styling, indicating style.css failed to load after the move to root directory (commit de3f989 - 2026-03-23).
- console log: Browser console error: "Failed to load resource: the server responded with a status of 404 (Not Found)" for /style.css and /login.js, due to path changes from structural reorganizations (discovered 2026-03-25).
- related PR: Pull request merging frontend branch changes, which included file deletions and moves (e.g., commit 7ee7d32 deleting login.html on 2026-03-23, later re-added).
- related Issue: Issue #1 for structural changes (referencing commits a738ca8 and 523a28c from 2026-03-22 for "Structural Changes" that may have broken file references).

---

## Impact on Demo

Does this affect your demo?

- [x] Yes
- [ ] No

If yes, explain:

This affects the user authentication demo, preventing login functionality from working.

---

## Owner

Who is responsible for fixing this?

[TAMANG SONAM - Team Leader]
