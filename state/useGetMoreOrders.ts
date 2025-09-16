import { useInfiniteQuery } from '@tanstack/react-query';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FetchOrdersListItemType } from '@/components/order/fetch-orders-list-type';
import { fetchOrderList } from '@/components/order/fetch-orders-list';

interface UseGetMoreOrdersInput {
  pageSize: number;
  total: number;
}

export default function useGetMoreOrders(
  initialData: FetchOrdersListItemType[],
  input: UseGetMoreOrdersInput
) {
  return useInfiniteQuery<FetchOrdersListItemType[]>({
    queryKey: ['orders'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const authToken = await AsyncStorage.getItem('auth-token');
        
        if (!authToken) {
          throw new Error('No auth token found');
        }

        const response = await fetchOrderList(
          authToken,
          pageParam.toString(),
          input.pageSize.toString()
        );

        return response?.orders ?? [];
      } catch (error) {
        console.error('Error fetching more orders:', error);
        throw new Error('Failed to fetch orders');
      }
    },
    initialData: { pages: [initialData], pageParams: [1] },
    initialPageParam: 1,
    getNextPageParam(lastPage, allPages) {
      const totalLoadedItems = allPages.reduce((acc, page) => acc + page.length, 0);
      const hasMore = totalLoadedItems < input.total && lastPage.length > 0;
      return hasMore ? allPages.length + 1 : undefined;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}