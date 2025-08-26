import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, Animated } from "react-native";
import GroceryCard from "./GroceryCard";

export interface CatalogItem {
  id: string;
  catalog_id: string;
  category_id: string;
  provider?: { store_id: string }; // ✅ Made optional to handle missing provider
  descriptor?: {
    name?: string;
    long_desc?: string;
    images?: string[];
    symbol?: string;
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
  provider_id?: string; // ✅ Keep as optional fallback
  store_id?: string; // ✅ Keep as optional fallback
}

interface GroceryCardContainerProps {
  catalog: CatalogItem[];
  selectedCategory?: string;
  searchString: string;
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
  selectedCategory,
  searchString,
}) => {
  // ✅ Filter out undefined/null items first
  const safeCatalog = catalog?.filter((item) => item != null) || [];

  const filteredCatalog =
    !selectedCategory || selectedCategory === "All"
      ? safeCatalog
      : safeCatalog.filter((item) => item?.category_id === selectedCategory);

  const displayedCatalog = filteredCatalog.filter((item) => {
    if (!item) return false; // ✅ Additional safety check
    const itemName = item?.descriptor?.name || "";
    return searchString
      ? itemName.toLowerCase().includes(searchString.toLowerCase())
      : true;
  });

  return (
    <View style={containerStyles.container}>
      {displayedCatalog.map((item, index) => {
        // ✅ Skip undefined/null items
        if (!item) return null;

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
  providerId={item.store_id}
  slug={item.slug || item.id}
  catalogId={item.catalog_id}
  symbol={item.symbol || item.descriptor?.symbol}
  image={item.descriptor?.images?.[0]}
  weight={item.weight || "1kg"}
  unit={item.unit || "piece"}
  originalPrice={item.price.maximum_value}
  discount={item.price.offerPercent}
  item={item}
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