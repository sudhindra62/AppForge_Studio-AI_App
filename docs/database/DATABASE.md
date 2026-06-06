# AppForge AI — Database Design

---

## 1. Technology Choices

| Tool | Choice | Reason |
|---|---|---|
| Database | PostgreSQL (Neon) | ACID compliant, JSON support, serverless-compatible |
| ORM | Prisma | Type-safe, auto-generated client, migration system |
| Connection | Neon Serverless Driver | Optimized for serverless/edge environments |
| Pattern | Repository Pattern | Decouples DB from business logic |

---

## 2. Core Schema (Prisma)

```prisma
// prisma/schema.prisma (conceptual — implementation in Phase 2+)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Users ───────────────────────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  hashedPassword String?
  role          Role      @default(USER)
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  applications  Application[]
  importJobs    ImportJob[]
  notifications Notification[]

  @@map("users")
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}

// ─── NextAuth Tables ──────────────────────────────────────────────
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─── Applications ─────────────────────────────────────────────────
model Application {
  id          String   @id @default(cuid())
  userId      String
  name        String
  slug        String   @unique
  description String?
  metadata    Json     // AppMetadata as JSON
  status      AppStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  entityDefinitions EntityDefinition[]
  importJobs        ImportJob[]

  @@index([userId])
  @@map("applications")
}

enum AppStatus {
  ACTIVE
  ARCHIVED
  DRAFT
}

// ─── Entity Definitions ───────────────────────────────────────────
model EntityDefinition {
  id              String   @id @default(cuid())
  applicationId   String
  name            String
  pluralName      String
  slug            String
  fieldDefinitions Json    // FieldDefinition[] as JSON
  permissions     Json     // EntityPermission as JSON
  listConfig      Json?    // ListConfig as JSON
  formConfig      Json?    // FormConfig as JSON
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@unique([applicationId, slug])
  @@index([applicationId])
  @@map("entity_definitions")
}

// ─── Import Jobs ──────────────────────────────────────────────────
model ImportJob {
  id              String      @id @default(cuid())
  userId          String
  applicationId   String
  entitySlug      String
  status          ImportStatus @default(PENDING)
  fileName        String
  totalRows       Int         @default(0)
  processedRows   Int         @default(0)
  successRows     Int         @default(0)
  errorRows       Int         @default(0)
  errorLog        Json?       // Array of { row, field, message }
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([applicationId])
  @@map("import_jobs")
}

enum ImportStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED_PARTIAL
  FAILED
}

// ─── Notifications ────────────────────────────────────────────────
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // e.g. "import_complete", "system_alert"
  title     String
  body      String
  isRead    Boolean  @default(false)
  metadata  Json?    // Extra context (e.g., { importJobId: "..." })
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}

// ─── Push Subscriptions ───────────────────────────────────────────
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("push_subscriptions")
}
```

---

## 3. Repository Pattern

### Why Repository Pattern?

Direct Prisma access from use cases creates tight coupling to the database implementation. The repository pattern:

1. **Decouples** business logic from DB technology
2. **Makes testing easy** — repositories can be mocked
3. **Enforces consistency** — all DB access goes through one place
4. **Provides abstraction** — use cases don't know about SQL/Prisma details

### Base Repository

```typescript
// Conceptual interface for src/database/repositories/base.repository.ts
abstract class BaseRepository<T, CreateInput, UpdateInput> {
  abstract findById(id: string): Promise<T | null>;
  abstract findMany(options: FindManyOptions): Promise<PaginatedResult<T>>;
  abstract create(data: CreateInput): Promise<T>;
  abstract update(id: string, data: UpdateInput): Promise<T>;
  abstract delete(id: string): Promise<void>;
}
```

---

## 4. Migration Strategy

### Development Workflow
```bash
# Create a new migration after schema change
npx prisma migrate dev --name "add_push_subscriptions"

# Apply migrations in production
npx prisma migrate deploy

# Reset DB (development only)
npx prisma migrate reset

# View DB in browser
npx prisma studio
```

### Migration Naming Conventions
- `0001_init` — Initial schema
- `0002_add_notifications` — Adding notifications table
- `0003_add_push_subscriptions` — Adding push subscriptions
- Always prefix with zero-padded sequential number

### Neon Branch Strategy
- `main` branch → Production database
- `dev` branch → Development database
- Each PR gets its own Neon branch (ephemeral preview DB)

---

## 5. Performance Considerations

| Strategy | Implementation |
|---|---|
| Connection Pooling | Neon serverless driver + PgBouncer |
| Query Optimization | Prisma `select` to avoid over-fetching |
| Indexing | Indexes on all FK columns + frequently queried fields |
| Pagination | Cursor-based pagination for large datasets |
| JSON Columns | `metadata`, `fieldDefinitions` stored as JSONB for efficient querying |
