# AppForge AI — Complete Folder Structure

Every folder and file is listed with its exact responsibility. No ambiguity.

---

## Root Level

```
appforge-ai/
├── src/                    # ALL application source code lives here
├── prisma/                 # Prisma ORM schema + migrations
├── public/                 # Static files served at root URL
├── docs/                   # All documentation
├── .env.example            # Template for environment variables
├── .env.local              # Local env vars (git-ignored)
├── .gitignore              # Files excluded from version control
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # TailwindCSS configuration
├── tsconfig.json           # TypeScript compiler configuration
├── components.json         # ShadCN UI configuration
├── postcss.config.mjs      # PostCSS configuration (Tailwind)
├── package.json            # npm dependencies and scripts
├── package-lock.json       # Locked dependency tree
├── README.md               # Project overview and quick start
└── middleware.ts            # Next.js edge middleware (auth + RBAC)
```

---

## `/src` — Application Source

The `src/` directory is the heart of the application, organized into the following top-level sections:

```
src/
├── app/            # Next.js App Router: routing ONLY
├── components/     # Shared UI component library
├── engines/        # Core rendering & runtime engines
├── modules/        # Isolated plug-and-play feature modules
├── features/       # Domain-based feature slices
├── backend/        # Server-side use cases, validators, services
├── database/       # Prisma client, repositories, seeds
├── config/         # Configuration, env, feature flags
├── hooks/          # Global React hooks
├── services/       # External service adapters
├── types/          # Global TypeScript type definitions
├── utils/          # Pure utility functions
└── shared/         # Cross-cutting logic used by multiple layers
```

---

## `/src/app` — Next.js App Router (Routing Only)

**Rule:** This directory contains ONLY routing, page composition, and layouts. Zero business logic.

```
src/app/
├── (auth)/                         # Route group: unauthenticated pages
│   ├── login/
│   │   └── page.tsx                # Login page — renders LoginForm component
│   ├── register/
│   │   └── page.tsx                # Register page — renders RegisterForm component
│   └── layout.tsx                  # Auth layout (centered card, no sidebar)
│
├── (dashboard)/                    # Route group: authenticated pages
│   ├── dashboard/
│   │   └── page.tsx                # Main dashboard overview page
│   ├── apps/
│   │   ├── page.tsx                # List all user applications
│   │   ├── [appId]/
│   │   │   ├── page.tsx            # Single app overview
│   │   │   ├── entities/
│   │   │   │   ├── page.tsx        # List entities for this app
│   │   │   │   └── [entityId]/
│   │   │   │       ├── page.tsx    # Entity data table view
│   │   │   │       ├── new/
│   │   │   │       │   └── page.tsx # Create new entity record
│   │   │   │       └── [recordId]/
│   │   │   │           └── page.tsx # Edit/view entity record
│   │   │   └── settings/
│   │   │       └── page.tsx        # App-specific settings
│   │   └── new/
│   │       └── page.tsx            # Create new application wizard
│   ├── import/
│   │   └── page.tsx                # CSV import module entry page
│   ├── settings/
│   │   └── page.tsx                # Global user settings
│   └── layout.tsx                  # Dashboard layout (sidebar + topbar)
│
├── api/                            # API Route handlers
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts            # NextAuth.js route handler
│   ├── applications/
│   │   ├── route.ts                # GET /api/applications, POST /api/applications
│   │   └── [appId]/
│   │       ├── route.ts            # GET, PUT, DELETE /api/applications/:id
│   │       └── entities/
│   │           ├── route.ts        # GET, POST /api/applications/:id/entities
│   │           └── [entityId]/
│   │               └── route.ts   # GET, PUT, DELETE entity endpoints
│   ├── import/
│   │   ├── route.ts                # POST /api/import (initiate import job)
│   │   └── [jobId]/
│   │       └── route.ts            # GET /api/import/:id (job status SSE)
│   ├── notifications/
│   │   └── route.ts                # GET /api/notifications, POST mark-as-read
│   └── health/
│       └── route.ts                # GET /api/health (health check endpoint)
│
├── layout.tsx                      # Root layout (html, body, providers)
├── page.tsx                        # Landing/marketing page (public)
├── not-found.tsx                   # 404 page
├── error.tsx                       # Global error boundary
├── loading.tsx                     # Global loading skeleton
└── globals.css                     # Global CSS (Tailwind base + CSS vars)
```

