# FarmersHub - System Architecture

## Overview

FarmersHub uses a three-layer architecture: a React frontend, a Node.js/Express backend, and a PostgreSQL database. The frontend communicates with the backend through REST APIs, and the backend handles business logic and database operations.

## Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│                    Client                        │
│              (React.js Frontend)                 │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Farmer  │  │ Consumer │  │    Admin      │   │
│  │   View   │  │   View   │  │    View       │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
└──────────────────────┬───────────────────────────┘
                       │ REST API (HTTP/JSON)
                       ▼
┌──────────────────────────────────────────────────┐
│              Backend (Node.js + Express)          │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │   Routes   │→ │ Controllers│→ │  Models    │  │
│  └────────────┘  └────────────┘  └───────────┘  │
│  ┌────────────┐  ┌────────────┐                  │
│  │ Middleware  │  │   Auth     │                  │
│  │ (CORS,     │  │ (JWT)      │                  │
│  │  Logging)  │  │            │                  │
│  └────────────┘  └────────────┘                  │
└──────────────────────┬───────────────────────────┘
                       │ SQL Queries
                       ▼
┌──────────────────────────────────────────────────┐
│              Database (PostgreSQL)                │
│                                                  │
│  ┌────────┐ ┌──────────┐ ┌───────┐ ┌─────────┐  │
│  │ Users  │ │ Products │ │Orders │ │Messages │  │
│  └────────┘ └──────────┘ └───────┘ └─────────┘  │
│  ┌────────┐ ┌──────────┐ ┌───────┐              │
│  │ Farms  │ │ Reviews  │ │Media  │              │
│  └────────┘ └──────────┘ └───────┘              │
└──────────────────────────────────────────────────┘
```

## Tech Stack

| Layer      | Technology        |
|------------|-------------------|
| Frontend   | React.js          |
| Backend    | Node.js + Express |
| Database   | PostgreSQL        |
| Auth       | JWT               |
| Hosting    | Vercel            |
| Storage    | Cloud (images/videos) |

## Project Structure

```
farmershub/
├── frontend/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages
│   ├── services/       # API call functions
│   ├── context/        # State management
│   ├── hooks/          # Custom hooks
│   └── styles/         # CSS/styling
│
├── backend/
│   ├── routes/         # API route definitions
│   ├── controllers/    # Request handling logic
│   ├── models/         # Database models
│   ├── middleware/      # Auth, CORS, logging
│   ├── config/         # Environment & DB config
│   └── uploads/        # Media file storage
│
└── database/
    └── migrations/     # SQL schema scripts
```

## Core Modules

1. **Authentication** — JWT-based login with role-based access (Farmer, Consumer, Admin)
2. **Product Management** — Farmers list, edit, and manage their produce
3. **Order Management** — Consumers place orders; farmers accept and track status
4. **Messaging** — Direct communication between farmers and consumers
5. **Search & Discovery** — Browse and filter farmers/products by location, type, price
6. **Reviews & Ratings** — Consumers rate and review farmers after transactions

## Data Flow

1. User logs in → Frontend sends credentials → Backend verifies via JWT → Token returned
2. Consumer searches products → Frontend calls GET `/api/products` → Backend queries PostgreSQL → Results returned
3. Consumer places order → Frontend calls POST `/api/orders` → Backend creates order record → Farmer gets notified
4. Farmer updates order status → Frontend calls PUT `/api/orders/:id` → Backend updates DB → Consumer sees status change
