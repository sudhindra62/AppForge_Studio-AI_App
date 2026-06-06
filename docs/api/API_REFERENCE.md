# AppForge AI — API Reference

---

## Conventions

- **Base URL:** `https://appforge.vercel.app/api` (production) / `http://localhost:3000/api` (dev)
- **Authentication:** All endpoints (except `/health`) require a valid session cookie (NextAuth)
- **Content-Type:** `application/json`
- **Response Envelope:**
  - Success: `{ "success": true, "data": <T>, "meta": <PaginationMeta> }`
  - Error: `{ "success": false, "error": { "code": "<ErrorCode>", "message": "<string>", "details": <optional> } }`

---

## Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Valid session, insufficient role |
| `NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 422 | Request body failed Zod validation |
| `CONFLICT` | 409 | Unique constraint violation |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Health

### GET /api/health
Returns server health status. No authentication required.

**Response:**
```json
{ "success": true, "data": { "status": "ok", "timestamp": "2026-05-29T..." } }
```

---

## Applications

### GET /api/applications
List all applications owned by the authenticated user.

**Query Params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | string | — | Filter by status (`ACTIVE`, `ARCHIVED`, `DRAFT`) |

**Response:**
```json
{
  "success": true,
  "data": [ { "id": "...", "name": "...", "slug": "...", "status": "ACTIVE", ... } ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### POST /api/applications
Create a new application.

**Body:**
```json
{
  "name": "My CRM",
  "slug": "my-crm",
  "description": "Customer relationship management app"
}
```

**Response:** `201 Created` with created `Application` object.

---

### GET /api/applications/:appId
Get a single application by ID.

---

### PUT /api/applications/:appId
Update application details or metadata.

**Body:** Partial `Application` fields.

---

### DELETE /api/applications/:appId
Soft-delete an application (sets status to `ARCHIVED`).

---

## Entity Definitions

### GET /api/applications/:appId/entities
List all entity definitions for an application.

---

### POST /api/applications/:appId/entities
Create a new entity definition.

**Body:**
```json
{
  "name": "Product",
  "pluralName": "Products",
  "slug": "products",
  "fieldDefinitions": [
    { "name": "productName", "label": "Product Name", "type": "text", "required": true },
    { "name": "price", "label": "Price", "type": "number", "required": true }
  ],
  "permissions": { "create": ["USER"], "read": ["USER"], "update": ["USER"], "delete": ["ADMIN"] }
}
```

---

### GET /api/applications/:appId/entities/:entityId
Get a single entity definition.

---

### PUT /api/applications/:appId/entities/:entityId
Update an entity definition (add fields, change permissions, etc.).

---

### DELETE /api/applications/:appId/entities/:entityId
Delete an entity definition.

---

## CSV Import

### POST /api/import
Initiate a new CSV import job.

**Body:** `multipart/form-data`
```
file: <CSV file>
applicationId: <string>
entitySlug: <string>
columnMapping: <JSON string> // { "csvColumn": "entityField" }
```

**Response:**
```json
{
  "success": true,
  "data": { "jobId": "...", "status": "PENDING", "totalRows": 150 }
}
```

---

### GET /api/import/:jobId
Get import job status (supports SSE for real-time progress).

**Headers:**
- For real-time: `Accept: text/event-stream`
- For single status: `Accept: application/json`

**SSE Events:**
```
event: progress
data: { "processedRows": 50, "totalRows": 150, "status": "PROCESSING" }

event: complete
data: { "successRows": 148, "errorRows": 2, "status": "COMPLETED" }
```

---

## Notifications

### GET /api/notifications
List notifications for the current user.

**Query Params:** `page`, `limit`, `isRead` (boolean filter)

---

### PATCH /api/notifications/:id/read
Mark a notification as read.

---

### POST /api/notifications/subscribe
Register a push notification subscription.

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "p256dh": "...",
  "auth": "..."
}
```

---

### DELETE /api/notifications/subscribe
Unregister push notification subscription.
