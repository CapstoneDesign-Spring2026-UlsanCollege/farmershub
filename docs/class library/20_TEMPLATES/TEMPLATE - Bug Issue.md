# TEMPLATE - Bug Issue

## Bug Summary

- [Example] Upload flow fails when backend server is unavailable from frontend runtime.

## Severity

Choose one:

- [ ] **P0:** final demo cannot work
- [x] **P1:** core feature broken or unreliable
- [ ] **P2:** important but workaround exists
- [ ] **P3:** polish / nice improvement

## Steps to Reproduce

1. Open the app and navigate to upload/sell crops flow.
2. Attempt product/media upload while backend API is not reachable.
3. Observe failed request or missing success result.

## Expected Result

- User should see either successful upload or clear actionable error message.

## Actual Result

- Upload operation fails silently or returns non-user-friendly error behavior.

## Evidence

- Screenshot/video: Add screenshot from failed upload attempt.
- Error message: Add console/network error text from browser DevTools.
- Log: Add backend terminal/API log output if available.
- Related PR/commit: Link PR or commit that introduces/fixes issue.

## Suspected Area

- File/component/route: `frontend/login/sell_crops.js`, `frontend/js/api.config.js`, backend upload routes.
- Owner: Sonam

## Definition of Done

- [ ] Bug is reproduced or clearly documented.
- [ ] Fix or workaround is linked.
- [ ] Tested manually or automatically.
- [ ] Evidence is added to Sprint Packet.
