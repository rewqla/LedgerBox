import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildCoinTransferSignature,
  buildCoinsExportPayload,
  buildImportSummary,
  mapExportRowToRecord,
  parseImportPayload,
  validateImportCoinRecord,
  type ExportCoinRow
} from '@/features/coins/import-export/server/helpers';
import type { ImportReportItem, CoinsExportPayload, CoinTransferRecord } from '@/features/coins/import-export/server/types';

type CategoryRow = {
  id: string;
  name: string;
};

type ExistingCoinRow = ExportCoinRow;

function normalizeCategoryKey(name: string): string {
  return name.trim().toLocaleLowerCase('uk-UA');
}

async function ensureCategoryId(
  supabase: SupabaseClient,
  categoryMap: Map<string, string>,
  categoryName: string
): Promise<string> {
  const key = normalizeCategoryKey(categoryName);
  const existing = categoryMap.get(key);

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .schema('coins')
    .from('categories')
    .insert({
      name: categoryName
    })
    .select('id, name')
    .single<CategoryRow>();

  if (error || !data) {
    throw new Error(`Не вдалося створити категорію "${categoryName}".`);
  }

  categoryMap.set(key, data.id);

  return data.id;
}

export async function exportCoinsCollection(
  supabase: SupabaseClient
): Promise<CoinsExportPayload> {
  const { data, error } = await supabase
    .schema('coins')
    .from('coins')
    .select(
      'name, mint_year, acquired_at, purchase_amount, purchase_currency, fx_usd_rate, is_precious, precious_metal_type, precious_metal_weight_g, notes, categories(name)'
    )
    .order('acquired_at', { ascending: true })
    .order('name', { ascending: true })
    .returns<ExportCoinRow[]>();

  if (error) {
    throw new Error(`Failed to export collection: ${error.message}`);
  }

  return buildCoinsExportPayload((data ?? []).map(mapExportRowToRecord));
}

export async function importCoinsCollection(args: {
  supabase: SupabaseClient;
  fileText: string;
}) {
  const parsed = parseImportPayload(args.fileText);

  if (!parsed.payload) {
    return {
      success: false,
      message: parsed.error,
      summary: null,
      report: [] satisfies ImportReportItem[]
    };
  }

  const [{ data: categories, error: categoriesError }, { data: existingCoins, error: coinsError }] =
    await Promise.all([
      args.supabase
        .schema('coins')
        .from('categories')
        .select('id, name')
        .returns<CategoryRow[]>(),
      args.supabase
        .schema('coins')
        .from('coins')
        .select(
          'name, mint_year, acquired_at, purchase_amount, purchase_currency, fx_usd_rate, is_precious, precious_metal_type, precious_metal_weight_g, notes, categories(name)'
        )
        .returns<ExistingCoinRow[]>()
    ]);

  if (categoriesError) {
    throw new Error(`Failed to load categories before import: ${categoriesError.message}`);
  }

  if (coinsError) {
    throw new Error(`Failed to load existing coins before import: ${coinsError.message}`);
  }

  const categoryMap = new Map(
    (categories ?? []).map((category) => [normalizeCategoryKey(category.name), category.id])
  );
  const seenSignatures = new Set(
    (existingCoins ?? []).map((coin) => buildCoinTransferSignature(mapExportRowToRecord(coin)))
  );

  const report: ImportReportItem[] = [];

  for (const [index, rawRecord] of parsed.payload.coins.entries()) {
    const rowNumber = index + 1;
    const validated = validateImportCoinRecord(rawRecord);
    const name =
      rawRecord && typeof rawRecord === 'object' && 'name' in rawRecord
        ? String((rawRecord as Record<string, unknown>).name ?? '').trim() || `Рядок ${rowNumber}`
        : `Рядок ${rowNumber}`;

    if (!validated.value) {
      report.push({
        rowNumber,
        name,
        status: 'error',
        message: validated.error ?? 'Невалідний запис.'
      });
      continue;
    }

    const signature = buildCoinTransferSignature(validated.value);

    if (seenSignatures.has(signature)) {
      report.push({
        rowNumber,
        name: validated.value.name,
        status: 'skipped',
        message: 'Дублікат уже існує в колекції або в цьому ж файлі.'
      });
      continue;
    }

    try {
      const categoryId = await ensureCategoryId(args.supabase, categoryMap, validated.value.categoryName);
      const { error } = await args.supabase.schema('coins').from('coins').insert({
        name: validated.value.name,
        mint_year: validated.value.mintYear,
        acquired_at: validated.value.acquiredAt,
        purchase_amount: validated.value.purchaseAmount,
        purchase_currency: validated.value.purchaseCurrency,
        fx_usd_rate: validated.value.fxUsdRate,
        category_id: categoryId,
        is_precious: validated.value.isPrecious,
        precious_metal_type: validated.value.preciousMetalType,
        precious_metal_weight_g: validated.value.preciousMetalWeightG,
        notes: validated.value.notes
      });

      if (error) {
        report.push({
          rowNumber,
          name: validated.value.name,
          status: 'error',
          message: error.message
        });
        continue;
      }

      seenSignatures.add(signature);
      report.push({
        rowNumber,
        name: validated.value.name,
        status: 'imported',
        message: 'Монету імпортовано.'
      });
    } catch (error) {
      report.push({
        rowNumber,
        name: validated.value.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Не вдалося імпортувати запис.'
      });
    }
  }

  const summary = buildImportSummary(report);

  return {
    success: summary.imported > 0,
    message:
      summary.errors > 0 || summary.skipped > 0
        ? 'Імпорт завершено з частковим результатом. Перевір звіт нижче.'
        : 'Імпорт завершено успішно.',
    summary,
    report
  };
}
