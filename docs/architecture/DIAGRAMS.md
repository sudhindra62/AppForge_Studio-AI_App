# AppForge AI — Architecture Diagrams

---

## Diagram 1: System Layer Architecture

```mermaid
graph TB
    subgraph CLIENT["🌐 Client (Browser)"]
        B[Browser]
    end

    subgraph FRONTEND["Layer 1 — Frontend Rendering Engine"]
        ROUTER[Next.js App Router]
        RSC[React Server Components]
        RCC[React Client Components]
        RENGINE[Rendering Engine\nMetadata → UI]
        SHADCN[ShadCN UI Primitives]
        TAILWIND[TailwindCSS Styles]
    end

    subgraph BACKEND["Layer 3 — Backend Runtime Engine"]
        API[API Routes\n/app/api/]
        ACTIONS[Server Actions]
        USECASES[Use Cases\nBusiness Logic]
        VALIDATORS[Zod Validators]
    end

    subgraph AUTH["Layer 5 — Authentication Layer"]
        NEXTAUTH[NextAuth.js]
        RBAC[RBAC Middleware]
        SESSION[Session Manager]
    end

    subgraph CONFIG["Layer 4 — Configuration Engine"]
        META[Metadata Schema Engine]
        ENV[Env Manager]
        FLAGS[Feature Flags]
    end

    subgraph DATABASE["Layer 2 — Database Layer"]
        REPOS[Repository Layer]
        PRISMA[Prisma ORM]
        PG[(PostgreSQL\nNeon)]
    end

    subgraph MODULES["Layer 6 — Module Layer"]
        CSV[CSV Import]
        I18N[i18n Module]
        PWA[PWA Module]
        NOTIF[Notification Module]
    end

    B --> ROUTER
    ROUTER --> RSC
    ROUTER --> RCC
    RSC --> RENGINE
    RENGINE --> SHADCN
    SHADCN --> TAILWIND
    RSC --> USECASES
    RCC --> API
    API --> VALIDATORS
    VALIDATORS --> USECASES
    USECASES --> REPOS
    REPOS --> PRISMA
    PRISMA --> PG
    NEXTAUTH --> SESSION
    RBAC --> API
    RBAC --> ROUTER
    META --> RENGINE
    ENV --> CONFIG
    FLAGS --> CONFIG
    CONFIG --> META
    MODULES --> USECASES
```

---

## Diagram 2: Request Lifecycle (Read Flow)

```mermaid
sequenceDiagram
    participant BR as Browser
    participant MW as Edge Middleware
    participant PA as Next.js Page (RSC)
    participant SV as Feature Service
    participant RP as Repository
    participant DB as PostgreSQL

    BR->>MW: GET /dashboard/apps
    MW->>MW: Validate Session (NextAuth)
    MW->>MW: RBAC Check (role permissions)
    MW->>PA: Forward Request
    PA->>SV: getApplications(userId)
    SV->>RP: ApplicationRepository.findMany({userId})
    RP->>DB: SELECT * FROM applications WHERE user_id = ?
    DB-->>RP: rows[]
    RP-->>SV: Application[]
    SV-->>PA: Application[] (typed)
    PA-->>BR: Server-Rendered HTML + RSC Payload
```

---

## Diagram 3: Request Lifecycle (Write Flow via Server Action)

```mermaid
sequenceDiagram
    participant CL as Client Component
    participant SA as Server Action
    participant ZD as Zod Validator
    participant UC as Use Case
    participant RP as Repository
    participant DB as PostgreSQL
    participant RV as Next.js Revalidation

    CL->>SA: submitForm(formData)
    SA->>ZD: validate(formData, CreateAppSchema)
    alt Validation Fails
        ZD-->>CL: {error: ValidationError}
    else Validation Passes
        ZD-->>SA: ValidatedData
        SA->>UC: createApplication(ValidatedData)
        UC->>RP: ApplicationRepository.create(data)
        RP->>DB: INSERT INTO applications ...
        DB-->>RP: Application
        RP-->>UC: Application
        UC-->>SA: {ok: Application}
        SA->>RV: revalidatePath('/dashboard/apps')
        SA-->>CL: {success: true, data: Application}
    end
```

