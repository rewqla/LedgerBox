# ADR 0001: Use `src/` as the application code root

## Status
Accepted

## Date
2026-08-14

## Context

LedgerBox uses Next.js App Router with a vertical-slice structure aligned to business domains. The initial architecture decision established these layers:

- `app/` for routes and route-level composition
- `features/` for domain slices
- `shared/` for explicit shared primitives

After reviewing the scaffold, we decided the repository root should stay focused on planning, documentation, Supabase infrastructure, and project configuration. Keeping application code in the root would work, but it makes the repository feel flatter and less clearly separated from non-application assets.

## Decision

All application code lives under `src/`.

The canonical structure is:

```text
src/
  app/
  features/
  shared/
```

This keeps the existing vertical-slice architecture intact while making the repository easier to scan and closer to the structure many teams expect in a growing Next.js codebase.

## Consequences

Positive:

- The repository root stays cleaner and easier to navigate
- Application code is clearly separated from `docs/`, `plan/`, `skills/`, `supabase/`, and future config files
- We preserve the chosen domain-first structure without introducing a `frontend/` and `backend/` split that does not fit the Next.js App Router model

Trade-offs:

- Documentation and planning files must consistently refer to `src/app`, `src/features`, and `src/shared`
- New contributors must understand that backend-capable Next.js code still lives inside the same `src/` tree rather than in a separate server package

## Rejected alternatives

- Keep `app/`, `features/`, and `shared/` in the repository root
- Split the MVP into top-level `frontend/` and `backend/` folders
