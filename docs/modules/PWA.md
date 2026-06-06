# Progressive Web App (PWA) Module

The **PWA Module** (`src/modules/pwa`) turns AppForge into an installable, offline-capable application.

## 🏗 Architecture

We intentionally avoided heavy third-party plugins (like `next-pwa`) in favor of a specialized vanilla implementation. This provides ultimate control over our complex dynamic sync requirements.

### 1. Service Worker & Caching (`public/sw.js`)
The custom Service Worker is compiled and placed in the `public` directory.
- **Static Assets (Next.js Chunks)**: Uses a Cache-First strategy to ensure the UI loads instantly even on a flight.
- **Navigations**: Uses Stale-While-Revalidate to keep the HTML shell fresh while returning immediate cached responses.

### 2. The Offline Sync Queue (`sync-queue.ts`)
When building dynamic forms in AppForge, a standard PWA caching strategy isn't enough to handle data submission while offline.
1. When a user submits a form (e.g. creating a new generated record), the frontend checks `navigator.onLine`.
2. If offline, instead of calling the API, it calls `enqueueSyncPayload()`.
3. The HTTP payload (method, headers, body, URL) is stringified and saved to **IndexedDB**.
4. The `OfflineIndicator.tsx` UI shows "1 action pending sync".

### 3. Background Sync & Reconnection (`useOfflineSync.ts`)
The `useOfflineSync` hook acts as a background processor on the client side.
When it detects the `online` event firing on the `window` object:
1. It reads all payloads from `IndexedDB`.
2. It sequentially replays the exact HTTP requests against the backend APIs.
3. If a request succeeds (or fails permanently with a 400 Bad Request due to validation), it is removed from the queue.
4. The `OfflineIndicator` spins green and reports "All actions synced successfully."