---

## Diagram 4: Metadata-Driven UI Generation Flow

```mermaid
flowchart LR
    subgraph INPUT["Input"]
        YAML[app-metadata.yaml\nEntity Definitions\nField Configs\nRelationships\nPermissions]
    end

    subgraph CONFIG_ENGINE["Configuration Engine"]
        PARSER[Metadata Parser]
        VALIDATOR[Zod Schema Validator]
        REGISTRY[Entity Registry]
    end

    subgraph RENDERING_ENGINE["Rendering Engine"]
        FGEN[Form Generator]
        TGEN[Table Generator]
        NGEN[Nav Generator]
        VGEN[View Generator]
    end

    subgraph UI["Generated UI"]
        FORM[Dynamic Form]
        TABLE[Data Table]
        NAV[Navigation Menu]
        DETAIL[Detail View]
    end

    YAML --> PARSER
    PARSER --> VALIDATOR
    VALIDATOR --> REGISTRY
    REGISTRY --> FGEN
    REGISTRY --> TGEN
    REGISTRY --> NGEN
    REGISTRY --> VGEN
    FGEN --> FORM
    TGEN --> TABLE
    NGEN --> NAV
    VGEN --> DETAIL
```

---

## Diagram 5: Authentication & RBAC Flow

```mermaid
flowchart TD
    USER[User Request] --> MW[Edge Middleware]
    MW --> SESS{Valid Session?}
    SESS -- No --> LOGIN[Redirect to /login]
    SESS -- Yes --> RBAC{RBAC Check}
    RBAC -- Denied --> FORBIDDEN[403 Forbidden Page]
    RBAC -- Allowed --> ROUTE[Continue to Route]

    subgraph AUTH_PROVIDERS["NextAuth Providers"]
        CREDS[Credentials Provider\nEmail + Password]
        GOOGLE[Google OAuth]
        GITHUB[GitHub OAuth]
    end

    LOGIN --> CREDS
    LOGIN --> GOOGLE
    LOGIN --> GITHUB
    CREDS --> JWT[Issue JWT + Session]
    GOOGLE --> JWT
    GITHUB --> JWT
    JWT --> MW
```

---

## Diagram 6: CSV Import Module Pipeline

```mermaid
flowchart LR
    UPLOAD[File Upload\n.csv] --> PARSE[CSV Parser\nPapa Parse]
    PARSE --> VALIDATE[Row Validator\nZod Schema]
    VALIDATE --> PREVIEW[Preview Table\nShow errors + data]
    PREVIEW --> CONFIRM{User Confirms?}
    CONFIRM -- No --> CANCEL[Cancel Import]
    CONFIRM -- Yes --> TRANSFORM[Data Transformer\nField Mapping]
    TRANSFORM --> BATCH[Batch Processor\nChunked Inserts]
    BATCH --> DB[(PostgreSQL)]
    BATCH --> PROGRESS[Progress Tracker\nSSE / WebSocket]
    DB --> COMPLETE[Import Complete\nSuccess Report]
```

---

## Diagram 7: Module Plug-and-Play Architecture

```mermaid
graph TD
    CORE[AppForge Core\napp + engines + database] 
    
    CORE --> IFACE[Module Interface\nIAppModule]

    IFACE --> CSV_M[CSV Import Module\ncsv/index.ts implements IAppModule]
    IFACE --> I18N_M[i18n Module\ni18n/index.ts implements IAppModule]
    IFACE --> PWA_M[PWA Module\npwa/index.ts implements IAppModule]
    IFACE --> NOTIF_M[Notification Module\nnotifications/index.ts implements IAppModule]

    FLAGS[Feature Flags\nconfig/feature-flags.ts] --> |toggles| CSV_M
    FLAGS --> |toggles| I18N_M
    FLAGS --> |toggles| PWA_M
    FLAGS --> |toggles| NOTIF_M
```

---

