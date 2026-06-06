# System Design & Architecture

AppForge AI relies on a modern, decoupled engine architecture built entirely within the Next.js App Router paradigm. This prevents "spaghetti code" and ensures massive scalability.

## 1. The Rendering Engine (`src/engines/rendering-engine`)

**Responsibility:** Convert JSON metadata into live UI components.

- **Component Registry**: Instead of hardcoding React components, the engine uses a dynamic `FieldRegistry`. When it encounters a field of type `TEXT`, it looks up the registry and dynamically injects the `TextField` component.
- **Why?**: This allows Super Admins to invent new data types (e.g. `LOCATION_PICKER`) without altering the core codebase.

## 2. The Backend Runtime Engine (`src/engines/backend-runtime`)

**Responsibility:** Provide RESTful CRUD APIs for dynamically generated entities.

- **Dynamic Validation (`buildDynamicSchema`)**: When a user submits a POST request to create a new `Product` (a dynamically generated entity), the engine pulls the `Product` definition from the DB. It then constructs a strict `Zod` validation schema on the fly before accepting the payload.
- **Error Boundaries**: If validation fails, it throws specialized `EngineError` objects which are intercepted by Next.js Server Actions and returned cleanly to the UI.

## 3. CSV Import Module (`src/modules/csv-import`)

**Responsibility:** Bulk data ingestion designed for Serverless constraints.

- **The Problem**: Vercel kills any API request that takes longer than 10-60 seconds. A 50,000 row CSV parse + insert will always timeout.
- **The Solution**: **Client-Side Chunking**. `PapaParse` reads the file in the browser. The browser sends the data to the server in chunks of 100 rows. This keeps server memory low and entirely bypasses the Vercel timeout limits.

## 4. Progressive Web App (PWA) Module (`src/modules/pwa`)

**Responsibility:** Offline capabilities and Background Sync.

- Instead of just caching static HTML, AppForge implements an `IndexedDB` sync queue.
- If a user loses connection and submits data, the payload is serialized and stored locally.
- A custom `useOfflineSync` hook listens for the `online` window event and silently replays the queued HTTP payloads in the background.
