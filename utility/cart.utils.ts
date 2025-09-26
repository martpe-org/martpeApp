// utils/cart.utils.ts
import { CartItem } from "@/state/types/cart.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_STORAGE_KEY = "user_cart";

export const sanitizeCartItems = (
  items: (CartItem | undefined | null)[]
): CartItem[] => items.filter((item): item is CartItem => !!item && !!item._id);

export const sanitizeCarts = (carts: Cart[]): Cart[] =>
  carts
    .filter((cart) => !!cart && !!cart.store?._id)
    .map((cart) => ({
      ...cart,
      cart_items: sanitizeCartItems(cart.cart_items || []),
    }))
    .filter((cart) => cart.cart_items.length > 0);

// Transform TanStack Query data to Zustand format
export const transformToZustandFormat = (carts: any[]): Cart[] => {
  if (!Array.isArray(carts)) return [];
  
  return carts.map(cart => ({
    _id: cart._id,
    store: { 
      _id: cart.store?._id || cart.store_id || cart._id 
    },
    cart_items: (cart.cart_items || []).map((item: any) => {
      // Extract base product price from various possible fields
      const baseProductPrice = item.product?.price || 
                              item.base_price || 
                              item.product_price ||
                              item.unit_price || 
                              0;

      // Calculate customization price
      const customizationPrice = (item.selected_customizations || [])
        .reduce((sum: number, customization: any) => {
          return sum + (customization.price?.value || customization.price || 0);
        }, 0);

      return {
        _id: item._id,
        qty: item.qty || 1,
        slug: item.slug || item.product_slug || item.product?.slug || '',
        unit_price: item.unit_price || 0,
        unit_max_price: item.unit_max_price || item.unit_price || 0,
        total_price: item.total_price || (item.unit_price * item.qty) || 0,
        total_max_price: item.total_max_price || (item.unit_max_price * item.qty) || 0,
        store_id: item.store_id || cart.store?._id || cart._id,
        product: {
          name: item.product?.name || item.product_name || '',
          symbol: item.product?.symbol || item.product_image || '',
          price: baseProductPrice, // Preserve the base product price
          quantity: item.qty || 1,
          instock: item.product?.instock !== false,
          customizable: item.product?.customizable || false,
          directlyLinkedCustomGroupIds: item.product?.directlyLinkedCustomGroupIds || [],
          slug: item.product?.slug || item.product_slug || item.slug || '',
        },
        selected_customizations: item.selected_customizations || [],
      };
    })
  })).filter(cart => cart.cart_items.length > 0);
};

export const saveCartToStorage = async (carts: Cart[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carts));
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
};

export const loadCartFromStorage = async (): Promise<Cart[]> => {
  try {
    const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
    return stored ? sanitizeCarts(JSON.parse(stored)) : [];
  } catch (error) {
    console.error("Failed to load cart:", error);
    return [];
  }
};

// Helper to find cart item by ID across all carts
export const findCartItem = (carts: Cart[], cartItemId: string): CartItem | undefined => {
  for (const cart of carts) {
    const item = cart.cart_items.find(item => item._id === cartItemId);
    if (item) return item;
  }
  return undefined;
};

// Helper to find cart by store ID
export const findCartByStoreId = (carts: Cart[], storeId: string): Cart | undefined => {
  return carts.find(cart => cart.store._id === storeId);
};

// Helper to update cart item in the carts array
export const updateCartItemInCarts = (
  carts: Cart[], 
  cartItemId: string, 
  updates: Partial<CartItem>
): Cart[] => {
  return carts.map(cart => ({
    ...cart,
    cart_items: cart.cart_items.map(item => 
      item._id === cartItemId 
        ? { 
            ...item, 
            ...updates,
            // Preserve product price when updating
            product: item.product ? {
              ...item.product,
              price: item.product.price || updates.product?.price || item.unit_price
            } : updates.product
          }
        : item
    )
  }));
};

// Calculate updated prices based on quantity, preserving base product price
export const calculateItemPrices = (item: CartItem, newQty: number): Partial<CartItem> => {
  return {
    qty: newQty,
    total_price: item.unit_price * newQty,
    total_max_price: item.unit_max_price * newQty,
    // Preserve the product price
    product: item.product ? {
      ...item.product,
      quantity: newQty
    } : undefined
  };
};