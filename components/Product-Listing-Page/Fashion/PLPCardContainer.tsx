import { FC } from "react";
import { Text, StyleSheet, Animated, View } from "react-native";
import { useRef, useEffect } from "react";
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

// No Items Animation Component
const NoItemsDisplay: FC<{ category: string }> = ({ category }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial animation
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

    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        noItemsStyles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
        },
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
  const getFilteredCatalog = (): CatalogItem[] => {
    if (!selectedCategory || selectedCategory === "All" || selectedCategory === "Home & Decor") {
      return catalog;
    }

    const category = String(selectedCategory).toLowerCase();
    return catalog.filter((item) => {
      const itemName = item?.descriptor?.name?.toLowerCase() || "";
      const itemDesc = item?.descriptor?.long_desc?.toLowerCase() || "";
      const itemShortDesc = item?.descriptor?.short_desc?.toLowerCase() || "";

      const match = (text: string, keyword: string | RegExp) =>
        typeof keyword === "string"
          ? new RegExp(`\\b${keyword}\\b`, "i").test(text)
          : keyword.test(text);

      switch (category) {
        case "furniture":
          return (
            match(itemName, "furniture") ||
            match(itemName, "chair") ||
            match(itemName, "table") ||
            match(itemName, "sofa") ||
            match(itemDesc, "furniture")
          );
        case "furnishing":
          return (
            match(itemName, "curtain") ||
            match(itemName, "carpet") ||
            match(itemName, "bedsheet") ||
            match(itemName, "pillow") ||
            match(itemDesc, "furnishing")
          );
        case "cooking":
          return (
            match(itemName, "kitchen") ||
            match(itemName, "dining") ||
            match(itemName, "cookware") ||
            match(itemName, "utensil") ||
            match(itemDesc, "cooking") ||
            match(itemDesc, "dining")
          );
        case "garden":
          return (
            match(itemName, "garden") ||
            match(itemName, "outdoor") ||
            match(itemName, "plant") ||
            match(itemName, "patio") ||
            match(itemDesc, "garden") ||
            match(itemDesc, "outdoor")
          );
        default:
          return (
            match(itemName, category) ||
            match(itemDesc, category) ||
            match(itemShortDesc, category)
          );
      }
    });
  };

  const filteredCatalog = getFilteredCatalog();

  if (
    filteredCatalog.length === 0 &&
    selectedCategory !== "All" &&
    selectedCategory !== "Home & Decor"
  ) {
    return <NoItemsDisplay category={selectedCategory} />;
  }

  return (
    <View style={styles.container}>
      {filteredCatalog.map((item, idx) => {
        const name = item?.descriptor?.name || "";
        const desc = item?.descriptor?.long_desc || "";
        const value = item?.price?.value || 0;
        const maxPrice = item?.price?.maximum_value || 0;

        // ✅ Normalize discount into number
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

        const uniqueKey = `${item.id}-${idx}-${item.catalog_id}`;

        const directlyLinkedCustomGroupIds =
          item.directlyLinkedCustomGroupIds ||
          (item.customizations?.map(
            (c) => c.groupId || c.group_id || c._id || c.id
          ).filter(Boolean) as string[]) ||
          [];

        const resolveStoreId = (): string | undefined => {
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
          return undefined;
        };

        const safeStoreId = resolveStoreId() || "unknown-store";

        return (
<FashionCard
  key={uniqueKey}
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
      })}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
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
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default PLPCardContainer;
export type { CatalogItem };
