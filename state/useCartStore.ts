import { create } from "zustand";
import { removeCart } from "./removeCart";
import { removeCartItems as removeCartItemsApi } from "./removeCartItems";
import { updateQty } from "./updateQty";
import { addToCartAction } from "./addToCart";

interface CartItem {
  _id: string;
  qty: number;
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

interface Cart {
  store: { _id: string };
  cart_items: CartItem[];
}

interface CartState {
  allCarts: Cart[];
  setAllCarts: (carts: Cart[]) => void;
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
    qty: number,
    authToken: string
  ) => Promise<boolean>;
  removeCartItems: (itemIds: string[], authToken: string) => Promise<boolean>;
  removeCart: (storeId: string, authToken: string) => Promise<boolean>;
}

// Helper function to filter out invalid cart items
const sanitizeCartItems = (items: (CartItem | undefined | null)[]): CartItem[] => {
  return items.filter((item): item is CartItem => {
    if (!item) {
      console.warn("Found null/undefined cart item, filtering out");
      return false;
    }
    if (!item._id) {
      console.warn("Found cart item without _id, filtering out:", item);
      return false;
    }
    return true;
  });
};

// Helper function to sanitize carts
const sanitizeCarts = (carts: Cart[]): Cart[] => {
  return carts
    .filter((cart) => {
      if (!cart) {
        console.warn("Found null/undefined cart, filtering out");
        return false;
      }
      if (!cart.store?._id) {
        console.warn("Found cart without store._id, filtering out:", cart);
        return false;
      }
      return true;
    })
    .map((cart) => ({
      ...cart,
      cart_items: sanitizeCartItems(cart.cart_items || []),
    }))
    .filter((cart) => cart.cart_items.length > 0); // Remove empty carts
};

export const useCartStore = create<CartState>((set, get) => ({
  allCarts: [],

  setAllCarts: (carts) => {
    const sanitizedCarts = sanitizeCarts(carts || []);
    set({ allCarts: sanitizedCarts });
  },

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

    try {
      const { success } = await addToCartAction(input, authToken);
      return success;
    } catch (error) {
      console.error("addItem error:", error);
      return false;
    }
  },

  updateQty: async (cartItemId, qty, authToken) => {
    if (!authToken || !cartItemId) return false;

    try {
      const success = await updateQty(cartItemId, qty, authToken);

      if (!success) {
        console.error("Failed to update quantity via API");
        return false;
      }

      // Update local state optimistically with validation
      set((state) => {
        const updatedCarts = state.allCarts.map((cart) => {
          if (!cart?.cart_items) return cart;
          
          return {
            ...cart,
            cart_items: sanitizeCartItems(
              cart.cart_items.map((item) => {
                if (!item?._id) return item; // Skip invalid items
                
                return item._id === cartItemId
                  ? {
                      ...item,
                      qty,
                      total_price: item.unit_price * qty,
                      total_max_price: item.unit_max_price * qty,
                    }
                  : item;
              })
            ),
          };
        });
        
        return { allCarts: sanitizeCarts(updatedCarts) };
      });

      return true;
    } catch (error) {
      console.error("updateQty error:", error);
      return false;
    }
  },

  removeCartItems: async (itemIds, authToken) => {
    if (!authToken || !itemIds?.length) return false;

    const prevState = get().allCarts;

    try {
      // Optimistic update with validation
      set((state) => {
        const updatedCarts = state.allCarts
          .map((cart) => {
            if (!cart?.cart_items) return cart;
            
            return {
              ...cart,
              cart_items: sanitizeCartItems(
                cart.cart_items.filter((item) => {
                  if (!item?._id) return false; // Remove invalid items
                  return !itemIds.includes(item._id);
                })
              ),
            };
          })
          .filter((cart) => cart.cart_items.length > 0);
        
        return { allCarts: sanitizeCarts(updatedCarts) };
      });

      // API call
      const success = await removeCartItemsApi(itemIds, authToken);

      if (!success) {
        set({ allCarts: prevState });
      }

      return success;
    } catch (error) {
      console.error("removeCartItems error:", error);
      set({ allCarts: prevState });
      return false;
    }
  },

  removeCart: async (storeId, authToken) => {
    if (!authToken || !storeId) return false;

    const prevState = get().allCarts;

    try {
      // Optimistic update with validation
      set((state) => ({
        allCarts: sanitizeCarts(
          state.allCarts.filter((cart) => cart?.store?._id !== storeId)
        ),
      }));

      // API call
      const success = await removeCart(storeId, authToken);

      if (!success) {
        set({ allCarts: prevState });
      }

      return success;
    } catch (error) {
      console.error("removeCart error:", error);
      set({ allCarts: prevState });
      return false;
    }
  },
}));