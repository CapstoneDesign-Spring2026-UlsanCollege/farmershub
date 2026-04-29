# CHEATSHEET - How Tested

## Purpose
In this class, it is not enough to say that something was built.
You also need to say **how you checked that it works**.

That is what the **How tested** section is for.

---

## Simple Rule
A good **How tested** note answers:

- what was tested
- how it was tested
- what happened
- what evidence exists

---

## What Counts as Testing in This Class
At this stage, testing can include:
- manual test steps
- simple automated tests
- API request checks
- form validation checks
- browser checks
- CI run results
- screenshot or video proof with context

You do **not** need a huge test suite for every project right now.
But you do need a believable way to show that your important feature was checked.

---

## Weak Examples
### Weak
- tested locally
- works now
- checked it
- no issues
- done

These tell the reader almost nothing.

---

## Better Examples
### Better
- created a test account, logged in, submitted a post, refreshed the page, and confirmed the post still appeared

### Better
- sent three sample requests to the API: one valid, two invalid, and confirmed the correct responses were returned

### Better
- opened the page in the browser, clicked all main navigation links, and confirmed each route loaded without errors

### Better
- ran the included test command and confirmed all tests passed in CI

---

## A Good How Tested Template
Use this in a PR or Issue:

### How tested
- tested: __________
- method: __________
- expected result: __________
- actual result: __________
- proof link: __________

---

## Strong PR Example
### How tested
- created a new user account
- logged in with valid credentials
- tried one invalid login
- submitted a new event
- refreshed the page and confirmed the event still appeared
- attached screenshot and linked deployed preview

---

## Strong API Example
### How tested
- sent POST request with valid input
- sent POST request with missing required field
- confirmed valid request created the item
- confirmed invalid request returned an error
- linked screenshots of both responses

---

## Strong UI Example
### How tested
- opened the landing page on desktop browser
- clicked signup, login, and home navigation links
- checked that buttons worked and text was readable
- attached screenshot of final layout

---

## What to Include When Possible
A strong **How tested** note often includes:
- the exact steps
- more than one case
- expected behavior
- actual behavior
- a proof link

---

## Common Mistakes
Avoid these:
- leaving the section blank
- copying the template without filling it in
- writing only “tested locally”
- explaining code changes but not test steps
- claiming something works with no evidence

---

## Quick Checklist
- [ ] Does it say what was tested?
- [ ] Does it say how it was tested?
- [ ] Does it say what happened?
- [ ] Is there proof or a link when possible?
- [ ] Would another person understand what was checked?

---

## Final Reminder
A weak **How tested** section creates doubt.
A strong **How tested** section builds trust.

If another person reads your PR, they should be able to think:

**“Okay, I understand what they checked, and I believe this was actually tested.”**

