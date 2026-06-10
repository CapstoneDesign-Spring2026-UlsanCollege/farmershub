# AI and Code Ownership Audit

This audit combines repository evidence with the later sprint ownership map. Ownership means “best documented person to explain or confirm this area,” not exclusive authorship.

| Area | Files | AI assistance | Human owner or reviewer | What the team can explain | Evidence | Remaining risk |
|---|---|---|---|---|---|---|
| Login/account entry | `frontend/login/`, `backend/routes/auth.routes.js` | Refactor/support noted generally | Yubaraj; Sonam supported/auth history | Role entry, API login, token storage | [Yubaraj login history](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/d70b7e7), [auth routes](../../backend/routes/auth.routes.js) | Current tests fail; owner confirmation needed |
| Farmer dashboard | `frontend/index.html`, farmer dashboard assets | General UI/refactor support | Sonam | Role-aware workspace/navigation | [Commit](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/e1f6d8e) | Current manual receipt needed |
| Profile/store/search | `frontend/profile.*`, frontend search files, `backend/routes/users.routes.js` | General refactor support | Rupesh (`lama` / `Codingpowerplant`) per team confirmation and sprint map; Sonam commit evidence | Profile display/update/upload and frontend search behavior | [Profile commit](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/3ab05e2), [search fix](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/3b9f976), [Week 11](../../docs/weekly-sprint-packets/week%2011/weekly%20Sprint%20packet-week11.md) | Exact shared profile ownership needs confirmation |
| Products/sell crops/demo crops | product pages/routes/controllers | General refactor support | Tulsiram per sprint map; Yubaraj and Chiranjibi have sell-crops commits; team confirms Chiranjibi posted demo crops | Product UI, CRUD route flow, and demo-data preparation | [Yubaraj commit](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/c98400f), [Chiranjibi commit](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/1b24ece) | Current regression evidence missing |
| Messages/notifications | frontend pages and backend routes | Not specified per change | Chiranjibi per sprint map; Rupesh and Yubaraj have notification commits | Communication UI and route purpose | [Message commit](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/7ce41f2), [notification commit](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/e20142f) | Needs multi-user QA |
| Demo/content/Issue support | docs, sprint packets, Issues, and demo data | Not documented per change | Chiranjibi; shared team documentation support | Demo preparation, farmer accounts/crops, and evidence organization | [Sprint packet evidence](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/b8b795c), [sell-crops commit](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/1b24ece) | Direct screenshots/Issue links still need collection |
| Repository cleanup/backend/deployment | backend, workflow, cleanup docs | Copilot assistance documented | Sonam; team review required | Architecture, deployment, cleanup decisions | [Cleanup log](../../CLEANUP_LOG.md), [backend rebuild](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/commit/642014a) | Knowledge concentration and test debt |

## Ownership Risks

- Historical roster documents include identities that are not part of the confirmed active final-portfolio roster.
- Contribution receipts are uneven and need member confirmation.
- The broad codebase is larger than the currently proven final demo.
- The failing automated suite weakens confidence in shared debugging readiness.
