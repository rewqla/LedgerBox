# Tests

`tests/` contains integration-level support code.

- `integration` for feature and RLS integration tests
- `fixtures` for reusable test data
- `helpers` for setup and assertions
- `setup` for shared Vitest environment bootstrap

## Local flow

1. Start Supabase locally with `supabase start`.
2. Run `npm run test:integration:local` to reset the local stack, re-apply migrations/seeds, and then execute the Vitest integration suite.
3. Run `npm run build` when you want the same build gate that CI uses on pull requests.

## Coverage audit

- `auth` covers redirect policy and login validation helpers.
- `database` covers schema constraints, seeded defaults, RLS policies, and explicit access cases for `anon`, authenticated-without-profile, and authenticated-with-profile users.
- `collection` covers filters, form validation, and CRUD/state expectations for coin rows including the two-slot photo schema.
- `categories` covers CRUD expectations for category rows.
- `photos` covers URL security guards plus image processing size/validity constraints.
- `wishlist` covers validation helpers and CRUD expectations for wishlist rows.
- `dashboard` covers aggregate math and snapshot shapes.
- `import-export` covers the JSON payload contract, validation, duplicate signatures, and report aggregation.
