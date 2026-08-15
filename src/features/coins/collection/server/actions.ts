'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/shared/supabase/server';
import type { CoinFormState } from '@/features/coins/collection/server/form-state';
import {
  parseCoinFormData,
  validateCoinFormInput
} from '@/features/coins/collection/server/helpers';
import { importPhotoFromRemoteUrlAndUpload } from '@/features/coins/photos/server/import';
import { normalizeLocalUploadedPhoto } from '@/features/coins/photos/server/processing';
import {
  removeCoinPhotoPath,
  uploadCoinPhotoBuffer
} from '@/features/coins/photos/server/storage';
import type { CoinPhotoSlot } from '@/features/coins/photos/server/constants';

type CoinRow = {
  id: string;
  obverse_photo_path: string | null;
  reverse_photo_path: string | null;
};

function touchCoinCollectionRoutes(coinId?: string) {
  revalidatePath('/coins/collection');
  revalidatePath('/dashboard');

  if (coinId) {
    revalidatePath(`/coins/collection/${coinId}`);
    revalidatePath(`/coins/collection/${coinId}/edit`);
  }
}

async function getCoinStorageState(coinId: string): Promise<CoinRow> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .schema('coins')
    .from('coins')
    .select('id, obverse_photo_path, reverse_photo_path')
    .eq('id', coinId)
    .maybeSingle<CoinRow>();

  if (error || !data) {
    throw new Error('Не вдалося знайти монету для редагування фото.');
  }

  return data;
}

async function syncPhotoSlot(args: {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  coinId: string;
  slot: CoinPhotoSlot;
  currentPath: string | null;
  file: File | null;
  url: string;
  remove: boolean;
}): Promise<string | null> {
  if (args.remove) {
    await removeCoinPhotoPath(args.supabase, args.currentPath);
    return null;
  }

  if (args.file) {
    const processed = await normalizeLocalUploadedPhoto(args.file);
    return uploadCoinPhotoBuffer(args.supabase, args.coinId, args.slot, processed);
  }

  if (args.url) {
    const imported = await importPhotoFromRemoteUrlAndUpload({
      supabase: args.supabase,
      coinId: args.coinId,
      slot: args.slot,
      url: args.url
    });

    return imported.path;
  }

  return args.currentPath;
}

export async function createCoinAction(
  _previousState: CoinFormState,
  formData: FormData
): Promise<CoinFormState> {
  const { values, files } = parseCoinFormData(formData);
  const validation = validateCoinFormInput(values, files);

  if (Object.keys(validation.fieldErrors).length > 0) {
    return validation;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .schema('coins')
    .from('coins')
    .insert({
      name: values.name,
      mint_year: values.mintYear,
      acquired_at: values.acquiredAt,
      purchase_amount: values.purchaseAmount,
      purchase_currency: values.purchaseCurrency,
      fx_usd_rate: values.fxUsdRate,
      category_id: values.categoryId,
      is_precious: values.isPrecious,
      precious_metal_type: values.preciousMetalType,
      precious_metal_weight_g: values.preciousMetalWeightG,
      notes: values.notes || null
    })
    .select('id, obverse_photo_path, reverse_photo_path')
    .single<CoinRow>();

  if (error || !data) {
    return {
      success: false,
      message: 'Не вдалося створити монету.',
      fieldErrors: {
        form: error?.message ?? 'Insert failed'
      }
    };
  }

  try {
    const nextObverse = await syncPhotoSlot({
      supabase,
      coinId: data.id,
      slot: 'obverse',
      currentPath: null,
      file: files.obversePhotoFile,
      url: values.obversePhotoUrl,
      remove: false
    });
    const nextReverse = await syncPhotoSlot({
      supabase,
      coinId: data.id,
      slot: 'reverse',
      currentPath: null,
      file: files.reversePhotoFile,
      url: values.reversePhotoUrl,
      remove: false
    });

    const { error: updateError } = await supabase
      .schema('coins')
      .from('coins')
      .update({
        obverse_photo_path: nextObverse,
        reverse_photo_path: nextReverse
      })
      .eq('id', data.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  } catch (photoError) {
    await supabase.schema('coins').from('coins').delete().eq('id', data.id);
    return {
      success: false,
      message: photoError instanceof Error ? photoError.message : 'Не вдалося обробити фото монети.',
      fieldErrors: {}
    };
  }

  touchCoinCollectionRoutes(data.id);
  redirect(`/coins/collection/${data.id}`);
}

export async function updateCoinAction(
  coinId: string,
  _previousState: CoinFormState,
  formData: FormData
): Promise<CoinFormState> {
  const { values, files } = parseCoinFormData(formData);
  const validation = validateCoinFormInput(values, files);

  if (Object.keys(validation.fieldErrors).length > 0) {
    return validation;
  }

  const supabase = await createServerSupabaseClient();
  const current = await getCoinStorageState(coinId);
  const { error } = await supabase
    .schema('coins')
    .from('coins')
    .update({
      name: values.name,
      mint_year: values.mintYear,
      acquired_at: values.acquiredAt,
      purchase_amount: values.purchaseAmount,
      purchase_currency: values.purchaseCurrency,
      fx_usd_rate: values.fxUsdRate,
      category_id: values.categoryId,
      is_precious: values.isPrecious,
      precious_metal_type: values.preciousMetalType,
      precious_metal_weight_g: values.preciousMetalWeightG,
      notes: values.notes || null
    })
    .eq('id', coinId);

  if (error) {
    return {
      success: false,
      message: 'Не вдалося оновити монету.',
      fieldErrors: {
        form: error.message
      }
    };
  }

  try {
    const nextObverse = await syncPhotoSlot({
      supabase,
      coinId,
      slot: 'obverse',
      currentPath: current.obverse_photo_path,
      file: files.obversePhotoFile,
      url: values.obversePhotoUrl,
      remove: values.removeObversePhoto
    });
    const nextReverse = await syncPhotoSlot({
      supabase,
      coinId,
      slot: 'reverse',
      currentPath: current.reverse_photo_path,
      file: files.reversePhotoFile,
      url: values.reversePhotoUrl,
      remove: values.removeReversePhoto
    });

    const { error: updatePhotoError } = await supabase
      .schema('coins')
      .from('coins')
      .update({
        obverse_photo_path: nextObverse,
        reverse_photo_path: nextReverse
      })
      .eq('id', coinId);

    if (updatePhotoError) {
      throw new Error(updatePhotoError.message);
    }
  } catch (photoError) {
    return {
      success: false,
      message: photoError instanceof Error ? photoError.message : 'Не вдалося оновити фото монети.',
      fieldErrors: {}
    };
  }

  touchCoinCollectionRoutes(coinId);
  redirect(`/coins/collection/${coinId}`);
}

export async function deleteCoinAction(coinId: string) {
  const supabase = await createServerSupabaseClient();
  const current = await getCoinStorageState(coinId);

  await removeCoinPhotoPath(supabase, current.obverse_photo_path);
  await removeCoinPhotoPath(supabase, current.reverse_photo_path);

  const { error } = await supabase.schema('coins').from('coins').delete().eq('id', coinId);

  if (error) {
    throw new Error(`Не вдалося видалити монету: ${error.message}`);
  }

  touchCoinCollectionRoutes(coinId);
  redirect('/coins/collection');
}
