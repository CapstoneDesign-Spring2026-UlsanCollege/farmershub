# Week 11 Sprint Packet: MVP Verification

## Purpose

This packet verifies the FarmersHub MVP against the Week 11 requirement: demonstrate a core MVP flow that runs successfully, can be demoed clearly, and is supported by evidence.

## FarmersHub Team Members

- Yubaraj
- Sonam
- Rupesh
- Tulsiram
- Chirangibi

## MVP Track

**Current track: B. MVP Stabilization**

The app has a broad working frontend experience and recent updates across profile, dashboard, messaging, settings, services, inventory, orders, payments, analytics, and notifications. The main Week 11 focus is to stabilize the core flow, connect claims to evidence, and identify any remaining bugs clearly.

## Core MVP Flow to Verify

Primary demo flow:

1. User enters FarmersHub from the landing/login area.
2. Farmer/customer role is recognized and the correct dashboard/profile experience appears.
3. Farmer can access operational workspace pages such as products, inventory, orders, messages, analytics, settings, and services.
4. Product or crop-related workflows can be opened and demonstrated without navigation breaks.
5. Notifications, saved items, profile, and messaging support the user journey.

Success state:

- The app opens without crashes.
- The role-aware profile/dashboard experience displays correctly.
- Core navigation links reach the expected pages.
- The presenter can explain what each step proves about the marketplace MVP.

## Weekly Progress Demo Plan

| Segment | Time | What to Show |
| --- | ---: | --- |
| PM update | 45 seconds | Summarize Week 11 focus: MVP verification, stabilization, evidence capture, and bug tracking. |
| Demo presentation | 2 minutes | Walk through the core FarmersHub flow from entry to dashboard/profile and farmer workspace pages. |
| QA evidence | 1 minute | Show test results, manual checks, known issues, and links to commits/PRs. |
| Team explanation | 1 minute | Random team member explains one owned area, what changed, and how it supports the MVP. |

## Verified Evidence

| Evidence Type | Status | Notes / Link |
| --- | --- | --- |
| Repository branch | Ready | `weekly` branch created and pushed to `origin/weekly`. |
| Code changes | Ready | Recent commits include role-aware profile, dashboard metrics, notification sound handling, settings/services workspace, farmer destinations, messaging, and profile UI updates. |
| Demo video | Needed | Record the MVP flow in action. |
| Test result | Needed | Add manual test checklist results or automated test output. |
| Documentation update | In progress | This Week 11 sprint packet documents the MVP verification plan. |
| Review comments | Needed | Add PR or peer-review feedback when available. |
| CI run | Needed | Add build/test status if GitHub Actions or another CI check is available. |

## Recent Relevant Changes

- Profile page now supports role-aware behavior.
- Notification sounds were updated and saved notification sound behavior was fixed.
- Farmer dashboard metrics were updated to be more truthful.
- Farmer workspace destinations were added for operational pages.
- Settings and farm services workspaces were redesigned.
- Messaging workspace interface was modernized.
- Farmer store/profile interface was added.
- Search fixes and frontend page improvements were included in recent commits.

## MVP Verification Checklist

| Area | Check | Result |
| --- | --- | --- |
| App functionality | App loads without crashes or blocking browser errors. | To verify |
| Core flow | User can complete the primary role/dashboard/workspace navigation flow. | To verify |
| Evidence linkage | Each claim has a commit, screenshot, test result, demo video, or PR link. | In progress |
| Bug clarity | Known issues are listed with severity and owner. | In progress |
| Team ownership | Each major feature area has a clear owner who can explain it. | To assign |

## Bug List

| Priority | Issue | Impact | Owner | Status |
| --- | --- | --- | --- | --- |
| P0 | Demo-blocking bugs found during core flow verification | Prevents successful MVP demo | TBD | Add if found |
| P1 | Navigation or UI issues that confuse the flow but do not block it | Weakens demo clarity | TBD | Add if found |
| P2 | Polish, layout, or copy improvements | Nice-to-have for MVP Plus | TBD | Add if found |

Bug rule for Week 11:

- Treat any issue that prevents the demo flow from working as P0.
- Resolve critical bugs first before adding new features.
- Avoid vague claims such as "almost done"; document what works, what breaks, and where the evidence is linked.

## Ownership Map

| Area | Responsibility | Owner |
| --- | --- | --- |
| Login / account creation | Entry flow and user setup | Yubaraj |
| Farmer dashboard | Farmer overview, metrics, and workspace access | Sonam |
| Profile | Role-aware profile and store/profile behavior | Rupesh |
| Products / sell crops | Product and crop workflow pages | Tulsiram |
| Messages / notifications | Communication and alert behavior | Chirangibi |
| Documentation / evidence | Sprint packet, demo script, screenshots, test results | Team |

Each owner should be able to explain what changed, why it matters to the MVP, and how the evidence proves it works.

## Demo Script

1. Start from the app entry page and explain FarmersHub as a marketplace/workspace for farmers and customers.
2. Show account/login or the relevant starting page.
3. Open the dashboard/profile experience and point out role-aware behavior.
4. Navigate to farmer workspace destinations such as products, inventory, orders, messages, analytics, settings, and services.
5. Show one product or crop-related page as the core marketplace action.
6. Show supporting features: notifications, saved items, profile, or messages.
7. Close with evidence: branch, commits, test results, screenshots/video, and known bug list.

## Next Steps

1. Run the core flow manually and mark each checklist item as pass/fail.
2. Capture screenshots or a short demo video for the verified flow.
3. Add PR, commit, test, and review links to the evidence table.
4. Assign owners for each feature area.
5. Fix P0 bugs before adding non-essential polish.
