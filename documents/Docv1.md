# FarmersHub - Project Status Documentation v1.0

**Project:** A Hub for Farmers  
**Team:** FarmersHub Capstone Design  
**Date:** March 25, 2026  
**Sprint:** Sprint 2 (Mar 11-18, 2026)  
**Status:** Foundation Phase - Architecture & Design Complete

---

## Executive Summary

We're at an exciting milestone in FarmersHub development. Over the past two weeks (Mar 11-25), our team has done the heavy lifting on design and planning. We've figured out exactly how the system should work, sketched out all the interfaces, and created a detailed roadmap for Sprint 3. Starting April 1st, we move from planning into actual development. Everyone knows their role, the blockers have been cleared, and we're ready to start building.

---

## 1. Architecture & Design Status

### Architecture Sketch - Completed (Mar 20, 2026)

We've finalized the complete system architecture design that will guide our development efforts. The architecture breaks down into distinct layers that work together:

**System Architecture:**

```
FarmersHub
│
├── Frontend (React)
│   ├── Farmer Interface
│   └── Consumer Interface
│
├── Backend (Node.js/Express)
│   ├── API Routes  
│   └── Business Logic
│
├── Database (PostgreSQL)
│   └── Data Storage
│
└── Hosting (Vercel)
    └── Deployment
```

**What We Did:** Designed the complete system layout by identifying all major components and how they interconnect. This gives us a clear blueprint for development.

**What Changed:** Moved from conceptual ideas to an actual documented architecture that the team can follow.

**What's Next (Sprint 3):** Developers will implement each layer according to this structure, starting with the infrastructure setup in Week 1.

---

### Wireframes - Completed (Mar 19, 2026)

We've created 3 detailed wireframes showing how users will interact with FarmersHub. These wireframes serve as the visual blueprint for our designers and developers.

**Wireframe Deliverables:**

1. **Farmer Dashboard Wireframe** (Completed Mar 19, 2026)
   - Profile management with farm details and certifications
   - Product listing & management interface
   - Community interaction and networking features
   - Status: Ready for design handoff
   
2. **Consumer Browse Wireframe** (Completed Mar 19, 2026)
   - Product discovery and search interface
   - Advanced filter functionality by category, location, price
   - Detailed product view with farmer information
   - Status: Ready for design handoff
   
3. **Transaction/Contact Wireframe** (Completed Mar 19, 2026)
   - Messaging system between Farmers and Consumers
   - Order and purchase flow
   - Shipping coordination and status tracking
   - Status: Ready for design handoff

**What We Did:** Mapped out the actual user journeys and created detailed layouts for each major feature.

**What Changed:** Moved from user stories to visual representations that show exactly how the interface should look.

**What's Next:** Designers will add styling and components based on these wireframes during Sprint 3.

---

### Design Document v1 - In Progress (Started Mar 18, 2026)

We're building out the design system that will ensure consistency across the entire FarmersHub interface.

**Design Doc v1 Currently Includes:**
- Style guide with color palette (greens and earth tones for farming theme)
- Typography specifications and font selections
- Component library definitions (buttons, forms, cards, etc.)
- UI pattern standards for consistency
- Design system version 1.0 baseline

**Timeline:**
- Started: Mar 18, 2026
- Expected Completion: Mar 31, 2026
- Status: 70% complete

**What We Did:** Started creating a unified design system so all interfaces look and feel consistent.

**What Changed:** Transitioned from wireframes to actual design specifications with colors, fonts, and component styles.

**What's Next:** Complete the design doc by Mar 31, then hand it to developers for implementation in Sprint 3.

---

## 2. Sprint 1 Issues - Created (Mar 15, 2026)

We've created all the necessary issues that will guide Sprint 1 development work. These are broken down by functional area.

**Issues by Category:**

**Setup & Infrastructure**
- Repository structure initialization (due Apr 2)
- CI/CD pipeline setup (due Apr 5)
- Development environment configuration (due Apr 2)

**Frontend Development**
- Farmer profile component implementation (due Apr 8)
- Consumer dashboard component setup (due Apr 8) 
- Navigation structure and routing (due Apr 5)

**Backend Development**
- User authentication system with JWT (due Apr 6)
- Database schema design and validation (due Apr 3)
- API endpoint structure and documentation (due Apr 7)

**Testing & QA**
- Test environment setup and configuration (due Apr 4)
- QA testing guidelines and standards (due Apr 2)

**What We Did:** Broke down all the work needed for Sprint 1 into tracked, assignable issues on GitHub.

