# TEMPLATE - Risk or Blocker Issue

## Risk / Blocker

- Backend API availability and environment mismatch between local and deployed frontend.

## Type

- [ ] Technical
- [ ] Scope
- [ ] Team / ownership
- [ ] Deployment
- [ ] Data / API
- [ ] Unknown AI-generated code
- [ ] Other:

Selected for this example:

- [x] Technical
- [x] Deployment
- [x] Data / API

## Why It Matters

- Core flows like login and upload can fail during demo if API base URL or backend status is wrong.

## Evidence

- `frontend/js/api.config.js`
- `frontend/login/sell_crops.js`
- Live demo behavior: https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/

## Owner

- Sonam

## Help Needed

- Team review to verify all API endpoints and fallback behavior before final demo.

## Mitigation Plan

1. Confirm production API base URL and local dev URL strategy.
2. Add clear UI error handling for failed network/API responses.
3. Run smoke tests for login/upload/profile/message flows and record evidence.

## Deadline / Review Date

- Before next weekly sprint demo.
