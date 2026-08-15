'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/shared/supabase/server';
import {
  INITIAL_IMPORT_COINS_FORM_STATE,
  type ImportCoinsFormState
} from '@/features/coins/import-export/server/form-state';
import { importCoinsCollection } from '@/features/coins/import-export/server/services';

export async function importCoinsAction(
  _previousState: ImportCoinsFormState,
  formData: FormData
): Promise<ImportCoinsFormState> {
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return {
      ...INITIAL_IMPORT_COINS_FORM_STATE,
      fieldErrors: {
        file: 'Оберіть JSON-файл для імпорту.'
      }
    };
  }

  if (!file.name.toLocaleLowerCase().endsWith('.json')) {
    return {
      ...INITIAL_IMPORT_COINS_FORM_STATE,
      fieldErrors: {
        file: 'Поки що підтримується тільки JSON-експорт LedgerBox.'
      }
    };
  }

  const supabase = await createServerSupabaseClient();
  const result = await importCoinsCollection({
    supabase,
    fileText: await file.text()
  });

  revalidatePath('/coins/collection');
  revalidatePath('/coins/collection/import-export');
  revalidatePath('/dashboard');

  return {
    success: result.success,
    message: result.message,
    fieldErrors: result.success || result.report.length > 0 ? {} : { file: result.message ?? 'Імпорт не вдався.' },
    summary: result.summary,
    report: result.report
  };
}
