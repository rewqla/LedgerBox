# LedgerBox

LedgerBox is a private collection site for coins first and bonds later. The MVP focuses on a shared authenticated coin collection built with Next.js App Router, Supabase, and Vercel.

Current implementation status: the repository now contains the agreed project scaffold under `src/`, the initial Supabase database architecture, a working Supabase SSR authentication layer, the protected app shell, the coin collection browse/search/detail surface, and the first CRUD/category/photo management flow for coins.

## Technology

- Next.js App Router
- TypeScript
- Supabase SSR helpers for cookie-based server auth
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
- Supabase schema state is versioned in `supabase/migrations/`, with local seeds in `supabase/seed.sql`
- Access control is based on `public.profiles`; domain tables stay shared and do not use `owner_id`
- Route protection is enforced twice: in `proxy.ts` for request-time redirects and in `src/app/(app)/layout.tsx` for server-rendered protected surfaces
- The protected shell keeps the sidebar layout mounted across App Router navigations, with `Дашборд` as a top-level route and `Монети` expanded into `Колекція` and `Бажанки`
- Coin collection search and filter logic stays inside `src/features/coins/collection` and is not promoted into a cross-domain shared helper
- Coin CRUD, category management, and photo import/upload logic are split across `src/features/coins/collection`, `src/features/coins/categories`, and `src/features/coins/photos`

See:
- [docs/roadmap.md](docs/roadmap.md)
- [plan/mvp/00-architecture-and-structure.md](plan/mvp/00-architecture-and-structure.md)
- [plan/mvp/01-db-architecture-and-migrations.md](plan/mvp/01-db-architecture-and-migrations.md)
- [plan/mvp/02-auth-and-access-control.md](plan/mvp/02-auth-and-access-control.md)
- [plan/mvp/03-app-shell-and-navigation.md](plan/mvp/03-app-shell-and-navigation.md)
- [plan/mvp/04-coins-browse-search-and-details.md](plan/mvp/04-coins-browse-search-and-details.md)
- [plan/mvp/05-coins-crud-categories-and-photos.md](plan/mvp/05-coins-crud-categories-and-photos.md)
- [docs/adr/0001-use-src-application-root.md](docs/adr/0001-use-src-application-root.md)
- [docs/bootstrap-first-user.md](docs/bootstrap-first-user.md)
- [skills/project-rules/SKILL.md](skills/project-rules/SKILL.md)

## Key decisions

- No public access in MVP
- No self-signup
- No `owner_id` in domain tables because the collection is shared
- Database changes are made only through Supabase migrations in version control
- The first owner account is bootstrapped separately after migrations; it is never hard-coded in SQL
- Password storage and hashing are fully delegated to Supabase Auth; the app and migrations never handle raw password persistence
- Credentials must never be committed; use `.env.local` locally and secret storage in hosted environments
- Tests are added during each implementation step, not postponed until the end

## Local run

1. Install Node.js, Docker Desktop, and Supabase CLI.
2. Copy `.env.example` into `.env.local` and fill in your own values.
3. Run `npm install` to install Next.js, Supabase SSR, and the test dependencies.
4. Review the scaffold in `src/app/`, `src/features/`, `src/shared/`, `supabase/`, and `tests/`.
5. Start the local Supabase stack with `supabase start`.
6. Bootstrap the first allowed user using [docs/bootstrap-first-user.md](docs/bootstrap-first-user.md).
7. Run `npm run test:integration` to verify the current database and auth logic.
8. Start the app with `npm run dev` and open the login screen locally.
9. Optionally run `npm run build` to verify the production App Router build.

## Database

- `supabase/config.toml` defines the local Supabase stack, enables seeds, and disables self-signup locally to match MVP rules
- `supabase/migrations/20260814093000_init_db_architecture.sql` creates the `coins` and `bonds` schemas, core tables, constraints, RLS, and the private `coin-photos` bucket metadata
- `supabase/seed.sql` inserts the initial categories `українська` and `закордонна`
- `.github/workflows/database-checks.yml` starts Supabase locally in CI and runs the database integration tests on pull requests
- `.github/workflows/deploy-supabase-migrations.yml` links the remote Supabase project and applies migrations automatically on pushes to `main`

## Authentication

- `src/features/auth/server/actions.ts` provides email+password login and logout server actions
- `src/shared/auth/access.ts` resolves auth state and membership through `public.profiles`
- `proxy.ts` redirects anonymous users to `/login`, users without membership to `/forbidden`, and signed-in members into `/dashboard`
- `src/app/(auth)/login/page.tsx` and `src/app/(auth)/forbidden/page.tsx` cover the allowed entry states for non-app routes
- `src/app/(app)/layout.tsx` protects server-rendered app routes even if the proxy layer is bypassed

## App Shell

- `src/shared/ui/theme.css` defines the current UI token layer for accent blue, amber badges, neutral structure colors, and serif/sans typography roles
- `src/shared/ui/navigation.ts` contains the canonical sidebar navigation model and active-state helpers
- `src/shared/ui/sidebar-nav.tsx` renders the expandable domain navigation with the muted `ОВДП` placeholder marked `скоро`
- `src/app/(app)/coins/collection/page.tsx` and `src/app/(app)/coins/wishlist/page.tsx` are the current domain entry routes for the `Монети` section

## Coin Collection

- `src/features/coins/collection/server/queries.ts` reads the collection list, filter options, and detail cards directly from the `coins` schema
- `src/features/coins/collection/server/filters.ts` owns collection-specific search/filter normalization and view-mode helpers
- `src/app/(app)/coins/collection/page.tsx` provides search by name, filters by year/category/precious status, and two browse modes: cards and table
- `src/features/coins/collection/ui/collection-browser.tsx` persists the selected view mode in `localStorage`
- `src/app/(app)/coins/collection/[coinId]/page.tsx` renders the detail card with all current fields and exactly two separate photo slots: obverse and reverse

## Coin CRUD And Photos

- `src/app/(app)/coins/collection/new/page.tsx` and `src/app/(app)/coins/collection/[coinId]/edit/page.tsx` provide create/edit flows for all current MVP coin fields
- `src/features/coins/collection/server/actions.ts` handles create, update, and delete plus photo-slot synchronization and route revalidation
- `src/app/(app)/coins/collection/categories/page.tsx` provides category create/rename management without hard-coding future values
- `src/features/coins/photos/client/process-local-photo.ts` performs client-side local image processing to WebP ≤ 1 MB before submit
- `src/features/coins/photos/server/import.ts` and `src/app/api/coins/photos/import/route.ts` implement secure backend URL import with validation and server-side image normalization via `sharp`
- Storage cleanup for replaced/deleted photos is handled in `src/features/coins/photos/server/storage.ts`

## Planning flow

- MVP execution lives in [plan/mvp](plan/mvp)
- Future work can be split into separate folders under `plan/{feature}`
- Work proceeds one plan step at a time with dependency order respected

## Owner actions

The project owner must create the real Supabase/Vercel/GitHub configuration and provide secrets manually. See [plan/mvp/11-owner-action-plan.md](plan/mvp/11-owner-action-plan.md).
