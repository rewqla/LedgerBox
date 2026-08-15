import type {
  CoinTransferRecord,
  CoinsExportPayload,
  ImportReportItem,
  ImportSummary
} from '@/features/coins/import-export/server/types';

export type ExportCoinRow = {
  name: string;
  mint_year: number | null;
  acquired_at: string;
  purchase_amount: number;
  purchase_currency: string;
  fx_usd_rate: number;
  is_precious: boolean;
  precious_metal_type: 'gold' | 'silver' | 'platinum' | null;
  precious_metal_weight_g: number | null;
  notes: string | null;
  categories: {
    name: string;
  } | Array<{ name: string }> | null;
};

function normalizeCategoryName(
  value: ExportCoinRow['categories']
): string {
  if (!value) {
    return 'Без категорії';
  }

  const category = Array.isArray(value) ? (value[0] ?? null) : value;

  return category?.name ?? 'Без категорії';
}

export function mapExportRowToRecord(row: ExportCoinRow): CoinTransferRecord {
  return {
    name: row.name,
    mintYear: row.mint_year,
    acquiredAt: row.acquired_at,
    purchaseAmount: row.purchase_amount,
    purchaseCurrency: row.purchase_currency as CoinTransferRecord['purchaseCurrency'],
    fxUsdRate: row.fx_usd_rate,
    categoryName: normalizeCategoryName(row.categories),
    isPrecious: row.is_precious,
    preciousMetalType: row.precious_metal_type,
    preciousMetalWeightG: row.precious_metal_weight_g,
    notes: row.notes
  };
}

export function buildCoinsExportPayload(records: CoinTransferRecord[]): CoinsExportPayload {
  return {
    format: 'ledgerbox.coins.export',
    version: 1,
    exportedAt: new Date().toISOString(),
    photoPolicy: 'excluded',
    duplicatePolicy: 'skip-on-import',
    coins: records
  };
}

export function buildImportSummary(report: ImportReportItem[]): ImportSummary {
  return report.reduce<ImportSummary>(
    (summary, item) => {
      summary.total += 1;

      if (item.status === 'imported') {
        summary.imported += 1;
      } else if (item.status === 'skipped') {
        summary.skipped += 1;
      } else {
        summary.errors += 1;
      }

      return summary;
    },
    {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: 0
    }
  );
}

export function parseImportPayload(text: string): {
  payload: CoinsExportPayload | null;
  error: string | null;
} {
  try {
    const parsed = JSON.parse(text) as Partial<CoinsExportPayload>;

    if (
      parsed.format !== 'ledgerbox.coins.export' ||
      parsed.version !== 1 ||
      parsed.photoPolicy !== 'excluded' ||
      parsed.duplicatePolicy !== 'skip-on-import' ||
      !Array.isArray(parsed.coins)
    ) {
      return {
        payload: null,
        error: 'Файл не схожий на MVP JSON-експорт LedgerBox.'
      };
    }

    return {
      payload: parsed as CoinsExportPayload,
      error: null
    };
  } catch {
    return {
      payload: null,
      error: 'Не вдалося розібрати JSON-файл для імпорту.'
    };
  }
}

function normalizeText(value: string | null): string {
  return (value ?? '').trim();
}

export function buildCoinTransferSignature(record: CoinTransferRecord): string {
  return JSON.stringify({
    name: normalizeText(record.name).toLocaleLowerCase('uk-UA'),
    mintYear: record.mintYear,
    acquiredAt: record.acquiredAt,
    purchaseAmount: Number(record.purchaseAmount.toFixed(2)),
    purchaseCurrency: record.purchaseCurrency,
    fxUsdRate: Number(record.fxUsdRate.toFixed(6)),
    categoryName: normalizeText(record.categoryName).toLocaleLowerCase('uk-UA'),
    isPrecious: record.isPrecious,
    preciousMetalType: record.preciousMetalType,
    preciousMetalWeightG:
      record.preciousMetalWeightG === null ? null : Number(record.preciousMetalWeightG.toFixed(3)),
    notes: normalizeText(record.notes)
  });
}

