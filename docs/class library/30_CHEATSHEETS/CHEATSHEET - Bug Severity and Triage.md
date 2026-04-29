# CHEATSHEET - Bug Severity and Triage

## Goal

Make bugs visible, owned, and fixable.

## Severity Levels

| Level | Meaning | Example |
|---|---|---|
| P0 | Final demo cannot work | app will not start, login totally broken |
| P1 | Core feature broken or unreliable | user cannot submit main form |
| P2 | Important but workaround exists | upload fails sometimes, manual workaround exists |
| P3 | Polish / nice improvement | ugly message, spacing issue |

## Triage Steps

1. Reproduce the bug.
2. Write the steps.
3. Add evidence.
4. Assign severity.
5. Assign owner.
6. Decide next action.
7. Link it in Sprint Packet.

## Good Bug Report

```md
## Bug
Login crashes when password is empty.

## Severity
P1

## Steps
1. Open login page.
2. Enter email.
3. Leave password empty.
4. Click Login.

## Expected
Show validation message.

## Actual
Server error appears.

## Evidence
Screenshot attached.

## Owner
Mina
```

## Bad Bug Report

> Login broken.

That helps nobody. Be specific.
