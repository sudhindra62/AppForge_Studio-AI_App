# ADR-002: Repository Pattern Over Direct Prisma Access

**Status:** Accepted  
**Date:** 2026-05-29  
**Deciders:** Architecture Team

---

## Context

Prisma provides a type-safe database client. We must decide whether use cases and services access Prisma directly or through an abstraction layer.

## Decision

All database access will go through **Repository classes**. No use case, service, or component may import the Prisma client directly.

## Rationale

**Direct Prisma access problems:**
- Tight coupling: changing the DB schema or ORM requires changes across all files
- Untestable: cannot unit test use cases without a real database
- No central place to add cross-cutting concerns (logging, caching, soft-delete)

**Repository pattern benefits:**
- Use cases depend on an interface, not a concrete implementation
- Repositories can be mocked in unit tests
- Consistent query patterns (pagination, soft-delete, audit logging) in one place
- Easy to add caching layer (e.g., Redis) inside a repository without changing use cases

## Consequences

- **Positive:** Testable, decoupled, consistent data access
- **Negative:** Additional boilerplate layer
- **Mitigation:** `BaseRepository<T>` abstract class reduces per-repository boilerplate to override-only methods
