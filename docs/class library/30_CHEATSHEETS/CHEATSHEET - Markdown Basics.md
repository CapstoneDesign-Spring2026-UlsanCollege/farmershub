# CHEATSHEET - Markdown Basics

## Goal

Write clean project docs in `/docs` using Markdown (`.md`). Keep it simple, link evidence, and make the project easy to understand.

## Headings

```md
# Title
## Main section
### Smaller section
```

Use one `#` title and several `##` sections.

## Lists

```md
- item
- item
  - sub-item
```

Use numbered lists for procedures:

```md
1. step one
2. step two
3. step three
```

## Checklists

```md
- [ ] App runs locally
- [ ] Login flow works
- [x] README updated
```

## Links

```md
[PR #12 - Fix login error](https://github.com/...)
```

Good links:

- PRs
- Issues
- review comments
- CI runs
- screenshots
- demo videos
- docs commits

## Images

```md
![Login error screenshot](../assets/login-error.png)
```

On GitHub Issues and PRs, you can drag screenshots into the comment box.

## Code

Inline:

```md
Run `npm test`.
```

Block:

````md
```bash
npm install
npm run dev
```
````

## Tables

```md
| Item | Owner | Status | Evidence |
|---|---|---|---|
| Login flow | Mina | Done | PR #12 |
```

## Quotes

```md
> Decision: We will cut social login before final demo.
```

## Good Rules

- Use short sections.
- Link evidence directly.
- Use checklists for “done.”
- Use screenshots instead of long explanations.
- Keep project docs in `/docs`.
- Do not paste giant AI-generated walls of text.

## Full Templates

Use these files for full copy/paste templates:

- `TEMPLATE - Weekly Sprint Packet Issue.md`
- `TEMPLATE - Weekly Progress Demo.md`
- `TEMPLATE - AI Code Ownership Audit.md`
