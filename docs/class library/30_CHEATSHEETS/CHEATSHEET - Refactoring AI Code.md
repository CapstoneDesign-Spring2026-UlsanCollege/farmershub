# CHEATSHEET - Refactoring AI Code

## Goal

Simplify messy AI-generated code without breaking the app.

## Refactor Means

Improve structure or readability while keeping behavior the same.

## Good Refactor Targets

- duplicate code,
- confusing function names,
- dead code,
- giant component,
- unclear error handling,
- repeated API calls,
- unused imports/files.

## Rules

- Start from one Issue.
- Change one small area.
- Do not add features.
- Do not add dependencies unless required.
- Test before and after.
- Review `git diff`.
- Open a PR explaining what changed.

## Safe Prompt

```txt
We are working on Issue #24: simplify dashboard component.

Inspect this file and explain what it does.
Do not edit yet.
Then suggest a small refactor that does not change behavior.
```

## Definition of Done

- [ ] Code is easier to read.
- [ ] Behavior did not change.
- [ ] App still runs.
- [ ] Manual or automated test evidence exists.
- [ ] PR explains the refactor.
- [ ] Team member can explain the change.
