# CHEATSHEET - Copilot Setup in VS Code

## Goal

Set up and use GitHub Copilot safely inside VS Code.

## Before You Start

You need:

- GitHub account,
- GitHub Student Developer Pack / Copilot access,
- VS Code,
- GitHub Copilot extension,
- project repo opened in VS Code.

## Basic Setup

1. Open VS Code.
2. Install **GitHub Copilot** extension.
3. Sign in with GitHub.
4. Open your team repo folder.
5. Open Copilot Chat from the sidebar or command palette.

## Use Chat Before Agent Mode

Start with questions:

```txt
Explain the current project structure.
```

```txt
Find where the login flow is implemented. Do not edit files.
```

## Agent Mode Safety Rules

Use Agent Mode only for small issue-based work.

Good:

```txt
We are working on Issue #18.
Inspect first. Do not edit yet.
Suggest the smallest safe fix.
```

Bad:

```txt
Fix all bugs and finish the app.
```

## Repository Custom Instructions

Create:

```txt
.github/copilot-instructions.md
```

Starter:

```md
# Copilot Instructions

This is a student capstone project.

Rules:
- Make small, issue-focused changes.
- Explain the plan before editing.
- Do not change unrelated files.
- Do not add dependencies unless asked.
- Prefer clear beginner-readable code.
- Add or update tests when reasonable.
- After changes, explain how to test.
- Be honest about uncertainty.
```

## Prompt Files, Skills, Custom Agents, Hooks

| Tool | Use | Class status |
|---|---|---|
| Prompt files | reusable prompts | optional |
| Custom instructions | repo standards | recommended |
| Agent skills | specialized workflows | advanced |
| Custom agents | planner/reviewer/tester roles | advanced |
| Hooks | automation checks | instructor-demo unless approved |