---

## `/src/components` — Shared UI Library

Reusable, business-agnostic UI primitives. These know nothing about your domain.

```
src/components/
├── ui/                             # ShadCN UI auto-generated components
│   ├── button.tsx                  # Button primitive
│   ├── input.tsx                   # Input primitive
│   ├── form.tsx                    # Form wrapper (react-hook-form integration)
│   ├── dialog.tsx                  # Modal dialog
│   ├── table.tsx                   # Table primitive
│   ├── card.tsx                    # Card container
│   ├── badge.tsx                   # Status badge
│   ├── toast.tsx                   # Toast notification
│   ├── select.tsx                  # Select dropdown
│   ├── checkbox.tsx                # Checkbox
│   ├── switch.tsx                  # Toggle switch
│   ├── tabs.tsx                    # Tab navigation
│   ├── dropdown-menu.tsx           # Dropdown menu
│   ├── avatar.tsx                  # User avatar
│   ├── skeleton.tsx                # Loading skeleton
│   ├── separator.tsx               # Visual separator
│   ├── tooltip.tsx                 # Tooltip
│   ├── alert.tsx                   # Alert/banner
│   ├── progress.tsx                # Progress bar
│   └── [more shadcn components]    # Added as needed
│
├── layout/                         # Layout shell components
│   ├── Sidebar.tsx                 # Main navigation sidebar
│   ├── Topbar.tsx                  # Top header bar
│   ├── Footer.tsx                  # Application footer
│   ├── PageHeader.tsx              # Consistent page title + breadcrumb
│   └── ContentArea.tsx             # Main content wrapper with padding
│
├── common/                         # Shared domain-aware components
│   ├── LoadingSpinner.tsx           # Centered loading spinner
│   ├── EmptyState.tsx              # Empty list/zero-state UI
│   ├── ErrorBoundary.tsx           # React error boundary wrapper
│   ├── ConfirmDialog.tsx           # Generic confirm/delete dialog
│   ├── DataTable.tsx               # Reusable sortable/paginated table
│   ├── SearchInput.tsx             # Debounced search input
│   ├── StatusBadge.tsx             # Color-coded status badge
│   ├── UserAvatar.tsx              # User avatar with fallback initials
│   └── CopyButton.tsx              # Copy-to-clipboard button
│
├── providers/                      # React Context Providers
│   ├── AuthProvider.tsx            # NextAuth session provider wrapper
│   ├── ThemeProvider.tsx           # Dark/light mode provider
│   ├── ToastProvider.tsx           # Toast notification context
│   ├── QueryProvider.tsx           # TanStack Query provider (if used)
│   └── AppProviders.tsx            # Combines all providers for root layout
│
└── icons/                          # Icon wrappers and custom SVGs
    ├── AppForgeIcon.tsx             # Brand logo icon
    └── index.ts                    # Re-exports all icon components
```

---

## `/src/engines` — Core Engines

The intellectual core of AppForge AI.

