import { create } from "zustand";
import { removeCart } from "./removeCart";
import { removeCartItems } from "./removeCartItems";
import { updateQty } from "./updateQty";
import { addToCartAction } from "./addToCart";

interface CartState {
  allCarts: any[];
  setAllCarts: (carts: any[]) => void;
  addItem: (
    storeId: string,
    slug: string,
    catalogId: string,
    quantity: number,
    customizable: boolean,
    customizations: any[],
    authToken: string
  ) => Promise<boolean>;
  updateQty: (
    cartItemId: string,
    quantity: number,
    authToken: string
  ) => Promise<boolean>;
  removeCartItems: (itemIds: string[], authToken: string) => Promise<boolean>;
  removeCart: (storeId: string, authToken: string) => Promise<boolean>;
}

export const useCartStore = create<CartState>((set, get) => ({
  allCarts: [],

  setAllCarts: (carts) => set({ allCarts: carts }),

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

  updateQty: async (cartItemId, quantity, authToken) => {
    if (!authToken) return false;
    const { success } = await updateQty(cartItemId, quantity, authToken);
    
    if (success) {
      // Update local state optimistically
      const currentCarts = get().allCarts;
      const updatedCarts = currentCarts.map(cart => ({
        ...cart,
        items: cart.items.map((item: any) => 
          item._id === cartItemId 
            ? { 
                ...item, 
                qty: quantity,
                total_price: item.unit_price * quantity,
                total_max_price: item.unit_max_price * quantity
              }
            : item
        )
      }));
      set({ allCarts: updatedCarts });
    }
    
    return success;
  },

  removeCartItems: async (itemIds, authToken) => {
    if (!authToken) return false;
    const { success } = await removeCartItems(itemIds, authToken);
    
    if (success) {
      // Remove items from local state
      const currentCarts = get().allCarts;
      const updatedCarts = currentCarts.map(cart => ({
        ...cart,
        items: cart.items.filter((item: any) => !itemIds.includes(item._id))
      })).filter(cart => cart.items.length > 0); // Remove empty carts
      
      set({ allCarts: updatedCarts });
    }
    
    return success;
  },

  removeCart: async (storeId, authToken) => {
    if (!authToken) return false;
    const { success } = await removeCart(storeId, authToken);
    
    if (success) {
      // Remove entire cart from local state
      const currentCarts = get().allCarts;
      const updatedCarts = currentCarts.filter(cart => cart.store._id !== storeId);
      set({ allCarts: updatedCarts });
    }
    
    return success;
  },
}));