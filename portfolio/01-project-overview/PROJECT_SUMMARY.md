# Project Summary

## Identity

- **Team:** CodingFarmer
- **Project:** FarmersHub
- **Repository:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub
- **Live frontend:** https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/
- **Backend health:** https://farmershub-kkjd.onrender.com/api/health

## Team Members

The strongest roster sources are the [team agreement](../../docs/TEAM_AGREEMENT%20.md), sprint packets, commit history, and team confirmation. See the [individual portfolio index](../08-individual-portfolios/README.md) for the confirmed active final-portfolio roster and handle mappings.

## Users, Problem, and Value

FarmersHub serves farmers who want a direct digital presence and customers who want to discover produce and farmer information. The original project pitch also considered co-op administrators, agricultural workers, and service providers.

**Problem:** fragmented sales and communication channels make it difficult for farmers and local buyers to find each other, compare products, and maintain trusted information.

**Value statement:** FarmersHub gives farmers and customers one web platform for product discovery, profiles, direct communication, and community activity.

## Final MVP Summary

The tracked final product uses:

- Static HTML, CSS, and JavaScript in `frontend/`.
- Node.js and Express in `backend/`.
- MongoDB with Mongoose models.
- JWT authentication, bcrypt password hashing, role checks, validation, rate limiting, and Helmet.
- Multer-based local image uploads.
- GitHub Pages for the frontend and a Render-hosted production API.

The final code contains API routes and UI for authentication, profiles, products, posts/feed, uploads, messages, notifications, friend requests, provider services, orders, and admin. Current proof is strongest for deployed page access, API health, historical login/product demo evidence, and the existence of the implemented routes. Complete end-to-end evidence is still missing for several broader flows.

## Key Evidence

- [Final MVP scope](FINAL_MVP_SCOPE.md)
- [Scope decisions](SCOPE_DECISIONS.md)
- [Final architecture](../04-final-product/ARCHITECTURE_FINAL.md)
- [Demonstration run from May 4](../../docs/DEMONSTRATION_RUN.md)
- [Week 9 screenshots](../../docs/weekly-sprint-packets/week%209/images/)
- [QA report](../05-qa-and-stabilization/QA_REPORT.md)
- [AI/code ownership audit](../06-ai-and-code-ownership/AI_CODE_OWNERSHIP_AUDIT.md)
