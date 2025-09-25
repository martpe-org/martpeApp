// cartTypes.ts
export interface CartItem {
  _id: string;
  qty: number;
  slug: string;
  unit_price: number;
  unit_max_price: number;
  total_price: number;
  total_max_price: number;
  product?: {
    name?: string;
    symbol?: string;
    quantity?: number;
    instock?: boolean;
  };
}

export interface AppliedOffer {
  offerId: string;
  discount: number;
  total: number;
}

export interface Cart {
  store: { _id: string };
  cart_items: CartItem[];
}

export interface CartState {
  allCarts: Cart[];
  appliedOffers: Record<string, AppliedOffer>;
  setAllCarts: (carts: Cart[] | any[]) => void;
  loadCartFromStorage: () => Promise<void>;
  syncCartFromApi: (authToken: string | null) => Promise<void>;
  addItem: (
    storeId: string,
    slug: string,
    catalogId: string,
    quantity: number,
    customizable: boolean,
    customizations: any[],
    authToken: string | null
  ) => Promise<boolean>;
  updateQty: (cartItemId: string, qty: number, authToken: string | null) => Promise<boolean>;
  removeCartItems: (itemIds: string[], authToken: string | null) => Promise<boolean>;
  removeCart: (storeId: string, authToken: string | null) => Promise<boolean>;
  updateCartOffer: (cartId: string, offerId: string, discount: number, total: number) => void;
  clearCartOffer: (cartId: string) => void;
}
