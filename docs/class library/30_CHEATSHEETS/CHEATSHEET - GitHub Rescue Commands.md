# CHEATSHEET - GitHub Rescue Commands

## I made changes on main by accident

```bash
git checkout -b fix/moved-from-main
git add .
git commit -m "Move accidental main changes into branch"
git push -u origin fix/moved-from-main
```

Then open a PR.

## My branch is behind main

```bash
git checkout fix/login-error
git pull origin main
# resolve conflicts if needed
git push
```

## AI changed too many files

First inspect:

```bash
git status
git diff
```

Restore one file:

```bash
git restore path/to/file
```

Restore all uncommitted changes:

```bash
git restore .
```

## I need to see what changed

```bash
git diff
```

## I need to see recent commits

```bash
git log --oneline -5
```

## I committed but forgot something

```bash
git add .
git commit --amend
git push --force-with-lease
```

Only use this on your own branch.

## I am unsure

Stop before committing. Ask your team or instructor.
