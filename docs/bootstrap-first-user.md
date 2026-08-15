# Bootstrap First User

This project does not create a fixed first user in SQL migrations. The first user must be bootstrapped separately after migrations are deployed.

## Why

- No fixed `admin/admin` or any other hard-coded credential may be committed
- Supabase Auth is responsible for password hashing and account lifecycle
- Access to LedgerBox requires both an auth account and a row in `public.profiles`

## Safe bootstrap flow

1. Deploy the database schema from `supabase/migrations/`.
2. Create the first auth user through a secure owner-only channel:
   - Supabase Dashboard: `Authentication -> Users -> Add user`
   - or a separate owner-only admin script using the service role key
3. Copy the created auth user UUID and confirmed email.
4. Add the same user to the allow-list:

```sql
insert into public.profiles (user_id, email, full_name)
values (
  '<auth-user-uuid>',
  'owner@example.com',
  'Project Owner'
);
```

5. Share access with the real owner through a password-reset or invite flow managed by Supabase Auth.

## Important rules

- Never commit real emails, passwords, UUIDs, or service-role scripts with embedded secrets
- Do not add bootstrap users in `supabase/migrations/` or `supabase/seed.sql`
- Keep `public.profiles` owner-managed; application users must not be able to add themselves
