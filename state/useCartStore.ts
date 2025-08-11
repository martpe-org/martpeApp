import { create } from "zustand";
import { addToCartAction } from "./addToCart";
import { removeCartAction } from "./removeCart";
import { removeCartItemsAction } from "./removeCartItems";
import { updateCartItemQtyAction } from "./updateQty";
import { updateCartItemCustomizationsAction } from "./updateCustomizations";

// Define Cart types based on the API responses
interface CartItem {
  _id: string;
  product_slug: string;
  user_id: string;
  store_id: string;
  catalog_id: string;
  qty: number;
  unit_price: number;
  total_price: number;
  unit_max_price: number;
  total_max_price: number;
  customizable: boolean;
  customization_hash?: string;
  selected_customizations?: SelectedCustomization[];
  dynamicId?: string;
}

interface SelectedCustomization {
  groupId: string;
  name: string;
  optionId: string;
}

interface Store {
  id: string;
  name?: string;
}

interface Cart {
  store: Store;
  items: CartItem[];
  total_price: number;
  total_max_price: number;
}

type State = {
  allCarts: Cart[];
  loading: boolean;
  error: string | null;
};

type Action = {
  addItem: (
    storeId: string,
    slug: string,
    catalogId: string,
    quantity: number,
    customizable: boolean,
    customizations?: { groupId: string; optionId: string; name: string; }[]
  ) => Promise<boolean>;
  updateItemQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeCartItems: (cartItemIds: string[]) => Promise<boolean>;
  removeCart: (storeId: string) => Promise<boolean>;
  updateItemCustomizations: (
    cartItemId: string,
    qty: number,
    product_slug: string,
    product_price: any,
    selected_customizations: SelectedCustomization[]
  ) => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshCarts: () => Promise<void>;
};

const initialState: State = {
  allCarts: [],
  loading: false,
  error: null,
};

export const useCartStore = create<State & Action>((set, get) => ({
  ...initialState,

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  refreshCarts: async () => {
    // This function would need to be implemented based on your API
    // for fetching all carts. Since it's not provided in the files,
    // I'll leave it as a placeholder
    console.log("refreshCarts: Implementation needed for fetching all carts");
  },

  addItem: async (storeId, slug, catalogId, quantity, customizable, customizations) => {
    set({ loading: true, error: null });
    
    try {
      const result = await addToCartAction({
        store_id: storeId,
        slug,
        catalog_id: catalogId,
        qty: quantity,
        customizable,
        customizations,
      });

      if (result.success && result.data) {
        // Update the cart state with the new item
        set((state) => {
          const updatedCarts = [...state.allCarts];
          const existingCartIndex = updatedCarts.findIndex(
            cart => cart.store.id === storeId
          );

          if (existingCartIndex >= 0) {
            // Add item to existing cart
            updatedCarts[existingCartIndex].items.push(result.data as CartItem);
            // Recalculate cart totals
            const cart = updatedCarts[existingCartIndex];
            cart.total_price = cart.items.reduce((sum, item) => sum + item.total_price, 0);
            cart.total_max_price = cart.items.reduce((sum, item) => sum + item.total_max_price, 0);
          } else {
            // Create new cart for this store
            updatedCarts.push({
              store: { id: storeId },
              items: [result.data as CartItem],
              total_price: result.data.total_price,
              total_max_price: result.data.total_max_price,
            });
          }

          return { allCarts: updatedCarts, loading: false };
        });
        return true;
      } else {
        set({ error: "Failed to add item to cart", loading: false });
        return false;
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      set({ error: "Error adding item to cart", loading: false });
      return false;
    }
  },

  updateItemQuantity: async (cartItemId, quantity) => {
    set({ loading: true, error: null });
    
    try {
      const result = await updateCartItemQtyAction(cartItemId, quantity);
      
      if (result.success) {
        // Update the cart state
        set((state) => {
          const updatedCarts = state.allCarts.map((cart) => {
            const updatedItems = cart.items.map((item) => {
              if (item._id === cartItemId) {
                const updatedItem = { ...item, qty: quantity };
                // Recalculate prices based on new quantity
                updatedItem.total_price = updatedItem.unit_price * quantity;
                updatedItem.total_max_price = updatedItem.unit_max_price * quantity;
                return updatedItem;
              }
              return item;
            });

            // Recalculate cart totals
            const total_price = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
            const total_max_price = updatedItems.reduce((sum, item) => sum + item.total_max_price, 0);

            return { ...cart, items: updatedItems, total_price, total_max_price };
          });

          return { allCarts: updatedCarts, loading: false };
        });
        return true;
      } else {
        set({ error: "Failed to update item quantity", loading: false });
        return false;
      }
    } catch (error) {
      console.error("Error updating item quantity:", error);
      set({ error: "Error updating item quantity", loading: false });
      return false;
    }
  },

  removeCartItems: async (cartItemIds) => {
    set({ loading: true, error: null });
    
    try {
      const result = await removeCartItemsAction(cartItemIds);
      
      if (result.success) {
        // Remove items from cart state
        set((state) => {
          const updatedCarts = state.allCarts.map((cart) => {
            const updatedItems = cart.items.filter(
              item => !cartItemIds.includes(item._id)
            );

            // Recalculate cart totals
            const total_price = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
            const total_max_price = updatedItems.reduce((sum, item) => sum + item.total_max_price, 0);

            return { ...cart, items: updatedItems, total_price, total_max_price };
          }).filter(cart => cart.items.length > 0); // Remove empty carts

          return { allCarts: updatedCarts, loading: false };
        });
        return true;
      } else {
        set({ error: "Failed to remove cart items", loading: false });
        return false;
      }
    } catch (error) {
      console.error("Error removing cart items:", error);
      set({ error: "Error removing cart items", loading: false });
      return false;
    }
  },

  removeCart: async (storeId) => {
    set({ loading: true, error: null });
    
    try {
      const result = await removeCartAction(storeId);
      
      if (result.success) {
        // Remove cart from state
        set((state) => {
          const updatedCarts = state.allCarts.filter(
            cart => cart.store.id !== storeId
          );
          return { allCarts: updatedCarts, loading: false };
        });
        return true;
      } else {
        set({ error: "Failed to remove cart", loading: false });
        return false;
      }
    } catch (error) {
      console.error("Error removing cart:", error);
      set({ error: "Error removing cart", loading: false });
      return false;
    }
  },

  updateItemCustomizations: async (cartItemId, qty, product_slug, product_price, selected_customizations) => {
    set({ loading: true, error: null });
    
    try {
      const result = await updateCartItemCustomizationsAction(
        cartItemId,
        qty,
        product_slug,
        product_price,
        selected_customizations
      );
      
      if (result.success) {
        // Update item customizations in state
        set((state) => {
          const updatedCarts = state.allCarts.map((cart) => {
            const updatedItems = cart.items.map((item) => {
              if (item._id === cartItemId) {
                return {
                  ...item,
                  qty,
                  selected_customizations,
                  // Update prices if needed
                  total_price: product_price * qty,
                };
              }
              return item;
            });

            // Recalculate cart totals
            const total_price = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
            const total_max_price = updatedItems.reduce((sum, item) => sum + item.total_max_price, 0);

            return { ...cart, items: updatedItems, total_price, total_max_price };
          });

          return { allCarts: updatedCarts, loading: false };
        });
        return true;
      } else {
        set({ error: "Failed to update item customizations", loading: false });
        return false;
      }
    } catch (error) {
      console.error("Error updating item customizations:", error);
      set({ error: "Error updating item customizations", loading: false });
      return false;
    }
  },
}));