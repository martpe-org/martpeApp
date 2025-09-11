import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, Animated } from "react-native";
import PLPFnBCard from "./PLPFnBCard";

export interface FnBCatalogItem {
  id: string;
  catalog_id: string;
  store_id: string;
  slug?: string;
  category_id: string;
  symbol?: string;
  veg: boolean;
  non_veg: boolean;
  descriptor: {
    images: string[];
    name?: string;
    long_desc?: string;
    symbol?: string;
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
  directlyLinkedCustomGroupIds?: string[];
  customizations?: {
    _id?: string;
    id?: string;
    groupId?: string;
    group_id?: string;
    optionId?: string;
    option_id?: string;
    name: string;
  }[];
  // ✅ F&B specific fields
  spiceLevel?: string;
}

interface PLPFnBCardContainerProps {
  catalog: FnBCatalogItem[];
  selectedCategory?: string;
  searchString: string;
  storeId: string;
  storeName: string;
  // ✅ F&B specific filters
  vegFilter?: "All" | "Veg" | "Non-Veg";
}

const CARD_SPACING = Dimensions.get("window").width * 0.03;

const PLPFnBCardContainer: React.FC<PLPFnBCardContainerProps> = ({
  catalog,
  selectedCategory,
  searchString,
  vegFilter = "All",
}) => {
  // ✅ Apply veg/non-veg filter first
  const vegFilteredCatalog = React.useMemo(() => {
    if (vegFilter === "Veg") return catalog.filter((item) => item.veg);
    if (vegFilter === "Non-Veg") return catalog.filter((item) => item.non_veg);
    return catalog;
  }, [catalog, vegFilter]);

  // ✅ Apply category filter
  const filteredCatalog = React.useMemo(() => {
    if (!selectedCategory || selectedCategory === "All") {
      return vegFilteredCatalog;
    }
    return vegFilteredCatalog.filter((item) => item.category_id === selectedCategory);
  }, [vegFilteredCatalog, selectedCategory]);

  // ✅ Apply search filter
  const displayedCatalog = React.useMemo(() => {
    return filteredCatalog.filter((item) => {
      const itemName = item?.descriptor?.name || "";
      return searchString
        ? itemName.toLowerCase().includes(searchString.toLowerCase())
        : true;
    });
  }, [filteredCatalog, searchString]);

  if (
    selectedCategory &&
    selectedCategory !== "All" &&
    displayedCatalog.length === 0
  ) {
    return <NoItemsDisplay category={selectedCategory} />;
  }

  return (
    <View style={containerStyles.container}>
      {displayedCatalog.map((item, index) => {
        // ✅ Extract customization group IDs from the customizations array
        const directlyLinkedCustomGroupIds = item.customizations?.map(
          customization => customization.groupId || 
                          customization.group_id || 
                          customization._id || 
                          customization.id
        ).filter(Boolean) || [];

        // Debug logging for first few items
        if (index < 3) {
          console.log(`🍽️ F&B Item ${index + 1}:`, {
            name: item.descriptor?.name,
            veg: item.veg,
            non_veg: item.non_veg,
            images: item.descriptor?.images,
            customizable: item.customizable,
            directlyLinkedCustomGroupIds,
          });
        }

        return (
          <PLPFnBCard
            key={item.id}
            id={item.id}
            itemName={item.descriptor?.name || "Unnamed Item"}
            cost={item.price?.value || 0}
            maxLimit={item.quantity?.available?.count}
            providerId={item.store_id}
            slug={item.slug}
            catalogId={item.catalog_id}
            weight={item.weight}
            unit={item.unit}
            originalPrice={item.price?.maximum_value}
            discount={item.price?.offerPercent}
            symbol={item.descriptor?.symbol || item.symbol}
            image={item.descriptor?.images?.[0]}
            item={item}
            customizable={item.customizable}
            directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
            // ✅ F&B specific props
            veg={item.veg}
            non_veg={item.non_veg}
            spiceLevel={item.spiceLevel}
          />
        );
      })}
    </View>
  );
};

// ✅ Animated "No Items" Component (same as grocery)
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
      <Text style={noItemsStyles.emoji}>🍽️</Text>
      <Text style={noItemsStyles.title}>No Food Items Found</Text>
      <Text style={noItemsStyles.subtitle}>
        No items available in{" "}
        <Text style={{ fontWeight: "600" }}>{category}</Text>
      </Text>
    </Animated.View>
  );
};

export default PLPFnBCardContainer;

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
