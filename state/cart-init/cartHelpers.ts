// cartHelpers.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Cart, CartItem } from "./cartTypes";

const CART_STORAGE_KEY = "user_cart";

export const sanitizeCartItems = (items: (CartItem | null | undefined)[]): CartItem[] =>
  items.filter((item): item is CartItem => !!item && !!item._id);

export const sanitizeCarts = (carts: Cart[]): Cart[] =>
  carts
    .filter((cart) => !!cart && !!cart.store?._id)
    .map((cart) => ({
      ...cart,
      cart_items: sanitizeCartItems(cart.cart_items || []),
    }))
    .filter((cart) => cart.cart_items.length > 0);

export const transformToZustandFormat = (carts: any[]): Cart[] => {
  if (!Array.isArray(carts)) return [];
  return carts
    .map((cart) => ({
      store: { _id: cart.store?._id || cart.store_id || cart._id },
      cart_items: (cart.cart_items || []).map((item: any) => ({
        _id: item._id,
        qty: item.qty || 1,
        slug: item.slug || item.product_slug || "",
        unit_price: item.unit_price || 0,
        unit_max_price: item.unit_max_price || 0,
        total_price: item.total_price || 0,
        total_max_price: item.total_max_price || 0,
        product: {
          name: item.product?.name || item.product_slug || "",
          symbol: item.product?.symbol || "",
          quantity: item.qty || 1,
          instock: item.product?.instock !== false,
        },
      })),
    }))
    .filter((cart) => cart.cart_items.length > 0);
};

export const saveCartToStorage = async (carts: Cart[]) => {
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
