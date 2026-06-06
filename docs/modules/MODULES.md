# AppForge AI — Module Specifications

Each module is **fully self-contained**, independently toggleable via feature flags, and communicates with the core through the `IAppModule` interface.

---

## IAppModule Interface

```typescript
// src/shared/interfaces/module.interface.ts
interface IAppModule {
  name: string;
  version: string;
  isEnabled(): boolean;
  initialize(): Promise<void>;
  teardown(): Promise<void>;
}
```

---

## Module 1: CSV Import Module

**Location:** `src/modules/csv/`  
**Feature Flag:** `FEATURE_CSV_IMPORT`  
**Purpose:** Allows users to bulk-import data into any entity by uploading a CSV file.

### Architecture

```
User uploads CSV file
        ↓
FileDropzone.tsx        → accepts .csv, validates MIME type
        ↓
csv-parser.ts           → Papa Parse: CSV → string[][]
        ↓
ColumnMapper.tsx         → user maps CSV headers → entity fields
        ↓
csv-validator.ts        → validates each row against entity Zod schema
        ↓
DataPreviewTable.tsx     → shows valid rows (green) + errors (red)
        ↓
User confirms import
        ↓
create-import-job.ts    → creates ImportJob record in DB
        ↓
batch-importer.ts       → inserts rows in configurable batch sizes (e.g., 100/batch)
        ↓
ImportProgress.tsx       → SSE stream from /api/import/:jobId
        ↓
Import complete → success report with counts
```

### Error Handling
- Row-level validation: each invalid row is logged with field + reason
- Partial imports: valid rows are inserted even if some rows fail
- Import job status: PENDING → PROCESSING → COMPLETED | FAILED_PARTIAL | FAILED

---

## Module 2: Internationalization (i18n) Module

**Location:** `src/modules/i18n/`  
**Feature Flag:** `FEATURE_I18N`  
**Purpose:** Supports multiple languages for the AppForge UI.

### Architecture

- Uses **next-intl** library (Next.js 15 compatible)
- Locale files stored in `src/modules/i18n/locales/[locale]/[namespace].json`
- Locale detection: URL prefix (`/en/`, `/es/`) → falls back to browser Accept-Language → defaults to `en`
- `LocaleSwitcher.tsx` allows users to switch language at runtime

### Supported Locales (Initial)

| Code | Language |
|---|---|
| `en` | English (default) |
| `es` | Spanish |
| `hi` | Hindi |
| `fr` | French |

### Translation Namespaces

- `common` — Shared UI text (buttons, labels, statuses)
- `auth` — Login/register page text
- `dashboard` — Dashboard-specific text
- `errors` — Error messages

---

## Module 3: Progressive Web App (PWA) Module

**Location:** `src/modules/pwa/`  
**Feature Flag:** `FEATURE_PWA`  
**Purpose:** Makes AppForge installable and partially usable offline.

### Architecture

- Uses **next-pwa** plugin configured in `next.config.ts`
- Service Worker registered on first load
- Web App Manifest served at `/manifest.webmanifest`

### Caching Strategy

| Resource Type | Strategy |
|---|---|
| Static assets (JS, CSS, fonts) | Cache-First |
| API requests (read) | Network-First with fallback |
| Images | Cache-First with expiry |
| Navigation (HTML) | Network-First |

### Offline Capabilities
- Cached pages remain accessible offline
- Forms show clear "offline" indicator
- Mutations queued for retry when back online (Background Sync API)

### PWA Manifest Config

```json
{
  "name": "AppForge AI",
  "short_name": "AppForge",
  "theme_color": "#6366f1",
  "background_color": "#0f0f13",
  "display": "standalone",
  "start_url": "/dashboard",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Module 4: Notification Module

**Location:** `src/modules/notifications/`  
**Feature Flag:** `FEATURE_NOTIFICATIONS`  
**Purpose:** Delivers in-app and push notifications to users.

### Architecture

#### In-App Notifications
- `Notification` records stored in PostgreSQL
- `NotificationBell.tsx` polls for unread count (or uses SSE)
- `NotificationList.tsx` shows dropdown of recent notifications
- Mark-as-read via API PATCH

#### Push Notifications
- Uses **Web Push API** with VAPID keys
- Browser asks permission → subscription stored in DB
- Server sends push via `web-push` npm package
- `usePushSubscription.ts` hook manages subscribe/unsubscribe

### Notification Types

| Type | Trigger | Delivery |
|---|---|---|
| `import_complete` | CSV import finishes | In-app + Push |
| `import_failed` | CSV import fails | In-app + Push |
| `app_created` | New app created | In-app |
| `record_created` | Entity record created | In-app |
| `system_alert` | Admin broadcasts message | In-app + Push |

### Module Toggle Behavior
- When `FEATURE_NOTIFICATIONS=false`: `NotificationBell` renders nothing; API routes return 404
- Push subscriptions are never solicited when disabled
