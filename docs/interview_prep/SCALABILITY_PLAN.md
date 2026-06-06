# Future Scalability Plan

If AppForge AI were to scale from 1,000 to 1,000,000 users, here is the architectural roadmap I would implement:

## 1. Database Read Replicas
Currently, all dynamic reads and writes hit the primary Neon Postgres instance.
**The Fix**: I would configure Prisma to use the `readReplicas` extension. All `CRUDEngine.findMany()` calls would be routed to a read-only replica, freeing up the primary database to exclusively handle high-throughput `POST` and `PUT` operations.

## 2. Redis Caching Layer (Upstash)
Dynamically fetching the `GeneratedEntity` metadata (the schema definitions) on every single API request adds 20-30ms of latency.
**The Fix**: I would integrate Upstash Redis. When an entity is updated, I would cache its JSON schema in Redis. The `CRUDEngine` would pull the schema from Redis in <1ms instead of hitting Postgres, drastically reducing DB load.

## 3. Dedicated Worker Tier for CSV Imports
While client-side chunking works beautifully for 50,000 rows, a 5,000,000 row CSV file would crash the browser's memory before PapaParse could even chunk it.
**The Fix**: I would introduce an AWS S3 bucket and an AWS SQS queue. The user uploads the raw file directly to S3. S3 triggers an event to SQS, which is processed by a dedicated, long-running Node.js worker instance that streams the file directly into Postgres using `COPY FROM`.
