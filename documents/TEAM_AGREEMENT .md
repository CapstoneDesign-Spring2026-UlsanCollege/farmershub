# TEAM AGREEMENT - Capstone Design

**Document Created:** 2026-03-25 at 10:00  
**Last Updated:** 2026-03-25 at 10:30  
**Agreement Status:** Active (ratified by team lead)

This document is your **team constitution**.

It defines how your team will work together, make decisions, resolve conflicts, and ensure everyone contributes.

Teams that write clear agreements usually avoid most problems later in the semester.

This agreement can be **updated during the semester** if the team agrees and records the change.

---

# Team Information

**Team Name**

Farmers Hub

**Repository**

https://github.com/CapstoneDesign-Spring2026-UlsanCollege/farmershub

**Members**

| Name | Role Rotation (first week) |
| --- | --- |
| TAMANG SONAM | PM (Team Leader) |
| DJTwoTone | Scribe |
| Lama Rupesh| QA Lead |
| sthasagar236 | Demo Driver |
| Tulsiram Subedi | Support |
| yubarajsubedi07 | Support |

---

# Team Roles (Rotate Weekly)

Roles rotate every sprint so that everyone experiences each responsibility.

### PM (Project Manager)

Responsible for:

- creating the Weekly Sprint Packet
- coordinating tasks
- making sure work is visible in GitHub
- submitting the weekly Sprint Packet issue

---

### Scribe

Responsible for:

- recording team decisions
- updating documentation
- noting blockers and risks
- helping maintain the Sprint Packet

---

### QA Lead

Responsible for:

- checking whether work actually works
- verifying demos before submission
- helping test features

---

### Demo Driver

Responsible for:

- preparing the demo
- writing the demo script
- running the demo if needed

---

# Communication

Our primary communication channels are:

| Tool | Purpose |
| --- | --- |
| GitHub Issues | Project management, bug reports, retrospectives, risk blockers |
| GitHub Pull Requests | Code reviews and merging |
| Discord/KakaoTalk | Daily communication and meetings |
| Email | Formal notifications |

Examples:

- KakaoTalk
- Discord
- Slack
- Email

---

### Communication Expectations

Our team agrees to (effective from 2026-03-25):

- respond to messages within **24 hours** (acknowledged by 14:30 the next day)
- notify the team if we cannot attend a meeting (by 12:00 day before)
- ask for help early instead of disappearing (within 4 hours of blocker identification)

---

# Meeting Expectations

Typical team meetings will happen:

**Primary:** Wednesday after class at 14:30 KST (starting 2026-03-18)  
**Secondary:** Online evenings as needed (TBD based on sprint needs)  
**Sprint Reviews:** Every Friday at 18:00 KST

Meetings should:

- focus on completing Issues
- assign clear owners
- end with visible progress in GitHub

---

# GitHub Workflow Rules

Our team will follow this workflow:

```text
Issue -> Branch -> Pull Request -> Merge -> Evidence
```

## Branch Strategy (Effective 2026-03-25)

**Branch Structure:**
- `main` - Production/stable branch (protected, requires PR review)
- `frontend` - Frontend feature development (created 2026-03-25)
- `backend` - Backend API development (created 2026-03-25)
- `hotfix/*` - Emergency fixes (from main, merged back ASAP)
- `feature/*` - Individual features (from frontend or backend as needed)

**Branch Naming Convention:**
- Feature: `feature/user-auth`, `feature/product-listing`
- Hotfix: `hotfix/login-404`, `hotfix/database-connection`
- Bug: `bug/issue-123-description`

**Merge Rules:**
- `feature/*` branches → `frontend` or `backend` (via PR, 1 reviewer)
- `frontend` / `backend` → `main` (via PR, 2 reviewers, after testing)
- `hotfix/*` → `main` (immediate, 1 reviewer, then back to feature branches)

**Protection Settings (Enabled 2026-03-25 17:00):**
- Require pull request reviews before merge
- Dismiss stale pull request approvals on new commits
- Require status checks to pass (when CI/CD is set up)
- Include administrators (no bypass)

Rules:

- No work without an **Issue**
- Code should be written in **branches**
- Work should be merged through **Pull Requests**
- Important work should be **reviewed by a teammate**

---

# Evidence Rule

This class uses an **evidence-based workflow**.

The rule is simple:

> If it isn't linked, it didn't happen.

Every student must post **2-3 receipts each week**.

Examples of receipts:

- Pull request
- Issue closed
- Code commit
- Review comment
- Documentation update
- Screenshot of working feature

Receipts are posted as **comments on the Weekly Sprint Packet issue**.

---

# Work Expectations

Each team member agrees to:

- contribute work every week
- post evidence of their work
- communicate blockers early
- respect teammates’ time and effort

---

# Missed Work

If a team member misses work:

1. They must inform the team.
2. They must complete the work later.
3. The missed grade **may remain zero**, depending on course rules.

Missing work repeatedly may trigger instructor intervention.

---

# Conflict Resolution

If a problem happens, the team will follow these steps:

### Step 1 - Discuss within the team

Try to resolve the issue respectfully and clearly.

### Step 2 - Adjust responsibilities

The team may redistribute work if necessary.

### Step 3 - Document the issue

Record the situation in GitHub (Issue or comment).

### Step 4 - Instructor help

If the problem continues, contact the instructor.

---

# Freeloading Policy

If a team member consistently fails to contribute:

Evidence will be reviewed.

Signs of non-contribution include:

- no receipts
- no commits
- no issue activity
- missing meetings without explanation

Possible outcomes:

- task reassignment
- reduced credit
- removal from the team

---

# Team Decision Rules

For most decisions:

```text
Majority vote
```

For major project changes:

```text
Full team agreement
```

---

# Updating This Agreement

This document may be updated if:

- the team agrees
- the change is recorded in GitHub
- the updated version is committed to the repository

---

# Signatures

By signing, we agree to follow the expectations in this document.

| Name | Signature | Date |
| --- | --- | --- |
| | | |
| | | |
| | | |
| | | |

---

# Quick Reminder

Strong teams usually:

- communicate early
- track work clearly
- post evidence regularly
- help each other succeed