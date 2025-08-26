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
    symbol?: string;
  };
  id: string;
  price: {
    maximum_value: number;
    value: number;
  };
  provider_id: string;
  provider?: { store_id: string };
  store?: { _id: string; name?: string; slug?: string; symbol?: string };
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
  
  // ✅ Filter out null/undefined items first
  const safeCatalog = catalog?.filter((item) => item != null) || [];

  const getFilteredCatalog = () => {
    let filtered = safeCatalog;

    // ✅ Filter by category
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(
        (item) => item?.category_id === selectedCategory
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
        // ✅ Skip null/undefined items
        if (!item) return null;

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

        // ✅ Enhanced storeId resolution with better validation
        const resolveStoreId = (): string | undefined => {
          // Helper function to validate store ID
          const isValidStoreId = (storeId: any): storeId is string => {
            return storeId && 
              typeof storeId === 'string' && 
              storeId.trim() !== "" && 
              storeId !== "unknown-store" && 
              storeId !== "null" && 
              storeId !== "undefined";
          };

          // Priority order: item.provider.store_id > item.store?._id > providerId prop > provider_id
          if (isValidStoreId(provider?.store_id)) {
            return provider.store_id;
          }
          if (isValidStoreId(store?._id)) {
            return store._id;
          }
          if (providerId) {
            if (Array.isArray(providerId)) {
              const validId = providerId.find(id => isValidStoreId(id));
              return validId;
            }
            if (isValidStoreId(providerId)) {
              return providerId;
            }
          }
          if (isValidStoreId(provider_id)) {
            return provider_id;
          }
          return undefined; // No valid storeId found
        };

        const resolvedStoreId = resolveStoreId();

        // ✅ Enhanced logging for debugging
        if (!resolvedStoreId) {
          console.warn(
            `⚠️ PersonalCareCardContainer: No valid storeId for product ${id} (${name})`,
            {
              provider_store_id: provider?.store_id,
              store_id: store?._id,
              providerId_prop: providerId,
              provider_id: provider_id
            }
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
            providerId={resolvedStoreId} // ✅ Pass validated storeId
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