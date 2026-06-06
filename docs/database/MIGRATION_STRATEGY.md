# AppForge AI — Migration Strategy

---

## Phase 2: Initial Migration Plan

The initial database is split into 9 ordered migrations matching the dependency graph.

### Migration Order & Dependency Graph

```
0001_init_users_and_auth          (no deps)
        ↓
0002_add_generated_applications   (depends on: users)
        ↓
0003_add_application_configs      (depends on: generated_applications)
        ↓
0004_add_entities_and_fields      (depends on: generated_applications)
        ↓
0005_add_workflows                (depends on: generated_applications)
        ↓
0006_add_import_jobs              (depends on: users + generated_applications)
        ↓
0007_add_notifications_push       (depends on: users)
        ↓
0008_add_languages                (no deps — global)
        ↓
0009_add_audit_system             (depends on: users — FK nullable)
```

---

## Running Migrations

### Initial Setup (Phase 2)

```bash
# Copy environment template
cp .env.example .env.local
# Fill in: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# Run all pending migrations
npm run db:migrate
# Equivalent to: npx prisma migrate dev --schema=prisma/schema

# Validate schema (no DB required)
npm run db:validate

# Seed the database with demo data
npm run db:seed

# Open Prisma Studio browser
npm run db:studio
```

### Adding a New Migration

```bash
# 1. Edit the relevant .prisma file(s) in prisma/schema/
# 2. Create the migration (auto-detects schema changes):
npx prisma migrate dev --schema=prisma/schema --name "add_workflow_logs"
# 3. Review prisma/migrations/[timestamp]_add_workflow_logs/migration.sql
# 4. Commit both the schema change AND the migration file
```

### Production Deployment

```bash
# In CI/CD (Vercel build hook or GitHub Actions):
npx prisma migrate deploy --schema=prisma/schema
# Note: migrate deploy applies pending migrations; it does NOT create new ones
```

---

## Schema Change Checklist

Before creating a migration, verify:

- [ ] Added `@db.Text` to long string fields (descriptions, custom CSS/JS)
- [ ] Added `@default(...)` to all new NOT NULL columns on existing tables
- [ ] Added `@@index` for every new FK column
- [ ] Added `@@unique` for business-level unique constraints
- [ ] Updated `enum` values only by ADDING (never removing) values first
- [ ] Tested with `npx prisma validate --schema=prisma/schema`
- [ ] Reviewed generated SQL before applying to production

---

## Rollback Strategy

Prisma does not support automatic rollbacks. Manual rollback procedure:

```bash
# 1. Identify the migration to roll back
npx prisma migrate status --schema=prisma/schema

# 2. Write a reverse migration SQL manually
# 3. Apply it directly to the database
# 4. Mark the migration as "rolled back" in _prisma_migrations table:
UPDATE _prisma_migrations SET rolled_back_at = NOW() WHERE migration_name = '...';

# 5. Delete the migration file from prisma/migrations/
# 6. Revert the schema .prisma file changes
# 7. Re-run npx prisma generate --schema=prisma/schema
```

---

## Enum Evolution Rules

Prisma/PostgreSQL enum evolution is tricky. Follow these rules:

```bash
# ✅ SAFE: Add a new value to an existing enum
# Edit enums.prisma → add new value → npx prisma migrate dev

# ⚠️ UNSAFE: Remove an enum value
# Step 1: Mark value as deprecated in code (add _DEPRECATED suffix)
# Step 2: Migrate all rows using the old value
# Step 3: Remove in a separate migration (only after row migration is complete)

# ⚠️ UNSAFE: Rename an enum value
# Use the add-new + migrate-rows + remove-old approach
```

---

## Large Table Migration Pattern

For tables with > 100K rows, avoid locking with batched updates:

```sql
-- Instead of: UPDATE generated_fields SET new_col = default_value;
-- Use batched approach:
DO $$
DECLARE
  batch_size INT := 1000;
  offset_val INT := 0;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE generated_fields
    SET new_col = default_value
    WHERE id IN (
      SELECT id FROM generated_fields
      WHERE new_col IS NULL
      LIMIT batch_size
    );
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;
    PERFORM pg_sleep(0.1); -- Brief pause to reduce lock contention
  END LOOP;
END $$;
```
