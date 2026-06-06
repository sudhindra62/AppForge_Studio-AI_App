# AppForge AI — Engine Specifications

---

## 1. Frontend Rendering Engine

**Location:** `src/engines/rendering/`  
**Layer:** Layer 1 — Frontend Rendering Engine  
**Purpose:** Transforms `EntityDefinition` metadata into fully functional UI components at runtime.

### Design Philosophy

The Rendering Engine is AppForge AI's core innovation. Instead of hardcoding forms and tables for each entity, this engine reads a structured `EntityDefinition` and produces:
- A validated form with correct field types, validation rules, and layout
- A sortable, filterable data table with correct columns
- A read-only detail view
- Navigation items

This means adding a new entity to an application requires **zero new UI code** — only a metadata update.

### Sub-Engines

#### 1.1 Form Generator (`src/engines/rendering/form-generator/`)

**Input:** `EntityDefinition` (from Config Engine)  
**Output:** `<DynamicForm>` React component

**Algorithm:**
1. Read `EntityDefinition.fields[]`
2. For each field, determine `fieldType` (text, number, select, boolean, date, relation, file, richtext)
3. Map `fieldType` → appropriate `FieldComponent`
4. Apply validation rules from field metadata (required, min, max, pattern)
5. Build Zod schema dynamically from field definitions
6. Render `<DynamicForm>` with `react-hook-form` + Zod resolver

**Field Type Registry:**

| Metadata `type` | Rendered Component | ShadCN Primitive |
|---|---|---|
| `text` | `TextField` | Input |
| `email` | `TextField` (email mode) | Input |
| `number` | `NumberField` | Input[type=number] |
| `select` | `SelectField` | Select |
| `boolean` | `BooleanField` | Switch |
| `date` | `DateField` | DatePicker |
| `relation` | `RelationField` | Select (async) |
| `file` | `FileField` | Custom dropzone |
| `richtext` | `RichTextField` | Textarea / Editor |

#### 1.2 Table Generator (`src/engines/rendering/table-generator/`)

**Input:** `EntityDefinition` + `Record[]` data  
**Output:** `<DynamicTable>` React component

**Features:**
- Auto-generates columns from `EntityDefinition.fields[]` where `showInList: true`
- Supports client-side sorting, server-side pagination
- Action column: edit, view, delete with RBAC-aware visibility
- Row selection for bulk actions
- Column-level search/filter if `filterable: true` on field

#### 1.3 View Generator (`src/engines/rendering/view-generator/`)

**Input:** `EntityDefinition` + single `Record`  
**Output:** `<DynamicDetailView>` component

**Features:**
- Renders each field value with appropriate formatter (dates, booleans, relations)
- Respects `showInDetail: true/false` per field
- Handles related entity display (foreign key → display name)

#### 1.4 Nav Generator (`src/engines/rendering/nav-generator/`)

**Input:** `AppMetadata` (all entities for an app)  
**Output:** Navigation items for `Sidebar.tsx`

**Features:**
- Auto-generates sidebar links for each entity
- Groups entities by category if metadata specifies
- Highlights active route

---

## 2. Configuration Engine (Metadata Engine)

**Location:** `src/engines/config/`  
**Layer:** Layer 4 — Configuration Engine  
**Purpose:** Defines, loads, validates, and provides the `AppMetadata` schema that drives all other engines.

### AppMetadata Schema Structure

```typescript
// Conceptual schema (actual Zod definition in src/engines/config/schema-types.ts)

interface AppMetadata {
  id: string;
  name: string;
  slug: string;
  version: string;
  entities: EntityDefinition[];
  theme?: ThemeConfig;
  i18n?: I18nConfig;
  permissions?: PermissionConfig;
}

interface EntityDefinition {
  id: string;
  name: string;          // "Product"
  pluralName: string;    // "Products"
  slug: string;          // "products"
  icon?: string;         // Icon name from Lucide
  fields: FieldDefinition[];
  permissions: EntityPermission;
  listConfig?: ListConfig;
  formConfig?: FormConfig;
}

interface FieldDefinition {
  id: string;
  name: string;           // "productName"
  label: string;          // "Product Name"
  type: FieldType;        // "text" | "number" | "select" | ...
  required: boolean;
  unique?: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  helpText?: string;
  options?: SelectOption[];     // For "select" type
  relation?: RelationConfig;    // For "relation" type
  validation?: ValidationRules;
  showInList?: boolean;
  showInDetail?: boolean;
  filterable?: boolean;
  sortable?: boolean;
}
```

### Metadata Loading Pipeline

```
1. Load from source (DB column, YAML file, or API)
        ↓
2. Parse: JSON.parse() or YAML.parse()
        ↓
3. Validate: Zod schema validation (throws on invalid metadata)
        ↓
4. Register: Store in EntityRegistry (in-memory Map)
        ↓
5. Serve: Rendering Engine reads from EntityRegistry
```

### Entity Registry (`src/engines/config/metadata-registry.ts`)

- Singleton Map: `entitySlug → EntityDefinition`
- Populated at app startup (or per-request for dynamic metadata)
- Provides `getEntity(slug)`, `getAllEntities()`, `hasEntity(slug)` methods

---

## 3. Runtime Engine (Backend)

**Location:** `src/engines/runtime/` (via `src/backend/`)  
**Layer:** Layer 3 — Backend Runtime Engine

The Runtime Engine standardizes how all API requests are handled:

### Request Processing Pipeline

```
Incoming HTTP Request
        ↓
1. Edge Middleware (session check, RBAC)
        ↓
2. Route Handler (src/app/api/.../route.ts)
        ↓
3. withAuth() wrapper — re-checks session server-side
        ↓
4. withValidation() wrapper — Zod validates request body
        ↓
5. Use Case function — pure business logic
        ↓
6. Repository call — DB access
        ↓
7. Response formation — standard JSON envelope
        ↓
Outgoing HTTP Response
```

### Standard API Response Envelope

```typescript
// Success
{ success: true, data: T, meta?: PaginationMeta }

// Error
{ success: false, error: { code: string, message: string, details?: unknown } }
```

### Result Pattern (`src/utils/result.ts`)

Use cases return a `Result<T, AppError>` type instead of throwing exceptions:

```typescript
type Result<T, E> = Ok<T> | Err<E>
// Ok<T>  = { ok: true;  value: T }
// Err<E> = { ok: false; error: E }
```

This makes error handling explicit and prevents silent failures.