```
src/engines/
├── rendering/                      # Frontend Rendering Engine
│   ├── index.ts                    # Public API: exports all rendering functions
│   ├── form-generator/
│   │   ├── index.ts                # DynamicForm component entry
│   │   ├── DynamicForm.tsx         # Root dynamic form component
│   │   ├── FieldRenderer.tsx       # Renders a single field by type
│   │   ├── field-types/
│   │   │   ├── TextField.tsx       # Text input field
│   │   │   ├── NumberField.tsx     # Numeric input field
│   │   │   ├── SelectField.tsx     # Enum/select field
│   │   │   ├── BooleanField.tsx    # Checkbox/toggle field
│   │   │   ├── DateField.tsx       # Date picker field
│   │   │   ├── RelationField.tsx   # Foreign key relation selector
│   │   │   ├── FileField.tsx       # File upload field
│   │   │   └── RichTextField.tsx   # Rich text / markdown field
│   │   └── form-validator.ts       # Generates Zod schema from FieldDefinition[]
│   │
│   ├── table-generator/
│   │   ├── index.ts                # DynamicTable entry
│   │   ├── DynamicTable.tsx        # Root dynamic data table
│   │   ├── ColumnRenderer.tsx      # Renders table columns from metadata
│   │   ├── TableToolbar.tsx        # Search, filter, bulk actions toolbar
│   │   └── table-utils.ts          # Sorting, pagination, filter helpers
│   │
│   ├── view-generator/
│   │   ├── index.ts                # DynamicDetailView entry
│   │   ├── DynamicDetailView.tsx   # Read-only record detail view
│   │   └── FieldValueRenderer.tsx  # Renders a field value by type
│   │
│   └── nav-generator/
│       ├── index.ts                # Navigation generation entry
│       ├── DynamicNav.tsx          # Navigation items from app metadata
│       └── nav-utils.ts            # Nav item construction helpers
│
└── config/                         # Configuration Engine
    ├── index.ts                    # Public API: exports config functions
    ├── metadata-parser.ts          # Parses YAML/JSON → internal AppMetadata
    ├── metadata-validator.ts       # Zod schemas for AppMetadata validation
    ├── metadata-registry.ts        # In-memory registry of parsed entity definitions
    ├── entity-resolver.ts          # Resolves entity definitions by name/ID
    └── schema-types.ts             # TypeScript types for metadata schema
```

---

## `/src/modules` — Isolated Feature Modules

Each module is fully self-contained and plug-and-play.

```
src/modules/
├── index.ts                        # Module registry: registers enabled modules
│
├── csv/                            # CSV Import Module
│   ├── index.ts                    # Module public API + IAppModule implementation
│   ├── README.md                   # Module documentation
│   ├── components/
│   │   ├── CSVImportWizard.tsx     # Multi-step import wizard
│   │   ├── FileDropzone.tsx        # Drag-and-drop CSV uploader
│   │   ├── ColumnMapper.tsx        # Map CSV columns → entity fields
│   │   ├── DataPreviewTable.tsx    # Preview parsed CSV data with errors
│   │   └── ImportProgress.tsx      # Real-time import progress tracker
│   ├── services/
│   │   ├── csv-parser.ts           # Parse CSV → raw rows (Papa Parse wrapper)
│   │   ├── csv-validator.ts        # Validate rows against entity schema
│   │   ├── csv-transformer.ts      # Transform/map rows to entity fields
│   │   └── batch-importer.ts       # Chunked batch insert into repository
│   ├── hooks/
│   │   └── useCSVImport.ts         # React hook for import wizard state
│   └── types/
│       └── csv.types.ts            # ImportJob, ColumnMapping, ParseResult types
│
├── i18n/                           # Internationalization Module
│   ├── index.ts                    # Module public API + IAppModule implementation
│   ├── README.md                   # Module documentation
│   ├── config/
│   │   └── i18n.config.ts          # Supported locales, default locale
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json         # Common UI strings (English)
│   │   │   ├── auth.json           # Auth-related strings (English)
│   │   │   └── dashboard.json      # Dashboard strings (English)
│   │   ├── es/
│   │   │   ├── common.json         # Spanish translations
│   │   │   ├── auth.json
│   │   │   └── dashboard.json
│   │   └── [locale]/               # Additional locale directories
│   ├── components/
│   │   └── LocaleSwitcher.tsx      # Locale selector dropdown component
│   ├── hooks/
│   │   └── useTranslation.ts       # Hook for accessing translations
│   └── types/
│       └── i18n.types.ts           # Locale, TranslationKey, I18nConfig types
│
├── pwa/                            # Progressive Web App Module
│   ├── index.ts                    # Module public API + IAppModule implementation
│   ├── README.md                   # Module documentation
│   ├── manifest/
│   │   └── manifest.ts             # Web app manifest configuration
│   ├── service-worker/
│   │   ├── sw.ts                   # Service worker main file
│   │   ├── cache-strategies.ts     # Cache-first, network-first strategies
│   │   └── offline-page.tsx        # Offline fallback page
│   ├── components/
│   │   ├── InstallPrompt.tsx       # PWA install prompt banner
│   │   └── OfflineIndicator.tsx    # Shows when user is offline
│   └── hooks/
│       ├── useInstallPrompt.ts     # PWA install prompt hook
│       └── useOfflineStatus.ts     # Network status detection hook
│
└── notifications/                  # Notification Module
    ├── index.ts                    # Module public API + IAppModule implementation
    ├── README.md                   # Module documentation
    ├── components/
    │   ├── NotificationBell.tsx    # Topbar notification bell with badge
    │   ├── NotificationList.tsx    # Dropdown list of notifications
    │   └── NotificationItem.tsx    # Single notification row
    ├── services/
    │   ├── push-service.ts         # Web Push API + VAPID key management
    │   └── notification-sender.ts  # Send notifications via push service
    ├── hooks/
    │   ├── useNotifications.ts     # Fetch and manage notifications
    │   └── usePushSubscription.ts  # Subscribe/unsubscribe from push
    └── types/
        └── notification.types.ts   # Notification, PushSubscription types
```

