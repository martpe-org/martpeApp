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
    symbol?: string; // ✅ Add symbol field like PLPCardContainer
  };
  id: string;
  price: {
    maximum_value: number;
    value: number;
  };
  provider_id: string;
  provider?: { store_id: string }; // ✅ Add provider field for better storeId resolution
  store?: { _id: string; name?: string; slug?: string; symbol?: string }; // ✅ Add store field like PLPCardContainer
}

interface PersonalCareCardContainerProps {
  catalog: CatalogItem[];
  providerId: string | string[];
  searchString: string;
  selectedCategory?: string;
}

const PersonalCareCardContainer: React.FC<
  PersonalCareCardContainerProps
> = ({ catalog, providerId, searchString, selectedCategory }) => {
  const getFilteredCatalog = () => {
    let filtered = catalog;

    // ✅ Filter by category
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(
        (item) => item.category_id === selectedCategory
      );
    }

    // ✅ Filter by search string
    if (searchString && searchString.trim() !== "") {
      filtered = filtered.filter((item) =>
        item?.descriptor?.name
          ?.toLowerCase()
          .includes(searchString.toLowerCase().trim())
      );
    }

    return filtered;
  };

  const filteredCatalog = getFilteredCatalog();

  return (
    <View style={styles.cardsContainer}>
      {filteredCatalog.map((item, index) => {
        const {
          id,
          catalog_id,
          descriptor: { name, long_desc, images, symbol },
          price: { value: price, maximum_value: maxValue },
          provider_id,
          provider,
          store,
        } = item;

        const discount = maxValue && maxValue > price
          ? Math.round(((maxValue - price) / maxValue) * 100)
          : 0;

        const image = images?.[0];

        // ✅ Enhanced storeId resolution (matches PLPCardContainer pattern exactly)
        const resolveStoreId = (): string | undefined => {
          // Priority order: item.provider.store_id > item.store?._id > providerId prop > provider_id
          if (provider?.store_id && provider.store_id !== "unknown-store") {
            return provider.store_id;
          }
          if (store?._id && store._id !== "unknown-store") {
            return store._id;
          }
          if (providerId && providerId !== "unknown-store") {
            if (Array.isArray(providerId)) {
              const validId = providerId.find(id => id && id !== "unknown-store" && id.trim() !== "");
              return validId;
            }
            return providerId;
          }
          if (provider_id && provider_id !== "unknown-store") {
            return provider_id;
          }
          return undefined; // No valid storeId found
        };

        const resolvedStoreId = resolveStoreId();

        // ✅ Log warning for debugging (like PLPCardContainer)
        if (!resolvedStoreId) {
          console.warn(
            `⚠️ PersonalCareCardContainer: Missing storeId for product ${id} (${name})`
          );
        }

        return (
          <PersonalCareCard
            key={`${id}-${catalog_id}-${index}`}
            title={name}
            description={long_desc}
            price={price}
            maxValue={maxValue}
            discount={discount}
            image={image}
            symbol={symbol}
            id={id}
            providerId={resolvedStoreId} // ✅ Pass simple resolved storeId string (not array)
            catalogId={catalog_id}
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