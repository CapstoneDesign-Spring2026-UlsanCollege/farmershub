# Sprint 4 Guide: QA + Refactor + Professional Polish

## Purpose

Sprint 4 is about making the app reliable enough to demo and hand off.

This means:

- test core flows,
- fix P0/P1 bugs,
- simplify messy code,
- improve setup and architecture docs,
- stabilize deployment or demo environment,
- improve user-facing polish.

## Sprint 4 Weeks

| Week | Focus | Required evidence |
|---:|---|---|
| Week 12 | QA Day | QA checklist + bug severity list |
| Week 13 | Refactor + docs | cleanup PRs + setup/architecture updates |
| Week 14 | Deployment + polish | stable demo/deploy plan + backup plan |

## Refactor Rules

Refactoring means improving code structure without changing behavior.

Good refactor:

- one small area,
- behavior stays the same,
- app still runs,
- tested manually or automatically,
- PR explains what changed.

Bad refactor:

- rewrites half the app,
- adds new libraries,
- breaks working features,
- no one understands it.

## QA Requirements

By the end of Sprint 4:

- [ ] QA checklist exists.
- [ ] P0 bugs are fixed or clearly documented.
- [ ] P1 bugs have owners and next steps.
- [ ] Core flow is tested.
- [ ] Setup guide works for a new teammate.
- [ ] Demo/deploy plan is stable.
- [ ] README and `/docs` are updated.

## What Good Looks Like

> “We tested the core reservation flow, found two P1 bugs, fixed one in PR #31, and documented the remaining workaround. We also updated `docs/SETUP.md` so the app runs from a fresh clone.”

## Common Mistakes

- Calling something “QA” without a checklist.
- Fixing bugs directly on `main`.
- Refactoring without testing.
- Updating docs after the demo instead of before.
