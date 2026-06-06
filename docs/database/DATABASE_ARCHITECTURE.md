# AppForge AI — Database Architecture

**Version:** 2.0.0 (Phase 2)  
**Engine:** PostgreSQL (Neon)  
**ORM:** Prisma v6.7+ (Multi-file schema, GA)  
**Last Updated:** 2026-05-29

---

## 1. Architecture Principles

### 1.1 Multi-Tenant: User-Scoped Isolation

AppForge AI uses **user-level multi-tenancy**. Every owned record carries a `userId` foreign key:

```
User → GeneratedApplication → GeneratedEntity → GeneratedField
                            → GeneratedWorkflow
                            → CSVImportJob
User → Notification
User → AuditLog
```

**Enforcement layers:**
1. **Repository layer**: All `find*` methods include `userId` in WHERE (never return another user's data)
2. **API middleware**: `withAuth()` injects `userId` from session; validated before use case call
3. **Prisma constraints**: `onDelete: Cascade` propagates user deletions downward

**Non-user-scoped models** (global shared data): `Language`, `SystemSettings`, `VerificationToken`

### 1.2 Soft Delete Pattern

Four models support soft delete via `deletedAt DateTime?`:

| Model | When soft-deleted | Hard delete trigger |
|---|---|---|
| `User` | Account deactivation | 30 days after soft delete (scheduler) |
| `GeneratedApplication` | User archives app | 90 days after soft delete |
| `GeneratedEntity` | Entity removed from app | Immediate with parent app |
| `GeneratedWorkflow` | Workflow archived | Immediate with parent app |

**Repository convention:**
```typescript
// All find methods include this WHERE clause for soft-deletable models:
where: { deletedAt: null }

// Admin recovery (explicit):
where: { deletedAt: { not: null } }
```

**`GeneratedField` has NO soft delete.** Field removal is a schema change — intentional and permanent. Soft-deleting a field would leave orphaned validation rules and broken form references.

### 1.3 Audit Trail Design

`AuditLog` is a **polymorphic, immutable** audit table:

```
AuditLog {
  resourceType: "GeneratedApplication"   // Model name as string
  resourceId:   "clx123..."              // ID of the affected record
  action:       "UPDATE"
  oldValue:     { status: "DRAFT" }      // JSON snapshot before
  newValue:     { status: "ACTIVE" }     // JSON snapshot after
  changedFields: { status: { old: "DRAFT", new: "ACTIVE" } }
}
```

**Why no FK on resourceType/resourceId?**  
Polymorphic FKs are not supported natively in PostgreSQL. Using strings allows auditing records that are later soft-deleted or hard-deleted — the audit trail persists beyond the data's lifetime.

**Immutability enforcement:**
- `AuditLogRepository.update()` and `delete()` throw immediately
- No cascades or triggers that modify audit records
- Cleanup only via scheduled data retention jobs (after 365 days)

### 1.4 Repository Pattern

```
Component / API Route
        ↓
Use Case (business logic)
        ↓
Repository (data access)
        ↓
Prisma Client (generated types)
        ↓
PostgreSQL (Neon)
```

**Rules:**
- No Prisma import outside `src/database/`
- No use case or service accesses `prisma` directly
- All repositories extend `BaseRepository<T, CreateInput, UpdateInput>`
- Repositories return domain types, not Prisma internal types

### 1.5 Multi-File Schema (Prisma v6.7+)

The schema is split across 9 files in `prisma/schema/`:

| File | Models |
|---|---|
| `base.prisma` | Generator + Datasource |
| `enums.prisma` | All enumerations (10 enums, 47 values) |
| `user.prisma` | User, Account, Session, VerificationToken, PushSubscription |
| `application.prisma` | GeneratedApplication, ApplicationConfig |
| `entity.prisma` | GeneratedEntity, GeneratedField |
| `workflow.prisma` | GeneratedWorkflow |
| `import.prisma` | CSVImportJob |
| `notification.prisma` | Notification |
| `i18n.prisma` | Language |
| `audit.prisma` | AuditLog |
| `system.prisma` | SystemSettings |

Prisma automatically merges all files during `generate` and `migrate`. Models in any file can reference models in any other file.

---

## 2. Model Reference

| Model | Table Name | Soft Delete | User Scoped | Records |
|---|---|---|---|---|
| User | `users` | ✅ deletedAt | — (IS the tenant) | ~1K |
| Account | `accounts` | ❌ | Via User | ~1-3 per user |
| Session | `sessions` | ❌ (expires) | Via User | ~1-5 per user |
| VerificationToken | `verification_tokens` | ❌ (expires) | Via identifier | Transient |
| PushSubscription | `push_subscriptions` | ❌ | Via User | ~1-5 per user |
| GeneratedApplication | `generated_applications` | ✅ deletedAt | ✅ userId | ~1-10 per user |
| ApplicationConfig | `application_configs` | ❌ | Via App | 1:1 with app |
| GeneratedEntity | `generated_entities` | ✅ deletedAt | Via App | ~5-50 per app |
| GeneratedField | `generated_fields` | ❌ | Via Entity | ~5-100 per entity |
| GeneratedWorkflow | `generated_workflows` | ✅ status+deletedAt | Via App | ~0-20 per app |
| CSVImportJob | `csv_import_jobs` | ❌ (retained) | ✅ userId | ~0-100 per user |
| Notification | `notifications` | ❌ (expiresAt) | ✅ userId | ~0-500 per user |
| Language | `languages` | ❌ (isActive) | ❌ Global | ~10-50 |
| AuditLog | `audit_logs` | ❌ Immutable | ✅ userId | ~1M+ total |
| SystemSettings | `system_settings` | ❌ (isActive) | ❌ Global | ~20-50 |

---

## 3. Validation Strategy

### 3.1 Three-Layer Validation

```
Layer 1: Client-side  → React Hook Form + Zod (immediate user feedback)
Layer 2: Server-side  → Zod schema in API route/Server Action (security)
Layer 3: Database     → Prisma constraints + PostgreSQL (last line of defense)
```

**Zod schemas live in:** `src/backend/validators/`  
**Database constraints:** Unique, Not Null, FK constraints in Prisma schema  
**Field-level validation:** Stored in `GeneratedField.validation` JSON; evaluated by Rendering Engine at runtime

### 3.2 Constraint Summary

| Constraint | Where Enforced |
|---|---|
| Unique email | `User.email @unique` |
| Unique app slug | `GeneratedApplication.slug @unique` |
| Unique entity slug per app | `GeneratedEntity @@unique([applicationId, slug])` |
| Unique field name per entity | `GeneratedField @@unique([entityId, name])` |
| Unique SKU (field-level) | `GeneratedField.isUnique: true` → enforced by Rendering Engine |
| Unique push endpoint | `PushSubscription.endpoint @unique` |
| Unique settings key | `SystemSettings.key @unique` |
| Unique OAuth account | `Account @@unique([provider, providerAccountId])` |

---

## 4. Performance Design

### 4.1 Index Strategy

**Principle:** Every FK column gets an index. High-cardinality query patterns get compound indexes.

**Critical indexes:**
```sql
-- Most common queries on generatedApplications:
CREATE INDEX ON generated_applications (user_id, status);
CREATE INDEX ON generated_applications (user_id, deleted_at);

-- Notification bell unread count (runs on every page load):
CREATE INDEX ON notifications (user_id, is_read);

-- AuditLog resource history (compliance dashboard):
CREATE INDEX ON audit_logs (resource_type, resource_id);

-- Import job status monitoring:
CREATE INDEX ON csv_import_jobs (status, started_at);
```

### 4.2 JSON Column Strategy

| Model | JSON Column | Contents | Why JSON? |
|---|---|---|---|
| GeneratedApplication | `metadata` | App-specific extra data | Flexible schema per app |
| GeneratedField | `options` | Select field options list | Variable-length, typed data |
| GeneratedField | `validation` | Zod-compatible rules | Rule set varies by field type |
| GeneratedField | `fileConfig` | Upload configuration | Optional, complex structure |
| ApplicationConfig | `permissionsConfig` | Entity RBAC rules | Dynamic per-entity |
| CSVImportJob | `columnMapping` | Header→field mapping | User-defined at runtime |
| CSVImportJob | `errorLog` | Row-level error array | Variable-length error list |
| AuditLog | `oldValue`/`newValue` | Full record snapshots | Schema-independent |

**Storage type:** PostgreSQL `JSONB` (binary JSON) for all `Json` columns.  
JSONB supports indexing, contains queries (`@>`), and is more efficient than `JSON`.

### 4.3 Neon Serverless Optimization

```bash
# Connection string format for serverless:
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
# (Direct URL for migrations; pooled URL for runtime)
```

- Neon uses HTTP-based driver for serverless environments
- Connection pool: 25 connections max (Neon free tier)
- Use `@neondatabase/serverless` driver in production for edge functions

---

## 5. Migration Strategy

### 5.1 Naming Convention

```
prisma/migrations/
├── 0001_init_users_and_auth/
│   └── migration.sql
├── 0002_add_generated_applications/
│   └── migration.sql
├── 0003_add_entities_and_fields/
│   └── migration.sql
├── 0004_add_workflows/
│   └── migration.sql
├── 0005_add_import_jobs/
│   └── migration.sql
├── 0006_add_notifications_and_push/
│   └── migration.sql
├── 0007_add_languages/
│   └── migration.sql
├── 0008_add_audit_logs/
│   └── migration.sql
└── 0009_add_system_settings/
    └── migration.sql
```

### 5.2 Development Workflow

```bash
# 1. Edit .prisma schema files in prisma/schema/
# 2. Create a migration:
npx prisma migrate dev --schema=prisma/schema --name "description_of_change"

# 3. Review generated SQL in prisma/migrations/
# 4. Apply to local DB automatically (dev)

# 5. For production:
npx prisma migrate deploy --schema=prisma/schema
```

### 5.3 Neon Branch Strategy

| Branch | DB | Usage |
|---|---|---|
| `main` | Neon `main` | Production database |
| `dev` | Neon `dev` | Development & integration |
| `feature/*` | Neon ephemeral branch | Per-PR preview databases |

**Neon branch workflow:**
```bash
# Create preview branch for a PR:
neonctl branches create --name "preview/pr-42"
# Vercel automatically detects Neon and sets branch DB URL for preview deploys
```

### 5.4 Data Migration Rules

1. **Never drop a column in one migration** — first mark as deprecated, then remove in next release
2. **Always add new NOT NULL columns with a DEFAULT** — prevents migration failure on existing rows
3. **Test migrations against a copy of production data** before deploying
4. **Rollback plan** — every breaking migration must have a documented rollback procedure
5. **Large table migrations** — for tables > 100K rows, use batched updates rather than `UPDATE ... WHERE 1=1`

---

## 6. Data Retention Policy

| Data Type | Retention | Cleanup Method |
|---|---|---|
| Soft-deleted Users | 30 days | Scheduled cleanup job |
| Soft-deleted Applications | 90 days | Scheduled cleanup job |
| Completed Import Jobs | 90 days | Scheduled cleanup job |
| Failed Import Jobs (error log) | 30 days | Partial cleanup (keep summary) |
| Read Notifications | 30 days | Scheduled cleanup job |
| Expired Notifications | Immediate | Query filter (expiresAt < NOW()) |
| Audit Logs | 365 days | Scheduled cleanup job |
| Sessions | On expiry | NextAuth + periodic cleanup |
| Verification Tokens | On expiry | NextAuth + periodic cleanup |

Cleanup jobs run as Vercel Cron Jobs (Phase 4+) and are triggered via `GET /api/cron/cleanup`.
