# Week 10 - Weekly Sprint Packet

**Project:** FarmersHub  
**Team:** CodingFarmers  
**Sprint:** Sprint 3 - MVP Verification + Code Ownership  
**Week:** 10  
**Date:** May 6-12, 2026  
**Repository:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub  
**Live Demo:** https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/  
**Packet Status:** Draft for team review

---

## 1. Week 10 Purpose

Week 9 started the Sprint 3 standard: the MVP only counts when the team can run it, explain it, test it, debug it, and link evidence.

Week 10 continues that work. The focus is not adding many new features. The focus is stabilizing the core FarmersHub flow and proving that the app is ready for a reliable demo.

Main Week 10 goal:

> Prove the FarmersHub MVP works end to end, document the remaining risks, and connect every claim to evidence.

---

## 2. Week 9 Class Deck Notes Used

The two provided PDFs were checked:

- `Week 9 - Prove the MVP Is Real.pdf`
- `Week 9 - Prove the MVP Is Real (1).pdf`

The main standards carried into this Week 10 packet are:

- The app must run.
- The core flow must be stable.
- Bugs must be visible and tracked.
- AI-assisted code must be reviewed and explainable.
- GitHub Issues, PRs, screenshots, tests, and docs should be linked as evidence.
- Every student should provide contribution receipts.

---

## 3. Current MVP Flow

The current FarmersHub MVP should demonstrate this flow:

1. A user opens the FarmersHub live site.
2. A farmer creates an account or logs in.
3. The farmer can view profile/dashboard information.
4. The farmer can add or manage crop/product information.
5. A consumer can browse products and farmer details.
6. The team can explain which frontend and backend files support the flow.

Evidence already available:

- Live site: https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/
- Create account page: https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/login/createAccount.html
- Week 9 progress demo: `docs/weekly-sprint-packets/week 9/WEEKLY_PROGRESS_DEMO.md`
- AI ownership audit: `docs/weekly-sprint-packets/week 9/AI Code Ownership.md`
- Demonstration run notes: `docs/DEMONSTRATION_RUN.md`

---

## 4. What Changed Since Week 9

| Area | Week 9 Status | Week 10 Update |
|---|---|---|
| Login/signup | Signup page and database evidence shown | Retest full register/login/logout flow |
| Product flow | Product upload/listing flow available | Verify add, edit, search/filter, and delete behavior |
| Backend API | Route/controller structure exists | Confirm local backend demo mode and endpoint responses |
| Deployment | Live frontend available | Confirm live pages still load after latest pull |
| Documentation | Week 9 packet and ownership audit started | Add Week 10 packet and update evidence links |
| Bugs/risks | Initial P1/P2 risks listed | Convert remaining unstable behavior into GitHub Issues |

---

## 5. Week 10 Demo Plan

### Demo Status

**Status:** In preparation

### Demo Driver

- **PM:** subedi yubaraj
- **Demo Driver:** tamang sonam
- **QA Lead / Scribe:** Shrestha Chiranjibi
- **Backup Speaker:** tamang sonam
### 5-Minute Demo Structure

| Segment | Time | Owner | Evidence |
|---|---:|---|---|
| What changed since Week 9 | 45 sec | PM | This packet + commit/Issue links |
| Show core MVP flow | 2 min | Demo Driver | Live site or local app |
| Show evidence | 1 min | QA Lead / Scribe | Screenshots, demo run notes, GitHub links |
| Explain one code area | 1 min | Random member | File links and ownership audit |
| Ask/blocker | 15 sec | PM | Risk table or GitHub Issue |

### Demo Script

1. Open the FarmersHub live site.
2. Navigate to create account/login.
3. Show the account flow or prepared evidence if using local backend.
4. Show product browsing or product management.
5. Show one backend/API evidence item from `docs/DEMONSTRATION_RUN.md`.
6. Show the AI ownership audit and explain one code area.
7. End with the top risks and Week 10 stabilization goals.

### Backup Plan

- Use screenshots from `docs/weekly-sprint-packets/week 9/images/`.
- Use `docs/DEMONSTRATION_RUN.md` to show the tested API flow.
- Walk through relevant frontend and backend files if live demo is unavailable.

---

## 6. Evidence Checklist

Before Friday submission, collect or update these items:

