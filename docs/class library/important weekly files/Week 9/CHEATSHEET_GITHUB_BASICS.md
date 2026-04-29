# CHEATSHEET - GitHub Basics (Capstone Design)

**Goal:** Use GitHub as the single source of truth for tasks, code, docs, AI-assisted work, and evidence.

## The workflow

1. **Issue** = work request or problem to solve
2. **Branch** = safe place to do the work
3. **Commit** = saved change with a message
4. **Pull Request (PR)** = propose merging work + show evidence
5. **Review** = team checks the work before merging
6. **Merge** = work becomes part of the main project
7. **Sprint Packet** = weekly proof of progress

---

## Daily basics

### 1. Get the latest code

```bash
git checkout main
git pull
```

### 2. Create a branch

Branch names should be boring and readable.

```bash
git checkout -b fix/login-error
```

Good names:

- `feature/user-profile`
- `fix/login-error`
- `docs/setup-guide`
- `test/signup-validation`
- `refactor/auth-flow`

### 3. Make changes + commit

```bash
git add .
git commit -m "Fix login error message"
```

### 4. Push branch

```bash
git push -u origin fix/login-error
```

### 5. Open a PR

In GitHub:

- Click **Compare & pull request**.
- Fill the PR template.
- Link the Issue it solves, for example: `Closes #12`.
- Include evidence.

---

## Issues: how to write good work cards

A good Issue includes:

- **What:** one clear task
- **Why:** short reason
- **Definition of Done:** checklist that can be verified
- **Owner:** one person
- **Evidence needed:** what link/screenshot/test proves it

Example:

```md
## Task
Fix the login error shown when the password field is empty.

## Why
Users currently see a confusing server error.

## Definition of Done
- [ ] Empty password shows clear message
- [ ] Login page does not crash
- [ ] Screenshot attached
- [ ] PR links this issue
- [ ] Tested manually

## Owner
Mina
```

---

## Pull Requests: minimum standard

Every PR must include:

- linked Issue
- what changed
- why it changed
- screenshots or demo notes if UI changed
- **How tested**
- **AI Use Note**
- no unrelated changes

### Required AI Use Note

```md
## AI Use Note

- AI tool used:
- What AI helped with:
- What I personally checked or changed:
- How I tested it:
- One part I still do not fully understand:
```

**Rule:** If no one can explain the code, it is not done.

---

## Using GitHub Copilot correctly

Copilot is allowed. Copilot is useful. Copilot is not your team leader.

Good uses:

- explain unfamiliar code
- summarize a file
- suggest test cases
- find likely bugs
- draft small changes from a clear Issue
- improve error handling
- refactor one small area
- write first-pass documentation

Bad uses:

- “Build the whole app”
- accepting huge changes without review
- changing files unrelated to the Issue
- adding libraries no one understands
- generating code no one can explain
- pretending AI output is finished work

### Good Copilot prompt pattern

```txt
We are working on Issue #18: Fix login error when password is empty.

First, inspect the relevant files and explain the current flow.
Do not edit anything yet.
Then suggest the smallest safe fix.
After that, tell me what tests or manual checks we should run.
```

### Bad Copilot prompt

```txt
Fix all auth problems and make it better.
```

That is how you summon chaos.

---

## Repository custom instructions

Recommended file:

```txt
.github/copilot-instructions.md
```

Use it to tell Copilot the project rules.

Starter text:

```md
# Copilot Instructions

This is a student capstone project.

Rules:
- Make small, issue-focused changes.
- Do not change unrelated files.
- Prefer clear code over clever code.
- Explain the plan before editing.
- Add or update tests when reasonable.
- Preserve existing project structure unless asked.
- Never hide uncertainty.
- After changes, summarize what changed and how to test it.
```

---

## GitHub Projects board

Use simple columns:

- **To Do**
- **Doing**
- **Done**
- Optional: **Blocked**
- Optional: **Nice Later**

Rules:

- Every card has one owner.
- Every card has Definition of Done.
- Every active task links to evidence.
- If blocked, label it `blocker` and explain what is needed.
- If not needed for final demo, move it to `Nice Later`.

---

## Weekly Sprint Packet

One team submission per week.

Must include:

- Weekly Progress Demo link or notes
- demo link + 3-bullet demo script + backup plan
- board snapshot
- shipped work with links
- bugs / risks / blockers
- engineering practice spine evidence
- AI Use + Code Ownership Check
- next sprint plan
- individual receipts in comments

Each student comments with 2–3 receipts.

---

## What counts as receipts

Good receipts:

- PR link
- Issue link you owned or closed
- review comment link
- CI run link
- screenshot of working feature
- test result
- bug report
- docs update
- demo video

Does not count:

- “I worked on it”
- “We talked about it”
- “AI made it”
- “It is almost done”
- unlinked screenshots on someone’s laptop

---

## Common mistakes

- Working directly on `main`
- No Issue for the work
- Huge PRs with unrelated changes
- No “How tested” section
- No AI Use Note
- Accepting AI code without review
- No receipts comment on Sprint Packet
- Board says “Done” but no evidence link

---

## If something goes wrong

### I made changes on main by accident

```bash
git checkout -b fix/moved-from-main
git add .
git commit -m "Move accidental main changes into branch"
git push -u origin fix/moved-from-main
```

### My branch is behind main

```bash
git checkout fix/login-error
git pull origin main
# resolve conflicts if needed
git push
```

### AI changed too many files

Do not panic. Do this:

```bash
git status
git diff
```

Then either keep only the useful changes or discard the mess:

```bash
git restore path/to/file
```

If you are unsure, ask before committing.
