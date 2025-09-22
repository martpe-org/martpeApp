import { fetchCarts } from "@/app/(tabs)/cart/fetch-carts";
import { FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";
import { useCartStore } from "@/state/useCartStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";


export const useCartsQuery = (authToken?: string) => {
  const queryClient = useQueryClient();
  const lastCartsData = useRef<string>("");

  const query = useQuery<FetchCartType[], Error>({
    queryKey: ["carts", authToken],
    queryFn: () => fetchCarts(authToken!),
    enabled: !!authToken,
    select: (fetchedCarts) => {
      if (!Array.isArray(fetchedCarts)) return [];
      return fetchedCarts
        .filter(cart => cart && (cart.cart_items?.length > 0 || cart.cartItemsCount > 0))
        .map(cart => ({
          ...cart,
          store: cart.store ?? {
            _id: cart.store_id || cart._id,
            name: cart.store?.name || "Unknown Store",
            slug: cart.store?.slug || "",
          },
        }));
    },
  });

  // Sync with Zustand
  useEffect(() => {
    if (!query.data) return;
    const cartsDataString = JSON.stringify(
      query.data.map(c => ({ id: c._id, items: c.cart_items?.length || c.cartItemsCount || 0 }))
    );
    if (cartsDataString !== lastCartsData.current) {
      lastCartsData.current = cartsDataString;
      useCartStore.getState().setAllCarts(query.data);
    }
  }, [query.data]);

  const refreshCarts = () => {
    queryClient.invalidateQueries({ queryKey: ["carts", authToken] });
  };

  return { ...query, refreshCarts };
};
