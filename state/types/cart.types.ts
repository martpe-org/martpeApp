// types/cart.types.ts
export interface CartItem {
  _id: string;
  qty: number;
  slug: string;
  unit_price: number;
  unit_max_price: number;
  total_price: number;
  total_max_price: number;
  store_id: string;
  product?: {
    name?: string;
    symbol?: string;
    price?: number; // Add base product price to preserve it
    quantity?: number;
    instock?: boolean;
    customizable?: boolean;
    directlyLinkedCustomGroupIds?: string[];
    slug?: string; // Add product slug
  };
  selected_customizations?: any[];
}

export interface AppliedOffer {
  offerId: string;
  discount: number;
  total: number;
}

export interface Cart {
  _id?: string;
  store: { _id: string };
  cart_items: CartItem[];
}

export interface CartState {
  allCarts: Cart[];
  appliedOffers: Record<string, AppliedOffer>;
  
  // Cart management actions
  setAllCarts: (carts: Cart[] | any[]) => void;
  loadCartFromStorage: () => Promise<void>;
  syncCartFromApi: (authToken: string | null) => Promise<void>;
  
  // Item actions
  addItem: (
    storeId: string,
    slug: string,
    catalogId: string,
    quantity: number,
    customizable: boolean,
    customizations: any[],
    authToken: string | null
  ) => Promise<boolean>;
  
  updateQty: (
    cartItemId: string,
    qty: number,
    authToken: string | null
  ) => Promise<boolean>;
  
  updateItemCustomizations: (
    cartItemId: string,
    qty: number,
    productSlug: string,
    productPrice: number,
    customizations: any[],
    authToken: string | null
  ) => Promise<boolean>;
  
  removeCartItems: (
    itemIds: string[],
    authToken: string | null
  ) => Promise<boolean>;
  
  removeCart: (storeId: string, authToken: string | null) => Promise<boolean>;

  // Offer actions
  updateCartOffer: (
    cartId: string,
    offerId: string,
    discount: number,
    total: number
  ) => void;
  
  clearCartOffer: (cartId: string) => void;
  
  // Helper methods
  getCartItem: (cartItemId: string) => CartItem | undefined;
  getCartByStoreId: (storeId: string) => Cart | undefined;
}