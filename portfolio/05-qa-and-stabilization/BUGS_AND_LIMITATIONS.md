# Bugs and Limitations

| Bug or limitation | Severity | Status | Evidence | Workaround or next step |
|---|---|---|---|---|
| Existing automated API suite fails all three tests | P1 | Open | [QA report](QA_REPORT.md), [test file](../../backend/tests/api.test.js) | Update tests for current response shape and use a controlled test database/mocking strategy |
| API-backed demo depends on Render/network/database availability | P1 | Accepted risk | [API config](../../frontend/assets/js/config/api.config.js) | Rehearse local backend and screenshot fallback |
| Product/profile/post upload files use local disk | P2 | Open limitation | [Upload middleware](../../backend/middleware/upload.js) | Use persistent object storage for production |
| Several broad modules lack final end-to-end receipts | P2 | Open | [Week 12 packet](../../docs/weekly-sprint-packets/week12/weekly%20Sprint%20packet-week12.md) | Pick a small final flow and capture evidence |
| Provider/admin/order flows expand beyond safest demo | P2 | Accepted scope | [Final MVP scope](../01-project-overview/FINAL_MVP_SCOPE.md) | Demo only after dedicated rehearsal |
| Admin is unavailable unless private env variables are configured | P2 | Accepted security behavior | [Admin service](../../backend/services/adminAccountService.js) | Configure privately or omit admin from demo |
| Legacy token service used a committed fixed JWT fallback | P2 | Fixed in portfolio branch | [Token service](../../backend/services/tokenService.js) | Keep `JWT_SECRET` configured privately |
| Historical docs describe outdated React/PostgreSQL/Vercel plans | P3 | Accepted historical evidence | [Design history](../03-design-and-planning/README.md) | Use final architecture doc for current truth |
| Historical roster documents use inconsistent names/handles | P3 | Clarified for final portfolio | [Individual index](../08-individual-portfolios/README.md) | Final portfolio uses the team-confirmed active roster and aliases |
| Personal default admin credentials were committed | P1 | Fixed in portfolio branch | Security cleanup diff | Keep production credentials only in hosting environment |
| Three pages referenced missing local CSS/JS assets | P3 | Fixed in portfolio branch | Static frontend reference scan | Removed the stale references; legacy dashboard styling still needs review |

## Severity Guide

- **P0:** final demo cannot work.
- **P1:** core feature broken or unreliable.
- **P2:** important but a workaround exists.
- **P3:** polish or documentation improvement.

No confirmed P0 issue was found during the limited June 10 HTTP smoke check. That does not replace a full final rehearsal.
