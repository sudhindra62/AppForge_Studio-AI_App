# ADR-004: Zod-Validated JSON Metadata Schema

**Status:** Accepted  
**Date:** 2026-05-29  
**Deciders:** Architecture Team

---

## Context

The core innovation of AppForge AI is metadata-driven UI generation. We need to define the format for this metadata.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| **JSON + Zod** | Widely understood, TypeScript-native validation | Verbose for complex schemas |
| **YAML + Zod** | Human-readable, supports comments | Requires YAML parser |
| **GraphQL SDL** | Self-documenting, typed | Overkill, separate ecosystem |
| **Custom DSL** | Tailored to our needs | High development cost, no tooling |
| **TypeScript objects** | Full type safety | Not portable/user-editable |

## Decision

**JSON schema with Zod validation.** YAML will be supported as an input format (parsed to JSON before Zod validation).

## Rationale

- **Zod** provides runtime validation with TypeScript type inference — single source of truth
- **JSON** is universally understood; easy to store in PostgreSQL JSONB column
- **YAML** support satisfies the human-readability requirement without sacrificing machine parseability
- TypeScript types are **inferred from Zod schema** (`z.infer<typeof EntityDefinitionSchema>`) — no duplication

## Consequences

- **Positive:** Type-safe metadata everywhere in the system; validation errors caught at startup not runtime
- **Negative:** Zod schemas can be verbose for deeply nested structures
- **Mitigation:** Compose small Zod schemas into larger ones; extensive use of `.extend()`, `.merge()`, `.pick()`
