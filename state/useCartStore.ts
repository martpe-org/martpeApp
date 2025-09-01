import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeCart } from "./removeCart";
import { removeCartItems as removeCartItemsApi } from "./removeCartItems";
import { updateQty } from "./updateQty";
import { addToCartAction } from "./addToCart";
import { fetchCarts } from "@/app/(tabs)/cart/fetch-carts";
interface CartItem {
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

interface Cart {
  store: { _id: string };
  cart_items: CartItem[];
}

interface CartState {
  allCarts: Cart[];
  setAllCarts: (carts: Cart[]) => void;
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
  updateQty: (
    cartItemId: string,
    qty: number,
    authToken: string | null
  ) => Promise<boolean>;
  removeCartItems: (itemIds: string[], authToken: string | null) => Promise<boolean>;
  removeCart: (storeId: string, authToken: string | null) => Promise<boolean>;
}

const CART_STORAGE_KEY = "user_cart";

// Helpers
const sanitizeCartItems = (items: (CartItem | undefined | null)[]): CartItem[] =>
  items.filter((item): item is CartItem => !!item && !!item._id);

const sanitizeCarts = (carts: Cart[]): Cart[] =>
  carts
    .filter((cart) => !!cart && !!cart.store?._id)
    .map((cart) => ({
      ...cart,
      cart_items: sanitizeCartItems(cart.cart_items || []),
    }))
    .filter((cart) => cart.cart_items.length > 0);

const saveCartToStorage = async (carts: Cart[]) => {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carts));
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
};

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

  // 👇 NEW
  syncCartFromApi: async (authToken) => {
    if (!authToken) return;
    try {
      const carts = await fetchCarts(authToken);
      if (carts) {
        set({ allCarts: sanitizeCarts(carts) });
        saveCartToStorage(carts);
      }
    } catch (err) {
      console.error("syncCartFromApi error:", err);
    }
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
    const { success, data } = await addToCartAction(input, authToken);

    if (success && data) {
      set((state) => {
        const updatedCarts = [...state.allCarts];
        const cartIndex = updatedCarts.findIndex((c) => c.store._id === storeId);

        // ✅ Build a proper cart item from API response
        const newItem: CartItem = {
          _id: data._id,
          qty: data.qty,
          slug: data.product_slug,
          unit_price: data.unit_price,
          unit_max_price: data.unit_max_price,
          total_price: data.total_price,
          total_max_price: data.total_max_price,
          product: {
            name: data.product_slug, // or fetch product details separately
            quantity: data.qty,
            instock: true, // adjust if backend provides
          },
        };

        if (cartIndex >= 0) {
          updatedCarts[cartIndex] = {
            ...updatedCarts[cartIndex],
            cart_items: [...updatedCarts[cartIndex].cart_items, newItem],
          };
        } else {
          updatedCarts.push({
            store: { _id: storeId },
            cart_items: [newItem],
          });
        }

        saveCartToStorage(updatedCarts);
        return { allCarts: sanitizeCarts(updatedCarts) };
      });
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
