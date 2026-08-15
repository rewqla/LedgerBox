import Link from 'next/link';
import { getCollectionCoinDetail } from '@/features/coins/collection/server/queries';
import { CoinForm } from '@/features/coins/collection/ui/coin-form';
import { listCoinCategories } from '@/features/coins/categories/server/queries';

export const dynamic = 'force-dynamic';

type EditCoinPageProps = {
  params: Promise<{
    coinId: string;
  }>;
};

export default async function EditCoinPage({ params }: EditCoinPageProps) {
  const { coinId } = await params;
  const [coin, categories] = await Promise.all([
    getCollectionCoinDetail(coinId),
    listCoinCategories()
  ]);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Link href={`/coins/collection/${coinId}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
        ← Назад до картки
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
          <p style={{ margin: 0, color: 'var(--muted)' }}>Монети / Редагування</p>
          <h1 className="font-serif" style={{ margin: 0, fontWeight: 400, fontSize: '2.1rem' }}>
            Редагувати монету
          </h1>
        </div>
        <CoinForm categories={categories} coin={coin} mode="edit" />
      </section>
    </div>
  );
}
