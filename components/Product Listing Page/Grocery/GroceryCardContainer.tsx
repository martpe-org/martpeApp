import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import GroceryCard from "./GroceryCard";

export interface CatalogItem {
  id: string;
  category_id: string;
  descriptor: {
    images: string[];
    name: string;
  };
  price: {
    value: number;
  };
  quantity: {
    maximum: { count: number };
    available: { count: number };
  };
}

interface GroceryCardContainerProps {
  catalog: CatalogItem[];
  selectedCategory?: string;
  providerId: string;
  searchString: string;
}

const CARD_SPACING = Dimensions.get("window").width * 0.03;

const GroceryCardContainer: React.FC<GroceryCardContainerProps> = ({
  catalog,
  selectedCategory,
  providerId,
  searchString,
}) => {
  const filteredCatalog =
    !selectedCategory || selectedCategory === "All"
      ? catalog
      : catalog.filter((item) => item.category_id === selectedCategory);

  if (selectedCategory && selectedCategory !== "All" && filteredCatalog.length === 0) return null;

  const displayedCatalog = filteredCatalog.filter((item) =>
    searchString ? item.descriptor.name.toLowerCase().includes(searchString.toLowerCase()) : true
  );

  return (
    <View style={styles.container}>
      {displayedCatalog.map((item) => (
        <View
          key={item.id}
          style={{ marginRight: CARD_SPACING, marginBottom: CARD_SPACING }}
        >
          <GroceryCard
            id={item.id}
            imageUrl={item.descriptor.images[0]}
            itemName={item.descriptor.name}
            cost={item.price.value}
            maxLimit={Math.min(item.quantity.maximum.count, item.quantity.available.count)}
            providerId={providerId}
          />
        </View>
      ))}
    </View>
  );
};

export default GroceryCardContainer;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
