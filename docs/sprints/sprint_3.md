
# FarmersHub - Sprint 3 Overview

**Sprint Name:** Sprint 3 - MVP Verification, Stabilization, and QA Readiness  
**Duration:** Week 9-12  
**Repository:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub  
**Live Demo:** https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/  
**Branch Used for Latest Sprint Work:** `weekly`  
**PM / Documentation Lead:** Yubaraj

---

## Team Members

- Yubaraj
- Sonam
- Rupesh
- Tulsiram
- Chirangibi

---

## Sprint Summary

Sprint 3 shifted FarmersHub from feature expansion toward MVP proof. The main goal was to show that the app is real, the core flow can be demonstrated, bugs are visible, and every progress claim has evidence.

The sprint moved through four connected stages:

1. **Week 9:** Prove the MVP is real through login/signup, database evidence, and AI code ownership notes.
2. **Week 10:** Stabilize the MVP flow and connect progress to evidence.
3. **Week 11:** Verify the MVP demo path and document ownership, risks, and next steps.
4. **Week 12:** Prepare QA Day materials, including checklist requirements, bug severity rules, and Friday packet essentials.

**Sprint Status:** MVP stabilization and QA preparation complete at the documentation level; final testing evidence and issue links still need to be filled in.

---

## Weekly Breakdown

### Week 9: Prove the MVP Is Real

Detailed files:

- [Weekly Progress Demo](../weekly-sprint-packets/week%209/WEEKLY_PROGRESS_DEMO.md)
- [AI Code Ownership](../weekly-sprint-packets/week%209/AI%20Code%20Ownership.md)

Key outcomes:

- Login and signup flow were selected as the main demo focus.
- Live create account page was used as deployed evidence.
- MongoDB Compass evidence showed saved farmer records.
- AI/code ownership notes were started to connect code areas with human understanding.

Main Week 9 evidence:

- Live create account page: https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/login/createAccount.html
- Screenshot evidence in `docs/weekly-sprint-packets/week 9/images/`
- Database evidence showing records in the `farmershub.farmers` collection.

### Week 10: MVP Verification and Code Ownership

Detailed file:

- [Weekly Sprint Packet - Week 10](../weekly-sprint-packets/week%2010/weekly%20Sprint%20packet-week10.md)

Key outcomes:

- Defined the Sprint 3 standard: the MVP must run, be explainable, be tested, be debuggable, and link evidence.
- Documented the current MVP flow from live site to login, profile/dashboard, product management, and consumer browsing.
- Identified backend-dependent flows and product upload/media behavior as key risks.
- Set expectations for GitHub Issues, board cleanup, AI ownership, and individual receipts.

### Week 11: MVP Verification

Detailed file:

- [Weekly Sprint Packet - Week 11](../weekly-sprint-packets/week%2011/weekly%20Sprint%20packet-week11.md)

Key outcomes:

- Classified the app as **B. MVP Stabilization**.
- Defined the primary demo flow around login/entry, role-aware dashboard/profile, farmer workspace navigation, product/crop workflow, notifications, saved items, and messaging.
- Added the FarmersHub team member list.
- Created an ownership map for login, dashboard, profile, products/sell crops, messages/notifications, and documentation.
- Documented a Week 11 demo script and evidence checklist.

Recent relevant changes captured in Week 11:

- Role-aware profile behavior.
- Saved notification sound behavior.
- Truthful farmer dashboard metrics.
- Dedicated farmer workspace pages.
- Redesigned settings and farm services workspace.
- Modern messaging workspace.
- Farmer store/profile interface.
- Search and frontend page improvements.

### Week 12: QA Day and Friday Packet Preparation

Detailed file:

- [Weekly Sprint Packet - Week 12](../weekly-sprint-packets/week12/weekly%20Sprint%20packet-week12.md)

Key outcomes:

- Shifted focus to QA, refactor, and professional polish.
- Defined the core QA question: **What would break the final demo right now?**
- Documented the required `docs/QA_CHECKLIST.md` location.
- Planned at least 8 QA tests across environment config, main flow, navigation, empty state, error state, data save/load, deployment/demo, and ownership.
- Defined bug severity rules from P0 to P3.
- Required GitHub Issues for all P0/P1 bugs.
- Added Friday packet essentials: QA checklist link, bug severity list, board snapshot, testing evidence, AI-use note, and individual receipts.

