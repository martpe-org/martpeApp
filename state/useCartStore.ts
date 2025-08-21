import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  loadCartFromStorage: () => Promise<void>;
addItem: (
  storeId: string,
  slug: string,
  catalogId: string,
  quantity: number,
  customizable: boolean,
  customizations: any[],
  authToken: string | null   // ✅ allow null
) => Promise<boolean>;

updateQty: (
  cartItemId: string,
  qty: number,
  authToken: string | null   // ✅ allow null
) => Promise<boolean>;

removeCartItems: (itemIds: string[], authToken: string | null) => Promise<boolean>;
removeCart: (storeId: string, authToken: string | null) => Promise<boolean>;

}

const CART_STORAGE_KEY = "user_cart";

// Helper function to filter out invalid cart items
const sanitizeCartItems = (items: (CartItem | undefined | null)[]): CartItem[] => {
  return items.filter((item): item is CartItem => !!item && !!item._id);
};

// Helper function to sanitize carts
const sanitizeCarts = (carts: Cart[]): Cart[] => {
  return carts
    .filter((cart) => !!cart && !!cart.store?._id)
    .map((cart) => ({
      ...cart,
      cart_items: sanitizeCartItems(cart.cart_items || []),
    }))
    .filter((cart) => cart.cart_items.length > 0);
};

// Save carts to storage
const saveCartToStorage = async (carts: Cart[]) => {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carts));
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
};

// Load carts from storage
const loadCartFromStorage = async (): Promise<Cart[]> => {
  try {
    const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
    return stored ? sanitizeCarts(JSON.parse(stored)) : [];
  } catch (error) {
    console.error("Failed to load cart:", error);
    return [];
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  allCarts: [],

  setAllCarts: (carts) => {
    const sanitized = sanitizeCarts(carts || []);
    set({ allCarts: sanitized });
    saveCartToStorage(sanitized);
  },

  loadCartFromStorage: async () => {
    const carts = await loadCartFromStorage();
    set({ allCarts: carts });
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
      if (success) {
        // reload from API or optimistically update state
        const updatedCarts = [...get().allCarts]; // for now keep same
        set({ allCarts: updatedCarts });
        saveCartToStorage(updatedCarts);
      }
      return success;
    } catch (error) {
      console.error("addItem error:", error);
      return false;
    }
  },

  updateQty: async (cartItemId, qty, authToken) => {
    if (!authToken || !cartItemId) return false;

    if (qty < 0) return false;

    try {
      const success = await updateQty(cartItemId, qty, authToken);

      if (!success) return false;

      set((state) => {
        const updatedCarts = state.allCarts.map((cart) => ({
          ...cart,
          cart_items: sanitizeCartItems(
            cart.cart_items.map((item) =>
              item._id === cartItemId
                ? {
                    ...item,
                    qty,
                    total_price: item.unit_price * qty,
                    total_max_price: item.unit_max_price * qty,
                  }
                : item
            )
          ),
        }));
        saveCartToStorage(updatedCarts);
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
      set((state) => {
        const updatedCarts = state.allCarts.map((cart) => ({
          ...cart,
          cart_items: sanitizeCartItems(
            cart.cart_items.filter((item) => !itemIds.includes(item._id))
          ),
        }));
        saveCartToStorage(updatedCarts);
        return { allCarts: sanitizeCarts(updatedCarts) };
      });

      const success = await removeCartItemsApi(itemIds, authToken);
      if (!success) set({ allCarts: prevState });
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
      set((state) => {
        const updatedCarts = state.allCarts.filter(
          (cart) => cart.store._id !== storeId
        );
        saveCartToStorage(updatedCarts);
        return { allCarts: sanitizeCarts(updatedCarts) };
      });

      const success = await removeCart(storeId, authToken);
      if (!success) set({ allCarts: prevState });
      return success;
    } catch (error) {
      console.error("removeCart error:", error);
      set({ allCarts: prevState });
      return false;
    }
  },
}));
