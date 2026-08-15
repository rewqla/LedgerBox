export const dynamic = 'force-dynamic';

export default function CoinsWishlistPage() {
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
      <p style={{ margin: 0, color: 'var(--muted)' }}>Монети / Бажанки</p>
      <h1 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '2rem' }}>
        Текстова бажанка відокремлена від колекції
      </h1>
      <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>
        Це окремий маршрут для wishlist у межах домену монет. Далі сюди ляже CRUD для
        позицій, які ще не придбані.
      </p>
    </section>
  );
}