---

## Core MVP Flow

The Sprint 3 MVP flow is:

1. User opens FarmersHub from the live or local site.
2. User signs up or logs in.
3. User reaches the correct farmer/customer dashboard or profile experience.
4. Farmer navigates to operational workspace pages such as products, sell crops, inventory, orders, messages, analytics, settings, and services.
5. User demonstrates one product/crop-related marketplace action.
6. Supporting behavior such as saved items, notifications, profile, or messages is shown.
7. Team links the demo to screenshots, code, Issues, tests, or documentation evidence.

---

## Key Deliverables

| Deliverable | Status | Evidence |
| --- | --- | --- |
| Live frontend demo | Available | https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/ |
| Login/signup demo evidence | Available | Week 9 demo packet and screenshots |
| Database evidence | Available | Week 9 MongoDB Compass screenshot |
| AI code ownership audit | Started | Week 9 AI Code Ownership file |
| Week 10 MVP verification packet | Complete | Week 10 sprint packet |
| Week 11 MVP verification packet | Complete | Week 11 sprint packet |
| Week 12 QA Day packet | Complete | Week 12 sprint packet |
| QA checklist | Needed | Create/update `docs/QA_CHECKLIST.md` |
| P0/P1 GitHub Issues | Needed if bugs found | Add Issue links during QA |
| Board snapshot | Needed | Add Friday submission evidence |
| Individual receipts | Needed | Add proof from each member |

---

## Bugs and Risks

| Risk / Bug Area | Severity | Why It Matters | Owner | Next Action |
| --- | --- | --- | --- | --- |
| Backend-dependent flows may fail when backend is unavailable | P1 | Login, upload, or API-backed actions may break the demo | Sonam | Verify live vs local API behavior and document fallback |
| Product upload and media display need regression testing | P2 | Product/crop flow is central to the marketplace MVP | Tulsiram | Run QA checklist on sell crops/product pages |
| Some pages may be UI-complete but not fully integrated | P2 | Demo claims need proof, not just visual pages | Team | Mark pages as working, partial, or not tested |
| Missing final QA evidence | P2 | Sprint claims are weak without pass/fail results | Team | Create `docs/QA_CHECKLIST.md` and attach evidence |
| Individual contribution receipts are incomplete | P2 | Team members must show ownership and understanding | Yubaraj | Collect commits, screenshots, PRs, Issues, or review notes |

Severity guide:

- **P0:** Final demo cannot work.
- **P1:** Core feature is broken.
- **P2:** Important issue with a workaround.
- **P3:** Polish or minor improvement.

---

## Ownership Map

| Area | Responsibility | Owner |
| --- | --- | --- |
| Login / account creation | Entry flow and user setup | Yubaraj |
| Farmer dashboard | Farmer overview, metrics, and workspace access | Sonam |
| Profile | Role-aware profile and store/profile behavior | Rupesh |
| Products / sell crops | Product and crop workflow pages | Tulsiram |
| Messages / notifications | Communication and alert behavior | Chirangibi |
| Documentation / evidence | Sprint packets, QA checklist, screenshots, and test results | Team |

Each owner should be able to explain what changed, why it matters to the MVP, what evidence proves it works, and what risks remain.

---

## Sprint 3 Definition of Done

- [x] Core MVP flow is documented.
- [x] Live create account evidence is documented.
- [x] Database evidence is documented.
- [x] AI code ownership audit is started.
- [x] Week 10, Week 11, and Week 12 packets are created.
- [x] Bug severity rules are documented.
- [ ] `docs/QA_CHECKLIST.md` contains 8 or more completed tests.
- [ ] P0/P1 bugs are created as GitHub Issues if found.
- [ ] Board snapshot is attached for Friday submission.
- [ ] Individual receipts are added for every team member.

---

## Next Steps

1. Create or update `docs/QA_CHECKLIST.md` with at least 8 tests.
2. Run the documented QA tests and fill expected result, actual result, pass/fail, evidence, and Issue link.
3. Create GitHub Issues for any P0/P1 bugs.
4. Add a sprint board snapshot.
5. Add individual receipts for Yubaraj, Sonam, Rupesh, Tulsiram, and Chirangibi.
6. Rehearse the final demo using the same core MVP flow.

---

**Last Updated:** June 3, 2026  
**Prepared By:** FarmersHub Team
