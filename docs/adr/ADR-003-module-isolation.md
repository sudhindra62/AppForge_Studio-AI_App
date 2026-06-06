# ADR-003: Plug-and-Play Module Architecture

**Status:** Accepted  
**Date:** 2026-05-29  
**Deciders:** Architecture Team

---

## Context

AppForge AI has several optional capabilities: CSV Import, i18n, PWA, and Notifications. We must decide how to organize and toggle these capabilities.

## Decision

Each optional capability will be implemented as an **isolated module** in `src/modules/` implementing the `IAppModule` interface. Modules are toggled via feature flags.

## Rationale

**Alternative 1: Inline feature flags scattered throughout codebase**
- Problem: Feature flag checks (`if (featureX)`) scattered across dozens of files — hard to find, easy to miss
- Problem: Removing a feature requires hunting through the entire codebase

**Alternative 2: Separate packages (monorepo)**
- Problem: Overkill for an internship-scale project; adds Turborepo/workspace complexity

**Chosen: Module Pattern**
- All CSV code lives in `src/modules/csv/` — removing the module means deleting one folder
- Single `IAppModule.isEnabled()` check at the module registry level
- Module API is a well-defined contract — core never knows module internals

## Consequences

- **Positive:** Clean separation, easy to add/remove modules, single toggle point
- **Negative:** Requires discipline to not let modules import from each other
- **Rule:** Modules may only depend on `src/shared/`, `src/types/`, and `src/utils/`. Never on other modules or features.
