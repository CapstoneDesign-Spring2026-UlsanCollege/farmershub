# POLICY - AI-Assisted Work and Code Ownership

## Purpose

AI tools are part of modern software work. This course allows AI use because students need practice using AI responsibly.

However, AI does not remove responsibility. If a team uses AI to create code, docs, tests, or diagrams, the team still owns the result.

## Core Rule

AI-assisted work only counts if the team can:

1. run it,
2. explain it,
3. test it,
4. debug it,
5. link evidence for it.

If no one on the team can explain the submitted work, it is **Not Yet**, even if it looks complete.

## Allowed AI Use

Students may use AI to:

- explain code,
- generate small code suggestions,
- write test ideas,
- debug errors,
- summarize files,
- draft documentation,
- suggest refactors,
- review PRs,
- improve setup instructions,
- create diagrams or outlines.

## Not Acceptable

Students may not:

- submit code no one understands,
- accept huge AI changes without review,
- add features outside the agreed sprint scope,
- hide AI use,
- claim AI-generated work as personally understood without being able to explain it,
- use AI to bypass team discussion or ownership,
- submit fake or vague evidence.

## Required AI Use Note

Every PR that uses AI must include:

```md
## AI Use Note

- AI tool used:
- What AI helped with:
- What I personally checked or changed:
- How I tested it:
- One part I still do not fully understand:
```

## Weekly Sprint Packet Requirement

Every Weekly Sprint Packet must include an **AI Use + Code Ownership Check**:

- AI tools used this week
- what AI helped with
- what humans reviewed or changed
- what code each student can explain
- what code is still confusing
- evidence links

## Examples

### Good AI use

> “Copilot helped us find where the login error was happening. We checked the suggested fix, changed only one file, tested invalid login manually, and linked PR #22.”

Why this is good:

- small scope,
- human review,
- evidence link,
- testing included.

### Weak AI use

> “AI made the login system.”

Why this is weak:

- no scope,
- no evidence,
- no testing,
- no ownership,
- probably cursed.

## Common Mistakes

- Asking AI to “fix everything.”
- Letting AI edit unrelated files.
- Accepting new dependencies without understanding them.
- Not reading the generated code.
- Not testing the result.
- Forgetting to link PRs/issues.

## Grading Impact

AI use is not a penalty.

Poor ownership is the problem.

Work can be marked **Not Yet** if:

- evidence is missing,
- the demo does not work,
- students cannot explain the work,
- AI use is hidden or unclear,
- code is too broken or risky to accept,
- no testing or verification is shown.

## Student Reminder

AI can help you move faster.

It cannot do the learning for you.
