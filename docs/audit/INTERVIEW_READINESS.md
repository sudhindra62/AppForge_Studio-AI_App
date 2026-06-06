# Interview Readiness Report: Top 10 Questions

If you face a harsh technical interviewer, use these ideal answers to prove your Senior-level understanding of the architecture you built.

### 1. Why this architecture?
"I chose a decoupled Engine Architecture because a monolithic approach to dynamic data inevitably turns into spaghetti code. By isolating the `Rendering Engine` from the `Backend Runtime`, I ensure that the UI simply consumes JSON configuration and doesn't care how the database works. This separation of concerns makes testing and scaling exponentially easier."

### 2. Why this database design?
"Instead of executing dynamic `CREATE TABLE` DDL queries—which are dangerous, cause schema drift, and perform poorly in Serverless environments—I used the JSONB EAV (Entity-Attribute-Value) pattern. The metadata is stored relationally, but the user data sits in a highly flexible, queryable JSONB column, providing NoSQL flexibility with ACID compliance."

### 3. Why this rendering engine?
"I used a Component Registry pattern. Instead of massive `switch` statements, the engine dynamically looks up the correct React Component (e.g. `TextField`, `NumberField`) based on the metadata. This means I can add new field types in the future without touching the core rendering logic."

### 4. Why this runtime?
"Next.js Server Actions provided the perfect runtime because they eliminate the need for manually writing boilerplate API routes and `fetch()` calls. However, because they are essentially open endpoints, I built a Dynamic Validation Engine wrapper that dynamically compiles `Zod` schemas to strictly validate inputs before they hit the database."

### 5. Why Prisma?
"Prisma provides incredible type safety and migration tracking. But more importantly for this project, its native support for PostgreSQL JSONB typing allowed me to interact with my dynamic EAV data payloads securely without writing raw, injection-prone SQL strings."

### 6. Why Next.js?
"Next.js 15 App Router allowed me to colocate my frontend and backend seamlessly. Features like Server Components were crucial for my i18n dynamic dictionary loading, ensuring users don't download unneeded languages to their browser. It also handled my dynamic API routes effortlessly."

### 7. What are the tradeoffs?
"The biggest tradeoff of the JSONB EAV pattern is query speed. Native SQL columns are faster for complex `JOINs` and filtering than JSON object traversal. However, by leveraging Postgres GIN indexes on the JSONB column, I mitigated the read latency significantly while keeping the massive benefit of zero-downtime schema changes."

### 8. What edge cases are handled?
"A major edge case is CSV Imports timing out on Vercel (which kills requests after 10s). I handled this by moving the parsing to the client using `PapaParse` and chunking the uploads in batches of 100. Another edge case is offline data submission, which I handled using a custom PWA Service Worker and IndexedDB background sync queue."

### 9. How does the system recover from invalid configs?
"If a Super Admin configures a field type that doesn't exist in the Component Registry, the Rendering Engine doesn't crash the whole page. It catches the error in a React `ErrorBoundary` and renders a fallback `UnknownComponent` block, allowing the rest of the application to continue functioning."

### 10. How does the system scale?
"Right now, it scales perfectly horizontally via Vercel Edge functions. The bottleneck will eventually be database reads when dynamically fetching Entity schemas. My next step to scale to 10k users would be introducing Upstash Redis to cache the metadata definitions, skipping the DB trip entirely for the API runtime."
