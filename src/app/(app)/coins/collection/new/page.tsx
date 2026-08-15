import Link from 'next/link';
import { CoinForm } from '@/features/coins/collection/ui/coin-form';
import { listCoinCategories } from '@/features/coins/categories/server/queries';

export const dynamic = 'force-dynamic';

export default async function NewCoinPage() {
  const categories = await listCoinCategories();

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Link href="/coins/collection" style={{ color: 'var(--accent)', fontWeight: 600 }}>
        ← Назад до колекції
      </Link>
      <section
        style={{
          display: 'grid',
          gap: '1rem',
          padding: '1.5rem',
          borderRadius: '1.5rem',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-soft)'
        }}
      >
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <p style={{ margin: 0, color: 'var(--muted)' }}>Монети / Нова монета</p>
          <h1 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '2.1rem' }}>
            Додати монету
          </h1>
        </div>
        <CoinForm categories={categories} coin={null} mode="create" />
      </section>
    </div>
  );
}
