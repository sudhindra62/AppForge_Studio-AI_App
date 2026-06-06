# Interview Explanation Notes

Use these talking points during your internship presentation or technical interviews to demonstrate Senior-level architectural understanding.

## 1. "How does the Dynamic Database work?"
**Your Explanation:**
> "I avoided executing dynamic `CREATE TABLE` DDL statements because they are dangerous in production, cause schema drift, and break easily in Serverless environments. Instead, I implemented an **Entity-Attribute-Value (EAV)** pattern backed by Postgres `JSONB`. The metadata schema is stored in strict relational tables (`GeneratedEntity`, `GeneratedField`), but the actual user data is stored as a `JSONB` payload in `GeneratedRecord`. This provides NoSQL-like flexibility while maintaining ACID compliance and relation integrity."

## 2. "How did you handle Validation if the schemas are dynamic?"
**Your Explanation:**
> "Since the data types aren't strictly enforced by SQL columns, I had to build a strong application-layer barrier. I built a `Validation Engine` that hooks into the backend CRUD factory. Whenever a POST request arrives, the engine dynamically constructs a strict `Zod` validation schema at runtime by reading the `GeneratedField` metadata. If a user tries to pass a string into a Number field, my engine throws a typed Error before it ever reaches the database."

## 3. "How did you solve the CSV Import Timeout issue?"
**Your Explanation:**
> "I knew that Serverless functions (like Vercel API routes) timeout after 10-60 seconds. Parsing a 50,000-row CSV on the server would crash the app. To solve this, I designed a **Client-Side Chunking Architecture**. I used `PapaParse` to parse the file inside the user's browser, sliced the data into batches of 100 rows, and sequentially POSTed those chunks to a Next.js Server Action. The user gets a smooth progress bar, and the server never times out."

## 4. "Tell me about the PWA Offline functionality."
**Your Explanation:**
> "Most PWAs just cache read-only static HTML, but I wanted users to be able to *create* data offline. I built a custom Service Worker that intercepts API POST requests when `navigator.onLine` is false. Instead of failing, the payload is serialized and written to the browser's `IndexedDB`. I wrote a React Hook (`useOfflineSync`) that listens for the network to reconnect, at which point it silently flushes the IndexedDB queue and syncs the data to the cloud."
