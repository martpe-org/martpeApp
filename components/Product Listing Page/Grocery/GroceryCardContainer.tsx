import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, Animated } from "react-native";
import GroceryCard from "./GroceryCard";

export interface CatalogItem {
  id: string;
  catalog_id: string;
  category_id: string;
  descriptor: {
    name?: string;
    long_desc?: string;
    images?: string[];
  };
  price: {
    value: number;
    maximum_value?: number;
    offerPercent?: number;
  };
  quantity?: {
    maximum?: { count: number };
    available?: { count: number };
  };
  slug?: string;
  symbol?: string;
  weight?: string;
  unit?: string;
  provider_id?: string; // ✅ Add provider_id
  provider?: { store_id: string }; // ✅ Add provider field
}

interface GroceryCardContainerProps {
  catalog: CatalogItem[];
  providerId: string;
  selectedCategory?: string;
  searchString: string;
  handleOpenModal?: (item: CatalogItem) => void;
}

// ✅ Export NoItemsDisplay so it can be used elsewhere
interface NoItemsDisplayProps {
  category?: string;
}

export const NoItemsDisplay: React.FC<NoItemsDisplayProps> = ({ category = "this category" }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
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
        {
          opacity: fadeAnim,
          transform: [{ scale: bounceAnim }],
        },
      ]}
    >
      <Text style={noItemsStyles.emoji}>🛒</Text>
      <Text style={noItemsStyles.title}>No Products Found</Text>
      <Text style={noItemsStyles.subtitle}>
        No items available in <Text style={{ fontWeight: "bold" }}>{category}</Text>
      </Text>
    </Animated.View>
  );
};

const CARD_SPACING = Dimensions.get("window").width * 0.03;

const GroceryCardContainer: React.FC<GroceryCardContainerProps> = ({
  catalog,
  providerId,
  selectedCategory,
  searchString,
  handleOpenModal,
}) => {
  const filteredCatalog =
    !selectedCategory || selectedCategory === "All"
      ? catalog
      : catalog.filter((item) => item.category_id === selectedCategory);

  const displayedCatalog = filteredCatalog.filter((item) => {
    const itemName = item?.descriptor?.name || "";
    return searchString
      ? itemName.toLowerCase().includes(searchString.toLowerCase())
      : true;
  });

  return (
    <View style={containerStyles.container}>
      {displayedCatalog.map((item, index) => {
        // ✅ Resolve storeId with proper fallback logic
        const resolveStoreId = (): string | undefined => {
          if (item.provider?.store_id && item.provider.store_id !== "unknown-store") {
            return item.provider.store_id;
          }
          if (item.provider_id && item.provider_id !== "unknown-store") {
            return item.provider_id;
          }
          if (providerId && providerId !== "unknown-store") {
            return providerId;
          }
          return undefined;
        };

        const storeId = resolveStoreId();

        // ✅ Log warning if no valid storeId found
        if (!storeId) {
          console.warn(
            `⚠️ GroceryCardContainer: Missing storeId for product ${item.id} (${item.descriptor?.name})`
          );
        }

        return (
          <View
            key={`${item.id || item.catalog_id}-${index}-${item.descriptor?.name?.slice(0,10) || 'item'}`}
            style={{ marginRight: CARD_SPACING, marginBottom: CARD_SPACING }}
          >
            <GroceryCard
              id={item.id}
              itemName={item.descriptor?.name || "Unnamed Product"}
              cost={item.price.value}
              maxLimit={item.quantity?.maximum?.count ?? 0} 
              providerId={storeId} // ✅ Use resolved storeId
              slug={item.slug || item.id}
              catalogId={item.catalog_id}
              symbol={item.symbol}
              weight={item.weight}
              unit={item.unit}
              originalPrice={item.price.maximum_value}
              discount={item.price.offerPercent}
              onPress={() => handleOpenModal?.(item)}
            />
          </View>
        );
      })}
    </View>
  );
};

export default GroceryCardContainer;

const containerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

const noItemsStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
  },
});