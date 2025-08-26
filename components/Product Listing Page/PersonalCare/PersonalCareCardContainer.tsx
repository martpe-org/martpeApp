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
  slug?: string;
  store_id?: string;
  bpp_id?: string;
}

interface PersonalCareCardContainerProps {
  catalog: CatalogItem[];
  providerId?: string | string[];
  searchString: string;
  selectedCategory?: string;
}

const PersonalCareCardContainer: React.FC<
  PersonalCareCardContainerProps
> = ({ catalog, providerId, searchString, selectedCategory }) => {
  const safeCatalog = catalog?.filter((item) => item != null) || [];

  const getFilteredCatalog = () => {
    let filtered = safeCatalog;

    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(
        (item) => item?.category_id === selectedCategory
      );
    }

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
          slug,
          store_id,
        } = item;

        const discount =
          maxValue && maxValue > price
            ? Math.round(((maxValue - price) / maxValue) * 100)
            : 0;

        const image = images?.[0];

        // ✅ use same logic as PLPCardContainer
        const resolveStoreId = (): string | undefined => {
          if (provider?.store_id && provider.store_id !== "unknown-store") {
            return provider.store_id;
          }
          if (store?._id && store._id !== "unknown-store") {
            return store._id;
          }
          if (store_id && store_id !== "unknown-store") {
            return store_id;
          }
          if (providerId && typeof providerId === "string" && providerId !== "unknown-store") {
            return providerId;
          }
          if (provider_id && provider_id !== "unknown-store") {
            return provider_id;
          }
          if (item.bpp_id && item.bpp_id !== "unknown-store") {
            return item.bpp_id;
          }
          return undefined;
        };

        const resolvedStoreId = resolveStoreId();

        const itemData = {
          id,
          catalog_id,
          provider,
          provider_id,
          store_id: resolvedStoreId,
          store,
        };

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
            providerId={resolvedStoreId}
            catalogId={catalog_id}
            slug={slug || id} // ✅ use backend slug if available
            item={itemData}
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