## Diagram 8: Database Entity Relationship (Core Entities)

```mermaid
erDiagram
    USER {
        string id PK
        string email
        string name
        string role
        datetime createdAt
        datetime updatedAt
    }

    APPLICATION {
        string id PK
        string userId FK
        string name
        string slug
        json metadata
        string status
        datetime createdAt
        datetime updatedAt
    }

    ENTITY_DEFINITION {
        string id PK
        string applicationId FK
        string name
        string pluralName
        json fieldDefinitions
        json permissions
        datetime createdAt
    }

    IMPORT_JOB {
        string id PK
        string userId FK
        string applicationId FK
        string status
        int totalRows
        int processedRows
        int errorRows
        datetime createdAt
    }

    NOTIFICATION {
        string id PK
        string userId FK
        string type
        string title
        string body
        boolean isRead
        datetime createdAt
    }

    USER ||--o{ APPLICATION : "owns"
    APPLICATION ||--o{ ENTITY_DEFINITION : "has"
    USER ||--o{ IMPORT_JOB : "runs"
    APPLICATION ||--o{ IMPORT_JOB : "targets"
    USER ||--o{ NOTIFICATION : "receives"
```

---

## Diagram 9: Deployment Architecture (Vercel + Neon)

```mermaid
graph TB
    subgraph VERCEL["Vercel Platform"]
        EDGE[Edge Network\nGlobal CDN]
        EDGE_FN[Edge Functions\nMiddleware]
        SERVER_FN[Serverless Functions\nAPI Routes + SSR]
        STATIC[Static Assets\n/public]
    end

    subgraph NEON["Neon PostgreSQL"]
        DB_PRIMARY[(Primary DB)]
        DB_BRANCH[(Branch DB\nPR Previews)]
        CONN_POOL[Connection Pooler]
    end

    subgraph EXTERNAL["External Services"]
        OAUTH_G[Google OAuth]
        OAUTH_GH[GitHub OAuth]
        PUSH_SVC[Push Service\nWeb Push / FCM]
    end

    USER[End User] --> EDGE
    EDGE --> EDGE_FN
    EDGE --> STATIC
    EDGE_FN --> SERVER_FN
    SERVER_FN --> CONN_POOL
    CONN_POOL --> DB_PRIMARY
    SERVER_FN --> OAUTH_G
    SERVER_FN --> OAUTH_GH
    SERVER_FN --> PUSH_SVC
    
    PR[Pull Request] --> DB_BRANCH
```

---

## Diagram 10: Component Hierarchy

```mermaid
graph TD
    APP[app/layout.tsx\nRoot Layout]
    APP --> AUTH_LAYOUT[app/auth/layout.tsx]
    APP --> DASH_LAYOUT[app/dashboard/layout.tsx]
    APP --> PUBLIC_LAYOUT[app/public/layout.tsx]

    AUTH_LAYOUT --> LOGIN[app/auth/login/page.tsx]
    AUTH_LAYOUT --> REGISTER[app/auth/register/page.tsx]

    DASH_LAYOUT --> DASH_PAGE[app/dashboard/page.tsx]
    DASH_LAYOUT --> APPS_PAGE[app/dashboard/apps/page.tsx]
    DASH_LAYOUT --> ENTITY_PAGE[app/dashboard/apps/entity/page.tsx]
    DASH_LAYOUT --> IMPORT_PAGE[app/dashboard/import/page.tsx]
    DASH_LAYOUT --> SETTINGS_PAGE[app/dashboard/settings/page.tsx]

    DASH_PAGE --> WIDGETS[DashboardWidgets\ncomponents/dashboard/]
    APPS_PAGE --> APP_LIST[AppListTable\ncomponents/apps/]
    ENTITY_PAGE --> DYNAMIC_FORM[DynamicForm\nengines/rendering/]
    ENTITY_PAGE --> DYNAMIC_TABLE[DynamicTable\nengines/rendering/]
    IMPORT_PAGE --> CSV_WIZARD[CSVImportWizard\nmodules/csv/]
```