export function validateImportCoinRecord(
  record: unknown
): {
  value: CoinTransferRecord | null;
  error: string | null;
} {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return {
      value: null,
      error: 'Запис має бути JSON-обʼєктом.'
    };
  }

  const candidate = record as Record<string, unknown>;

  if ('obversePhotoPath' in candidate || 'reversePhotoPath' in candidate) {
    return {
      value: null,
      error: 'Фото та photo paths не підтримуються в import/export MVP.'
    };
  }

  const name = String(candidate.name ?? '').trim();
  const acquiredAt = String(candidate.acquiredAt ?? '').trim();
  const categoryName = String(candidate.categoryName ?? '').trim();
  const purchaseCurrency = String(candidate.purchaseCurrency ?? '').trim();
  const purchaseAmount = Number(candidate.purchaseAmount);
  const fxUsdRate = Number(candidate.fxUsdRate);
  const mintYear =
    candidate.mintYear === null || candidate.mintYear === undefined || candidate.mintYear === ''
      ? null
      : Number(candidate.mintYear);
  const isPrecious = candidate.isPrecious === true;
  const preciousMetalTypeRaw =
    candidate.preciousMetalType === null || candidate.preciousMetalType === undefined
      ? null
      : String(candidate.preciousMetalType);
  const preciousMetalWeightG =
    candidate.preciousMetalWeightG === null ||
    candidate.preciousMetalWeightG === undefined ||
    candidate.preciousMetalWeightG === ''
      ? null
      : Number(candidate.preciousMetalWeightG);
  const notes =
    candidate.notes === null || candidate.notes === undefined ? null : String(candidate.notes).trim();

  if (!name) {
    return { value: null, error: 'Назва монети обовʼязкова.' };
  }

  if (!acquiredAt || Number.isNaN(Date.parse(acquiredAt))) {
    return { value: null, error: 'Дата придбання обовʼязкова і має бути валідною.' };
  }

  if (!categoryName) {
    return { value: null, error: 'Назва категорії обовʼязкова для імпорту.' };
  }

  if (!['UAH', 'USD', 'EUR'].includes(purchaseCurrency)) {
    return { value: null, error: 'Підтримуються тільки UAH, USD або EUR.' };
  }

  if (!Number.isFinite(purchaseAmount) || purchaseAmount < 0) {
    return { value: null, error: 'Сума придбання має бути додатною або нульовою.' };
  }

  if (!Number.isFinite(fxUsdRate) || fxUsdRate <= 0) {
    return { value: null, error: 'Курс USD має бути більшим за нуль.' };
  }

  if (mintYear !== null && (!Number.isInteger(mintYear) || mintYear < 1000 || mintYear > 9999)) {
    return { value: null, error: 'Рік карбування має бути в межах 1000-9999.' };
  }

  if (isPrecious) {
    if (!preciousMetalTypeRaw || !['gold', 'silver', 'platinum'].includes(preciousMetalTypeRaw)) {
      return {
        value: null,
        error: 'Для дорогоцінної монети треба передати gold, silver або platinum.'
      };
    }

    if (
      preciousMetalWeightG === null ||
      !Number.isFinite(preciousMetalWeightG) ||
      preciousMetalWeightG <= 0
    ) {
      return {
        value: null,
        error: 'Для дорогоцінної монети треба вказати вагу дорогоцінного металу.'
      };
    }
  }

  if (!isPrecious && (preciousMetalTypeRaw !== null || preciousMetalWeightG !== null)) {
    return {
      value: null,
      error: 'Звичайна монета не повинна мати precious-поля.'
    };
  }

  return {
    value: {
      name,
      mintYear,
      acquiredAt: acquiredAt.slice(0, 10),
      purchaseAmount,
      purchaseCurrency: purchaseCurrency as CoinTransferRecord['purchaseCurrency'],
      fxUsdRate,
      categoryName,
      isPrecious,
      preciousMetalType: isPrecious
        ? (preciousMetalTypeRaw as CoinTransferRecord['preciousMetalType'])
        : null,
      preciousMetalWeightG: isPrecious ? preciousMetalWeightG : null,
      notes
    },
    error: null
  };
}
