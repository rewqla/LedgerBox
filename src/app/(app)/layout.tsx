import { redirect } from 'next/navigation';
import { LogoutButton } from '@/features/auth/ui/logout-button';
import { resolveAuthAccessState } from '@/shared/auth/access';

export const dynamic = 'force-dynamic';

type ProtectedLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function ProtectedAppLayout({ children }: ProtectedLayoutProps) {
  const access = await resolveAuthAccessState();

  if (access.kind === 'anonymous') {
    redirect('/login');
  }

  if (access.kind === 'authenticated-no-membership') {
    redirect('/forbidden');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr'
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div style={{ display: 'grid', gap: '0.15rem' }}>
          <strong>LedgerBox</strong>
          <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
            {access.email ?? 'Авторизований користувач'}
          </span>
        </div>
        <LogoutButton />
      </header>
      <main style={{ padding: '2rem' }}>{children}</main>
    </div>
  );
}
