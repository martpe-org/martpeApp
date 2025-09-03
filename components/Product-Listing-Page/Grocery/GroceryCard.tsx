import ImageComp from "@/components/common/ImageComp";
import { StoreItem } from "@/components/store/fetch-store-items-type";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddToCart from "../../ProductDetails/AddToCart";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.44;

interface GroceryCardProps {
  // id: string;
  // itemName: string;
  // cost: number;
  // maxLimit?: number;
  // storeId?: string;
  // slug?: string;
  // catalogId: string;
  // weight?: string;
  // unit?: string;
  // originalPrice?: number;
  // discount?: number;
  // symbol?: string;
  // image?: string;
  //onPress?: () => void;
  item: StoreItem;
}

const GroceryCard: React.FC<GroceryCardProps> = ({
  // id,
  // itemName,
  // cost,
  // maxLimit,
  // storeId,
  // slug,
  // catalogId,
  // weight = "1kg",
  // unit = "piece",
  // originalPrice,
  // discount,
  // symbol,
  // image,
  // onPress,
  item,
}) => {
  const handlePress = () => {
    router.push(`/(tabs)/home/result/productDetails/${item.slug}`);
  };

  // const resolveStoreId = (): string => {
  //   if (providerId && providerId !== "unknown-store") return providerId;
  //   if (item) {
  //     if (item.provider?.store_id && item.provider.store_id !== "unknown-store") {
  //       return item.provider.store_id;
  //     }
  //     if (item.store_id && item.store_id !== "unknown-store") {
  //       return item.store_id;
  //     }
  //     if (item.provider_id && item.provider_id !== "unknown-store") {
  //       return item.provider_id;
  //     }
  //   }
  //   return catalogId || id || "default-store";
  // };

  //const storeId = resolveStoreId();
  //const resolvedSlug = slug || id;

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <ImageComp
        source={{ uri: item.symbol }}
        imageStyle={cardStyles.image}
        resizeMode="cover"
        fallbackSource={{ uri: "https://picsum.photos/200/300" }}
        loaderColor="#666"
        loaderSize="small"
      />

      <View style={cardStyles.info}>
        <Text style={cardStyles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={cardStyles.weight}>
          {item.unitized?.measure.value} {item.unitized?.measure.unit}
        </Text>

        <View style={cardStyles.priceRow}>
          <Text style={cardStyles.price}>₹{item.price.value.toFixed(2)}</Text>
          {item.price.maximum_value && (
            <Text style={cardStyles.originalPrice}>
              ₹{item.price.maximum_value.toFixed(2)}
            </Text>
          )}
        </View>

        {item.price.offerPercent && (
          <Text style={cardStyles.discount}>
            {item.price.offerPercent}% off
          </Text>
        )}
      </View>

      <View style={cardStyles.cartWrapper}>
        <AddToCart
          storeId={item.store_id}
          slug={item.slug}
          catalogId={item.catalog_id}
          price={item.price.value}
        />
      </View>
    </TouchableOpacity>
  );
};

export default GroceryCard;

const cardStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  info: {
    flexGrow: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
    color: "#333",
  },
  weight: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f14343",
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#777",
  },
  discount: {
    fontSize: 12,
    color: "#28a745",
    marginTop: 2,
  },
  cartWrapper: {
    marginTop: 8,
  },
});
