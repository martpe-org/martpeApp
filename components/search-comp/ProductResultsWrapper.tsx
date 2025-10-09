import React, { FC, useCallback, useMemo, useRef } from "react";
import {
  FlatList,
  Text,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { InteractionManager } from "react-native";
import ProductCard from "./ProductCard";
import useGetMoreProductSearchResults from "@/state/useGetMoreProductSearchResults";
import { StoreBucket } from "../search/search-products-type";
import { styles } from "./searchStyle";
import Loader from "../common/Loader";

interface Props {
  initialData: StoreBucket[];
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
const listDataCache = new Map<string, StoreBucket[]>();

const ProductResultsWrapper: FC<Props> = ({
  initialData,
  pageSize,
  searchParams,
}) => {
  const flatListRef = useRef<FlatList<StoreBucket>>(null);

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
    useGetMoreProductSearchResults({
      pageSize,
      ...searchParams,
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    });

const allProducts = useMemo(() => {
  if (data?.pages?.length) {
    const merged = data.pages.flat();
    listDataCache.set(cacheKey, merged);
    return merged;
  }

  const cachedData = listDataCache.get(cacheKey);
  if (cachedData?.length) return cachedData;

  // Only use initialData if no cache yet
  return initialData || [];
}, [data?.pages, cacheKey, initialData]);

const saveScrollPosition = useCallback((index: number) => {
  scrollPositionCache.set(cacheKey, index);
}, [cacheKey]);


// inside useFocusEffect
useFocusEffect(
  useCallback(() => {
    const savedOffset = scrollPositionCache.get(cacheKey);
    if (savedOffset != null && flatListRef.current) {
      const task = InteractionManager.runAfterInteractions(() => {
        flatListRef.current?.scrollToOffset({
          offset: savedOffset,
          animated: false,
        });
      });
      return () => task.cancel();
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
          <Loader />
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

const renderItem = useCallback(({ item }: { item: StoreBucket }) => {
  const storeData = item.store_info?.hits?.hits?.[0]?._source?.store;
  const storeId = item.key?.store_id; // optional chaining
  if (!storeId) return null; // skip invalid items

  const products = item.top_products.hits.hits.map(hit => ({
    ...hit._source,
    store: storeData,
  }));
  return <ProductCard item={[storeId, products]} />;
}, []);

const keyExtractor = useCallback(
  (item: StoreBucket, index: number) => item.key?.store_id || String(index),
  []
);


  if (!allProducts.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.noResultsText}>No products found</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={allProducts}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.2}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      // Performance tweaks
      removeClippedSubviews
      initialNumToRender={10}
      maxToRenderPerBatch={8}
      windowSize={10}
      onScrollToIndexFailed={() => {}}
    />
  );
};

export default ProductResultsWrapper;
