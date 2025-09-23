import React, { FC, useCallback, useMemo, useRef } from "react";
import {
  FlatList,
  ActivityIndicator,
  Text,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import StoreCard from "./StoreCard";
import { StoreSearchResult } from "../search/search-stores-type";
import useGetMoreStoreSearchResults from "@/state/useGetMoreStoreSearchResults";
import { styles } from "./searchStyle";
import { useFocusEffect } from "@react-navigation/native";

interface Props {
  initialData: StoreSearchResult[];
  total: number;
  pageSize: number;
  searchParams: {
    query: string;
    lat: number;
    lon: number;
    pincode: string;
    domain?: string;
    category?: string;
    quicksearch?: string;
  };
}

// Global caches
const scrollPositionCache = new Map<string, number>();
const listDataCache = new Map<string, StoreSearchResult[]>();

const StoreResultsWrapper: FC<Props> = ({
  initialData,
  total,
  pageSize,
  searchParams,
}) => {
  const flatListRef = useRef<FlatList<StoreSearchResult>>(null);

  // Unique cache key for this search
  const cacheKey = useMemo(
    () =>
      JSON.stringify({
        query: searchParams.query,
        lat: searchParams.lat,
        lon: searchParams.lon,
        pincode: searchParams.pincode,
        domain: searchParams.domain,
        category: searchParams.category,
        quicksearch: searchParams.quicksearch,
      }),
    [searchParams]
  );

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useGetMoreStoreSearchResults({
      pageSize,
      total,
      ...searchParams,
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    });

  // Merge pages & update cache
  const allStores = useMemo(() => {
    let merged: StoreSearchResult[] = [];

    if (data?.pages?.length) {
      merged = data.pages.flat();
    } else if (listDataCache.has(cacheKey)) {
      merged = listDataCache.get(cacheKey)!;
    } else {
      merged = initialData || [];
    }

    if (merged.length) {
      listDataCache.set(cacheKey, merged);
    }

    return merged;
  }, [data?.pages, initialData, cacheKey]);

  // Save scroll position
  const saveScrollPosition = useCallback(
    (offset: number) => {
      scrollPositionCache.set(cacheKey, offset);
    },
    [cacheKey]
  );

  // Restore scroll position on focus
  useFocusEffect(
    useCallback(() => {
      const savedOffset = scrollPositionCache.get(cacheKey);
      if (savedOffset != null && flatListRef.current) {
        const id = setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: savedOffset,
            animated: false,
          });
        }, 150); // small delay so list renders
        return () => clearTimeout(id);
      }
    }, [cacheKey])
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      saveScrollPosition(event.nativeEvent.contentOffset.y);
    },
    [saveScrollPosition]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color="#FB3E44" />
        </View>
      );
    }
    if (!hasNextPage) {
      return (
        <View style={styles.endMessage}>
          <Text style={styles.endMessageText}>You have reached the end</Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: StoreSearchResult }) => <StoreCard item={item} />,
    []
  );

  if (!allStores.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.noResultsText}>No stores found</Text>
      </View>
    );
  }

  return (
    <View style={styles.storeGrid}>
      <FlatList
        ref={flatListRef}
        data={allStores}
        keyExtractor={(item, index) => `${item.slug}-${index}`}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.storeRow}
        contentContainerStyle={styles.storeListContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // Performance tweaks
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={10}
      />
    </View>
  );
};

export default StoreResultsWrapper;
