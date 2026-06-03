# Week 12 Sprint Packet: QA Day

## Purpose

This packet documents the Week 12 QA Day work for FarmersHub. The goal is to prove the app is real by testing the core MVP flow, logging bugs with evidence, assigning owners, and preparing clear next actions for the final demo.

## FarmersHub Team Members

- Yubaraj
- Sonam
- Rupesh
- Tulsiram
- Chirangibi

## Week 12 Focus

**Sprint 4 focus: QA + refactor + professional polish**

Week 12 is not about adding more features. The priority is to verify the existing MVP, fix what matters, and support every claim with evidence.

Key question:

**What would break the final demo right now?**

## Core MVP Flow to Test

Primary FarmersHub flow:

1. User enters FarmersHub from the landing/login area.
2. User signs up or logs in.
3. User reaches the correct farmer/customer dashboard or profile experience.
4. Farmer opens core workspace pages such as products, sell crops, inventory, orders, messages, analytics, settings, and services.
5. User completes or demonstrates one product/crop-related marketplace action.
6. User confirms supporting behavior such as saved items, notifications, profile, or messages.

Success state:

- The app loads without crashes.
- Core navigation works across the demo path.
- The farmer/customer role experience is understandable.
- The main marketplace workflow can be shown clearly.
- Evidence exists for what passed, what failed, and what needs fixing.

## Weekly Progress Presentation Plan

| Segment | What to Show |
| --- | --- |
| What changed? | Summarize QA focus, bug fixes, and stabilization work. |
| Show improvement | Demonstrate the most important core flow improvement. |
| Show evidence | Open the app, repo, board, PRs, Issues, tests, screenshots, or docs. |
| Random member explains | A team member explains their owned area and evidence. |
| Ask / blocker | Name the most important blocker or next action. |

Presentation rule:

- 5 minutes per team.
- No slides required.
- Show the app, repo, board, PRs, Issues, tests, and docs.
- Evidence-based progress is the standard.

## QA Day Workflow

1. Write the core MVP flow.
2. Create the QA checklist.
3. Run tests.
4. Log bugs.
5. Assign severity.
6. Update this sprint packet.

## QA Checklist Requirement

Required checklist location:

`docs/QA_CHECKLIST.md`

The checklist must include at least 8 tests covering critical application areas.

| Required Area | FarmersHub Test Target | Status |
| --- | --- | --- |
| Environment config | App opens with correct local paths and assets. | To test |
| Main flow | Login/dashboard/workspace flow works. | To test |
| Navigation | Core pages can be reached without broken links. | To test |
| Empty state | Pages behave clearly when no data exists. | To test |
| Error state | Invalid input or failed actions show understandable behavior. | To test |
| Data save/load | Saved settings, products, profile, or notifications persist where expected. | To test |
| Deployment/demo | Demo path works on the presentation machine or hosted site. | To test |
| Ownership | Each member can explain an owned area with evidence. | To test |

Suggested checklist columns:

| ID | Test Case | Expected Result | Actual Result | Pass/Fail | Evidence | Issue Link |
| --- | --- | --- | --- | --- | --- | --- |
| QA-01 | Login or enter app | Correct dashboard/profile opens | TBD | TBD | TBD | TBD |
| QA-02 | Create account flow | New user information is accepted or validation appears | TBD | TBD | TBD | TBD |
| QA-03 | Farmer dashboard navigation | Workspace links open expected pages | TBD | TBD | TBD | TBD |
| QA-04 | Sell crops/products page | Product/crop workflow can be opened and explained | TBD | TBD | TBD | TBD |
| QA-05 | Inventory/orders page | Operational page opens without broken UI | TBD | TBD | TBD | TBD |
| QA-06 | Messages/notifications | Communication or notification page opens and displays expected state | TBD | TBD | TBD | TBD |
| QA-07 | Profile role behavior | Profile reflects correct user role experience | TBD | TBD | TBD | TBD |
| QA-08 | Error/empty state | Invalid or empty data state is understandable | TBD | TBD | TBD | TBD |

## Bug Severity Rules

Severity is based on demo risk and user impact.

