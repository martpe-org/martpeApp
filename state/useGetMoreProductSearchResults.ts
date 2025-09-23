import { searchProducts } from "@/components/search/search-products";
import { SearchProductsResponseType } from "@/components/search/search-products-type";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useGetMoreProductSearchResults(
  input: {
    pageSize: number;
    query: string;
    lat: number;
    lon: number;
    pincode: string;
    domain?: string;
    category?: string;
    quicksearch?: string;
  },
) {
  return useInfiniteQuery<
    SearchProductsResponseType["buckets"], // TQueryFnData
    Error,                                // TError
    SearchProductsResponseType["buckets"], // TData
    any[],                                // TQueryKey
    string                                // TPageParam
  >({
    queryKey: [
      "search",
      "products",
      input.query,
      input.pincode,
      input.lat,
      input.lon,
      input.domain,
      input.category,
      input.quicksearch,
    ],
    queryFn: async ({ pageParam }): Promise<SearchProductsResponseType["buckets"]> => {
      const res = await searchProducts({
        lat: input.lat,
        lon: input.lon,
        pincode: input.pincode,
        query: input.query,
        afterkey: pageParam || "",
        domain: input.domain,
        category: input.category,
        groupbystore: true,
        size: input.pageSize,
        quicksearch: input.quicksearch,
      });

      return res ? res.buckets : [];
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) =>
      lastPage?.length > 0 ? lastPage[lastPage.length - 1].key.store_id : undefined,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
