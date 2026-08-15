import { createServerSupabaseClient } from '@/shared/supabase/server';

export type CategoryListItem = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export async function listCoinCategories(): Promise<CategoryListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .schema('coins')
    .from('categories')
    .select('id, name, created_at, updated_at')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}
