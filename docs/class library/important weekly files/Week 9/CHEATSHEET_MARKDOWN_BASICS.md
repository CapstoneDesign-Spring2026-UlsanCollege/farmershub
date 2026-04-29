# CHEATSHEET - Markdown Basics (Capstone Design)

**Goal:** Write clean project docs in `/docs` using Markdown (`.md`). Keep it simple, link evidence, and make the project easy to understand.

## Why Markdown matters in this class

Markdown is how teams document work in GitHub.

Use it for:

- Weekly Sprint Packets
- setup guides
- architecture notes
- AI Code Ownership Audits
- bug notes
- test checklists
- final handoff docs

**Class rule:** If it isn’t linked, it didn’t happen.

---

## Headings

```md
# Title
## Main section
### Smaller section
```

Good project docs usually use one `#` title and several `##` sections.

---

## Bold / Italic

```md
**important**
*emphasis*
```

Use bold for labels, not whole paragraphs.

---

## Lists

### Bullet list

```md
- item
- item
  - sub-item
```

### Numbered list

```md
1. step one
2. step two
3. step three
```

Use numbered lists for procedures.

---

## Checklists

Checklists are perfect for Definition of Done, QA checks, and final readiness.

```md
- [ ] App runs locally
- [ ] Login flow works
- [ ] Error state is shown for invalid input
- [x] README setup instructions updated
```

---

## Links

```md
[PR #12 - Fix login error](https://github.com/...)
[Issue #8 - Add signup validation](https://github.com/...)
```

Use links as evidence receipts.

Good evidence links include:

- PRs
- issues
- review comments
- CI runs
- screenshots
- demo videos
- docs commits

Bad evidence:

- “I worked on it”
- “We talked about it”
- “AI helped us”
- “Almost done”

---

## Images / Screenshots

```md
![Login error screenshot](../assets/login-error.png)
```

On GitHub Issues and PRs, you can also drag-and-drop screenshots into the comment box.

Use screenshots for:

- UI changes
- bugs
- test results
- deployment proof
- weekly progress demos

---

## Code

Inline code:

```md
Run `npm test` before opening the PR.
```

Code block:

````md
```bash
npm install
npm run dev
npm test
```
````

Use code blocks for commands, errors, logs, and config snippets.

---

## Tables

Use tables for ownership maps, bug triage, and sprint planning.

```md
| Item | Owner | Status | Evidence |
|---|---|---|---|
| Login flow | Mina | Done | PR #12 |
| Error state | Joon | Doing | Issue #18 |
```

Keep tables short. Huge tables become homework goblins.

---

## Quotes

```md
> Decision: We will cut social login and keep email/password only for final demo.
```

Use quotes for decisions, scope cuts, and important instructor feedback.

---

# Template: AI Code Ownership Note

Copy this into `docs/AI_CODE_OWNERSHIP_AUDIT.md`.

```md
# AI Code Ownership Audit

## 1. What our app currently does
- Feature 1:
- Feature 2:
- Feature 3:

## 2. Code we understand
| Code area | File / folder | Who can explain it? | Evidence |
|---|---|---|---|
| Login flow | `src/...` | Name | Link |

## 3. Code we do not fully understand yet
| Code area | What is confusing? | Owner | Next step |
|---|---|---|---|
|  |  |  |  |

## 4. What works
- Working flow + evidence link:

## 5. What does not work reliably
- Bug / risk + issue link:

## 6. What we will stabilize next
1.
2.
3.
```

---

# Template: Weekly Demo Notes

```md
# Weekly Progress Demo Notes

## What changed since last week
- 

## What we will demo
1.
2.
3.

## Evidence links
- PR:
- Issue:
- Screenshot / video:
- Test / CI:

## What broke or is risky
- 

## Ask / blocker
- 
```

---

## Good Markdown Rules

- Use short sections.
- Link evidence directly.
- Use checklists for “done.”
- Use screenshots instead of long explanations.
- Write decisions clearly.
- Keep project docs in `/docs`.
- Do not paste giant AI-generated walls of text that no one understands.

## What good looks like

```md
## Login bug fixed

We fixed the login error that happened when the password field was empty.

Evidence:
- Issue: #18
- PR: #22
- Screenshot: attached below
- Test: `npm test` passed locally

Known limitation:
- Error message is still ugly. We will improve it next sprint.
```
