import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { StyleSheet, FlatList, View, ActivityIndicator, Text, Animated } from "react-native";
import PersonalCareCard, { CatalogItem } from "./PersonalCareCard";

interface Props {
  catalog: CatalogItem[];
  providerId?: string | string[];
  searchString: string;
  selectedCategory?: string;
}

const BATCH_SIZE = 10;

const PersonalCareCardContainer: React.FC<Props> = ({ catalog, providerId, searchString, selectedCategory }) => {
  const flatListRef = useRef<FlatList>(null);
  const [visibleItems, setVisibleItems] = useState<CatalogItem[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
const safeSearch = searchString?.trim() || "";

  const filteredCatalog = useMemo(() => {
    let filtered = catalog?.filter(Boolean) || [];
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category_id === selectedCategory);
    }
if (safeSearch !== "") {
  filtered = filtered.filter((item) =>
    item?.descriptor?.name?.toLowerCase().includes(safeSearch.toLowerCase())
  );

    }
    return filtered;
  }, [catalog, selectedCategory, searchString]);

  // Initialize visible items on filteredCatalog change
  useEffect(() => {
    setVisibleItems(filteredCatalog.slice(0, BATCH_SIZE));
  }, [filteredCatalog]);

  // Load next batch
  const loadMoreItems = useCallback(() => {
    if (isLoadingMore) return;
    if (visibleItems.length >= filteredCatalog.length) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      setVisibleItems((prev) => {
        const nextBatch = filteredCatalog.slice(prev.length, prev.length + BATCH_SIZE);
        return [...prev, ...nextBatch];
      });
      setIsLoadingMore(false);
    }, 200);
  }, [isLoadingMore, filteredCatalog, visibleItems.length]);

  const renderItem = ({ item, index }: { item: CatalogItem; index: number }) => {
    const { id, catalog_id, descriptor, price, provider, store, store_id, slug, provider_id, bpp_id } = item;

    const value = price?.value || 0;
    const maxValue = price?.maximum_value || 0;
    const discount = maxValue && maxValue > value ? Math.round(((maxValue - value) / maxValue) * 100) : 0;

    const image = descriptor?.images?.[0];
    const symbol = descriptor?.symbol;

    const resolveStoreId = (): string | undefined => {
      if (provider?.store_id && provider.store_id !== "unknown-store") return provider.store_id;
      if (store?._id && store._id !== "unknown-store") return store._id;
      if (store_id && store_id !== "unknown-store") return store_id;
      if (providerId && typeof providerId === "string" && providerId !== "unknown-store") return providerId;
      if (provider_id && provider_id !== "unknown-store") return provider_id;
      if (bpp_id && bpp_id !== "unknown-store") return bpp_id;
      return undefined;
    };

    const resolvedStoreId = resolveStoreId();

    const itemData = { id, catalog_id, provider, provider_id, store_id: resolvedStoreId, store };

    return (
      <PersonalCareCard
        key={`${id}-${catalog_id}-${index}`}
        title={descriptor?.name}
        description={descriptor?.long_desc}
        price={value}
        maxValue={maxValue}
        discount={discount}
        image={image}
        symbol={symbol}
        id={id}
        providerId={resolvedStoreId}
        catalogId={catalog_id}
        slug={slug || id}
        item={itemData}
      />
    );
  };

  if (selectedCategory && selectedCategory !== "All" && filteredCatalog.length === 0) {
    return <NoItemsDisplay category={selectedCategory} />;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={visibleItems}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.id}-${item.catalog_id}-${index}`} // ✅ Unique keys
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 10 }}
      onEndReached={loadMoreItems}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="small" color="#999" />
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 10 }}
    />
  );
};

// ✅ Animated "No Items" Component
const NoItemsDisplay: React.FC<{ category: string }> = ({ category }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[noItemsStyles.container, { opacity: fadeAnim, transform: [{ scale: bounceAnim }] }]}>
      <Text style={noItemsStyles.emoji}>🧴</Text>
      <Text style={noItemsStyles.title}>No Products Found</Text>
      <Text style={noItemsStyles.subtitle}>
        No items available in <Text style={{ fontWeight: "bold" }}>{category}</Text>
      </Text>
    </Animated.View>
  );
};

export default PersonalCareCardContainer;

const noItemsStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50, marginBottom: 50, paddingHorizontal: 20 },
  emoji: { fontSize: 48, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 6, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#777", textAlign: "center", lineHeight: 20 },
});
