# CHEATSHEET - Definition of Done

## What “Done” Means in This Class
A task is not done just because:
- someone touched the code
- the page looks better
- the team talked about it
- a commit exists

A task is **done** when the intended result works, has been checked, and is supported by proof.

---

## Simple Definition
**Definition of Done (DoD)** means:

> the checklist that tells your team when a task or feature is actually finished.

A good DoD prevents confusion like:
- “I thought you finished it.”
- “It works on my laptop.”
- “We meant to test it later.”
- “We changed it, but we do not know if it works.”

---

## What a Good DoD Usually Includes
A good Definition of Done often includes:
- the feature works as intended
- the result the user should see is clear
- the Issue has a clear owner
- the work is linked to a PR if needed
- testing or checking was done
- proof is linked

---

## Bad Examples
### Bad
- login page finished
- UI improved
- search works
- fixed bugs
- completed feature

These are too vague.
They do not explain what “done” actually means.

---

## Better Examples
### Better
- user can create an account with email and password
- invalid email shows an error message
- successful signup redirects to dashboard
- signup flow tested manually using three cases
- Issue links to PR and screenshot proof

### Better
- user can search by keyword and see matching results
- empty search does not crash the page
- search result list updates after submit
- tested using at least three sample inputs

---

## A Good DoD Template
Use this when writing a Definition of Done in an Issue:

### Definition of Done
- [ ] the user can __________
- [ ] the expected result is __________
- [ ] errors or edge cases handled: __________
- [ ] tested by: __________
- [ ] proof linked here: __________

---

## What Good Looks Like
A strong DoD is:
- specific
- testable
- easy to verify
- focused on results
- linked to proof

---

## What Weak DoD Looks Like
A weak DoD is:
- vague
- based on effort instead of results
- impossible to verify
- missing testing
- missing evidence

---

## Quick Examples by Type

### Feature Example
- [ ] user can log in with a valid account
- [ ] invalid login shows error message
- [ ] successful login redirects to main page
- [ ] tested with one valid and two invalid cases
- [ ] PR and screenshot linked

### UI Example
- [ ] main page layout displays correctly on desktop
- [ ] navigation links can be clicked
- [ ] key text is readable and not overlapping
- [ ] checked in browser at normal window size
- [ ] screenshot linked

### API Example
- [ ] POST request creates a new item
- [ ] missing required fields returns an error
- [ ] saved item appears in database or list view
- [ ] tested using sample request data
- [ ] test result or screenshot linked

---

## Common Mistakes
Avoid these:
- “done = code written”
- no expected user result
- no testing/checking step
- no owner
- no linked proof
- too many unrelated things in one DoD

---

## Quick Checklist
- [ ] Is the result specific?
- [ ] Is it testable?
- [ ] Is it easy to verify?
- [ ] Does it describe what the user can do or see?
- [ ] Does it include testing/checking?
- [ ] Does it point to proof?

---

## Final Reminder
A Definition of Done should make it easy for another person to answer one question:

**“Can I tell, with evidence, whether this is actually finished?”**

If the answer is no, your DoD is too weak.

