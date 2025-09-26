// state/useCartStore.ts
import { create } from "zustand";
import { fetchCarts } from "@/app/(tabs)/cart/fetch-carts";
import { addToCartAction } from "../components/Cart/api/addToCart";
import { removeCart } from "../components/Cart/api/removeCart";
import { removeCartItems as removeCartItemsApi } from "../components/Cart/api/removeCartItems";
import { updateQty } from "../components/Cart/api/updateQty";
import { updateCartItemCustomizationsAction } from "../components/customization/updateCustomizations";
import { Cart, CartItem, CartState } from "./types/cart.types";
import { calculateItemPrices, findCartByStoreId, findCartItem, loadCartFromStorage, sanitizeCarts, saveCartToStorage, transformToZustandFormat, updateCartItemInCarts } from "@/utility/cart.utils";


export const useCartStore = create<CartState>((set, get) => ({
  allCarts: [],
  appliedOffers: {},

  setAllCarts: (carts) => {
    let sanitized: Cart[];
    
    // Check if it's TanStack Query data format
    if (Array.isArray(carts) && carts.length > 0 && carts[0].cartItemsCount !== undefined) {
      // This is TanStack Query format, transform it
      sanitized = transformToZustandFormat(carts);
    } else {
      // This is already in Zustand format
      sanitized = sanitizeCarts(carts || []);
    }
    
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
      if (carts) {
        const transformed = transformToZustandFormat(carts);
        set({ allCarts: transformed });
        saveCartToStorage(transformed);
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
          const cartIndex = updatedCarts.findIndex(
            (c) => c.store._id === storeId
          );

          // Calculate base product price (without customizations)
          const customizationPrice = customizations?.reduce((sum, c) => sum + (c.price?.value || 0), 0) || 0;
          const basePrice = Math.max((data.unit_price || 0) - customizationPrice, 1);

          const newItem: CartItem = {
            _id: data._id,
            qty: data.qty,
            slug: data.product_slug || slug,
            unit_price: data.unit_price,
            unit_max_price: data.unit_max_price || data.unit_price,
            total_price: data.total_price,
            total_max_price: data.total_max_price || data.total_price,
            store_id: storeId,
            product: {
              name: data.product_name || data.product_slug || slug,
              symbol: data.product_image,
              price: basePrice, // Store the base product price
              quantity: data.qty,
              instock: true,
              customizable: customizable,
              directlyLinkedCustomGroupIds: data.directlyLinkedCustomGroupIds || [],
              slug: data.product_slug || slug,
            },
            selected_customizations: customizations || [],
          };

          if (cartIndex >= 0) {
            updatedCarts[cartIndex] = {
              ...updatedCarts[cartIndex],
              cart_items: [...updatedCarts[cartIndex].cart_items, newItem],
            };
          } else {
            updatedCarts.push({
              _id: data.cart_id,
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
        const currentItem = findCartItem(state.allCarts, cartItemId);
        if (!currentItem) return state;

        const priceUpdates = calculateItemPrices(currentItem, qty);
        const updatedCarts = updateCartItemInCarts(state.allCarts, cartItemId, priceUpdates);
        
        saveCartToStorage(updatedCarts);
        return { allCarts: sanitizeCarts(updatedCarts) };
      });

      return true;
    } catch (error) {
      console.error("updateQty error:", error);
      return false;
    }
  },

  updateItemCustomizations: async (
    cartItemId,
    qty,
    productSlug,
    productPrice,
    customizations,
    authToken
  ) => {
    if (!authToken || !cartItemId) return false;

    const prevState = get().allCarts;

    try {
      // Update API first
      const { success } = await updateCartItemCustomizationsAction(
        cartItemId,
        qty,
        productSlug,
        productPrice,
        customizations
      );

      if (!success) return false;

      // Optimistic update - we'll sync with API after
      set((state) => {
        const currentItem = findCartItem(state.allCarts, cartItemId);
        if (!currentItem) return state;

        // Calculate new prices (this might be approximate until we sync with API)
        const customizationPrice = customizations.reduce((sum, c) => sum + (c.price?.value || 0), 0);
        const basePrice = currentItem.product?.price || productPrice;
        const newUnitPrice = basePrice + customizationPrice;
        const newTotalPrice = newUnitPrice * qty;

        const updates: Partial<CartItem> = {
          qty,
          unit_price: newUnitPrice,
          unit_max_price: newUnitPrice,
          total_price: newTotalPrice,
          total_max_price: newTotalPrice,
          selected_customizations: customizations,
          product: currentItem.product ? {
            ...currentItem.product,
            price: basePrice, // Keep the base price intact
            quantity: qty,
          } : undefined
        };

        const updatedCarts = updateCartItemInCarts(state.allCarts, cartItemId, updates);
        saveCartToStorage(updatedCarts);
        return { allCarts: sanitizeCarts(updatedCarts) };
      });

      // Sync with API to get exact prices
      setTimeout(() => {
        get().syncCartFromApi(authToken);
      }, 500);

      return true;
    } catch (error) {
      console.error("updateItemCustomizations error:", error);
      set({ allCarts: prevState }); // Revert on error
      return false;
    }
  },

  removeCartItems: async (itemIds, authToken) => {
    if (!authToken || !itemIds?.length) return false;
    const prevState = get().allCarts;

    try {
      // Optimistic update
      set((state) => {
        const updatedCarts = state.allCarts.map((cart) => ({
          ...cart,
          cart_items: cart.cart_items.filter((item) => !itemIds.includes(item._id)),
        }));
        saveCartToStorage(updatedCarts);
        return { allCarts: sanitizeCarts(updatedCarts) };
      });

      const success = await removeCartItemsApi(itemIds, authToken);
      if (!success) {
        set({ allCarts: prevState }); // Revert on failure
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

  // Offer actions
  updateCartOffer: (cartId, offerId, discount, total) =>
    set((state) => ({
      appliedOffers: {
        ...state.appliedOffers,
        [cartId]: { offerId, discount, total },
      },
    })),

  clearCartOffer: (cartId) =>
    set((state) => {
      const next = { ...state.appliedOffers };
      delete next[cartId];
      return { appliedOffers: next };
    }),

  // Helper methods
  getCartItem: (cartItemId) => {
    const state = get();
    return findCartItem(state.allCarts, cartItemId);
  },

  getCartByStoreId: (storeId) => {
    const state = get();
    return findCartByStoreId(state.allCarts, storeId);
  },
}));