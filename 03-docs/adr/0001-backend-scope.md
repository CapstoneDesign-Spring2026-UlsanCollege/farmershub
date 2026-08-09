# ADR 0001 — Backend scope after the reset

- **Status:** Proposed — awaiting owner decision
- **Date:** 2026-08-07
- **Phase:** 1 (Planning) → 3 (Design)
- **Decides:** whether Milestone 3 restores the old API or builds a new one

## Context

The repository was reset to the design package on 2026-08-07. The previous Express/Mongoose API — roughly 200 commits covering auth, uploads, a wallet, delivery partners, admin and provider roles, and a social feed — now exists only in a local backup bundle.

The design package covers exactly one journey: browse a marketplace, open a product, fill a basket, log in. It does not describe wallets, providers, admins or a social feed.

## Options

**A. Restore the old backend from the bundle.**
Working code, real auth, real uploads. Also restores 10 deferred critical/medium issues, duplicate auth middleware, masked error handlers, and a product surface several times wider than the design.

**B. Build a minimal backend scoped to the design.**
Catalog, cart, orders, auth. Nothing else. Read the old implementation for reference before rewriting.

## Decision

**Recommended: B.**

The argument is scope, not code quality. Every endpoint restored under A that no screen consumes is surface that must still be explained, tested and defended at demo. B produces a smaller system that exactly matches a designed, demonstrable journey.

The old code stays valuable as reference. Its auth flow in particular is worth reading before rewriting — the response-envelope bug that silently broke login is a mistake worth not repeating.

## Consequences

- Milestones 3 and 4 build new rather than restore.
- The wallet, delivery, provider, admin and social-feed features are out of scope until explicitly re-planned.
- The backup bundle becomes a permanent reference asset and must be preserved (see ADR 0003 when written, and `ENGINEERING_PLAN.md` M0).
- If A is chosen instead, Milestones 3 and 4 change and the rest of the plan holds.
