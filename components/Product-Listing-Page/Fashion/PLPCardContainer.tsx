import React, { FC, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Animated,
} from "react-native";
import FashionCard from "./FashionCard";

interface CatalogItem {
  bpp_id: string;
  bpp_uri: string;
  catalog_id: string;
  category_id: string;
  provider: { store_id: string };
  descriptor: {
    images: string[];
    long_desc?: string;
    name?: string;
    short_desc?: string;
    symbol?: string;
  };
  id: string;
  location_id: string;
  non_veg: any;
  price: {
    maximum_value: number;
    offer_percent: any;
    offer_value: any;
    value: number;
  };
  provider_id: string;
  quantity: { available: any; maximum: any };
  veg: any;
  slug?: string;
  store?: { _id: string; name?: string; slug?: string; symbol?: string };
  customizable?: boolean;
  directlyLinkedCustomGroupIds: string[];
  customizations?: {
    _id?: string;
    id?: string;
    groupId?: string;
    group_id?: string;
    optionId?: string;
    option_id?: string;
    name: string;
  }[];
}

interface PLPCardContainerProps {
  catalog: CatalogItem[];
  domainColor: string;
  selectedCategory?: string;
  storeId?: string;
}

// Simple animated "No Items" placeholder
const NoItemsDisplay: FC<{ category: string }> = ({ category }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        noItemsStyles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={noItemsStyles.emoji}>🔍</Text>
      <Text style={noItemsStyles.title}>No Items Available</Text>
      <Text style={noItemsStyles.subtitle}>
        No items found in {category} category
      </Text>
    </Animated.View>
  );
};

const PLPCardContainer: FC<PLPCardContainerProps> = ({
  catalog,
  domainColor,
  selectedCategory = "All",
  storeId,
}) => {
  const BATCH_SIZE = 10;
  const [visibleItems, setVisibleItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter logic (same as your earlier version)
  const getFilteredCatalog = useCallback((): CatalogItem[] => {
    if (!selectedCategory || selectedCategory === "All" || selectedCategory === "Home & Decor") {
      return catalog;
    }
    const category = String(selectedCategory).toLowerCase();

    return catalog.filter((item) => {
      const name = item?.descriptor?.name?.toLowerCase() || "";
      const desc = item?.descriptor?.long_desc?.toLowerCase() || "";
      const short = item?.descriptor?.short_desc?.toLowerCase() || "";
      const match = (t: string, k: string | RegExp) =>
        typeof k === "string"
          ? new RegExp(`\\b${k}\\b`, "i").test(t)
          : k.test(t);

      switch (category) {
        case "furniture":
          return (
            match(name, "furniture") ||
            match(name, "chair") ||
            match(name, "table") ||
            match(name, "sofa") ||
            match(desc, "furniture")
          );
        case "furnishing":
          return (
            match(name, "curtain") ||
            match(name, "carpet") ||
            match(name, "bedsheet") ||
            match(name, "pillow") ||
            match(desc, "furnishing")
          );
        case "cooking":
          return (
            match(name, "kitchen") ||
            match(name, "cookware") ||
            match(name, "utensil") ||
            match(desc, "dining")
          );
        case "garden":
          return (
            match(name, "garden") ||
            match(name, "outdoor") ||
            match(name, "plant") ||
            match(desc, "patio")
          );
        default:
          return match(name, category) || match(desc, category) || match(short, category);
      }
    });
  }, [selectedCategory, catalog]);

  const filteredCatalog = getFilteredCatalog();

  useEffect(() => {
    // reset pagination when category changes
    setVisibleItems(filteredCatalog.slice(0, BATCH_SIZE));
  }, [filteredCatalog]);

  const loadMoreItems = () => {
    if (isLoading || visibleItems.length >= filteredCatalog.length) return;
    setIsLoading(true);

    setTimeout(() => {
      const next = filteredCatalog.slice(0, visibleItems.length + BATCH_SIZE);
      setVisibleItems(next);
      setIsLoading(false);
    }, 300);
  };

  // Preserve your resolveStoreId logic
  const resolveStoreId = (item: CatalogItem): string => {
    if (item.provider?.store_id && item.provider.store_id !== "unknown-store") {
      return item.provider.store_id;
    }
    if (item.store?._id && item.store._id !== "unknown-store") {
      return item.store._id;
    }
    if (storeId && storeId !== "unknown-store") {
      return storeId;
    }
    if (item.provider_id && item.provider_id !== "unknown-store") {
      return item.provider_id;
    }
    return "unknown-store";
  };

  const renderItem = ({ item }: { item: CatalogItem }) => {
    const name = item?.descriptor?.name || "";
    const desc = item?.descriptor?.long_desc || "";
    const value = item?.price?.value || 0;
    const maxPrice = item?.price?.maximum_value || 0;

    const discount =
      typeof item?.price?.offer_percent === "number"
        ? item.price.offer_percent
        : maxPrice && value
        ? Math.round(((maxPrice - value) / maxPrice) * 100)
        : 0;

    const image =
      item?.descriptor?.images?.[0] ||
      item?.descriptor?.symbol ||
      "https://via.placeholder.com/185?text=Fashion";

    const safeStoreId = resolveStoreId(item);

    return (
      <FashionCard
        key={`${item.id}-${item.catalog_id}`}
        itemName={name}
        desc={desc}
        value={value}
        maxPrice={maxPrice}
        discount={discount}
        image={image}
        id={item.id}
        catalogId={item.catalog_id}
        storeId={safeStoreId}
        slug={item.slug}
        customizable={item.customizable || false}
        directlyLinkedCustomGroupIds={item.directlyLinkedCustomGroupIds || []}
      />
    );
  };

  if (filteredCatalog.length === 0) {
    return <NoItemsDisplay category={selectedCategory} />;
  }

  return (
    <FlatList
      data={visibleItems}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.id}-${item.catalog_id}`}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMoreItems}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoading ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator size="small" color="#666" />
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 10,
    paddingTop: 20,
  },
});

const noItemsStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 50,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center" },
});

export default PLPCardContainer;
export type { CatalogItem };