---

## `/src/features` — Domain Feature Slices

Business-domain-aware code, organized by feature. Each feature can have components, hooks, services.

```
src/features/
├── auth/                           # Authentication feature
│   ├── index.ts                    # Public API exports
│   ├── components/
│   │   ├── LoginForm.tsx           # Login form with validation
│   │   ├── RegisterForm.tsx        # Registration form
│   │   ├── OAuthButtons.tsx        # Google/GitHub sign-in buttons
│   │   └── SessionGuard.tsx        # HOC: redirect if not authenticated
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth state + actions hook
│   │   └── usePermissions.ts       # RBAC permission check hook
│   ├── services/
│   │   └── auth.service.ts         # NextAuth config + credential validation
│   ├── actions/
│   │   └── auth.actions.ts         # Server Actions: login, register, logout
│   └── types/
│       └── auth.types.ts           # User, Session, Role, Permission types
│
├── applications/                   # Application management feature
│   ├── index.ts
│   ├── components/
│   │   ├── AppCard.tsx             # Application summary card
│   │   ├── AppListTable.tsx        # Table of all user apps
│   │   ├── CreateAppForm.tsx       # New app creation form
│   │   ├── AppSettingsForm.tsx     # Edit app settings
│   │   └── DeleteAppDialog.tsx     # Confirm delete dialog
│   ├── hooks/
│   │   ├── useApplications.ts      # Fetch + manage applications list
│   │   └── useApplication.ts       # Fetch + manage single application
│   ├── services/
│   │   └── application.service.ts  # Business logic for applications
│   ├── actions/
│   │   └── application.actions.ts  # Server Actions: create, update, delete
│   └── types/
│       └── application.types.ts    # Application, AppStatus, AppMetadata types
│
├── entities/                       # Entity definition management
│   ├── index.ts
│   ├── components/
│   │   ├── EntityList.tsx          # List entity definitions for an app
│   │   ├── EntityEditor.tsx        # Visual entity schema editor
│   │   ├── FieldEditor.tsx         # Field definition editor
│   │   └── RelationshipEditor.tsx  # Relationship builder UI
│   ├── hooks/
│   │   ├── useEntities.ts          # Fetch + manage entity definitions
│   │   └── useEntityEditor.ts      # Entity editor state management
│   ├── services/
│   │   └── entity.service.ts       # Entity definition business logic
│   ├── actions/
│   │   └── entity.actions.ts       # Server Actions: CRUD entity definitions
│   └── types/
│       └── entity.types.ts         # EntityDefinition, FieldDefinition, RelationType
│
└── dashboard/                      # Dashboard overview feature
    ├── index.ts
    ├── components/
    │   ├── StatsCard.tsx           # Metric stat card (apps count, etc.)
    │   ├── RecentActivity.tsx      # Recent imports/changes feed
    │   └── QuickActions.tsx        # Quick action buttons
    ├── hooks/
    │   └── useDashboardStats.ts    # Fetch dashboard statistics
    └── services/
        └── dashboard.service.ts    # Aggregate stats from multiple repos
```

