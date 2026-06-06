# Dynamic API Reference

AppForge AI does not hardcode REST endpoints for user data. Instead, it uses the **Backend Runtime Engine** to expose universal endpoints that dynamically validate and route data based on the requested entity.

## The Universal Endpoint

All dynamic CRUD operations flow through a single Next.js Server Action or API route interface, conceptually functioning like:
`/api/engine/[entitySlug]`

### 1. Create Record (POST)

**Function**: `CRUDEngine.create(entitySlug, payload)`

- **Process**:
  1. Engine queries DB for the entity definition matching `entitySlug`.
  2. Engine builds a Zod schema based on the entity's fields.
  3. Payload is validated.
  4. If valid, a new `GeneratedRecord` is created with the payload stored in the `data` JSONB column.
  5. An `AuditLog` entry is automatically generated.

### 2. Read Records (GET)

**Function**: `CRUDEngine.findMany(entitySlug, filters)`

- **Process**:
  1. Engine verifies the user has `READ` access to the entity.
  2. Engine queries `GeneratedRecord` where `entityId` matches.
  3. Applies pagination, sorting, and JSONB filtering.

### 3. Update Record (PUT)

**Function**: `CRUDEngine.update(entitySlug, recordId, payload)`

- **Process**:
  1. Validates payload using the dynamic Zod schema (Partial validation).
  2. Updates the `data` JSONB column.
  3. Generates `UPDATE` AuditLog.

### 4. Delete Record (DELETE)

**Function**: `CRUDEngine.delete(entitySlug, recordId)`

- **Process**:
  1. Soft deletes the record (does not `DROP` data).
  2. Generates `DELETE` AuditLog.

## Error Handling

The API will return structured JSON errors when validation fails:
```json
{
  "success": false,
  "error": "VALIDATION_FAILED",
  "details": [
    { "field": "price", "message": "Expected number, received string" }
  ]
}
```
