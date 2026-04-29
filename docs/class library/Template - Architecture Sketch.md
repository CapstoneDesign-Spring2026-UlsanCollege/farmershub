# TEMPLATE - Architecture Sketch

## Use this for Week 4
Paste this into `/docs/design-doc-v1.md` or use it to guide your diagram.

---

## 1) Architecture summary
**System name:**

**Main users:**
-
-

**Main job of the system:**
One sentence only:

---

## 2) Context view
Show the system, users, and outside services.

### Fill this in
**Users**
- User 1:
- User 2:

**Main system**
-

**External services / systems**
-
-

### Simple text version
```md
[User 1] ---> [Main System] ---> [Database]
[User 2] ---> [Main System] ---> [External Service]
```

### Notes
- What does each user do?
- What outside system matters right now?

---

## 3) Container view
Show the major parts inside your system.

### Fill this in
**Frontend / UI**
- main screens:
- key actions:

**Backend / Logic**
- main responsibilities:
- validation / rules:

**Database / Storage**
- main data stored:

**Other service (if needed)**
- service:
- purpose:

### Simple text version
```md
[Frontend]
  -> sends requests to [Backend]
  -> reads/writes data through [Backend]

[Backend]
  -> handles logic and validation
  -> stores data in [Database]
  -> optionally talks to [External Service]

[Database]
  -> stores users / content / records
```

---

## 4) Sprint 1 focus
**What part are we actually building first?**
-

**What is out of scope for now?**
-
-

---

## 5) Quality check
- [ ] users are visible
- [ ] the system is visible
- [ ] major internal parts are visible
- [ ] external dependencies are visible
- [ ] the diagram matches our MVP
- [ ] the diagram matches our wireframes
- [ ] the diagram is small enough to explain in 30 seconds

---

## 6) Example labels you can steal
Good labels:
- Student
- Admin
- Web App
- Mobile App
- API Server
- Database
- Auth Service
- Notification Service

Bad labels:
- Stuff
- System thing
- AI part
- Back-end things

---

## Final rule
If your architecture sketch cannot help you create Sprint 1 issues, it is too vague.

