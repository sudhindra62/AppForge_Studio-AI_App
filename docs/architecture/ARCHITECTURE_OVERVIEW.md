# AppForge AI — Architecture Overview

**Version:** 1.0.0  
**Status:** Architecture Phase (Phase 1)  
**Last Updated:** 2026-05-29  
**Author:** Senior Principal Architect

---

## 1. System Mission

AppForge AI is a **metadata-driven AI application generator**. Its core mission is:

> *"Given a structured metadata definition of an application (entities, fields, relationships, permissions, UI hints), generate and serve a fully functional, type-safe, production-ready web application dynamically — without any manual boilerplate."*

---

## 2. The Six Architectural Layers

The system is divided into **six distinct, independently testable layers**. Each layer has a single axis of change, enforcing strict separation of concerns.

```
┌──────────────────────────────────────────────────────────────┐
│                  LAYER 6: Module Layer                        │
│   CSV Import │ i18n │ PWA │ Notifications                    │
├──────────────────────────────────────────────────────────────┤
│                  LAYER 5: Auth Layer                          │
│   NextAuth │ JWT │ Session │ RBAC │ OAuth Providers           │
├──────────────────────────────────────────────────────────────┤
│                  LAYER 4: Configuration Engine               │
│   Metadata Schema │ Env Management │ Feature Flags           │
├──────────────────────────────────────────────────────────────┤
│                  LAYER 3: Backend Runtime Engine             │
│   API Routes │ Server Actions │ Business Logic │ Validation  │
├──────────────────────────────────────────────────────────────┤
│                  LAYER 2: Database Layer                     │
│   Prisma ORM │ PostgreSQL │ Migrations │ Repository Pattern  │
├──────────────────────────────────────────────────────────────┤
│                  LAYER 1: Frontend Rendering Engine          │
│   Next.js App Router │ RSC │ Dynamic UI │ ShadCN │ Tailwind  │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Layer Responsibilities

### Layer 1 — Frontend Rendering Engine

**Location:** `src/engines/rendering/`, `src/app/`, `src/components/`

**Purpose:** Renders the dynamic user interface driven entirely by metadata. This engine reads entity definitions and produces forms, tables, detail views, and navigation — all without hardcoded UI.

**Key Responsibilities:**
- Interpret `EntityMetadata` to generate form fields dynamically
- Render data tables with sorting, pagination, and filtering
- Manage client-side state for generated UIs
- Apply theming and layout from configuration
- Integrate ShadCN UI primitives as building blocks

**Boundary Rule:** This layer MUST NOT contain direct database calls or raw business logic. All data is fetched via Server Components (which call services) or via Client Components (which call API routes).

---

### Layer 2 — Database Layer

**Location:** `src/database/`, `prisma/`

**Purpose:** Owns all database schema definitions, migrations, and the data access abstraction (Repository Pattern).

**Key Responsibilities:**
- Define Prisma schema (`prisma/schema.prisma`)
- Manage migration history (`prisma/migrations/`)
- Provide Repository classes as the ONLY interface to the database
- Seed the database for development and testing
- Define connection pool & Prisma client singleton

**Boundary Rule:** No component, API route, or service should ever import Prisma Client directly. All DB access goes through a Repository class.

---

### Layer 3 — Backend Runtime Engine

**Location:** `src/engines/runtime/`, `src/backend/`, `src/app/api/`

**Purpose:** Orchestrates business logic, request processing, data validation, and response formation.

**Key Responsibilities:**
- Define all API Route handlers (`src/app/api/`)
- Implement Server Actions for form mutations
- Validate requests using Zod schemas
- Coordinate between Services and Repositories
- Handle error mapping and HTTP response formation

**Boundary Rule:** This layer calls Repositories (never Prisma directly) and Services (never external APIs directly — always through a service adapter).

---

### Layer 4 — Configuration Engine

**Location:** `src/config/`, `src/engines/config/`

**Purpose:** Manages all application-wide configuration including the core metadata schema that drives the entire app.

**Key Responsibilities:**
- Define `AppMetadata` schema (entities, fields, relationships, RBAC)
- Validate metadata at startup using Zod
- Manage environment variables with type-safe wrappers
- Implement feature flags (runtime toggles for modules)
- Provide centralized constants

**Boundary Rule:** All other layers read config through this engine. No layer should access `process.env` directly.

---

### Layer 5 — Authentication Layer

**Location:** `src/features/auth/`, `src/app/(auth)/`

**Purpose:** Handles all identity, session, and access-control concerns.

**Key Responsibilities:**
- Configure NextAuth.js providers (Credentials, Google, GitHub)
- Manage JWT and session tokens
- Implement Role-Based Access Control (RBAC) middleware
- Provide `useSession` and `getServerSession` abstractions
- Define permission guards for API routes

**Boundary Rule:** RBAC checks are enforced at the API route and page level. Components receive pre-authorized data — they do not check permissions themselves.

---

### Layer 6 — Module Layer

**Location:** `src/modules/`

**Purpose:** Encapsulates optional, self-contained feature modules that enhance the core platform. Each module is independently toggleable via the Configuration Engine.

**Modules:**
- **CSV Import Module** — Bulk data ingestion pipeline
- **i18n Module** — Internationalization & locale management
- **PWA Module** — Service worker, offline support, installability
- **Notification Module** — Push notifications & in-app alerts

**Boundary Rule:** Modules are plug-and-play. Removing a module must not break any other layer. Modules communicate with the core only through well-defined interfaces.

---

## 4. Data Flow Architecture

### Read Flow (Displaying Data)

```
Browser Request
      │
      ▼