| Severity | Meaning | FarmersHub Example |
| --- | --- | --- |
| P0 | Final demo cannot work | Login/dashboard/demo path is blocked. |
| P1 | Core feature broken | Products, sell crops, profile, or dashboard flow fails. |
| P2 | Important issue, workaround exists | Page works but a key button or state is confusing. |
| P3 | Polish or nice improvement | Minor layout, copy, spacing, or visual issue. |

P0/P1 rule:

- Every P0 or P1 bug must become a GitHub Issue.
- Each issue must include severity, reproduction steps, expected result, actual result, evidence, owner, and next step.

## Bug Severity List

| Priority | Issue | Impact | Owner | Evidence | GitHub Issue | Status |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | Add if demo-blocking issue is found | Final demo cannot proceed | TBD | TBD | TBD | Not started |
| P1 | Add if core feature is broken | Core MVP path is damaged | TBD | TBD | TBD | Not started |
| P2 | Add important workaround issue | Demo can continue with explanation | TBD | TBD | TBD | Not started |
| P3 | Add polish issue | Low demo risk | TBD | TBD | TBD | Not started |

## Evidence Checklist

Good evidence for Week 12:

- PR link
- GitHub Issue link
- Screenshot
- Test output
- CI run
- Demo video
- Docs commit
- Board snapshot
- Individual contribution receipts

Avoid weak evidence:

- "Almost done"
- "We talked"
- "AI fixed it"
- "It works on my laptop"

## Friday Sprint Packet Essentials

| Required Item | Status | Notes / Link |
| --- | --- | --- |
| Weekly progress demo evidence | Needed | Add recording, screenshots, or demo notes. |
| QA checklist link | Needed | Link `docs/QA_CHECKLIST.md` after it is created. |
| Bug severity list | In progress | Use the table in this packet and GitHub Issues. |
| Board snapshot | Needed | Add screenshot of current sprint board. |
| Testing evidence | Needed | Add logs, screenshots, or recordings for tests. |
| AI use + code ownership check | Needed | Add notes explaining AI assistance and team understanding. |
| Individual receipts | Needed | Add proof of each member's contribution. |

## AI Use and Code Ownership

AI can help during QA by suggesting test cases, explaining errors, drafting bug reports, and reviewing edge cases.

AI cannot replace running the app, testing the flow, understanding the code, or collecting evidence.

For Friday, each team member should be ready to explain:

- What area they own.
- What changed in that area.
- What evidence proves it works.
- What bugs or risks remain.
- How AI was used, if applicable.

## Ownership Map

| Area | Responsibility | Owner |
| --- | --- | --- |
| Login / account creation | Entry flow and user setup | Yubaraj |
| Farmer dashboard | Farmer overview, metrics, and workspace access | Sonam |
| Profile | Role-aware profile and store/profile behavior | Rupesh |
| Products / sell crops | Product and crop workflow pages | Tulsiram |
| Messages / notifications | Communication and alert behavior | Chirangibi |
| Documentation / evidence | Sprint packet, QA checklist, screenshots, test results | Team |

## Individual Receipts

| Member | Contribution Evidence | Link / Notes |
| --- | --- | --- |
| Yubaraj | TBD | Add commit, PR, Issue, screenshot, or test evidence. |
| Sonam | TBD | Add commit, PR, Issue, screenshot, or test evidence. |
| Rupesh | TBD | Add commit, PR, Issue, screenshot, or test evidence. |
| Tulsiram | TBD | Add commit, PR, Issue, screenshot, or test evidence. |
| Chirangibi | TBD | Add commit, PR, Issue, screenshot, or test evidence. |

## Exit Checkpoint

Before leaving QA Day, confirm:

- QA checklist exists.
- 8 or more tests are written.
- Tests are run and documented.
- Bugs are triaged by severity.
- P0/P1 GitHub Issues are created.
- Sprint board is updated.
- Friday packet is started.

## Next Actions

1. Create or update `docs/QA_CHECKLIST.md`.
2. Run the 8 required QA tests.
3. Fill in actual results, pass/fail status, evidence, and issue links.
4. Create GitHub Issues for all P0/P1 bugs.
5. Add a board snapshot and individual receipts.
6. Update this packet before the Friday submission.