- [ ] Screenshot or short recording of live site loading.
- [ ] Screenshot or test result for register/login flow.
- [ ] Screenshot or test result for product add/list/search behavior.
- [ ] Screenshot or note showing backend running in demo mode.
- [ ] GitHub Issue links for any P1/P2 bugs.
- [ ] Board snapshot showing To Do, Doing, Done, Blocked, and Nice Later.
- [ ] Updated AI Code Ownership notes.
- [ ] Individual contribution receipts from each team member.

---

## 7. Bugs and Risks

| Bug / Risk | Severity | Evidence | Owner | Next Action |
|---|---|---|---|---|
| Backend-dependent flows may fail when backend is not running | P1 | `frontend/assets/js/config/api.config.js`, `docs/DEMONSTRATION_RUN.md` | Sonam | Verify live vs local API behavior |
| Product upload/media display needs regression testing | P2 | `frontend/login/sell_crops.js`, `backend/services/mediaUrlService.js` | TBD | Run upload checklist and save evidence |
| Some frontend pages may be UI-complete but not fully integrated | P2 | Frontend pages and service files | TBD | Mark each page as working, partial, or not tested |
| Team code ownership still needs more student receipts | P2 | Week 9 ownership audit | PM | Ask every member for 2-3 evidence links |

Severity guide:

- **P0:** Blocks demo completely.
- **P1:** Breaks core MVP flow.
- **P2:** Important but can be worked around in demo.
- **P3:** Polish or documentation issue.

---

## 8. Week 10 Stabilization Goals

1. Verify the core MVP flow from login to product browsing/product management.
2. Create or update GitHub Issues for all P1/P2 bugs.
3. Update the ownership audit so each main code area has a human owner.
4. Make the demo repeatable using live site evidence and local backend fallback notes.
5. Collect individual receipts from all active team members.

---

## 9. Engineering Practice Spine

### AI Workflow

- AI can help draft code, docs, tests, and cleanup plans.
- Human team members must review and understand the final work.
- Any AI-assisted code must be connected to a file, Issue, PR, or explanation.
- Code that nobody can explain should be marked as "Not Yet" until reviewed.

### Code Ownership

| Code Area | File / Folder | Current Owner | Status |
|---|---|---|---|
| Login and account pages | `frontend/login/` | Sonam | Needs Week 10 retest |
| API service configuration | `frontend/assets/js/config/api.config.js` | Sonam | Needs live/local check |
| Product flow | `frontend/product.html`, `frontend/login/sell_crops.js` | TBD | Needs regression test |
| Backend auth and user routes | `backend/routes/`, `backend/controllers/` | TBD | Needs owner confirmation |
| Demo notes and sprint packet | `docs/DEMONSTRATION_RUN.md`, this packet | PM / Scribe | In progress |

---

## 10. GitHub Board Cleanup

Use these board columns:

- To Do
- Doing
- Done
- Blocked
- Nice Later

Week 10 board rules:

- Every active card needs one owner.
- Every active card needs a Definition of Done.
- Every bug should be a GitHub Issue.
- New features should move to Nice Later unless the core MVP flow is already stable.
- Evidence links should be added to cards before marking them Done.

---

## 11. Individual Contribution Receipts

Each student should add 2-3 evidence links.

Good receipts include:

- PR link
- Issue link
- Commit link
- Screenshot
- Test result
- Review comment
- Documentation update
- Demo video or demo note

| Student | Receipt 1 | Receipt 2 | Receipt 3 |
|---|---|---|---|
| Codingpowerplant | TBD | TBD | TBD |
| sthasagar236 | TBD | TBD | TBD |
| TAMANG SONAM | TBD | TBD | TBD |
| yubarajsubedi07 | TBD | TBD | TBD |
| tulsiramsubedi123 | TBD | TBD | TBD |

---

## 12. Friday Submission Checklist

- [ ] Week 10 packet is complete.
- [ ] Weekly progress demo evidence is linked.
- [ ] AI ownership audit is linked or updated.
- [ ] Board snapshot is included.
- [ ] 3-8 shipped or verified items are listed with evidence.
- [ ] Bugs are listed with P0/P1/P2/P3 severity.
- [ ] Risks and blockers are documented.
- [ ] Top 3 goals for next week are listed.
- [ ] Individual receipts are added for every student.

---

## 13. Top 3 Goals for Week 11

1. Finish all P1/P2 fixes or document demo-safe workarounds.
2. Complete final demo rehearsal with the same steps every time.
3. Prepare final evidence package: live link, screenshots, test notes, Issues, PRs, and ownership map.

---

**Last Updated:** May 6, 2026  
**Next Review:** May 13, 2026  
**Prepared By:** farmershub
