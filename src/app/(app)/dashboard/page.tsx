export const dynamic = 'force-dynamic';

import { getCoinsDashboardSnapshot } from '@/features/coins/dashboard/server/queries';
import { CoinsDashboard } from '@/features/coins/dashboard/ui/coins-dashboard';

export default async function DashboardPage() {
  const snapshot = await getCoinsDashboardSnapshot();

  return <CoinsDashboard snapshot={snapshot} />;
}
