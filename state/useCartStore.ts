
// useCartStore.ts
import { create } from "zustand";
import { addToCartAction } from "../components/Cart/api/addToCart";
import { removeCart } from "../components/Cart/api/removeCart";
import { removeCartItems as removeCartItemsApi } from "../components/Cart/api/removeCartItems";
import { updateQty as updateQtyApi } from "../components/Cart/api/updateQty";

import { fetchCarts } from "@/app/(tabs)/cart/fetch-carts";
import { CartItem, CartState } from "./cart-init/cartTypes";
import { loadCartFromStorage, sanitizeCartItems, sanitizeCarts, saveCartToStorage, transformToZustandFormat } from "./cart-init/cartHelpers";

export const useCartStore = create<CartState>((set, get) => ({
  allCarts: [],
  appliedOffers: {},

  setAllCarts: (carts) => {
    const sanitized = Array.isArray(carts) && carts[0]?.cartItemsCount !== undefined
      ? transformToZustandFormat(carts)
      : sanitizeCarts(carts || []);
    set({ allCarts: sanitized });
    saveCartToStorage(sanitized);
  },

  loadCartFromStorage: async () => {
    const carts = await loadCartFromStorage();
    set({ allCarts: carts });
  },

  syncCartFromApi: async (authToken) => {
    if (!authToken) return;
    try {
      const carts = await fetchCarts(authToken);
      if (!carts) return;
      const transformed = transformToZustandFormat(carts);
      set({ allCarts: transformed });
      saveCartToStorage(transformed);
    } catch (err) {
      console.error("syncCartFromApi error:", err);
    }
  },

  addItem: async (storeId, slug, catalogId, quantity, customizable, customizations, authToken) => {
    if (!authToken) return false;
    try {
      const { success, data } = await addToCartAction({ store_id: storeId, slug, catalog_id: catalogId, qty: quantity, customizable, customizations }, authToken);
      if (!success || !data) return false;

      set((state) => {
        const updatedCarts = [...state.allCarts];
        const cartIndex = updatedCarts.findIndex(c => c.store._id === storeId);

        const newItem: CartItem = {
          _id: data._id,
          qty: data.qty,
          slug: data.product_slug,
          unit_price: data.unit_price,
          unit_max_price: data.unit_max_price,
          total_price: data.total_price,
          total_max_price: data.total_max_price,
          product: { name: data.product_slug, quantity: data.qty, instock: true },
        };

        if (cartIndex >= 0) {
          updatedCarts[cartIndex].cart_items.push(newItem);
        } else {
          updatedCarts.push({ store: { _id: storeId }, cart_items: [newItem] });
        }

        saveCartToStorage(updatedCarts);
        return { allCarts: sanitizeCarts(updatedCarts) };
      });

      return true;
    } catch (error) {
      console.error("addItem error:", error);
      return false;
    }
  },

  updateQty: async (cartItemId, qty, authToken) => {
    if (!authToken || !cartItemId || qty < 0) return false;
    try {
      const success = await updateQtyApi(cartItemId, qty, authToken);
      if (!success) return false;

      set((state) => {
        const updatedCarts = state.allCarts.map(cart => ({
          ...cart,
          cart_items: sanitizeCartItems(
            cart.cart_items.map(item =>
              item._id === cartItemId
                ? { ...item, qty, total_price: item.unit_price * qty, total_max_price: item.unit_max_price * qty }
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
        const updatedCarts = state.allCarts.map(cart => ({
          ...cart,
          cart_items: sanitizeCartItems(cart.cart_items.filter(item => !itemIds.includes(item._id))),
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
        const updatedCarts = state.allCarts.filter(cart => cart.store._id !== storeId);
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

  updateCartOffer: (cartId, offerId, discount, total) =>
    set((state) => ({
      appliedOffers: { ...state.appliedOffers, [cartId]: { offerId, discount, total } },
    })),

  clearCartOffer: (cartId) =>
    set((state) => {
      const next = { ...state.appliedOffers };
      delete next[cartId];
      return { appliedOffers: next };
    }),
}));
