import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import GroceryCard from "./GroceryCard";

export interface CatalogItem {
  id: string; // product slug or id
  catalog_id: string; // ✅ product's ObjectId
  store_id: string; // ✅ seller's ObjectId
  slug?: string; // product slug
  category_id: string;
  symbol?: string; // ✅ added product/store symbol
  descriptor: {
    images: string[];
    name?: string;   // 👈 made optional (can be missing in API response)
    long_desc?: string;
  };
  price: {
    value: number;
    maximum_value?: number; // for original price
    offerPercent?: number; // for discount
  };
  quantity: {
    maximum: { count: number };
    available: { count: number };
  };
  weight?: string; // product weight
  unit?: string; // product unit
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
    const itemName = item?.descriptor?.name?.toLowerCase() || ""; // 👈 safe fallback
    return searchString
      ? itemName.includes(searchString.toLowerCase())
      : true;
  });

  if (
    selectedCategory &&
    selectedCategory !== "All" &&
    displayedCatalog.length === 0
  ) {
    return null;
  }

  return (
    <View style={containerStyles.container}>
      {displayedCatalog.map((item) => (
        <View
          key={item.id}
          style={{ marginRight: CARD_SPACING, marginBottom: CARD_SPACING }}
        >
          <GroceryCard
            id={item.id}
            itemName={item.descriptor?.name || "Unnamed Product"} // 👈 fallback
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
