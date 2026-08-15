export type CoinFormState = {
  success: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const INITIAL_COIN_FORM_STATE: CoinFormState = {
  success: false,
  message: null,
  fieldErrors: {}
};
