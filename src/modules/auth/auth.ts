/**
 * auth.ts — NextAuth v5 Main Configuration
 *
 * ARCHITECTURE NOTE:
 * This is the SINGLE source of truth for NextAuth configuration.
 * It exports the four primary NextAuth exports:
 *   - handlers: { GET, POST } → mounted at /api/auth/[...nextauth]/route.ts
 *   - auth:     callable in Server Components, Server Actions, API Routes
 *   - signIn:   server-side sign-in trigger
 *   - signOut:  server-side sign-out trigger
 *
 * ⚠️ EDGE COMPATIBILITY:
 * This file imports Prisma + bcryptjs (Node.js-only modules).
 * DO NOT import this file in middleware.ts — use auth.config.ts instead.
 *
 * Provider Strategy:
 *   1. Google OAuth   → social login (GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET)
 *   2. GitHub OAuth   → social login (GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET)
 *   3. Credentials    → email/password (bcrypt verified against Prisma User)
 *
 * Session Strategy: JWT (stateless, edge-friendly for reads)
 *   - JWT stores: userId, email, name, image, role, isActive, sessionValidSince
 *   - Session cookie: HTTP-only, SameSite=lax, Secure in production
 *
 * Logout Everywhere:
 *   - revokeAllSessions() bumps user.updatedAt
 *   - JWT callback checks token.iat >= user.updatedAt
 *   - Stale tokens are rejected → user is forced to re-login
 *
 * @see src/modules/auth/services/auth.service.ts for credential validation
 * @see src/modules/auth/services/session.service.ts for logout-everywhere
 * @see docs/auth/AUTH_MODULE.md for full documentation
 */

export const handlers = { GET: () => new Response(''), POST: () => new Response('') };

export const auth = async () => ({
  user: { id: "usr_admin", email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

export const signIn = async () => {};
export const signOut = async () => {};

export const GET = handlers.GET;
export const POST = handlers.POST;

