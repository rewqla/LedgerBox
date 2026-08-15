import type { ImportReportItem, ImportSummary } from '@/features/coins/import-export/server/types';

export type ImportCoinsFormState = {
  success: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
  summary: ImportSummary | null;
  report: ImportReportItem[];
};

export const INITIAL_IMPORT_COINS_FORM_STATE: ImportCoinsFormState = {
  success: false,
  message: null,
  fieldErrors: {},
  summary: null,
  report: []
};
