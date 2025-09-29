import { useInfiniteQuery } from "@tanstack/react-query";
import { FetchOrdersListItemType } from "@/components/order/fetch-orders-list-type";
import { fetchOrderList } from "@/components/order/fetch-orders-list";
import useUserDetails from "@/hook/useUserDetails";

interface UseGetMoreOrdersInput {
  pageSize: number;
  total: number;
}

export default function useGetMoreOrders(
  initialData: FetchOrdersListItemType[],
  input: UseGetMoreOrdersInput
) {
  const { authToken } = useUserDetails(); // 👈 get token correctly

  return useInfiniteQuery<FetchOrdersListItemType[]>({
    queryKey: ["orders"],
    queryFn: async ({ pageParam = 1 }) => {
      if (!authToken) {
        throw new Error("No auth token found");
      }

      const response = await fetchOrderList(
        authToken,
        pageParam.toString(),
        input.pageSize.toString()
      );

      return response?.orders ?? [];
    },
    initialData: { pages: [initialData], pageParams: [1] },
    initialPageParam: 1,
    getNextPageParam(lastPage, allPages) {
      const totalLoadedItems = allPages.reduce(
        (acc, page) => acc + page.length,
        0
      );
      const hasMore = totalLoadedItems < input.total && lastPage.length > 0;
      return hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!authToken, // 👈 only run when token is ready
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: (attemptIndex) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
