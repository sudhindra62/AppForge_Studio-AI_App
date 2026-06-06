# Backend Runtime Engine Architecture

The **Backend Runtime Engine** automatically provides full REST (CRUD) APIs for every dynamic entity defined in an AppForge application. It translates incoming HTTP requests into secure, validated database operations against the `GeneratedRecord` store.

## 📁 Directory Structure

```text
src/engines/backend-runtime/
├── api-factory.ts         # High-order route handler generators (createCollectionApiHandler, createRecordApiHandler)
├── crud-engine.ts         # Core database orchestration and audit logging
├── validation-engine.ts   # Dynamic Zod schema builder for JSON validation
├── error-engine.ts        # Centralized error handler and standard response formatting
├── rate-limiter.ts        # Pluggable rate-limiting interface
└── index.ts               # Public Module API
```

## 🧩 Key Patterns

### 1. Entity-Attribute-Value (EAV) via JSONB
Instead of manipulating the Postgres DDL structure (creating/altering real database tables for every user entity), the Backend Runtime uses a single `GeneratedRecord` table. 
All dynamic fields are stored within the `data` column as `JSONB`, offering the perfect balance of schema flexibility and high query performance.

### 2. The API Factory Pattern
Instead of writing boilerplate for every new API route, developers use the factory to mount dynamic routes instantly:

```typescript
// /app/api/apps/[appId]/data/[entitySlug]/route.ts
import { createCollectionApiHandler } from '@/engines/backend-runtime';

export const { GET, POST } = createCollectionApiHandler();
```

### 3. Server-Side Dynamic Validation
Before any data reaches the database, the `validation-engine` intercepts the payload. It queries the `GeneratedField` definitions for the entity, constructs a strict `Zod` schema at runtime, and runs `.safeParse()`.
- Invalid data types throw `400 Bad Request`.
- Extraneous fields not in the metadata throw `400 Bad Request` (Schema Mismatch Protection).
- Min/Max, Regex patterns, and strict enum values are enforced natively.

### 4. Multi-Tenant Security & Audit Logging
The `crud-engine` strictly enforces multi-tenancy. Every operation ensures that `app.userId === session.user.id`. 
All successful `POST`, `PUT`, and `DELETE` requests automatically emit a trail to the `AuditLog` table.

## 🔒 Rate Limiting
The engine integrates `applyRateLimit(userId)`. Currently, this uses an in-memory sliding window cache. For production clustered deployments on Vercel Edge, this is designed to be easily swapped with an Upstash Redis rate limiter.
