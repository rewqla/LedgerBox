import { LogoutButton } from '@/features/auth/ui/logout-button';

type ForbiddenPanelProps = {
  email: string | null;
};

export function ForbiddenPanel({ email }: ForbiddenPanelProps) {
  return (
    <section
      style={{
        width: 'min(32rem, 100%)',
        padding: '2rem',
        borderRadius: '1.5rem',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'grid',
        gap: '1rem',
        boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)'
      }}
    >
      <p style={{ margin: 0, color: 'var(--muted)' }}>Membership required</p>
      <h1
        style={{
          margin: 0,
          fontFamily: '"Times New Roman", Georgia, serif',
          fontWeight: 400,
          fontSize: '2rem'
        }}
      >
        Доступ ще не надано
      </h1>
      <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
        Ви успішно автентифікувалися
        {email ? ` як ${email}` : ''}, але вашого запису немає в
        {' '}
        <code>public.profiles</code>. Власник проєкту має додати вас вручну.
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <LogoutButton />
      </div>
    </section>
  );
}
