# Dynamic Rendering Engine Architecture

The Dynamic Rendering Engine is the core subsystem of AppForge AI responsible for translating raw metadata (`GeneratedEntity` and `GeneratedField` configurations) into live, interactive user interfaces.

## 📁 Directory Structure

```text
src/engines/rendering-engine/
├── components/          # The building blocks
│   ├── fields/          # Specific input implementations (TextField, NumberField, etc.)
│   ├── registry.ts      # Component Registry mapping DB types to React components
│   ├── DynamicField.tsx # The field loader
│   ├── ErrorBoundary.tsx# Graceful failure boundary
│   └── FallbackField.tsx# Rendered for unknown field types
├── views/               # Higher-level UI compositions
│   ├── DynamicForm.tsx  # Full form with react-hook-form state
│   ├── DynamicTable.tsx # Data grid view
│   ├── DashboardGrid.tsx# Widget layout engine
│   └── StatsWidget.tsx  # KPI widget
├── hooks/               # Logic and state management
│   └── useDynamicForm.ts# Dynamically builds Zod schemas & initializes form state
├── validators/          # Configuration schemas
│   └── field-config.validator.ts # Zod validators for parsing DB JSON config
├── types/               # Type safety bridging Prisma and React
│   └── engine.types.ts
└── index.ts             # Public module API
```

## 🧩 Key Patterns

### 1. Component Registry Pattern
`registry.ts` acts as a central dictionary. When the engine encounters a `FieldType` (e.g., `"TEXT"` or `"DATE"`), it looks up the mapped component in `COMPONENT_REGISTRY`.
- **Extensibility**: To support a new field type, simply build the component and add it to the registry. The rest of the system automatically supports it.
- **Graceful Failure**: If a type is unknown, `getComponentForField` returns the `FallbackField`, preventing crashes.

### 2. Dynamic Schema Construction
The `useDynamicForm` hook takes the DB metadata and dynamically builds a `zod` schema at runtime. This schema is passed directly to `@hookform/resolvers/zod` to enforce validation rules (min/max length, regex patterns, required flags) identically to hardcoded forms.

### 3. Graceful Failure & Error Boundaries
The `EngineErrorBoundary` wraps the dynamic form loader. If a badly configured field throws an error during render, the boundary catches it and displays a fallback UI, ensuring the entire page doesn't crash.

## 🛠️ Usage Example

```tsx
import { DynamicForm, type EngineEntity } from '@/engines/rendering-engine';

// This data usually comes from the database (GeneratedEntity)
const productEntity: EngineEntity = {
  id: 'ent_123',
  name: 'Product',
  pluralName: 'Products',
  slug: 'products',
  fields: [
    { id: 'f1', name: 'name', label: 'Name', type: 'TEXT', isRequired: true, isHiddenInForm: false, isHiddenInList: false, isReadOnly: false },
    { id: 'f2', name: 'price', label: 'Price', type: 'CURRENCY', isRequired: true, isHiddenInForm: false, isHiddenInList: false, isReadOnly: false }
  ]
};

export default function CreateProductPage() {
  const handleSubmit = async (data) => {
    // data is strongly typed and fully validated by Zod at this point
    await saveToDatabase(data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Create {productEntity.name}</h1>
      <DynamicForm 
        entity={productEntity} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
}
```
