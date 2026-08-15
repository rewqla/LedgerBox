import { listWishlistItems } from '@/features/coins/wishlist/server/queries';
import { WishlistManager } from '@/features/coins/wishlist/ui/wishlist-manager';

export const dynamic = 'force-dynamic';

export default async function CoinsWishlistPage() {
  const items = await listWishlistItems();

  return <WishlistManager items={items} />;
}