---

## `/src/backend` — Server-Side Logic

Pure server-side code. Never imported by Client Components.

```
src/backend/
├── use-cases/                      # Application-layer use cases (one per action)
│   ├── applications/
│   │   ├── create-application.ts   # Use case: create a new application
│   │   ├── update-application.ts   # Use case: update application metadata
│   │   ├── delete-application.ts   # Use case: soft-delete an application
│   │   └── get-applications.ts     # Use case: list user applications
│   ├── entities/
│   │   ├── create-entity.ts        # Use case: define new entity
│   │   └── update-entity.ts        # Use case: modify entity schema
│   └── import/
│       ├── create-import-job.ts    # Use case: initiate CSV import
│       └── process-import.ts       # Use case: process import batch
│
├── validators/                     # Zod request validation schemas
│   ├── application.validator.ts    # CreateApp, UpdateApp Zod schemas
│   ├── entity.validator.ts         # CreateEntity, UpdateEntity schemas
│   ├── import.validator.ts         # ImportJob creation schema
│   └── common.validator.ts         # Shared: pagination, sorting schemas
│
├── middleware/                     # API route middleware helpers
│   ├── with-auth.ts                # Wraps route: validates session
│   ├── with-rbac.ts                # Wraps route: checks role permissions
│   ├── with-validation.ts          # Wraps route: validates request body
│   └── with-error-handler.ts       # Wraps route: unified error responses
│
└── errors/                         # Error types and HTTP error mapping
    ├── app-error.ts                # Base AppError class
    ├── validation-error.ts         # 400 Validation error
    ├── auth-error.ts               # 401/403 Auth errors
    ├── not-found-error.ts          # 404 Not found error
    └── error-handler.ts            # Maps AppError → HTTP response
```

---

## `/src/database` — Database Layer

```
src/database/
├── client.ts                       # Prisma Client singleton (safe for serverless)
├── repositories/                   # Repository pattern: ONE class per entity
│   ├── base.repository.ts          # Abstract base: findById, findMany, create, update, delete
│   ├── user.repository.ts          # UserRepository extends BaseRepository
│   ├── application.repository.ts   # ApplicationRepository
│   ├── entity-definition.repository.ts # EntityDefinitionRepository
│   ├── import-job.repository.ts    # ImportJobRepository
│   └── notification.repository.ts  # NotificationRepository
│
└── seeds/                          # Database seeding scripts
    ├── index.ts                    # Master seed runner
    ├── user.seed.ts                # Seed demo users
    ├── application.seed.ts         # Seed sample applications
    └── entity.seed.ts              # Seed sample entity definitions
```

---

## `/prisma` — Prisma ORM

```
prisma/
├── schema.prisma                   # Database schema: all models, relations, indexes
└── migrations/                     # Auto-generated migration files
    ├── 0001_init/
    │   └── migration.sql           # Initial schema migration
    └── [timestamp]_[name]/
        └── migration.sql           # Each subsequent migration
```

---

## `/src/config` — Configuration Engine

```
src/config/
├── index.ts                        # Re-exports all config modules
├── env.ts                          # Type-safe environment variable accessor (no raw process.env)
├── constants.ts                    # App-wide constants (pagination size, max upload, etc.)
├── feature-flags.ts                # Feature flag definitions + runtime toggle
└── app-metadata/
    ├── schema.ts                   # Zod schema: full AppMetadata definition
    ├── loader.ts                   # Load & parse metadata from file or DB
    └── defaults.ts                 # Default metadata values
```

---

## `/src/hooks` — Global React Hooks

```
src/hooks/
├── useDebounce.ts                  # Debounce a value with configurable delay
├── useLocalStorage.ts              # Read/write localStorage with SSR safety
├── useMediaQuery.ts                # Responsive breakpoint detection
├── usePagination.ts                # Pagination state management
├── useToggle.ts                    # Simple boolean toggle hook
└── useWindowSize.ts                # Browser window dimensions
```

---

## `/src/services` — External Service Adapters

