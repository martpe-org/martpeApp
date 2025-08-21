import { StyleSheet, View } from "react-native";
import React from "react";
import PersonalCareCard from "./PersonalCareCard";

interface CatalogItem {
  catalog_id: string;
  category_id: string;
  descriptor: {
    images: string[];
    long_desc: string;
    name: string;
    short_desc: string;
    symbol: string;
  };
  id: string;
  price: {
    maximum_value: number;
    value: number;
  };
  provider_id: string;
}

interface PersonalCareCardContainerProps {
  catalog: CatalogItem[];
  providerId: string | string[];
  searchString: string;
  selectedCategory?: string;
}

const PersonalCareCardContainer: React.FC<PersonalCareCardContainerProps> = ({
  catalog,
  providerId,
  searchString,
  selectedCategory,
}) => {
  const getFilteredCatalog = () => {
    let filtered = catalog;

    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(
        (item) => item.category_id === selectedCategory
      );
    }

    if (searchString) {
      filtered = filtered.filter((item) =>
        item?.descriptor?.name
          ?.toLowerCase()
          .includes(searchString.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredCatalog = getFilteredCatalog();

  return (
    <View style={styles.cardsContainer}>
      {filteredCatalog.map((item) => {
        const title = item.descriptor.name;
        const description = item.descriptor.long_desc;
        const price = item.price.value;
        const maxValue = item.price.maximum_value;
        const discount = maxValue
          ? Math.round(((maxValue - price) / maxValue) * 100)
          : 0;
        const image = item.descriptor.images?.[0];

        return (
          <PersonalCareCard
            key={item.catalog_id} // ✅ use catalog_id as unique key
            title={title}
            description={description}
            price={price}
            maxValue={maxValue}
            discount={discount}
            image={image}
            id={item.id}
            providerId={providerId}
          />
        );
      })}
    </View>
  );
};

export default PersonalCareCardContainer;

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 10,
  },
});
