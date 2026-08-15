export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <section
      style={{
        maxWidth: '48rem',
        padding: '2rem',
        borderRadius: '1.5rem',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'grid',
        gap: '1rem',
        boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)'
      }}
    >
      <p style={{ margin: 0, color: 'var(--muted)' }}>Protected route</p>
      <h1
        style={{
          margin: 0,
          fontFamily: '"Times New Roman", Georgia, serif',
          fontWeight: 400,
          fontSize: '2rem'
        }}
      >
        Доступ підтверджено
      </h1>
      <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
        Це тимчасова захищена поверхня для MVP auth-кроку. Далі тут буде compositional
        dashboard зі статистикою колекції.
      </p>
    </section>
  );
}
