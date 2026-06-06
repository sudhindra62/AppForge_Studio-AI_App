# AppForge AI — Complete ER Diagram

All 13 database models and their relationships, generated from the Prisma multi-file schema.

---

## Full Entity Relationship Diagram

```mermaid
erDiagram

  %% ── User & Auth ──────────────────────────────────────────────────
  User {
    String  id             PK
    String  email          UK
    String  name
    String  hashedPassword
    Role    role
    Boolean isActive
    DateTime emailVerified
    DateTime lastLoginAt
    Int     loginCount
    DateTime createdAt
    DateTime updatedAt
    DateTime deletedAt     "Soft delete"
  }

  Account {
    String id             PK
    String userId         FK
    String type
    String provider
    String providerAccountId
    String refresh_token
    String access_token
    Int    expires_at
    String scope
  }

  Session {
    String   id           PK
    String   sessionToken UK
    String   userId       FK
    DateTime expires
  }

  VerificationToken {
    String   identifier
    String   token        UK
    DateTime expires
  }

  PushSubscription {
    String id        PK
    String userId    FK
    String endpoint  UK
    String p256dh
    String auth
    String userAgent
    DateTime createdAt
  }

  %% ── Application ──────────────────────────────────────────────────
  GeneratedApplication {
    String        id          PK
    String        userId      FK
    String        name
    String        slug        UK
    String        description
    String        icon
    String        coverColor
    AppStatus     status
    AppVisibility visibility
    Int           version
    Boolean       isPublished
    DateTime      publishedAt
    Json          metadata
    DateTime      createdAt
    DateTime      updatedAt
    DateTime      deletedAt   "Soft delete"
  }

  ApplicationConfig {
    String   id            PK
    String   applicationId FK-UK "1:1"
    String   primaryColor
    String   secondaryColor
    String   fontFamily
    Boolean  darkMode
    Boolean  allowRegistration
    String   defaultLocale
    String[] supportedLocales
    String   timezone
    String[] enabledModules
    String   customCSS
    Json     permissionsConfig
    DateTime createdAt
    DateTime updatedAt
  }

  %% ── Entity & Fields ──────────────────────────────────────────────
  GeneratedEntity {
    String   id            PK
    String   applicationId FK
    String   name
    String   pluralName
    String   slug
    String   displayField
    String   icon
    Boolean  isSystem
    Boolean  hasTimestamps
    Boolean  hasSoftDelete
    Int      orderIndex
    Int      recordCount
    Json     permissions
    Json     listConfig
    Json     formConfig
    DateTime createdAt
    DateTime updatedAt
    DateTime deletedAt     "Soft delete"
  }

  GeneratedField {
    String    id             PK
    String    entityId       FK
    String    name
    String    label
    FieldType type
    Boolean   isRequired
    Boolean   isUnique
    Boolean   isReadOnly
    Boolean   isSystem
    Json      defaultValue
    Json      options
    Json      validation
    String    relatedEntityId FK-nullable
    String    relationType
    String    placeholder
    String    helpText
    String    prefix
    String    suffix
    Int       orderIndex
    Boolean   isHiddenInList
    Boolean   isHiddenInForm
    Boolean   isSearchable
    Boolean   isSortable
    Boolean   isFilterable
    DateTime  createdAt
    DateTime  updatedAt
  }

  %% ── Workflow ─────────────────────────────────────────────────────
  GeneratedWorkflow {
    String          id              PK
    String          applicationId   FK
    String          name
    String          description
    WorkflowTrigger trigger
    String          targetEntitySlug
    String          cronExpression
    Json            conditions
    Json            steps
    Int             executionCount
    DateTime        lastExecutedAt
    WorkflowStatus  status
    DateTime        createdAt
    DateTime        updatedAt
    DateTime        deletedAt       "Soft delete"
  }

  %% ── Import ───────────────────────────────────────────────────────
  CSVImportJob {
    String       id            PK
    String       userId        FK
    String       applicationId FK
    String       entitySlug
    String       entityName
    ImportStatus status
    String       fileName
    Int          fileSize
    Json         columnMapping
    Int          totalRows
    Int          processedRows
    Int          successRows
    Int          errorRows
    Int          skippedRows
    Json         errorLog
    DateTime     startedAt
    DateTime     completedAt
    Int          durationMs
    DateTime     createdAt
    DateTime     updatedAt
  }

  %% ── Notification ─────────────────────────────────────────────────
  Notification {
    String               id        PK
    String               userId    FK
    NotificationType     type
    String               title
    String               body
    NotificationChannel[]channels
    String               actionUrl
    Boolean              isRead
    DateTime             readAt
    Boolean              isPushSent
    Boolean              isEmailSent
    String               sourceType
    String               sourceId
    Json                 metadata
    DateTime             expiresAt
    DateTime             createdAt
  }

  %% ── i18n ─────────────────────────────────────────────────────────
  Language {
    String  id         PK
    String  code       UK
    String  name
    String  nativeName
    String  flag
    Boolean isRTL
    Boolean isDefault
    Boolean isActive
    Int     coverage
    DateTime createdAt
    DateTime updatedAt
  }

  %% ── Audit ────────────────────────────────────────────────────────
  AuditLog {
    String      id           PK
    String      userId       FK-nullable
    String      userEmail
    String      userRole
    AuditAction action
    String      resourceType
    String      resourceId
    String      resourceName
    Json        oldValue
    Json        newValue
    Json        changedFields
    String      ipAddress
    String      userAgent
    String      requestId
    Boolean     success
    String      errorCode
    Json        metadata
    DateTime    createdAt    "Immutable"
  }

  %% ── System ───────────────────────────────────────────────────────
  SystemSettings {
    String  id          PK
    String  key         UK
    Json    value
    String  description
    String  category
    String  dataType
    Boolean isPublic
    Boolean isEditable
    Boolean isActive
    String  updatedBy   FK-nullable
    DateTime createdAt
    DateTime updatedAt
  }

  %% ── Relationships ────────────────────────────────────────────────

  User ||--o{ Account            : "has"
  User ||--o{ Session            : "has"
  User ||--o{ PushSubscription   : "subscribes"
  User ||--o{ GeneratedApplication : "owns"
  User ||--o{ CSVImportJob       : "runs"
  User ||--o{ Notification       : "receives"
  User ||--o{ AuditLog           : "generates"
  User ||--o{ SystemSettings     : "updates (updatedBy)"

  GeneratedApplication ||--o|  ApplicationConfig  : "configured by"
  GeneratedApplication ||--o{  GeneratedEntity    : "contains"
  GeneratedApplication ||--o{  GeneratedWorkflow  : "automates"
  GeneratedApplication ||--o{  CSVImportJob       : "imports via"

  GeneratedEntity ||--o{  GeneratedField : "has fields"
  GeneratedField  }o--o|  GeneratedEntity : "relates to (RELATION type)"
```

