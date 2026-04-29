# GUIDE - Architecture (C4-lite)

## Purpose
This guide helps your team make a **small, useful architecture sketch** for Sprint 1.

You are not making a giant enterprise diagram. You are showing the **minimum system structure** needed to build your first working slice.

## What “C4-lite” means in this class
For this course, your architecture sketch should answer 4 questions:

1. **Who uses the system?**
2. **What is the main system?**
3. **What major parts are inside it?**
4. **What external services or systems does it depend on?**

That is enough.

## What to include
Include only the parts that matter for your MVP and Sprint 1:
- users
- frontend or app UI
- backend or server logic
- database or storage
- external APIs or services
- major data flow between parts

## What to skip
Do **not** include:
- every class or function
- deep framework details
- fancy notation nobody understands
- future features you are not building yet
- giant diagrams with 20 boxes

## The 2 levels you should make
### 1) Context view
Show:
- the main system
- users
- outside systems or services

### 2) Container view
Show the big pieces inside your system:
- frontend
- backend
- database
- any important service

## Simple example
### Context view
- Student uses Reservation App
- Admin uses Reservation App
- Reservation App connects to Database
- Reservation App optionally connects to Email Service

### Container view
- Frontend: room list, booking form
- Backend: booking logic, validation
- Database: rooms, users, reservations

## What good looks like
A good architecture sketch is:
- small
- readable
- tied to the actual MVP
- useful for deciding Sprint 1 tasks

If a teammate can look at it and say, “Okay, I know what we need to build first,” it is working.

## Common mistakes
- vague box labels like "system" or "AI"
- no users shown
- no database shown when data obviously matters
- diagram does not match the wireframes
- diagram shows 10 future features that are not in scope

## Submission method
Add your architecture sketch to:
- `/docs/design-doc-v1.md`
- or a linked image inside `/docs/`
- and link it in the Weekly Sprint Packet

## Quick checklist
- [ ] users are shown
- [ ] main system is shown
- [ ] major internal parts are shown
- [ ] external dependencies are shown
- [ ] only Sprint 1 / MVP-relevant items are included
- [ ] labels are clear enough for a stranger to understand

## Final reminder
The point of the architecture sketch is not to impress people.

The point is to make the first build week obvious.

