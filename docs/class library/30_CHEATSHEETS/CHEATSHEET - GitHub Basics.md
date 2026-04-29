# CHEATSHEET - GitHub Basics

## Goal

Use GitHub as the single source of truth for tasks, code, docs, AI-assisted work, and evidence.

## Workflow

1. **Issue** = work request or problem.
2. **Branch** = safe place to do the work.
3. **Commit** = saved change.
4. **Pull Request** = propose merging + show evidence.
5. **Review** = team checks work.
6. **Merge** = work joins main project.
7. **Sprint Packet** = weekly proof of progress.

## Basic Commands

```bash
git checkout main
git pull
git checkout -b fix/login-error
git add .
git commit -m "Fix login error message"
git push -u origin fix/login-error
```

## Good Issue

A good Issue includes:

- What
- Why
- Definition of Done
- Owner
- Evidence needed

```md
## Task
Fix the login error shown when the password field is empty.

## Definition of Done
- [ ] Empty password shows clear message
- [ ] Login page does not crash
- [ ] Screenshot attached
- [ ] PR links this issue
- [ ] Tested manually

## Owner
Mina
```

## PR Minimum Standard

Every PR must include:

- linked Issue,
- what changed,
- why it changed,
- screenshots/demo notes if UI changed,
- How tested,
- AI Use Note if AI helped,
- no unrelated changes.

## Projects Board

Use simple columns:

- To Do
- Doing
- Done
- Blocked
- Nice Later

Rules:

- Every card has one owner.
- Every card has Definition of Done.
- Every active task links to evidence.
- If not needed for final demo, move it to Nice Later.

## Receipts

Good receipts:

- PR link
- Issue link
- review comment
- CI run
- screenshot
- test result
- bug report
- docs update
- demo video

Bad receipts:

- “I worked on it”
- “We talked about it”
- “AI made it”
- “Almost done”
