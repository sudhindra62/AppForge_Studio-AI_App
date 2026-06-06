# Database Architecture & The EAV Pattern

AppForge AI uses PostgreSQL (via Prisma ORM) to manage both the structural metadata of the platform and the user-generated data.

## The Problem with Dynamic Databases
Typically, if a user wants to create a new "Table" called `Inventory`, a traditional system would execute `CREATE TABLE Inventory` against the live production database. 
**This is incredibly dangerous**. It leads to schema drift, locking issues, and deployment nightmares in Serverless environments.

## The Solution: JSONB EAV Pattern
We utilize an **Entity-Attribute-Value (EAV)** hybrid pattern backed by Postgres' powerful `JSONB` column type.

### 1. `GeneratedEntity` (The Schema)
Stores the definition of the table. (e.g., `name: "Inventory"`).

### 2. `GeneratedField` (The Columns)
Stores the definition of the columns. (e.g., `name: "price", type: "CURRENCY"`).

### 3. `GeneratedRecord` (The Data)
```prisma
model GeneratedRecord {
  id         String   @id @default(cuid())
  entityId   String
  data       Json     // <--- The Magic Happens Here
}
```
Instead of a real SQL table, the data is stored as a JSON object in the `data` column:
`{"price": 45.99, "productName": "Laptop"}`

### Why is this better?
1. **Zero Downtime**: Users can add or remove "columns" instantly without running heavy `ALTER TABLE` statements.
2. **Queryable**: Because it is `JSONB`, Postgres can natively index and query inside the JSON object using GIN indexes.

## Multi-Tenancy & Security
- Every `GeneratedRecord` belongs to an `Account` (Tenant).
- The `CRUDEngine` strictly enforces `WHERE accountId = currentUser.accountId` on every single database operation. It is impossible for Tenant A to query Tenant B's dynamic data.