```
src/services/
├── email/
│   ├── index.ts                    # Email service public API
│   ├── email.service.ts            # Send emails via provider (Resend/SES)
│   └── templates/
│       ├── welcome.ts              # Welcome email template
│       └── password-reset.ts       # Password reset email template
│
├── storage/
│   ├── index.ts                    # Storage service public API
│   └── storage.service.ts          # File upload adapter (S3/Vercel Blob)
│
└── ai/
    ├── index.ts                    # AI service public API
    └── ai.service.ts               # AI API adapter (OpenAI/Gemini)
```

---

## `/src/types` — Global TypeScript Types

```
src/types/
├── index.ts                        # Re-exports all global types
├── api.types.ts                    # API request/response envelope types
├── common.types.ts                 # Shared: ID, Timestamps, PaginatedResult
├── env.d.ts                        # TypeScript declaration for env vars
└── next-auth.d.ts                  # Augment NextAuth session/user types
```

---

## `/src/utils` — Pure Utility Functions

```
src/utils/
├── index.ts                        # Re-exports all utils
├── cn.ts                           # clsx + tailwind-merge utility (className)
├── format.ts                       # Date, currency, number formatters
├── slug.ts                         # String → URL-safe slug converter
├── pagination.ts                   # Pagination math helpers
├── result.ts                       # Result<T, E> type + Ok/Err constructors
├── assert.ts                       # Runtime assertion helpers
└── object.ts                       # Object pick, omit, deepMerge helpers
```

---

## `/src/shared` — Cross-Cutting Shared Logic

```
src/shared/
├── constants/
│   └── routes.ts                   # Type-safe route path constants
├── schemas/
│   └── pagination.schema.ts        # Shared Zod schemas used in multiple layers
└── interfaces/
    └── module.interface.ts         # IAppModule interface for module plug-and-play
```

---

## `/docs` — Documentation

```
docs/
├── architecture/
│   ├── ARCHITECTURE_OVERVIEW.md   # System design and layer responsibilities
│   ├── FOLDER_STRUCTURE.md        # This file
│   └── DIAGRAMS.md                # Mermaid architecture diagrams
├── engines/
│   └── ENGINES.md                 # Engine design specifications
├── modules/
│   └── MODULES.md                 # Module specifications
├── database/
│   └── DATABASE.md                # Schema, ERD, migration strategy
├── api/
│   └── API_REFERENCE.md           # All API routes documented
├── auth/
│   └── AUTH.md                    # Auth flow and RBAC design
├── config/
│   └── CONFIGURATION.md           # Env vars and feature flag guide
├── adr/
│   ├── ADR-001-nextjs-app-router.md    # Decision: App Router over Pages Router
│   ├── ADR-002-repository-pattern.md   # Decision: Repository over direct Prisma
│   ├── ADR-003-module-isolation.md     # Decision: Plug-and-play modules
│   └── ADR-004-metadata-schema.md      # Decision: Zod-validated metadata
└── CONTRIBUTING.md                # Development workflow and conventions
```

---

## `/public` — Static Assets

```
public/
├── favicon.ico                     # Browser tab icon
├── icons/
│   ├── icon-192x192.png            # PWA icon (small)
│   └── icon-512x512.png            # PWA icon (large)
├── manifest.webmanifest            # PWA web manifest
├── sw.js                           # Service worker (generated by PWA module)
└── images/
    └── og-image.png                # Open Graph social preview image
```

---

## Root Config Files

```
.env.example              # Template showing all required env vars (no secrets)
.env.local                # Actual local secrets (NEVER commit)
.gitignore                # Ignores: .env.local, .next/, node_modules/, etc.
next.config.ts            # Next.js: PWA plugin, image domains, CSP headers, redirects
tailwind.config.ts        # Tailwind: content paths, custom colors, animations
tsconfig.json             # TypeScript: strict mode, path aliases (@/*)
components.json           # ShadCN: style, rsc, tsx, tailwind, aliases
postcss.config.mjs        # PostCSS: tailwind + autoprefixer
middleware.ts             # Edge middleware: session validation, RBAC, redirects
package.json              # Scripts: dev, build, start, lint, test, db:migrate, db:seed
```
