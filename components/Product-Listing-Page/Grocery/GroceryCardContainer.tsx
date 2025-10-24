import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
  FlatList,
  ActivityIndicator,
} from "react-native";
import GroceryCard, { CatalogItem } from "./GroceryCard";

interface GroceryCardContainerProps {
  catalog: CatalogItem[];
  selectedCategory?: string;
  searchString: string;
  storeId: string;
  storeName: string;
}

const CARD_SPACING = Dimensions.get("window").width * 0.03;
const BATCH_SIZE = 10;

const GroceryCardContainer: React.FC<GroceryCardContainerProps> = ({
  catalog,
  selectedCategory,
  searchString,
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // ✅ Stable filtered catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchesCategory =
        !selectedCategory || selectedCategory === "All"
          ? true
          : item.category_id === selectedCategory;
      const matchesSearch = searchString
        ? item.descriptor?.name
            ?.toLowerCase()
            ?.includes(searchString.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [catalog, selectedCategory, searchString]);

  // Reset indices when catalog / filter changes
  useEffect(() => {
    setStartIndex(0);
    setEndIndex(BATCH_SIZE);
  }, [filteredCatalog]);

  const visibleItems = useMemo(() => {
    return filteredCatalog.slice(startIndex, endIndex);
  }, [filteredCatalog, startIndex, endIndex]);

  const loadMoreItems = useCallback(() => {
    if (isLoadingMore) return;
    if (endIndex >= filteredCatalog.length) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      setEndIndex((prev) => Math.min(filteredCatalog.length, prev + BATCH_SIZE));
      setIsLoadingMore(false);
    }, 200);
  }, [endIndex, filteredCatalog.length, isLoadingMore]);

  const renderItem = ({ item }: { item: CatalogItem }) => {
    const value = item.price?.value || 0;
    const max = item.price?.maximum_value || 0;
    const offerPercent =
      typeof item.price?.offerPercent === "number"
        ? item.price.offerPercent
        : max > 0
        ? Math.round(((max - value) / max) * 100)
        : 0;

    const directlyLinkedCustomGroupIds =
      item.customizations
        ?.map((c) => c.groupId || c.group_id || c._id || c.id)
        .filter(Boolean) || [];

    return (
      <View
        key={item.catalog_id || item.id}
        style={{ marginRight: CARD_SPACING, marginBottom: CARD_SPACING }}
      >
        <GroceryCard
          id={item.id}
          itemName={item.descriptor?.name || "Unnamed Product"}
          cost={value}
          maxLimit={item.quantity?.maximum?.count}
          providerId={item.store_id}
          slug={item.slug || item.id}
          catalogId={item.catalog_id}
          symbol={item.descriptor?.symbol}
          image={item.descriptor?.symbol}
          weight={item.weight}
          unit={item.unit}
          originalPrice={max}
          discount={offerPercent}
          item={item}
          customizable={item.customizable || false}
          directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
        />
      </View>
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
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-evenly", paddingHorizontal: 10 }}
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
      <Text style={noItemsStyles.emoji}>🛒</Text>
      <Text style={noItemsStyles.title}>No Products Found</Text>
      <Text style={noItemsStyles.subtitle}>
        No items available in <Text style={{ fontWeight: "bold" }}>{category}</Text>
      </Text>
    </Animated.View>
  );
};

export default GroceryCardContainer;

const noItemsStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50, marginBottom: 50, paddingHorizontal: 20 },
  emoji: { fontSize: 48, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 6, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#777", textAlign: "center", lineHeight: 20 },
});
