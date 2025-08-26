import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, Animated } from "react-native";
import FnBCard from "./FnBCard";

export interface FnBCatalogItem {
  id: string;
  catalog_id?: string;
  veg: boolean;
  non_veg?: boolean;
  descriptor?: {
    name?: string;
    short_desc?: string;
    long_desc?: string;
    images?: string[];
    symbol?: string;
  };
  image?: string; // fallback image
  price: {
    value: number;
    maximum_value?: number;
  };
  quantity?: number;
  provider?: {
    id?: string;
  };
  slug?: string;
  customizable?: boolean;
  category_id?: string;
}

interface FnBCardContainerProps {
  catalog: FnBCatalogItem[];
  providerId: string;
  selectedCategory?: string;
  searchString: string;
  handleOpenPress?: () => void;
  foodDetails?: (data: any) => void;
  filter?: string; // "All", "Veg", "Non-Veg"
}

const CARD_SPACING = Dimensions.get("window").width * 0.03;

// ✅ NoItemsDisplay Component
export const NoItemsDisplay: React.FC<{ category?: string; filter?: string }> = ({ 
  category = "this category", 
  filter 
}) => {
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

  const getMessage = () => {
    if (filter && filter !== "All") {
      return `No ${filter} items found`;
    }
    if (category && category !== "this category") {
      return `No items available in ${category}`;
    }
    return "No items found";
  };

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
      <Text style={noItemsStyles.emoji}>🍽️</Text>
      <Text style={noItemsStyles.title}>No Food Items Found</Text>
      <Text style={noItemsStyles.subtitle}>{getMessage()}</Text>
    </Animated.View>
  );
};

const FnBCardContainer: React.FC<FnBCardContainerProps> = ({
  catalog,
  providerId,
  selectedCategory,
  searchString,
  handleOpenPress,
  foodDetails,
  filter = "All",
}) => {
  // ✅ Filter out undefined/null items first
  const safeCatalog = catalog?.filter((item) => item != null) || [];

  // ✅ Apply category filter
  const categoryFilteredCatalog = !selectedCategory || selectedCategory === "All"
    ? safeCatalog
    : safeCatalog.filter((item) => item?.category_id === selectedCategory);

  // ✅ Apply veg/non-veg filter
  const vegFilteredCatalog = (() => {
    if (filter === "Veg") return categoryFilteredCatalog.filter((item) => item?.veg === true);
    if (filter === "Non-Veg") return categoryFilteredCatalog.filter((item) => item?.non_veg === true || item?.veg === false);
    return categoryFilteredCatalog;
  })();

  // ✅ Apply search filter
  const displayedCatalog = vegFilteredCatalog.filter((item) => {
    if (!item) return false;
    const itemName = item?.descriptor?.name || "";
    return searchString
      ? itemName.toLowerCase().includes(searchString.toLowerCase())
      : true;
  });

  // ✅ Show NoItemsDisplay if no items
  if (displayedCatalog.length === 0) {
    return <NoItemsDisplay category={selectedCategory} filter={filter} />;
  }

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
            <FnBCard
              veg={item.veg || false}
              itemName={item.descriptor?.name || "Unnamed Food Item"}
              offerPrice={item.price.value}
              originalPrice={item.price.maximum_value || item.price.value}
              rating={4.2} // Default rating - you can make this dynamic
              itemImg={item.descriptor?.images?.[0] || item.image || ""}
              id={item.id}
              providerId={providerId}
              maxLimit={item.quantity || 10}
              slug={item.slug || item.id}
              customizable={item.customizable || false}
              shortDesc={item.descriptor?.short_desc || ""}
              longDesc={item.descriptor?.long_desc || ""}
              onPress={handleOpenPress}
              onDetailsPress={foodDetails}
            />
          </View>
        );
      })}
    </View>
  );
};

export default FnBCardContainer;

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