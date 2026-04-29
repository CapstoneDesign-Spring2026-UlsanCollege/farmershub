# TEMPLATE - Weekly Sprint Packet Issue

> One submission per team, per week. PM or Scribe submits the issue.
>
> Due: Friday after class by 23:59.
>
> Evidence rule: If it isn’t linked, it didn’t happen.
>
> AI rule: AI-assisted work only counts if your team can run it, explain it, test it, debug it, and link evidence.

## 0) Team + Sprint

- **Team:** FarmersHub Team
- **Week #:** 9
- **Sprint:** Sprint 3 / Sprint 4 / Final Sprint
- **Sprint phase:** MVP Verification / QA + Refactor / Final Demo + Handoff
- **Sprint dates:** Fill current sprint date range
- **PM:** Sonam
- **Scribe:** Sonam
- **QA Lead:** Sonam
- **Demo Driver:** Sonam
- **AI Steward:** Sonam

## 1) Weekly Progress Demo

- **Demo type:** live / video / screenshots / code walkthrough
- **Demo link or evidence:** https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/
- **What changed since last week?**
  1. Reorganized docs into `docs/class library/` to match class document structure.
  2. Updated handoff templates with project ownership and QA details.
  3. Cleaned project structure and archived test/temporary artifacts.

### 3-bullet demo script

1.
2.
3.

Suggested script:

1. Show live site and core navigation flow.
2. Show updated docs/templates and ownership evidence.
3. Show cleanup log and explain next stabilization goals.

### Backup plan

If the demo fails, we will show:

- Local walkthrough + screenshots + repo evidence links.

## 2) Sprint Goal + Board Snapshot

- **Sprint goal:**
- **Board snapshot link or screenshot:**

Suggested sprint goal:

- Stabilize core MVP flow and finalize handoff-quality documentation with evidence.

### Done this week

| Item | Owner | Definition of Done met? | Evidence link |
|---|---|---|---|
| Class library restructure in docs | Sonam | Yes | `docs/class library/` |
| AI ownership audit filled | Sonam | Yes | `docs/class library/20_TEMPLATES/TEMPLATE - AI Code Ownership Audit.md` |
| Architecture/setup/QA templates updated | Sonam | Yes | `docs/class library/20_TEMPLATES/` |

### Doing now

| Item | Owner | Next action | Blocked? |
|---|---|---|---|
| End-to-end upload verification | Sonam | Run backend+frontend smoke tests | No |
| Message flow integration check | Sonam | Validate API linkage and update docs | No |

### To Do next

| Item | Owner | Definition of Done | Priority |
|---|---|---|---|
| Final bug list triage | Sonam | P0/P1 status documented with evidence | High |
| Final demo runbook | Sonam | Demo + backup demo script finalized | High |

### Scope cut / Nice Later

- Optional UI polish not required for MVP verification.

## 3) What We Shipped

List 3–8 important shipped items. Every item needs a link.

- ✅ Shipped item + PR/Issue link:
- ✅ Docs reorganized under class library structure
- ✅ Core templates updated with ownership and QA fields

## 4) Bugs / Broken Things

| Bug / problem | Severity | Owner | Evidence / Issue link | Next step |
|---|---|---|---|---|
| Backend-dependent flow can fail if API is unavailable | P1 | Sonam | Add issue link | Add fallback and error-state validation |
| Message backend linkage still needs verification | P2 | Sonam | Add issue link | Confirm endpoint behavior and document result |

## 5) Risks / Blockers

| Risk / blocker | Owner | What we need | Evidence link | Mitigation |
|---|---|---|---|---|
| Environment URL mismatch | Sonam | Finalized API base URL strategy | `frontend/js/api.config.js` | Lock dev/prod config and retest |

## 6) Engineering Practice Spine

Pick **one** focus and show evidence.

- [ ] Testing basics
- [ ] CI checks
- [ ] Deployment reliability
- [ ] Logging/observability
- [ ] Security basics
- [ ] Accessibility basics
- [ ] Performance basics
- [ ] Refactoring/cleanup
- [ ] Documentation/handoff
- [ ] AI-assisted workflow

**What we did:**

- Documentation/handoff and AI-assisted workflow improvements with explicit ownership and evidence mapping.

**Evidence link:**

- `docs/class library/20_TEMPLATES/`
- `CLEANUP_LOG.md`

## 7) AI Use + Code Ownership Check

### AI tools used this week

- GitHub Copilot

### What AI helped with

- Drafting template content, structure cleanup steps, and documentation organization.

### What humans reviewed or changed

- Verified links, ownership, and project-specific details before commit/push.

### Code ownership map

| Student | Area owned | Evidence link | Can explain? |
|---|---|---|---|
| Sonam | Frontend flow, docs structure, cleanup, template completion | Live demo + `docs/class library/` | Clear |

### Code we do not fully understand yet

| Area | What is confusing? | Owner | Plan |
|---|---|---|---|
| Message integration behavior | Full backend route linkage status | Sonam | Verify routes/services and record evidence |

## 8) Plan for Next Week

1.
2.
3.

Suggested plan:

1. Complete end-to-end smoke tests for login/upload/message flows.
2. Resolve open P1/P2 items and link evidence in issues/PRs.
3. Finalize sprint packet and contribution receipts.

### First task next class

- Re-run MVP smoke test and create/update issues for any reproducible failures.

## 9) Individual Contribution Receipts

Each student must add a comment below with **2–3 links minimum**.

```md
## Contribution Receipts - Name

- Receipt 1:
- Receipt 2:
- Receipt 3:

### 1-sentence contribution summary

### AI Use Note
- AI tool used:
- What AI helped with:
- What I personally checked or changed:
- How I tested or verified it:
- One thing I still do not fully understand:
```

## 10) Instructor Notes

Leave blank.

-
