# ADR-001: Use Next.js 15 App Router (Over Pages Router)

**Status:** Accepted  
**Date:** 2026-05-29  
**Deciders:** Architecture Team

---

## Context

Next.js offers two routing systems: the legacy **Pages Router** (`pages/`) and the modern **App Router** (`app/`), introduced in Next.js 13 and stabilized in 14/15.

## Decision

We will use the **App Router** exclusively.

## Rationale

| Capability | Pages Router | App Router |
|---|---|---|
| React Server Components | ❌ | ✅ |
| Streaming SSR | ❌ | ✅ |
| Nested Layouts | Limited | ✅ Full support |
| Server Actions | ❌ | ✅ |
| Route Groups | ❌ | ✅ |
| Parallel Routes | ❌ | ✅ |
| Future-proof | Maintenance mode | Active development |

The App Router reduces client-side JavaScript bundle size significantly through RSC, which is critical for the Rendering Engine's performance (generating complex UIs server-side).

## Consequences

- **Positive:** Smaller client bundles, streaming, better data fetching patterns
- **Negative:** Steeper learning curve for developers unfamiliar with RSC; some third-party libraries may not be fully RSC-compatible
- **Mitigation:** Maintain strict convention: Client Components only when interactive. Document patterns in CONTRIBUTING.md.
