import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import { StoreSearchResult } from "@/components/search/search-stores-type";
import { searchStores } from "@/components/search/search-stores";

export default function useGetMoreStoreSearchResults(input: {
  pageSize: number;
  query: string;
  total: number;
  lat: number;
  lon: number;
  pincode: string;
  domain?: string;
  category?: string;
  quicksearch?: string;
}) {
  return useInfiniteQuery<StoreSearchResult[]>({
    queryKey: [
      "search",
      "stores",
      input.query,
      input.pincode,
      input.lat,
      input.lon,
      input.domain,
      input.category,
      input.quicksearch,
    ],
    // ✅ FIX: correct typing for pageParam
    queryFn: async ({ pageParam = 1 }: QueryFunctionContext) => {
      const res = await searchStores({
        query: input.query,
        lat: input.lat,
        lon: input.lon,
        pincode: input.pincode,
        domain: input.domain,
        category: input.category,
        quicksearch: input.quicksearch,
      //  page: pageParam,
        size: input.pageSize,
      });

      return res?.results ?? [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < input.pageSize) return undefined;
      return allPages.length + 1;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
