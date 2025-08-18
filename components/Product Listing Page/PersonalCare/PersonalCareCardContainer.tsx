import { StyleSheet, View } from "react-native";
import React from "react";
import PersonalCareCard from "./PersonalCareCard";

interface CatalogItem {
  bpp_id: string;
  bpp_uri: string;
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
  location_id: string;
  non_veg: null;
  price: {
    maximum_value: number;
    offer_percent: null;
    offer_value: null;
    value: number;
  };
  provider_id: string;
  quantity: {
    available: null;
    maximum: null;
  };
  veg: null;
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

    // Filter by category if selected and not "All"
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category_id === selectedCategory);
    }

    // Filter by search string
    if (searchString) {
      filtered = filtered.filter((item) =>
        item?.descriptor?.name
          .toLowerCase()
          .includes(searchString?.toLowerCase())
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
        const discount = Math.round(((maxValue - price) / maxValue) * 100);
        const image = item.descriptor.images[0];
        
        return (
          <PersonalCareCard
            key={`${item.id}-${title}`} // Better key to avoid duplicates
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
    flexWrap: "wrap",
    marginLeft: 5,
    flex: 0.96,
    paddingHorizontal: 10,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
})