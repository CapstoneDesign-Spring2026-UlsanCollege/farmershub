# CHEATSHEET - GitHub Copilot Engineering Workflow

**Goal:** Use Copilot as a coding assistant, not as a replacement brain.

## The rule

AI can help you write code.

You are still responsible for understanding, testing, debugging, and explaining it.

## Best workflow

### 1. Start from a GitHub Issue

Do not ask Copilot to “improve the app.”

Start with one clear issue:

```txt
Issue #18: Fix login error when password is empty.
```

### 2. Ask Copilot to inspect first

Good prompt:

```txt
We are working on Issue #18.
First, inspect the relevant files and explain how the login flow currently works.
Do not edit files yet.
```

### 3. Ask for a plan

```txt
Suggest the smallest safe fix for this issue.
List the files you would change and why.
Do not make changes yet.
```

### 4. Make a small change

```txt
Apply the smallest fix only.
Do not change unrelated files.
Do not add new dependencies.
After editing, summarize exactly what changed.
```

### 5. Test it

```txt
Tell me how to test this manually.
If useful, suggest one automated test.
```

### 6. Review the diff

Before committing:

```bash
git status
git diff
```

Ask:

- Did Copilot change unrelated files?
- Did it add new libraries?
- Do I understand the code?
- Can I explain this PR?
- Did I test it?

### 7. Open a PR with AI Use Note

```md
## AI Use Note

- AI tool used:
- What AI helped with:
- What I personally checked or changed:
- How I tested it:
- One part I still do not fully understand:
```

## Good Copilot requests

- “Explain this function in beginner-friendly language.”
- “Find where this error is likely coming from.”
- “Suggest tests for this function.”
- “Refactor this one file for readability without changing behavior.”
- “Review this PR for possible bugs or missing edge cases.”

## Bad Copilot requests

- “Build the rest of the app.”
- “Fix everything.”
- “Make it production ready.”
- “Add authentication and database and admin dashboard.”
- “Rewrite this whole project.”

## Custom instructions

Recommended file:

```txt
.github/copilot-instructions.md
```

Starter:

```md
# Copilot Instructions

This is a student capstone project.

Follow these rules:
- Make small, issue-focused changes.
- Explain the plan before editing.
- Do not change unrelated files.
- Do not add dependencies unless asked.
- Prefer clear beginner-readable code.
- Add or update tests when reasonable.
- After changes, explain how to test them.
- Be honest about uncertainty.
```

## Advanced tools

Use these only after the basic workflow is working.

| Tool | Use for | Warning |
|---|---|---|
| Agent mode | multi-step issue work | review every change |
| Prompt files | reusable prompts | keep them short |
| Custom instructions | repo-wide standards | avoid conflicting instructions |
| Agent skills | specialized workflows | optional/advanced |
| Custom agents | planner, reviewer, tester roles | optional/advanced |
| Hooks | automation/security checks | instructor demo unless approved |

## The professional standard

You may use AI.

You may not submit mystery code.
