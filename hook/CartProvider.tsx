import { CartItemStateType, SelectedCustomizationType } from "@/components/user/fetch-user-type";
import React, { createContext, useContext, ReactNode, useState } from "react";
import { create, StoreApi, UseBoundStore } from "zustand";


// Types
interface CartStoreType {
  items: CartItemStateType[];
  count: number;
}

interface CartActions {
  initUserCart: (items: CartItemStateType[], count: number) => void;
  addItem: (item: CartItemStateType) => void;
  updateItemQty: (id: string, qty: number, diff: number) => void;
  updateItemCustomizations: (
    id: string,
    customizations: SelectedCustomizationType[],
    itemTotalPrice: number
  ) => void;
  removeItem: (id: string) => void;
  removeCart: (
    store_id: string,
    cartItemsCount?: number,
    cartItemIds?: string[]
  ) => void;
  resetCart: () => void;
  reorder: (items: CartItemStateType[]) => void;
}

type CartStore = CartStoreType & CartActions;

// Store creation function
const createCartStore = (items: CartItemStateType[], count: number) =>
  create<CartStore>((set, get) => ({
    items: Array.isArray(items) ? items : [],
    count: typeof count === "number" ? count : 0,

    // Actions
    initUserCart: (items, count) =>
      set({
        items: Array.isArray(items) ? items : [],
        count: typeof count === "number" ? count : 0,
      }),

    addItem: (item) =>
      set((state) => {
        const currentItems = Array.isArray(state.items) ? state.items : [];
        return {
          count: state.count + 1,
          items: [...currentItems, item],
        };
      }),

    updateItemQty: (id, quantity, diff) =>
      set((state) => {
        const itemToUpdate = state.items.find((item) => item._id === id);
        if (!itemToUpdate) return state;

        return {
          count: state.count + diff,
          items: state.items.map((item) =>
            item._id === id ? { ...item, qty: quantity } : item
          ),
        };
      }),

    removeItem: (id: string) =>
      set((state) => {
        const itemToRemove = state.items.find((item) => item._id === id);
        if (!itemToRemove) return state;

        return {
          count: state.count - itemToRemove.qty,
          items: state.items.filter((item) => item._id !== id),
        };
      }),

    updateItemCustomizations: (id, customizations, itemTotalPrice) =>
      set((state) => {
        const itemToUpdate = state.items.find((item) => item._id === id);
        if (!itemToUpdate) return state;

        return {
          items: state.items.map((item) =>
            item._id === id
              ? {
                  ...item,
                  selected_customizations: customizations,
                  total_price: itemTotalPrice,
                }
              : item
          ),
        };
      }),

    removeCart: (store_id, cartItemsCount, cartItemIds) => {
      if (cartItemIds && cartItemIds.length) {
        return set((state) => {
          const removedItemsCount = state.items
            .filter((item) => cartItemIds.includes(item._id))
            .reduce((acc, item) => acc + item.qty, 0);

          return {
            items: state.items.filter(
              (item) => !cartItemIds.includes(item._id)
            ),
            count: state.count - removedItemsCount,
          };
        });
      } else {
        if (!cartItemsCount) {
          return set((state) => {
            const removedItemsCount = state.items
              .filter((item) => item.store_id === store_id)
              .reduce((acc, item) => acc + item.qty, 0);

            return {
              items: state.items.filter((item) => item.store_id !== store_id),
              count: state.count - removedItemsCount,
            };
          });
        } else {
          return set((state) => ({
            items: state.items.filter((item) => item.store_id !== store_id),
            count: state.count - cartItemsCount,
          }));
        }
      }
    },

    resetCart: () => set({ items: [], count: 0 }),

    reorder: (items) =>
      set((state) => {
        const newItemsCount = items.reduce((acc, item) => acc + item.qty, 0);
        
        // Remove any existing items from the same stores to avoid duplicates
        const storeIds = items.map(item => item.store_id);
        const filteredCurrentItems = state.items.filter(
          item => !storeIds.includes(item.store_id)
        );
        
        const currentItemsCount = state.items
          .filter(item => storeIds.includes(item.store_id))
          .reduce((acc, item) => acc + item.qty, 0);

        return {
          items: [...filteredCurrentItems, ...items],
          count: state.count - currentItemsCount + newItemsCount,
        };
      }),
  }));

// Context
type CartStoreHook = UseBoundStore<StoreApi<CartStore>>;
const CartContext = createContext<CartStoreHook | null>(null);

// Custom hook for accessing cart store
export const useCart = () => {
  const store = useContext(CartContext);
  if (!store) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return store;
};

// Provider component
interface CartProviderProps {
  items?: CartItemStateType[];
  count?: number;
  children: ReactNode;
}

export default function CartProvider({
  items = [],
  count = 0,
  children,
}: CartProviderProps) {
  const [store] = useState(() => createCartStore(items, count));

  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}