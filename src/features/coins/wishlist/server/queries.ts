import { createServerSupabaseClient } from '@/shared/supabase/server';

export type WishlistItem = {
  id: string;
  name: string;
  url: string;
  expectedPrice: number | null;
  createdAt: string;
  updatedAt: string;
};

type WishlistRow = {
  id: string;
  name: string;
  url: string;
  expected_price: number | null;
  created_at: string;
  updated_at: string;
};

function mapWishlistRow(row: WishlistRow): WishlistItem {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    expectedPrice: row.expected_price,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listWishlistItems(): Promise<WishlistItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .schema('coins')
    .from('wishlist_items')
    .select('id, name, url, expected_price, created_at, updated_at')
    .order('created_at', { ascending: false })
    .returns<WishlistRow[]>();

  if (error) {
    throw new Error(`Failed to load wishlist items: ${error.message}`);
  }

  return (data ?? []).map(mapWishlistRow);
}
