# LedgerBox

LedgerBox is a private collection site for coins first and bonds later. The MVP focuses on a shared authenticated coin collection built with Next.js App Router, Supabase, and Vercel.

Current implementation status: the repository now contains the agreed project scaffold and architecture boundaries for the MVP under `src/`. Application logic has not been added yet.

## Technology

- Next.js App Router
- TypeScript
- Supabase Postgres, Auth, Storage
- Supabase CLI for local stack and migrations
- Vitest for integration tests
- GitHub Actions for CI/CD and backups
- Vercel for hosting

## Architecture

- The project uses a vertical-slice structure aligned with database domains
- `coins` is the main MVP domain
- `bonds` is planned for later as a separate domain
- `public.profiles` is the shared allow-list for access
- `src/app/` handles routes and layout composition
- `src/features/` holds domain logic
- `src/shared/` holds only explicit shared primitives
- `src/app/(app)/dashboard` is a composition route, not a separate business domain
- The scaffold already includes `src/app/`, `src/features/`, `src/shared/`, `supabase/`, and `tests/` directories with the planned boundaries

See:
- [docs/roadmap.md](docs/roadmap.md)
- [plan/mvp/00-architecture-and-structure.md](plan/mvp/00-architecture-and-structure.md)
- [docs/adr/0001-use-src-application-root.md](docs/adr/0001-use-src-application-root.md)
- [skills/project-rules/SKILL.md](skills/project-rules/SKILL.md)

## Key decisions

- No public access in MVP
- No self-signup
- No `owner_id` in domain tables because the collection is shared
- Database changes are made only through Supabase migrations in version control
- Credentials must never be committed; use `.env.local` locally and secret storage in hosted environments
- Tests are added during each implementation step, not postponed until the end

## Local run

1. Install Node.js, Docker Desktop, and Supabase CLI.
2. Copy `.env.example` into `.env.local` and fill in your own values.
3. Review the scaffold in `src/app/`, `src/features/`, `src/shared/`, `supabase/`, and `tests/`.
4. Start the local Supabase stack with `supabase start` once the database step is implemented.
5. Install project dependencies and run the Next.js app in the next implementation steps when the application scaffold is added.

## Planning flow

- MVP execution lives in [plan/mvp](plan/mvp)
- Future work can be split into separate folders under `plan/{feature}`
- Work proceeds one plan step at a time with dependency order respected

## Owner actions

The project owner must create the real Supabase/Vercel/GitHub configuration and provide secrets manually. See [plan/mvp/11-owner-action-plan.md](plan/mvp/11-owner-action-plan.md).
