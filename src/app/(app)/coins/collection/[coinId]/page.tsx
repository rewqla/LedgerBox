import Link from 'next/link';
import { CoinDetailPanel } from '@/features/coins/collection/ui/coin-detail-panel';
import { getCollectionCoinDetail } from '@/features/coins/collection/server/queries';

export const dynamic = 'force-dynamic';

type CoinDetailPageProps = {
  params: Promise<{
    coinId: string;
  }>;
};

export default async function CoinDetailPage({ params }: CoinDetailPageProps) {
  const { coinId } = await params;
  const coin = await getCollectionCoinDetail(coinId);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Link href="/coins/collection" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          ← Назад до колекції
        </Link>
        <Link href={`/coins/collection/${coinId}/edit`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
          Редагувати монету
        </Link>
      </div>
      <CoinDetailPanel coin={coin} />
    </div>
  );
}
