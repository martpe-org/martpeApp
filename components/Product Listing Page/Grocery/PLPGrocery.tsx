import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, Animated } from "react-native";
import GroceryCard from "./GroceryCard";

export interface CatalogItem {
  id: string;
  catalog_id: string;
  store_id: string;
  slug?: string;
  category_id: string;
  symbol?: string;
  descriptor: {
    images: string[];
    name?: string;
    long_desc?: string;
  };
  price: {
    value: number;
    maximum_value?: number;
    offerPercent?: number;
  };
  quantity: {
    maximum: { count: number };
    available: { count: number };
  };
  weight?: string;
  unit?: string;
  customizable?: boolean;
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

interface GroceryCardContainerProps {
  catalog: CatalogItem[];
  selectedCategory?: string;
  searchString: string;
}

const CARD_SPACING = Dimensions.get("window").width * 0.03;

const GroceryCardContainer: React.FC<GroceryCardContainerProps> = ({
  catalog,
  selectedCategory,
  searchString,
}) => {
  const filteredCatalog =
    !selectedCategory || selectedCategory === "All"
      ? catalog
      : catalog.filter((item) => item.category_id === selectedCategory);

  const displayedCatalog = filteredCatalog.filter((item) => {
    const itemName = item?.descriptor?.name || "";
    return searchString ? itemName.includes(searchString) : true;
  });

  if (
    selectedCategory &&
    selectedCategory !== "All" &&
    displayedCatalog.length === 0
  ) {
    return <NoItemsDisplay category={selectedCategory} />;
  }

  return (
    <View style={containerStyles.container}>
      {displayedCatalog.map((item) => (
        <View
          key={item.catalog_id} // ✅ use unique catalog_id instead of id
          style={{ marginRight: CARD_SPACING, marginBottom: CARD_SPACING }}
        >
          <GroceryCard
            id={item.id}
            itemName={item.descriptor?.name || "Unnamed Product"}
            cost={item.price.value}
            maxLimit={item.quantity.maximum.count}
            providerId={item.store_id}
            slug={item.slug || item.id}
            catalogId={item.catalog_id}
            symbol={item.symbol}
            weight={item.weight}
            unit={item.unit}
            originalPrice={item.price.maximum_value}
            discount={item.price.offerPercent}
          />
        </View>
      ))}
    </View>
  );
};

// ✅ Animated "No Items" Component
const NoItemsDisplay: React.FC<{ category: string }> = ({ category }) => {
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
