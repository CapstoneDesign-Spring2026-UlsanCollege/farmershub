# CHEATSHEET — Mermaid (Diagrams in Markdown)

## What is Mermaid?
Mermaid lets you write diagrams as text inside Markdown.

**Core idea:** put Mermaid code inside a fenced code block:

```mermaid
flowchart LR
  A[Start] --> B[Do thing]
  B --> C{Works?}
  C -->|Yes| D[Ship]
  C -->|No| E[Fix]
```

---

## Where it usually works
Mermaid often renders in:
- Markdown files (`README.md`, `/docs/*.md`)
- Issues / PR descriptions / comments (depends on platform/settings)

**If it doesn’t render:** copy the code into the Mermaid Live Editor (search “Mermaid Live Editor”) or use a screenshot in `/docs/images/`.

---

## Syntax basics (you’ll use these constantly)

### 1) Code block
Use **exactly** ` ```mermaid `:

````
```mermaid
flowchart LR
  A --> B
```
````

### 2) Directions
- `TB` top-to-bottom
- `LR` left-to-right
- `RL` right-to-left
- `BT` bottom-to-top

Example:
```mermaid
flowchart TB
  A --> B --> C
```

### 3) Node shapes
```mermaid
flowchart LR
  A[Rectangle]
  B(Rounded)
  C((Circle))
  D{Decision}
  E[/Input/Output/]
  F[[Subroutine]]
```

### 4) Arrows + labels
```mermaid
flowchart LR
  A --> B
  B -->|yes| C
  B -->|no| D
  A --- E
  A -.-> F
```

### 5) Subgraphs (group boxes)
```mermaid
flowchart LR
  subgraph Frontend
    A[UI] --> B[Client Logic]
  end
  subgraph Backend
    C[API] --> D[(DB)]
  end
  B --> C
```

### 6) Comments
```mermaid
flowchart LR
  %% This is a comment
  A --> B
```

---

## Diagram types you’ll actually use in Capstone

## 1) Flowcharts (process + logic)
**Use for:** user flows, “what happens when”, setup steps, CI flow.

```mermaid
flowchart LR
  U[User] --> UI[Web App]
  UI --> API[Backend API]
  API --> DB[(Database)]
  API --> EXT[External API]
  EXT --> API
  DB --> API
  API --> UI
```

---

## 2) Sequence diagrams (API calls + timing)
**Use for:** request/response flows, login, payments, chatbot calls.

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant BE as Backend
  participant DB as Database

  U->>FE: Click "Login"
  FE->>BE: POST /login (email, password)
  BE->>DB: Find user
  DB-->>BE: user record
  BE-->>FE: 200 OK + token
  FE-->>U: Logged in
```

---

## 3) ER diagrams (database tables)
**Use for:** database planning, schema sanity checks.

```mermaid
erDiagram
  USER ||--o{ PROJECT : owns
  PROJECT ||--o{ TASK : contains

  USER {
    int id
    string email
    string name
  }

  PROJECT {
    int id
    string title
    string status
  }

  TASK {
    int id
    string title
    string state
    int project_id
  }
```

---

## 4) Gantt charts (sprint planning)
**Use for:** high-level roadmap, milestones.

```mermaid
gantt
  title Capstone Roadmap (Example)
  dateFormat  YYYY-MM-DD
  section Sprint 1
  Setup + MVP slice     :a1, 2026-03-27, 7d
  section Sprint 2
  Demo hardening        :a2, after a1, 7d
```

---

## 5) State diagrams (feature states)
**Use for:** UI states, onboarding flows, game states.

```mermaid
stateDiagram-v2
  [*] --> LoggedOut
  LoggedOut --> LoggedIn: login success
  LoggedIn --> LoggedOut: logout
  LoggedIn --> Error: auth fails
  Error --> LoggedOut: reset
```

---

## Capstone copy/paste templates

### A) C4-lite architecture (super simple)
```mermaid
flowchart LR
  U[User] --> FE[Frontend]
  FE --> BE[Backend API]
  BE --> DB[(Database)]
  BE --> S3[(File Storage)]
  BE --> EXT[External Service]
```

### B) Weekly demo flow (what you show)
```mermaid
flowchart TB
  A[Start demo] --> B[Feature 1]
  B --> C[Feature 2]
  C --> D{Something breaks?}
  D -->|No| E[Wrap up]
  D -->|Yes| F[Backup plan demo]
  F --> E
```

### C) CI pipeline (if you add Actions later)
```mermaid
flowchart LR
  PR[Pull Request] --> CI[Run CI]
  CI --> T{Tests pass?}
  T -->|Yes| M[Merge to main]
  T -->|No| F[Fix + push]
  F --> CI
```

---

## Styling (optional, use lightly)
If you want basic styling:

```mermaid
flowchart LR
  A[Frontend] --> B[Backend]
  B --> C[(DB)]

  classDef svc fill:#eef,stroke:#88a,stroke-width:1px;
  class A,B svc;
```

If styling causes render issues, remove it. Clarity > pretty.

---

## Common mistakes (and fixes)
- **Doesn’t render:** confirm the fence is ` ```mermaid `.
- **Indentation weird:** Mermaid is picky. Keep formatting simple.
- **IDs with spaces break:** use `A1`, `backend_api`, etc. Put spaces in labels like `[Label with spaces]`.
- **Unreadable:** switch to `LR`, use subgraphs, or split into two diagrams.

---

## Definition of Done for a Mermaid diagram
- It answers one question (architecture OR flow OR schema)
- It fits on one screen
- Labels use plain English
- It matches reality (no fantasy boxes)

