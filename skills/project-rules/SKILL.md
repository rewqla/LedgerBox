---
name: project-rules
description: Repository rules for LedgerBox implementation. Use this skill before doing implementation work so changes follow the agreed roadmap, active plan order, architecture boundaries, testing rules, and infrastructure constraints.
---

# LedgerBox project rules

This repository follows the roadmap in [../../docs/roadmap.md](../../docs/roadmap.md) and the planning files under `plan/`. The current implementation track is [../../plan/mvp](../../plan/mvp), but future work may live in other folders such as `plan/{feature}`. Before writing or changing code, read the active step file completely and follow its dependencies.

## Architecture rules

- The codebase uses `src/ + App Router + colocated vertical slices + explicit shared layer` as defined in [../../plan/mvp/00-architecture-and-structure.md](../../plan/mvp/00-architecture-and-structure.md).
- New code belongs in the matching feature folder, not in global cross-cutting folders:
  - `src/features/auth`
  - `src/features/coins/collection`
  - `src/features/coins/categories`
  - `src/features/coins/photos`
  - `src/features/coins/import-export`
  - `src/features/coins/wishlist`
  - `src/features/coins/dashboard`
  - future `src/features/bonds`
  - future `src/features/bonds/dashboard`
- `src/app/` is for routes, layouts, route composition, and entrypoints.
- `src/shared/` is only for explicit shared concerns such as auth helpers, UI primitives, Supabase/db infrastructure, and truly generic utilities.
- `src/app/(app)/dashboard` is a compositional route, not a separate business domain.
- Direct imports between feature internals are not allowed. Do not import a component, query, action, schema, or helper from one feature into another except through an intentionally shared layer.
- `wishlist` stays inside the `coins` domain in code because it maps to `coins.wishlist_items`.
- Feature-specific search logic stays inside its feature. Only styles, presentational components, or truly generic UI behavior may be reused.

## Database and infrastructure rules

- Stack: Next.js App Router, Supabase Postgres/Auth/Storage, Vercel, Supabase CLI, Vitest, GitHub Actions.
- The application is a modular monolith:
  - `public.profiles` is the shared allow-list boundary
  - `coins` owns coin collection, categories, wishlist, and coin-specific dashboard data
  - future `bonds` lives in its own schema
- Do not add `owner_id` to `coins`, `categories`, or `wishlist_items`.
- Do not create direct foreign keys across domain schemas. Shared access control goes through `public.profiles`.
- Database schema changes are allowed only through `supabase/migrations/` SQL files created and applied with Supabase CLI.
- Manual production schema edits in the Supabase Dashboard are forbidden.
- Local and remote Supabase configuration that can be kept as code should stay in the repository.
- Do not seed fixed credentials like `admin/admin` in migrations or application code.
- The first user is created by the project owner through a separate bootstrap flow, and password hashing is delegated to Supabase Auth.
- Credentials and secrets must never be committed. Use `.env.local` locally and hosting/platform secret storage in deployed environments.

## Testing rules

- Every feature with backend logic must have integration tests in the same implementation step that introduces the behavior.
- Use local `supabase start` for development and tests.
- Integration tests must use Vitest and hit server actions or API route handlers directly.
- Tests must verify both the returned result and the actual state in the database or storage.
- `plan/mvp/09-testing-and-ci.md` is a shared testing infrastructure and coverage-audit step, not permission to postpone tests until the end.
- Required coverage includes:
  - CRUD for coins
  - CRUD for categories
  - CRUD for wishlist
  - RLS access cases
  - photo slot behavior and photo processing to final file size <= 1 MB
  - URL import protections
  - storage cleanup on replacement and deletion

## UI and design rules

- Keep the agreed UI roles from the roadmap:
  - `accent` blue for active navigation, buttons, and links
  - `amber` only for precious metal badges
  - neutral grays for structure, cards, borders, tables, and ordinary states
- Do not introduce a new accent color for the coins area without explicit agreement.
- Navigation must preserve the agreed layout:
  - sidebar with expandable domains
  - `Монети` with `Колекція` and `Бажанки`
  - `ОВДП` as a muted "soon" placeholder until implemented
  - `Дашборд` as a top-level item
- Preserve the agreed view-mode switch for collection cards/list and keep its selection persisted across sessions.
- Typography rule from the roadmap:
  - section headings use a light serif voice
  - tables, forms, and navigation use sans-serif

## Process rules

- Work on exactly one active `plan/*/NN-*.md` step at a time.
- Follow numeric order and declared dependencies within the active plan track. Do not skip ahead and do not combine multiple plan steps in one implementation session.
- Before starting a step, read that step file completely.
- If the plan for the step contains unresolved questions, assumptions, or ambiguous behavior, prepare a short question list for the user before implementation starts and wait for the answers.
- While working, mark completed subtasks progressively with `[x]` instead of checking everything at the end.
- Update the implementation status during work; do not leave the plan file stale.
- Keep daily implementation notes in `Нотатки з реалізації`. Each workday entry should summarize what was implemented that day, what changed relative to the original plan, and why.
- After finishing a step, review whether `README.md` must be updated to reflect the current real state of the project.
- `README.md` should always describe the current result, not the intended future state only.
- When a completed step changes setup, architecture, stack, constraints, implemented features, owner actions, or important project decisions, update `README.md` in the same session.
- Use [readme-update-checklist.md](readme-update-checklist.md) as the default checklist when reviewing README changes.
- In README updates, prioritize the most important facts:
  - what is already implemented
  - how to run or verify it
  - key architectural decisions and constraints
  - required owner-provided configuration or secrets
- When the step meets its acceptance criteria and tests pass:
  - fill in `Нотатки з реалізації`
  - change `Статус` to `завершено`
- One step equals one completed and closed `.md` file. Do not start the next step until the current one is explicitly marked complete.
- If a step turns out to be too large or needs restructuring, update the files in `plan/` first instead of silently deviating from them.
