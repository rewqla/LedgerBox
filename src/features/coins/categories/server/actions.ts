'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/shared/supabase/server';

export type CategoryFormState = {
  success: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const INITIAL_CATEGORY_FORM_STATE: CategoryFormState = {
  success: false,
  message: null,
  fieldErrors: {}
};

function getName(formData: FormData): string {
  return String(formData.get('name') ?? '').trim();
}

function validateCategoryName(name: string): CategoryFormState | null {
  if (!name) {
    return {
      success: false,
      message: null,
      fieldErrors: {
        name: 'Назва категорії обов’язкова.'
      }
    };
  }

  return null;
}

export async function createCategoryAction(
  _previousState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const name = getName(formData);
  const validation = validateCategoryName(name);

  if (validation) {
    return validation;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.schema('coins').from('categories').insert({
    name
  });

  if (error) {
    return {
      success: false,
      message: 'Не вдалося створити категорію.',
      fieldErrors: {
        name: error.message
      }
    };
  }

  revalidatePath('/coins/collection');
  revalidatePath('/coins/collection/categories');

  return {
    success: true,
    message: 'Категорію створено.',
    fieldErrors: {}
  };
}

export async function renameCategoryAction(
  categoryId: string,
  _previousState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const name = getName(formData);
  const validation = validateCategoryName(name);

  if (validation) {
    return validation;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .schema('coins')
    .from('categories')
    .update({
      name
    })
    .eq('id', categoryId);

  if (error) {
    return {
      success: false,
      message: 'Не вдалося перейменувати категорію.',
      fieldErrors: {
        name: error.message
      }
    };
  }

  revalidatePath('/coins/collection');
  revalidatePath('/coins/collection/categories');

  return {
    success: true,
    message: 'Категорію оновлено.',
    fieldErrors: {}
  };
}
