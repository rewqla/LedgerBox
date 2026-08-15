import { redirect } from 'next/navigation';
import { LoginForm } from '@/features/auth/ui/login-form';
import { resolveAuthAccessState } from '@/shared/auth/access';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const access = await resolveAuthAccessState();

  if (access.kind === 'member') {
    redirect('/dashboard');
  }

  if (access.kind === 'authenticated-no-membership') {
    redirect('/forbidden');
  }

  return (
    <section
      style={{
        width: 'min(28rem, 100%)',
        padding: '2rem',
        borderRadius: '1.5rem',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'grid',
        gap: '1.5rem',
        boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)'
      }}
    >
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <p style={{ margin: 0, color: 'var(--muted)' }}>LedgerBox access</p>
        <h1
          style={{
            margin: 0,
            fontFamily: '"Times New Roman", Georgia, serif',
            fontWeight: 400,
            fontSize: '2.2rem'
          }}
        >
          Вхід до колекції
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
          Вхід доступний лише для вручну дозволених користувачів із записом у
          {' '}
          <code>public.profiles</code>.
        </p>
      </div>

      <LoginForm />
    </section>
  );
}
