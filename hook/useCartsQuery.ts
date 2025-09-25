import { fetchCarts } from "@/app/(tabs)/cart/fetch-carts";
import { FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";
import { useCartStore } from "@/state/useCartStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useCartsQuery = (authToken?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery<FetchCartType[], Error>({
    queryKey: ["carts", authToken],
    queryFn: () => fetchCarts(authToken!),
    enabled: !!authToken,
    select: (fetchedCarts) => {
      if (!Array.isArray(fetchedCarts)) return [];
      return fetchedCarts.map(cart => ({
        ...cart,
        store: cart.store ?? {
          _id: cart.store_id || cart._id,
          name: cart.store?.name || "Unknown Store",
          slug: cart.store?.slug || "",
        },
      }));
    },
  });

  // Sync with Zustand whenever API data changes
  useEffect(() => {
    if (query.data) {
      useCartStore.getState().setAllCarts(query.data);
    }
  }, [query.data]);

  const refreshCarts = async () => {
    await queryClient.invalidateQueries({ queryKey: ["carts", authToken] });
  };

  return { ...query, refreshCarts };
};
