# FarmersHub — SDLC Working Model & Team Charter

> **Project:** FarmersHub — farm-direct marketplace (Ulsan, South Korea)
> **Org:** `CapstoneDesign-Spring2026-UlsanCollege`
> **Doc owner:** Technical Writer (cross-cutting)
> **Status:** Living document — updated at the end of every phase/cycle
> **Last updated:** 2026-08-07

---

## 1. Purpose

This document is the single source of truth for **how we work**. From here on, all FarmersHub work runs through a 7-phase Software Development Life Cycle (SDLC). Every unit of work names its phase, its owning role, and its deliverable. Documentation is not optional — each phase produces at least one written artifact.

---

## 2. The Team

FarmersHub is owned and directed by one person, working with an AI engineering partner that
covers the seven delivery roles. This is stated plainly rather than dressed up as a
headcount, because the operating discipline is what matters, not the org chart.

| Seat | Held by | Primary SDLC phases | Owns |
|---|---|---|---|
| **Owner / Product Direction** | **TAMANG SONAM** | All — final say | Vision, scope calls, priorities, accept/reject on every deliverable |
| Product Manager / Business Analyst | AI partner | Planning, Requirements | Backlog, acceptance criteria drafts |
| Software Architect / Tech Lead | AI partner | Design | System design, tech decisions, ADRs, code standards |
| Backend Engineer | AI partner | Development | API, data models |
| Frontend Engineer | AI partner | Development, Design | Screen implementation |
| UI/UX Designer | AI partner | Design | Visual direction, design system upkeep |
| QA Engineer | AI partner | Testing | Test plans, audits, verification |
| DevOps Engineer | AI partner | Deployment | Pages/API deploys, build, backups |
| Technical Writer | AI partner | All (cross-cutting) | README, specs, changelog, this document |

**The owner decides; the partner proposes and builds.** Every scope call, architecture fork
and release is the owner's to make. The partner's job is to put a written, argued
recommendation in front of that decision — never to make it silently.

### Rules of engagement

1. **Nothing is decided in chat alone.** Architecture and scope decisions become an ADR in
   `03-docs/adr/`, with the options that were rejected and why.
2. **Every work item names its phase and its deliverable** before work starts.
3. **Definition of ready:** the goal and its acceptance criteria are written down, and any
   blocking decision is already made.
4. **Definition of done:** it builds, it has been exercised against the acceptance criteria,
   the CHANGELOG has an entry, and the affected doc is updated. Code that works but is
   undocumented is not done.
5. **Work happens on a branch and lands through a PR**, even solo. The PR description is the
   engineering record: what changed, why, and what a reviewer should check.
6. **Destructive operations require an explicit go-ahead and a verified backup first.**
7. **No secrets in the repository**, ever. The root `.gitignore` is the enforcement.
8. **Status is refreshed at the end of every cycle** — Section 4 of this document.

---

## 3. The SDLC Working Model

We follow the 7-phase model. For an in-flight project like FarmersHub, phases run **iteratively** — each feature or fix passes through the relevant phases rather than the whole project marching through once.

| # | Phase | What it means for us | Standard deliverable |
|---|---|---|---|
| 1 | **Planning** | Define scope, goals, resources, risks; shape the roadmap. | Roadmap / cycle plan |
| 2 | **Requirements** | Gather needs, document requirements, write the SRS. | Requirements note / acceptance criteria |
| 3 | **Design** | Translate requirements into architecture, data models, and UI. | Design spec / mockups |
| 4 | **Development** | Write and integrate code to standard. | Working code + PR notes |
| 5 | **Testing** | Multiple test levels; find bugs; verify against requirements. | Test plan + bug report |
| 6 | **Deployment** | Release to production, configure, hand off. | Release notes |
| 7 | **Maintenance** | Fix bugs, improve performance, add features, keep it reliable. | Change log / issue triage |

**Rule of the cycle:** No work item is "done" until its deliverable is written down. Docs live in the repo under `/docs`.

---

## 4. FarmersHub — Current Status by Phase

