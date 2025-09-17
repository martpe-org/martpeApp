import useGetMoreOrders from "@/state/useGetMoreOrders";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FetchOrdersListItemType } from "../order/fetch-orders-list-type";
import { AllOrderDetailsCard } from "./AllOrderDetailCard";

interface Props {
  orders: FetchOrdersListItemType[];
  pageSize: number;
  total: number;
}

export function OrdersListWrapper({ orders, pageSize, total }: Props) {
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useGetMoreOrders(orders, {
    pageSize,
    total,
  });

  // Flatten all pages data
  const flattenedOrders = useMemo(() => {
    return data?.pages.flat() ?? [];
  }, [data?.pages]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderOrder = useCallback(
    ({ item }: { item: FetchOrdersListItemType }) => (
      <AllOrderDetailsCard order={item} />
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#ef4444" />
        <Text style={styles.loadingText}>Loading more orders...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders to display</Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: FetchOrdersListItemType) => item._id,
    []
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <FlatList
      data={flattenedOrders}
      renderItem={renderOrder}
      keyExtractor={keyExtractor}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          colors={["#ef4444"]}
          tintColor="#ef4444"
        />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: "#6b7280",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
  separator: {
    height: 12,
  },
});
