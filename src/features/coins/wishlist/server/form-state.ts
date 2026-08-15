export type WishlistFormState = {
  success: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const INITIAL_WISHLIST_FORM_STATE: WishlistFormState = {
  success: false,
  message: null,
  fieldErrors: {}
};