On 2026-08-07 the repository was reset to the design package. `main` now contains the
design system, the customer screens and these docs — **and no application code.** The
previous Express/Mongoose API, multi-page frontend, React entrance and Expo mobile app
exist only in a local backup bundle. The table below reflects that reality.

| Phase | Status | Notes |
|---|---|---|
| 1. Planning | ✅ Established | Capstone scope defined (Spring 2026 cohort). Forward plan written: `ENGINEERING_PLAN.md`. |
| 2. Requirements | 🟡 Undocumented | Marketplace requirements understood in practice; the SRS is still unwritten. Needed before the API is designed. |
| 3. Design | ✅ Customer flow complete | Editorial identity established. Home, marketplace, product detail and basket all delivered, plus the re-skinned entrance/login and the shared vector shovel cursor. |
| 4. Development | 🔴 Reset to zero | No application code on `main`. Rebuild scope is the open decision — see `ENGINEERING_PLAN.md` §2. |
| 5. Testing | 🔴 Not started | No formal test plan. Deferred until there is application code to test (M5). |
| 6. Deployment | 🟡 Static only | GitHub Pages serves the entrance from the repo root. No API deployed; no release process or backup automation. |
| 7. Maintenance | ⚪ Not applicable | Resumes once Phase 4 restarts. |

---

## 5. Documentation Standard

Every cycle we maintain these under a `/docs` folder in the repo:

- `README.md` — project overview, setup, run instructions
- `docs/requirements.md` — SRS / acceptance criteria (Phase 2)
- `docs/architecture.md` — system design, data models, standards (Phase 3)
- `docs/design-system.md` — typography, color, components, screen specs (Phase 3)
- `docs/test-plan.md` — test levels, cases, results (Phase 5)
- `docs/CHANGELOG.md` — every merged change (Phases 4–7)
- `docs/backlog.md` — prioritized work items with phase + owner

---

## 6. The Next Plan (Backlog)

> **Superseded 2026-08-07 by `ENGINEERING_PLAN.md`.** Tracks B and C below are no longer
> actionable as written — they reference backend and frontend source files that are not in
> the repository after the reset. Track A is complete. Kept here as a record of what was
> planned before the reset.

Three parallel tracks are open. Each is prioritized and mapped to a phase and owner.

### Track A — Design: finish the UI (Phase 3) — *UX + FE*
- **A1.** Confirm the redesigned editorial direction (home screen approved as the reference).
- **A2.** Design + build **marketplace** screen.
- **A3.** Design + build **product detail** screen.
- **A4.** Design + build **basket** screen.
- **Blocker:** direction confirmation only. *This is the track we can move on immediately.*

### Track B — Development: backend review + fixes (Phase 4) — *Arch + BE*
- **B1.** Line-level review of core files (auth middleware, token utils, admin controller, user controller, 2 catch-block controllers).
- **B2.** Apply the 6 low-priority fixes (duplicate auth middleware, avatar upload path, pointless re-export, legacy model files, backup dir auto-create, masked errors).
- **B3.** Work through the **10 deferred critical/medium issues**.
- **Blocker:** actual source files need to be pasted for a real code-level review.

### Track C — Testing: frontend error audit (Phase 5) — *QA*
- **C1.** Audit `frontend/customer.html` and `main.js` for genuine errors.
- **Blocker:** plain-text GitHub blob URLs needed (markdown-formatted URLs fail; `/tree/` and `/commits/` are robots-blocked; the GitHub API tree endpoint works for listing).

---

## 7. How We Work Each Cycle

1. **PM** picks the track and states the goal + acceptance criteria.
2. **Arch/UX** produces the design or plan (Phase 3).
3. **BE/FE** implement (Phase 4).
4. **QA** tests against acceptance criteria (Phase 5).
5. **Ops** deploys (Phase 6).
6. **Docs** updates the relevant `/docs` file and the CHANGELOG.
7. This working-model doc's status table (Section 4) is refreshed.

---

*End of working model. This is our operating agreement for FarmersHub from 2026-08-05 onward.*
