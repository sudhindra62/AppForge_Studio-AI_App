# AppForge AI — Authentication & RBAC Design

---

## 1. Authentication Provider: NextAuth.js v5

### Configured Providers

| Provider | Use Case |
|---|---|
| Credentials | Email + password (hashed with bcrypt) |
| Google OAuth | Social login |
| GitHub OAuth | Developer social login |

### Session Strategy
- **JWT-based sessions** — No server-side session store required (serverless-compatible)
- Token stored in an HTTP-only `__Secure-next-auth.session-token` cookie (SameSite=Lax)
- Refresh: silent token rotation on each request

### NextAuth Configuration Location
- Config: `src/features/auth/services/auth.service.ts`
- Route handler: `src/app/api/auth/[...nextauth]/route.ts`
- Session type augmentation: `src/types/next-auth.d.ts`

---

## 2. Auth Flow Diagrams

### Credentials Login Flow
```
User submits email + password
         ↓
NextAuth Credentials Provider
         ↓
Hash comparison (bcrypt.compare)
         ↓
✗ Invalid → Return null → 401 response
✓ Valid   → Return User object
         ↓
JWT created → session cookie set
         ↓
Redirect to /dashboard
```

### OAuth Flow (Google/GitHub)
```
User clicks "Sign in with Google"
         ↓
Redirect to Google OAuth consent screen
         ↓
Google → callback to /api/auth/callback/google
         ↓
NextAuth: create or find User + Account in DB
         ↓
JWT created → session cookie set
         ↓
Redirect to /dashboard
```

---

## 3. Role-Based Access Control (RBAC)

### Roles

| Role | Description |
|---|---|
| `USER` | Standard user — can manage their own applications |
| `ADMIN` | Can manage all applications + user management |
| `SUPER_ADMIN` | Full system access, including system config |

### Permission Matrix

| Action | USER | ADMIN | SUPER_ADMIN |
|---|---|---|---|
| Create application | ✅ | ✅ | ✅ |
| Read own applications | ✅ | ✅ | ✅ |
| Read all applications | ❌ | ✅ | ✅ |
| Delete own application | ✅ | ✅ | ✅ |
| Delete any application | ❌ | ✅ | ✅ |
| Manage users | ❌ | ✅ | ✅ |
| Access system config | ❌ | ❌ | ✅ |
| Import CSV | ✅ | ✅ | ✅ |

### RBAC Enforcement Layers

1. **Edge Middleware** (`middleware.ts`): Redirects unauthenticated requests to `/login`. Checks role for protected route prefixes.
2. **API Route Middleware** (`src/backend/middleware/with-rbac.ts`): Re-validates role on each API call (defense in depth — middleware can be bypassed).
3. **UI Layer** (`usePermissions.ts` hook): Hides/disables UI elements the user cannot access (UX only — not a security boundary).

---

## 4. Middleware Configuration

```typescript
// middleware.ts (conceptual)
export const config = {
  matcher: [
    '/dashboard/:path*',    // Requires authentication
    '/api/:path*',          // Requires authentication (except /api/health)
  ],
};

// Logic:
// 1. Check for valid session token
// 2. If no session → redirect to /login (or return 401 for API routes)
// 3. If session exists → check role for admin routes
// 4. Continue to route handler
```

---

## 5. Entity-Level Permissions

Entity definitions include their own permission config:

```json
{
  "permissions": {
    "create": ["USER", "ADMIN"],
    "read":   ["USER", "ADMIN"],
    "update": ["USER", "ADMIN"],
    "delete": ["ADMIN"]
  }
}
```

The Runtime Engine enforces these at the API route level — uses the entity's permission config + the user's role to allow/deny operations.

---

## 6. Security Headers (next.config.ts)

```typescript
// Security headers applied to all responses
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; ...",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}
```
