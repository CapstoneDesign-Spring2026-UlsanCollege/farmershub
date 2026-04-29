# TEMPLATE - QA Checklist

## Team

- **Team:** FarmersHub Team
- **Project:** FarmersHub
- **Date:** 4/29/2026
- **QA Lead:** Sonam

## Core Flow Tested

Describe the main user flow:

1. Open app and navigate to login/create account.
2. Authenticate and load user flow.
3. Navigate to upload/product flow and submit data.
4. Validate profile/product/message UI states.

## Smoke Test

- [ ] App starts locally.
- [ ] No obvious console errors.
- [ ] Main page loads.
- [ ] Core flow can begin.
- [ ] Core flow can finish.
- [ ] Data saves or displays correctly.
- [ ] Error state appears for bad input.
- [ ] Empty state appears when there is no data.

## Role / User Tests

| User type | Test | Result | Evidence |
|---|---|---|---|
| Visitor | Open live home page and browse static sections | Pass | https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/ |
| Auth user | Login/create account UI flow | Pass / Needs backend retest | `frontend/login/login.html`, `frontend/login/createAccount.html` |
| Seller | Upload product/media flow | Pass / Needs backend retest | `frontend/login/sell_crops.html`, `frontend/product.html` |

## Browser / Device Checks

- [ ] Chrome
- [ ] Edge
- [ ] Mobile width
- [ ] Desktop width

## Bug List

| Bug | Severity | Issue link | Owner |
|---|---|---|---|
| Backend unavailable can break upload/login actions | P1 | Add issue link | Sonam |
| Messaging integration status not fully verified | P2 | Add issue link | Sonam |

## Final QA Notes

- Prioritize P1 upload/auth reliability checks before demo day.
