# Tradeoffs & Edge Cases Handled

During an architectural review, Senior Engineers want to know what you *sacrificed* to get your benefits. Discuss these openly.

## Tradeoff 1: JSONB EAV vs. Dynamic DDL Tables
- **What I Chose**: JSONB EAV (`GeneratedRecord.data`).
- **The Benefit**: Total flexibility. Users can add/remove fields instantly with zero database migrations or downtime. It's perfectly safe in a serverless Vercel environment.
- **The Tradeoff**: Query performance at extreme scale. Querying deep inside a JSON object (`data->>'price'`) is slower than querying a native SQL column.
- **How I Mitigated It**: I would use Postgres `GIN` (Generalized Inverted Index) indexes on the JSONB column to ensure lookup speeds remain fast up to millions of rows.

## Tradeoff 2: Client-Side Chunking vs. Background Workers (Redis/Celery)
- **What I Chose**: Client-side chunking for CSV uploads.
- **The Benefit**: Zero infrastructure overhead. I didn't have to deploy a separate Redis instance or a long-running Python/Node worker server.
- **The Tradeoff**: If the user closes their browser tab mid-upload, the job is aborted.
- **How I Mitigated It**: I implemented "Partial Success". If the browser is closed at 50%, the first 50% is successfully committed to the DB, and the job status remains `PENDING`/`PARTIAL`. The user doesn't lose the data that already made it across.

## Edge Cases Successfully Handled

1. **The "String in a Number Field" Edge Case**: Handled flawlessly by the dynamic `Zod` validation engine.
2. **The "Offline Form Submit" Edge Case**: Handled by the PWA IndexedDB sync queue. The data is safely queued locally until the internet returns.
3. **The "Cross-Tenant Data Leak" Edge Case**: Handled at the Prisma query level. Every single CRUD Engine function has a hardcoded `where: { accountId: session.user.accountId }` clause injected. It is physically impossible for the dynamic API to fetch another tenant's data.
