import { create } from "zustand";
import { removeCart } from "./removeCart";
import { removeCartItems as removeCartItemsApi } from "./removeCartItems";
import { updateQty  } from "./updateQty";
import { addToCartAction } from "./addToCart";

interface CartItem {
  _id: string;
  qty: number;
  unit_price: number;
  unit_max_price: number;
  total_price: number;
  total_max_price: number;
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

// In your useCartStore.ts, update the updateQty action:
updateQty: async (cartItemId, qty, authToken) => {
  if (!authToken || !cartItemId) return false;

  try {
    const success = await updateQty(cartItemId, qty, authToken);

    if (!success) {
      console.error("Failed to update quantity via API");
      return false;
    }

    // Update local state optimistically
    set((state) => {
      const updatedCarts = state.allCarts.map((cart) => ({
        ...cart,
        cart_items: cart.cart_items.map((item) =>
          item._id === cartItemId
            ? {
                ...item,
                qty,
                total_price: item.unit_price * qty,
                total_max_price: item.unit_max_price * qty,
              }
            : item
        ),
      }));
      return { allCarts: updatedCarts };
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

    // Optimistic update
    set((state) => {
      const updatedCarts = state.allCarts
        .map((cart) => ({
          ...cart,
          cart_items: cart.cart_items.filter(
            (item) => !itemIds.includes(item._id)
          ),
        }))
        .filter((cart) => cart.cart_items.length > 0);
      return { allCarts: updatedCarts };
    });

    // API call
    const success = await removeCartItemsApi(itemIds, authToken);

    if (!success) {
      set({ allCarts: prevState });
    }

    return success;
  },

  removeCart: async (storeId, authToken) => {
    if (!authToken || !storeId) return false;

    const prevState = get().allCarts;

    // Optimistic update
    set((state) => ({
      allCarts: state.allCarts.filter(
        (cart) => cart.store._id !== storeId
      ),
    }));

    // API call
    const success = await removeCart(storeId, authToken);

    if (!success) {
      set({ allCarts: prevState });
    }

    return success;
  },
}));
