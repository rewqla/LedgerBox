'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/shared/supabase/server';
import type { WishlistFormState } from '@/features/coins/wishlist/server/form-state';
import { parseWishlistFormData, validateWishlistInput } from '@/features/coins/wishlist/server/helpers';

function touchWishlistRoutes() {
  revalidatePath('/coins/wishlist');
}

export async function createWishlistItemAction(
  _previousState: WishlistFormState,
  formData: FormData
): Promise<WishlistFormState> {
  const values = parseWishlistFormData(formData);
  const validation = validateWishlistInput(values);

  if (Object.keys(validation.fieldErrors).length > 0) {
    return validation;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.schema('coins').from('wishlist_items').insert({
    name: values.name,
    url: values.url,
    expected_price: values.expectedPrice
  });

  if (error) {
    return {
      success: false,
      message: 'Не вдалося додати позицію в бажанки.',
      fieldErrors: {
        form: error.message
      }
    };
  }

  touchWishlistRoutes();

  return {
    success: true,
    message: 'Позицію додано до бажанок.',
    fieldErrors: {}
  };
}

export async function updateWishlistItemAction(
  wishlistItemId: string,
  _previousState: WishlistFormState,
  formData: FormData
): Promise<WishlistFormState> {
  const values = parseWishlistFormData(formData);
  const validation = validateWishlistInput(values);

  if (Object.keys(validation.fieldErrors).length > 0) {
    return validation;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .schema('coins')
    .from('wishlist_items')
    .update({
      name: values.name,
      url: values.url,
      expected_price: values.expectedPrice
    })
    .eq('id', wishlistItemId);

  if (error) {
    return {
      success: false,
      message: 'Не вдалося оновити позицію.',
      fieldErrors: {
        form: error.message
      }
    };
  }

  touchWishlistRoutes();

  return {
    success: true,
    message: 'Позицію оновлено.',
    fieldErrors: {}
  };
}

export async function deleteWishlistItemAction(wishlistItemId: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .schema('coins')
    .from('wishlist_items')
    .delete()
    .eq('id', wishlistItemId);

  if (error) {
    throw new Error(`Не вдалося видалити позицію: ${error.message}`);
  }

  touchWishlistRoutes();
}

export async function markWishlistItemPurchasedAction(wishlistItemId: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .schema('coins')
    .from('wishlist_items')
    .delete()
    .eq('id', wishlistItemId);

  if (error) {
    throw new Error(`Не вдалося прибрати придбану позицію: ${error.message}`);
  }

  touchWishlistRoutes();
}
