export type CoinTransferRecord = {
  name: string;
  mintYear: number | null;
  acquiredAt: string;
  purchaseAmount: number;
  purchaseCurrency: 'UAH' | 'USD' | 'EUR';
  fxUsdRate: number;
  categoryName: string;
  isPrecious: boolean;
  preciousMetalType: 'gold' | 'silver' | 'platinum' | null;
  preciousMetalWeightG: number | null;
  notes: string | null;
};

export type CoinsExportPayload = {
  format: 'ledgerbox.coins.export';
  version: 1;
  exportedAt: string;
  photoPolicy: 'excluded';
  duplicatePolicy: 'skip-on-import';
  coins: CoinTransferRecord[];
};

export type ImportReportItem = {
  rowNumber: number;
  name: string;
  status: 'imported' | 'skipped' | 'error';
  message: string;
};

export type ImportSummary = {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
};