**What Changed:** Moved from informal task lists to official GitHub issues that the team can assign and track.

**What's Next:** During Sprint 3, teams will pick up these issues and work through them systematically.

---

## 3. Project Board Status - Updated (Mar 21, 2026)

Our GitHub project board is fully organized and current, showing where everything stands.

**GitHub Project Board:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/projects

**Board Layout (as of Mar 21, 2026):**

| Column | What's There | Count |
|--------|--------------|-------|
| Backlog | Items for Sprint 2+ planning | 8+ items |
| Sprint 1 Ready | All infrastructure setup tasks | 5 items |
| In Progress | Currently being worked on | 3 items |
| Review | Waiting for approval/merge | 1 item |
| Done | Finished and merged | 7 items |

**Current Progress:**
- Sprint 2 goal: Successfully achieved (we completed structure setup and documentation)
- Documentation completeness: About 95% done
- Team alignment: Everyone knows their role

**What We Did:** Organized all work items into a logical board that shows status at a glance.

**What Changed:** Moved from scattered tasks to a centralized, visible project board.

**What's Next:** In Sprint 3, we'll move items from "Sprint 1 Ready" to "In Progress" and start executing.

---

## 4. Demo Scenario (MVP Walkthrough)

When we demo FarmersHub for the first time, here's the story we'll tell:

**Step 1: Farmer Gets Up and Running (2 minutes)**
- Open FarmersHub and create a new farmer account
- Set up a profile with farm details, location, certifications
- Upload product information (crops, quantities, pricing)
- Join a local farmer community

**Step 2: Consumer Discovers Products (3 minutes)**
- Log in as a consumer
- Browse the product catalog and see various farmers
- Filter by location (nearby farms) and product type (vegetables, grains, etc.)
- Click through to see detailed product and farmer information

**Step 3: Making the Connection (3 minutes)**
- Consumer finds a product they like and clicks to contact the farmer
- Opens the messaging interface and asks about the product
- Farmer responds back and they negotiate price/delivery
- Agree on details and finalize the purchase

**Step 4: Building Community (2 minutes)**
- Show the transaction being tracked in both dashboards
- Consumer leaves a 5-star review and detailed feedback
- Farmer updates their community profile with the sale
- Show how reputation and ratings build over time

**Total Demo Runtime:** 10 minutes (with good pacing)

---

## 5. Next Week Actions (Mar 25 - Mar 31, 2026)

**Owner:** PM Tamang Sonam

**Design Team:**
- Complete Design Doc v1 by Mar 31 (currently 70% done)
- Finalize style guide and component library
- Ready for development handoff

**Development Team Leaders:**
- Review and confirm the architecture and tech stack
- Prepare development environment setup checklist
- Assign frontend, backend, and DevOps roles before Apr 1

**QA Team:**
- Review Sprint 1 issues and testing requirements
- Prepare test environment configuration plans
- Document QA guidelines and standards

**Overall Team:**
- Final preparation for Sprint 3 kickoff (Apr 1)
- Confirm everyone understands their role and assignments
- Address any blockers or questions before development starts

---



## 6. Technology Stack Confirmation

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | Latest LTS |
| Backend | Node.js + Express | Node 18+ |
| Database | PostgreSQL | 14+ |
| Hosting | Vercel | Latest |
| Version Control | Git/GitHub | Standard |

---

## 7. Next Steps

**What Happens Next Week (Mar 31 - Apr 1):**
- Design doc will be complete and approved
- Development environment setup will be finalized
- All team roles and assignments confirmed
- Ready to start coding on Apr 1

**Sign-Offs & Approvals For Development to Begin:**

**Prepared By:** Documentation Team (Mar 25, 2026)  
**Reviewed By:** PM Tamang Sonam - *Pending review*  
**Approved By:** Project Sponsor/Instructor - *Pending*  

**Status:** Ready for team review. Once the PM and sponsor approve, we're cleared for Sprint 3 development.

---

## Appendix: Contact & Resources

All the useful links and contacts if you need to reach out or find something:

- **GitHub Repo:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub
- **Project Board:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub/projects
- **PM Contact:** TAMANG SONAM (Assigned Sprint 2 & 3 leadership)
- **Questions About This Doc:** Check TEAM_AGREEMENT.md for team contact info

---

**Document Version:** 1.0  
**Last Updated:** March 25, 2026  
**Next Review:** April 1, 2026 (Sprint 3 Kickoff)

