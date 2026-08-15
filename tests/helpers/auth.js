const { randomUUID } = require('node:crypto');

async function createAuthUser(db, overrides = {}) {
  const userId = overrides.userId ?? randomUUID();
  const email = overrides.email ?? `${userId}@ledgerbox.test`;

  await db.query(
    `
      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        is_anonymous
      )
      values (
        '00000000-0000-0000-0000-000000000000',
        $1,
        'authenticated',
        'authenticated',
        $2,
        '$2a$10$abcdefghijklmnopqrstuu1t7xKfQF0v0v0v0v0v0v0v0v0v0v0u',
        timezone('utc', now()),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        timezone('utc', now()),
        timezone('utc', now()),
        false
      )
      on conflict (id) do nothing
    `,
    [userId, email]
  );

  return {
    userId,
    email
  };
}

async function ensureProfile(db, user) {
  await db.query(
    `
      insert into public.profiles (user_id, email, full_name)
      values ($1, $2, $3)
      on conflict (user_id) do update
      set email = excluded.email,
          full_name = excluded.full_name
    `,
    [user.userId, user.email, user.fullName ?? 'LedgerBox Test User']
  );
}

async function cleanupAuthUser(db, userId) {
  await db.query('delete from public.profiles where user_id = $1', [userId]);
  await db.query('delete from auth.users where id = $1', [userId]);
}

async function runAsRole(db, role, userId, callback) {
  await db.query('begin');

  try {
    await db.query(`set local role ${role}`);
    await db.query(`select set_config('request.jwt.claim.role', $1, true)`, [role]);

    if (userId) {
      await db.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId]);
    }

    const result = await callback();
    await db.query('rollback');
    return result;
  } catch (error) {
    await db.query('rollback');
    throw error;
  }
}

module.exports = {
  cleanupAuthUser,
  createAuthUser,
  ensureProfile,
  runAsRole
};