---

## Relationship Summary Table

| From | To | Type | Constraint |
|---|---|---|---|
| User | Account | 1:N | Cascade delete |
| User | Session | 1:N | Cascade delete |
| User | PushSubscription | 1:N | Cascade delete |
| User | GeneratedApplication | 1:N | Cascade delete |
| User | CSVImportJob | 1:N | Cascade delete |
| User | Notification | 1:N | Cascade delete |
| User | AuditLog | 1:N | SetNull on delete |
| User | SystemSettings (updatedBy) | 1:N | SetNull on delete |
| GeneratedApplication | ApplicationConfig | 1:1 | Cascade delete |
| GeneratedApplication | GeneratedEntity | 1:N | Cascade delete |
| GeneratedApplication | GeneratedWorkflow | 1:N | Cascade delete |
| GeneratedApplication | CSVImportJob | 1:N | Cascade delete |
| GeneratedEntity | GeneratedField (owned) | 1:N | Cascade delete |
| GeneratedField | GeneratedEntity (related) | N:1 | SetNull on delete |

---

## Enum Reference

| Enum | Values |
|---|---|
| `Role` | USER, ADMIN, SUPER_ADMIN |
| `AppStatus` | DRAFT, ACTIVE, ARCHIVED, DEPRECATED |
| `AppVisibility` | PRIVATE, PUBLIC, SHARED |
| `FieldType` | TEXT, TEXTAREA, RICH_TEXT, EMAIL, URL, PHONE, NUMBER, DECIMAL, CURRENCY, PERCENTAGE, BOOLEAN, DATE, DATETIME, TIME, SELECT, MULTI_SELECT, RELATION, FILE, IMAGE, JSON, COLOR, RATING, FORMULA |
| `WorkflowTrigger` | ON_CREATE, ON_UPDATE, ON_DELETE, MANUAL, SCHEDULED, ON_IMPORT |
| `WorkflowStatus` | DRAFT, ACTIVE, PAUSED, ARCHIVED |
| `ImportStatus` | PENDING, VALIDATING, PROCESSING, COMPLETED, FAILED_PARTIAL, FAILED, CANCELLED |
| `NotificationType` | INFO, SUCCESS, WARNING, ERROR |
| `NotificationChannel` | IN_APP, PUSH, EMAIL |
| `AuditAction` | CREATE, UPDATE, DELETE, RESTORE, LOGIN, LOGOUT, EXPORT, IMPORT, PUBLISH, ARCHIVE |

---

## Index Summary

| Model | Indexed Columns | Purpose |
|---|---|---|
| User | email, role, isActive, deletedAt, createdAt | Auth lookups, role queries, soft-delete filter |
| Account | userId, (provider+providerAccountId) | NextAuth queries |
| Session | userId, expires | Auth + cleanup |
| GeneratedApplication | userId, (userId+status), (userId+deletedAt), slug | User dashboard, soft-delete |
| GeneratedEntity | applicationId, (applicationId+deletedAt), orderIndex | App entity list |
| GeneratedField | entityId, (entityId+orderIndex), type, relatedEntityId | Field lists, relation lookups |
| GeneratedWorkflow | applicationId, (applicationId+status), trigger | Workflow execution |
| CSVImportJob | userId, applicationId, status, createdAt | User job list, status filter |
| Notification | userId, (userId+isRead), sourceType+sourceId, expiresAt | Unread count, cleanup |
| AuditLog | userId, action, (resourceType+resourceId), createdAt | History, time queries |
| SystemSettings | category, isPublic, isActive | Config lookups |
