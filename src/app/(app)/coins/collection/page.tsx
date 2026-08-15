export const dynamic = 'force-dynamic';

export default function CoinsCollectionPage() {
  return (
    <section
      style={{
        maxWidth: '52rem',
        padding: '2rem',
        borderRadius: '1.5rem',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'grid',
        gap: '1rem',
        boxShadow: 'var(--shadow-soft)'
      }}
    >
      <p style={{ margin: 0, color: 'var(--muted)' }}>Монети / Колекція</p>
      <h1 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '2rem' }}>
        Розділ колекції готовий до наступних кроків
      </h1>
      <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>
        Це маршрут-домен для колекції монет. Тут далі з’являться пошук, фільтри,
        картки, таблиця і перегляд детальної інформації про монети.
      </p>
    </section>
  );
}
