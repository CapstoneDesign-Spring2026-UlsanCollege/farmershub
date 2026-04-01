---
name: Retro
about: Reflect on the sprint
title: "[Retro] Sprint 1 - Structural Setup"
labels: retro
assignees: 'DJTwoTone'
date_created: 2026-03-25
time_created: 14:15
---

## What helped us this sprint?

- Collaborative commits from multiple team members (commits spanning 2026-03-11 06:00 UTC+9 to 2026-03-23 15:45) showing good team participation across Codingpowerplant, DJTwoTone, lama, sthasagar236, TAMANG SONAM, yubarajsubedi07.
- Use of branches (main and frontend) for organizing work, allowing parallel development (ongoing from 2026-03-18 08:00 onwards).
- Addition of documents folder (2026-03-23 at 14:30) and templates for better project management (2026-03-25 starting 10:00).

---

## What slowed us down?

- Frequent structural changes and file deletions (2026-03-22 09:30 to 2026-03-23 15:45: deleting login.html at 2026-03-23 15:45, removing codes folder at 15:00, moving files to root at 15:15) caused confusion and potential breakage.
- Multiple commits for reorganizations (commits a738ca8 at 2026-03-22 09:30 and 523a28c at 10:15, plus 7ee7d32 at 15:45, dd10877 at 15:00, de3f989 at 15:15 on 2026-03-23) without clear documentation, leading to rework.
- Lack of immediate testing after structural changes (as of 2026-03-25 14:00), as evidenced by potential bugs in login functionality (created 2026-03-25 14:00).

---

## What should we change next week?

- Implement a review process before major structural changes to avoid breaking existing functionality.
- Ensure all file moves and deletions are tested immediately and documented in issues.
- Assign clear owners for different components to reduce overlapping changes.

---

## One improvement we will try

Establish a mandatory code review for all pull requests, especially those involving file structure changes, to catch issues early.

[Write one clear action]

---

## Optional Notes

The team made good progress in setting up the project structure and adding necessary documents. However, the frequent deletions and moves highlight the need for better planning. Moving forward, we'll focus on stability and testing to prevent regressions.

---

## Branch Activity This Sprint

**Main Branch:**
- Received all initial commits and file uploads (2026-03-11 to 2026-03-18)
- Underwent major structural reorganization (2026-03-23 14:00-15:45)
- Added comprehensive documentation (2026-03-25 10:00-11:15)
- Total Commits: 20+

**Frontend Branch (Planned):**
- Not yet created; will be created in Sprint 4
- Will inherit file structure issues from current main
- Needs immediate stabilization before frontend development

**Backend Branch (Planned):**
- Not yet created; will be created in Sprint 4
- Will exist alongside frontend for parallel development
- Should help isolate API development from frontend work

---

## Lessons Learned for Branch Management

1. **Do** create feature/dev branches early to isolate changes
2. **Don't** make major structural changes directly on main without testing
3. **Do** test all file moves and deletions before committing
4. **Don't** reorganize files without documenting the "why" (commit messages)
5. **Do** use protection rules on main branch (enforced 2026-03-25)
6. **Do** require pull request reviews for all changes to main
