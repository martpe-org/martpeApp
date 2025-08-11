import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import GroceryCard from "./GroceryCard";

interface GroceryCardContainerProps {
  providerId: string;
  catalog: {
    category_id: string;
    descriptor: {
      images: string[];
      name: string;
    };
    price: {
      value: number;
    };
    id: string;
    quantity: {
      maximum: { count: number };
      available: { count: number };
    };
  }[];
  selectedCategory?: string;
  searchString: string;
}

const GroceryCardContainer: React.FC<GroceryCardContainerProps> = ({
  catalog,
  selectedCategory,
  providerId,
  searchString,
}) => {
  let filteredCatalog =
    !selectedCategory || selectedCategory === "All"
      ? catalog
      : catalog.filter((item) => item.category_id === selectedCategory);

  // Skip rendering if category filter results in no items
  if (
    selectedCategory &&
    selectedCategory !== "All" &&
    filteredCatalog.length === 0
  ) {
    return null;
  }

  return (
    <View style={styles.groceryCardsContainer}>
      {filteredCatalog
        .filter((item) =>
          searchString
            ? item?.descriptor?.name
                .toLowerCase()
                .includes(searchString.toLowerCase())
            : true
        )
        .map((item) => {
          const imageUrl = item.descriptor.images[0];
          const name = item.descriptor.name;
          const price = item.price.value;
          const maxLimit = Math.min(
            item.quantity.maximum.count,
            item.quantity.available.count
          );

          return (
            <GroceryCard
              key={item.id}
              itemName={name}
              cost={price}
              imageUrl={imageUrl}
              id={item.id}
              category={item.category_id}
              providerId={providerId}
              maxLimit={maxLimit}
            />
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  groceryCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Dimensions.get("window").width * 0.03,
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

export default GroceryCardContainer;