Next.js App Router (app/page.tsx)
      │
      ▼
Server Component
      │ calls
      ▼
Feature Service (src/features/[feature]/services/)
      │ calls
      ▼
Repository (src/database/repositories/)
      │ calls
      ▼
Prisma Client (src/database/client.ts)
      │
      ▼
PostgreSQL (Neon)
      │
      ▼
Data flows back up → rendered as RSC HTML → streamed to browser
```

### Write Flow (Form Submission / Mutation)

```
Client Component (Form)
      │ calls Server Action or API Route
      ▼
Zod Validation (src/backend/validators/)
      │
      ▼
Business Logic / Use Case (src/backend/use-cases/)
      │
      ▼
Repository (src/database/repositories/)
      │
      ▼
Prisma Client → PostgreSQL
      │
      ▼
Response / Revalidation → UI Update
```

### Metadata-Driven UI Flow

```
AppMetadata JSON/YAML
      │ parsed by
      ▼
Configuration Engine (src/engines/config/)
      │ provides EntityDefinition to
      ▼
Rendering Engine (src/engines/rendering/)
      │ generates
      ▼
Dynamic Form / Table / View Components
      │ rendered by
      ▼
Frontend (Next.js App Router)
```

---

## 5. Module Interaction Map

```
┌─────────────────────────────────────────────────────────┐
│                    AppForge AI Core                      │
│                                                          │
│  ┌─────────────┐      ┌──────────────────────────────┐  │
│  │ Config      │─────▶│ Rendering Engine              │  │
│  │ Engine      │      │ (generates UI from metadata)  │  │
│  └─────────────┘      └──────────────────────────────┘  │
│         │                         │                      │
│         ▼                         ▼                      │
│  ┌─────────────┐      ┌──────────────────────────────┐  │
│  │ Auth Layer  │◀─────│ Backend Runtime Engine        │  │
│  │ (RBAC)      │      │ (API routes + Server Actions) │  │
│  └─────────────┘      └──────────────────────────────┘  │
│                                   │                      │
│                                   ▼                      │
│                        ┌──────────────────┐             │
│                        │  Database Layer   │             │
│                        │  (Prisma + PG)    │             │
│                        └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
         │              │              │           │
         ▼              ▼              ▼           ▼
    ┌─────────┐  ┌──────────┐  ┌──────────┐ ┌──────────┐
    │   CSV   │  │   i18n   │  │   PWA    │ │ Notif.   │
    │ Import  │  │  Module  │  │  Module  │ │ Module   │
    └─────────┘  └──────────┘  └──────────┘ └──────────┘
```

---

## 6. Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Routing Strategy | Next.js 15 App Router | RSC support, streaming, nested layouts |
| DB Access Pattern | Repository Pattern | Decouples DB from business logic; testable |
| Validation | Zod (server + client) | Single source of truth for schemas |
| Component Design | ShadCN + Tailwind | Accessible primitives; full control over styles |
| Auth Strategy | NextAuth v5 | First-class Next.js integration; extensible |
| Metadata Format | JSON/YAML + Zod validation | Human-readable; machine-parseable; type-safe |
| State Management | React Context + Server State | Avoids unnecessary complexity; RSC-compatible |
| Module Architecture | Plug-and-play modules | Independent deployment; feature flags |
| API Design | REST (API Routes) + RPC (Server Actions) | REST for external; Server Actions for mutations |
| Error Handling | Result Pattern (Ok/Err) | Explicit error propagation; no thrown exceptions |

---

## 7. Scalability Considerations

### Horizontal Scalability
- **Stateless API Routes** — No server-side session state; JWT-based auth enables horizontal scaling
- **Edge-Ready** — Critical routes can be promoted to Vercel Edge Functions
- **Database Connection Pooling** — Neon's serverless driver with connection pooling

### Code Scalability
- **Feature Slices** — Each domain feature is self-contained; teams can work in parallel
- **Module Isolation** — Modules have no cross-dependencies; safe to add/remove
- **Strict Layer Boundaries** — Dependency direction is always downward (Layer N → Layer N-1)

### Performance
- **React Server Components** — Reduces client JS bundle; server-side data fetching
- **Streaming** — Next.js 15 streaming for progressive page loading
- **Optimistic Updates** — Client-side optimistic UI for Server Actions
- **ISR (Incremental Static Regeneration)** — For metadata-driven pages that change infrequently

---

## 8. Security Architecture

```
Request → Edge Middleware (rate limit, geo-block)
        → NextAuth Session Validation
        → Route-Level RBAC Guard
        → Input Validation (Zod)
        → Business Logic
        → Repository (parameterized queries — SQL injection safe)
        → Database
```

**Key Security Controls:**
- All inputs validated with Zod before processing
- Prisma's parameterized queries prevent SQL injection
- RBAC enforced at middleware AND API route level (defense in depth)
- Environment secrets never exposed to client
- CSRF protection via NextAuth + SameSite cookies
- Content Security Policy (CSP) headers via next.config.ts

---

*See [DIAGRAMS.md](./DIAGRAMS.md) for visual Mermaid diagrams of all flows.*  
*See [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for the complete file-by-file breakdown.*
