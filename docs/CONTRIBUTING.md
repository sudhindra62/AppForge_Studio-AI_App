# Contributing to AppForge AI

Welcome! This guide covers the development workflow, code conventions, and branching strategy.

---

## Development Setup

```bash
# Prerequisites: Node.js 20+, npm 10+, PostgreSQL (or Neon account)

git clone https://github.com/your-org/appforge-ai.git
cd appforge-ai
npm install
cp .env.example .env.local
# Edit .env.local with your values
npx prisma migrate dev
npx prisma db seed
npm run dev
```

---

## Branching Strategy

```
main          → Production-ready code. Protected branch.
dev           → Integration branch. All PRs merge here first.
feature/*     → New features (e.g., feature/csv-import-progress)
fix/*         → Bug fixes (e.g., fix/form-validation-error)
refactor/*    → Code refactoring
docs/*        → Documentation changes only
```

**PR Rule:** All PRs require 1 code review approval + passing CI before merge to `dev`.

---

## Commit Convention (Conventional Commits)

```
feat(csv): add column mapping step to import wizard
fix(auth): correct session expiry on OAuth callback
docs(api): add notification endpoint examples
refactor(rendering): extract FieldRenderer into separate file
test(entities): add unit tests for entity service
chore(deps): upgrade next to 15.2.0
```

Format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`

---

## Code Conventions

### TypeScript
- **Strict mode** enabled — no `any`, no implicit `undefined`
- Prefer `interface` over `type` for object shapes
- Use `z.infer<typeof Schema>` for Zod-derived types
- Use the `Result<T, E>` pattern in use cases — no thrown exceptions in business logic

### File Naming
- Components: `PascalCase.tsx` (e.g., `DynamicForm.tsx`)
- Utilities/services: `kebab-case.ts` (e.g., `csv-parser.ts`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useCSVImport.ts`)
- Types: `kebab-case.types.ts` (e.g., `csv.types.ts`)

### Import Order (enforced by ESLint)
1. React / Next.js core
2. External packages
3. Internal absolute imports (`@/...`)
4. Relative imports (`./...`)
5. Type imports (`import type { ... }`)

### Path Aliases (`tsconfig.json`)
```json
{
  "@/*": ["./src/*"],
  "@/ui/*": ["./src/components/ui/*"],
  "@/config": ["./src/config/index.ts"]
}
```

---

## Layer Boundary Rules (ENFORCED)

| From | To | Allowed? |
|---|---|---|
| Component | Repository | ❌ NEVER |
| Component | Use Case | ❌ NEVER |
| Component | Service | ✅ (via Server Action or API route) |
| API Route | Repository | ❌ Prefer Use Case |
| API Route | Use Case | ✅ |
| Use Case | Repository | ✅ |
| Use Case | Service | ✅ |
| Service | Repository | ❌ Avoid |
| Any Server Layer | `process.env` directly | ❌ Use `env.ts` |

---

## Available npm Scripts

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run type-check   # TypeScript type check (no emit)
npm run format       # Prettier format
npm run test         # Run Jest unit tests
npm run test:e2e     # Run Playwright E2E tests

# Database
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed the database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset + re-migrate + re-seed (dev only)
```

---

## Adding a New Module

1. Create `src/modules/[module-name]/` with: `index.ts`, `README.md`, `components/`, `services/`, `hooks/`, `types/`
2. Implement `IAppModule` interface in `index.ts`
3. Add feature flag to `src/config/feature-flags.ts`
4. Register module in `src/modules/index.ts`
5. Document the module in `docs/modules/MODULES.md`

---

## Adding a New Entity Feature

1. Add feature slice to `src/features/[feature-name]/`
2. Create repository in `src/database/repositories/`
3. Add Prisma model to `prisma/schema.prisma`
4. Create use cases in `src/backend/use-cases/[feature]/`
5. Add validators in `src/backend/validators/`
6. Create API routes in `src/app/api/[feature]/`
7. Add pages in `src/app/(dashboard)/[feature]/`
