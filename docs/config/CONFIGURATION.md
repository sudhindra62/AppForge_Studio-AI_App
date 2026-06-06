# AppForge AI — Configuration Guide

---

## 1. Environment Variables

All environment variables are accessed **exclusively** through `src/config/env.ts`.  
**Never** use `process.env` directly in components, routes, or services.

### Required Variables

```bash
# ─── Database ─────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
# Neon serverless connection string. Used by Prisma.

# ─── Authentication ───────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
# Full URL of the application. MUST be set in production.

NEXTAUTH_SECRET="your-random-secret-min-32-chars"
# Secret for signing JWT tokens. Generate with: openssl rand -base64 32

# ─── OAuth Providers (optional, enable as needed) ────────────────
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

GITHUB_ID="..."
GITHUB_SECRET="..."

# ─── Feature Flags ────────────────────────────────────────────────
NEXT_PUBLIC_FEATURE_CSV_IMPORT="true"
NEXT_PUBLIC_FEATURE_I18N="true"
NEXT_PUBLIC_FEATURE_PWA="true"
NEXT_PUBLIC_FEATURE_NOTIFICATIONS="true"
```

### Optional Variables

```bash
# ─── AI Services ─────────────────────────────────────────────────
OPENAI_API_KEY="sk-..."
GOOGLE_AI_API_KEY="..."

# ─── Email ────────────────────────────────────────────────────────
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@appforge.ai"

# ─── Storage ──────────────────────────────────────────────────────
BLOB_READ_WRITE_TOKEN="vercelblob_..."

# ─── Push Notifications ───────────────────────────────────────────
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:admin@appforge.ai"

# ─── Analytics ───────────────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

---

## 2. Type-Safe Env Accessor

```typescript
// src/config/env.ts (conceptual)
// This module validates all env vars at startup.
// If a required var is missing, the app fails fast with a clear error.

import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  // ... etc
});

export const env = envSchema.parse(process.env);
// Usage: import { env } from '@/config/env'; env.DATABASE_URL
```

---

## 3. Feature Flags

Feature flags are defined in `src/config/feature-flags.ts`.

### Available Flags

| Flag | Type | Default | Controls |
|---|---|---|---|
| `FEATURE_CSV_IMPORT` | boolean | `true` | CSV Import Module |
| `FEATURE_I18N` | boolean | `true` | i18n Module |
| `FEATURE_PWA` | boolean | `true` | PWA Module |
| `FEATURE_NOTIFICATIONS` | boolean | `true` | Notification Module |

### Usage

```typescript
import { featureFlags } from '@/config/feature-flags';

if (featureFlags.CSV_IMPORT) {
  // render CSV import button
}
```

### How Modules Respect Flags

Each `IAppModule.isEnabled()` implementation reads from `featureFlags`. The `ModuleRegistry` in `src/modules/index.ts` calls `isEnabled()` and only initializes enabled modules.

---

## 4. App Metadata Configuration

Application metadata can be stored in two ways:

1. **Database** (production): Stored as JSONB in `applications.metadata` column
2. **File** (development/scaffolding): `src/config/app-metadata/defaults.ts` exports a default metadata object

### Loading Priority
1. Check database for app-specific metadata
2. Fall back to file-based defaults
3. Fall back to empty metadata (zero-config mode)

---

## 5. Next.js Configuration (`next.config.ts`)

```typescript
// Key configuration options (conceptual)
{
  // Image optimization: allow Neon/Vercel blob domains
  images: {
    remotePatterns: [{ hostname: 'your-bucket.public.blob.vercel-storage.com' }]
  },
  
  // Security headers on all responses
  async headers() { ... },
  
  // PWA plugin integration
  // next-pwa configured here when FEATURE_PWA=true
  
  // Internationalization
  // next-intl configured here when FEATURE_I18N=true
}
```
