import { create } from "zustand";
import { removeCart } from "./removeCart";
import { removeCartItems } from "./removeCartItems";
import { updateQty } from "./updateQty";
import { addToCartAction } from "./addToCart"; // ✅ use updated function

interface CartState {
  allCarts: any[];
  addItem: (
    storeId: string,
    slug: string,
    catalogId: string,
    quantity: number,
    customizable: boolean,
    customizations: any[],
    authToken: string
  ) => Promise<boolean>;
  updateItemQuantity: (
    cartItemId: string,
    quantity: number,
    authToken: string
  ) => Promise<boolean>;
  removeCartItems: (itemIds: string[], authToken: string) => Promise<boolean>;
  removeCart: (storeId: string, authToken: string) => Promise<boolean>;
}

export const useCartStore = create<CartState>(() => ({
  allCarts: [],

  addItem: async (
    storeId,
    slug,
    catalogId,
    quantity,
    customizable,
    customizations,
    authToken
  ) => {
    if (!authToken) return false;

    const input = {
      store_id: storeId,
      slug,
      catalog_id: catalogId,
      qty: quantity,
      customizable,
      customizations,
    };

    const { success } = await addToCartAction(input, authToken);
    return success;
  },

  updateItemQuantity: async (cartItemId, quantity, authToken) => {
    if (!authToken) return false;
    return await updateQty(cartItemId, quantity, authToken);
  },

  removeCartItems: async (itemIds, authToken) => {
    if (!authToken) return false;
    return await removeCartItems(itemIds, authToken);
  },

  removeCart: async (storeId, authToken) => {
    if (!authToken) return false;
    return await removeCart(storeId, authToken);
  },
}));
