# FarmersHub — SDLC Working Model & Team Charter

> **Project:** FarmersHub — farm-direct marketplace (Ulsan, South Korea)
> **Org:** `CapstoneDesign-Spring2026-UlsanCollege`
> **Doc owner:** Technical Writer (cross-cutting)
> **Status:** Living document — updated at the end of every phase/cycle
> **Last updated:** 2026-08-05

---

## 1. Purpose

This document is the single source of truth for **how we work**. From here on, all FarmersHub work runs through a 7-phase Software Development Life Cycle (SDLC). Every unit of work names its phase, its owning role, and its deliverable. Documentation is not optional — each phase produces at least one written artifact.

---

## 2. The Team

We operate as a small cross-functional team. Each role owns specific SDLC phases but collaborates across all of them.

| Role | Name | Primary SDLC phases | Owns |
|---|---|---|---|
| Product Manager / Business Analyst | **PM** | Planning, Requirements | Scope, backlog, acceptance criteria |
| Software Architect / Tech Lead | **Arch** | Design | System design, tech decisions, code standards |
| Backend Engineer | **BE** | Development | Node/Express/Mongoose API, data models |
| Frontend Engineer | **FE** | Development, Design | HTML/JS, screen implementation |
| UI/UX Designer | **UX** | Design | Visual direction, mockups, design system |
| QA Engineer | **QA** | Testing | Test plans, bug audits, verification |
| DevOps Engineer | **Ops** | Deployment | GitHub Pages, build/release, backups |
| Technical Writer | **Docs** | All (cross-cutting) | README, specs, changelog, this document |

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

FarmersHub is **mid-flight**, not greenfield. Here is where each phase stands today.

| Phase | Status | Notes |
|---|---|---|
| 1. Planning | ✅ Established | Capstone scope defined (Spring 2026 cohort). |
| 2. Requirements | ✅ Mostly done | Marketplace requirements understood; formal SRS not yet written down. |
| 3. Design | 🟡 In progress | Home screen redesigned (editorial direction: bone paper, deep ink, single red accent, Instrument Serif + Inter, hand-drawn SVG produce). **3 screens pending: marketplace, product detail, basket.** Direction confirmation outstanding. |
| 4. Development | 🟡 In progress | Backend exists (Node/Express/Mongoose). 6 low-priority fixes scoped via Codex prompt. **10 higher-priority issues deferred.** Source files not yet reviewed at line level. |
| 5. Testing | 🔴 Not started | Frontend `customer.html` audit blocked on file access. No formal test plan yet. |
| 6. Deployment | 🟡 Partial | Hosted on GitHub Pages. No formal release process/backup automation yet. |
| 7. Maintenance | 🟡 Ongoing | Bug triage from prior audit doc (critical / medium / low). |

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
