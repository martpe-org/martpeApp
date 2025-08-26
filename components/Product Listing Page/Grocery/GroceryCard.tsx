import ImageComp from "@/components/common/ImageComp";
import AddToCart from "../../../components/ProductDetails/AddToCart";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.44;

interface GroceryCardProps {
  id: string;
  itemName: string;
  cost: number;
  maxLimit?: number;
  providerId?: string;
  slug?: string;
  catalogId: string;
  weight?: string;
  unit?: string;
  originalPrice?: number;
  discount?: number;
  symbol?: string;
  image?: string; // ✅ add proper image support
  onPress?: () => void;
  item?: {
    id: string;
    catalog_id: string;
    provider?: { store_id: string };
    provider_id?: string;
    store_id?: string;
  };
}

const GroceryCard: React.FC<GroceryCardProps> = ({
  id,
  itemName,
  cost,
  maxLimit,
  providerId,
  slug,
  catalogId,
  weight = "1kg",
  unit = "piece",
  originalPrice,
  discount,
  symbol,
  image,
  onPress,
  item,
}) => {
// Inside GroceryCard

const handlePress = onPress || (() => {
  router.push(`/(tabs)/home/result/productDetails/${slug || id}`);
});

  // ✅ Unified Image Resolution (FashionCard style)
 const getImageSource = () => {
    if (symbol && symbol.trim() !== "") {
      return { uri: symbol };
    }
    if (image && image.trim() !== "") {
      return { uri: image };
    }
    return { uri: "https://via.placeholder.com/150?text=Grocery" };
  };

  // ✅ Enhanced store ID resolution
  const resolveStoreId = (): string => {
    if (providerId && providerId !== "unknown-store") return providerId;
    if (item) {
      if (item.provider?.store_id && item.provider.store_id !== "unknown-store") {
        return item.provider.store_id;
      }
      if (item.store_id && item.store_id !== "unknown-store") {
        return item.store_id;
      }
      if (item.provider_id && item.provider_id !== "unknown-store") {
        return item.provider_id;
      }
    }
    return catalogId || id || "default-store";
  };

  const storeId = resolveStoreId();

  React.useEffect(() => {
    if (!storeId || storeId === "default-store") {
      console.warn(`⚠️ GroceryCard: Could not resolve store ID for product ${id} (${itemName})`);
    }
  }, [storeId, id, itemName]);

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* ✅ FashionCard-style ImageComp */}
      <ImageComp
        source={getImageSource()}
        imageStyle={cardStyles.image}
        resizeMode="cover"
        fallbackSource={{
          uri: "https://via.placeholder.com/150?text=Grocery",
        }}
        loaderColor="#f14343"
        loaderSize="small"
      />

      <View style={cardStyles.info}>
        <Text style={cardStyles.name} numberOfLines={2}>
          {itemName}
        </Text>
        <Text style={cardStyles.weight}>
          {weight} / {unit}
        </Text>

        <View style={cardStyles.priceRow}>
          <Text style={cardStyles.price}>₹{cost.toFixed(2)}</Text>
          {discount && originalPrice && (
            <Text style={cardStyles.originalPrice}>₹{originalPrice.toFixed(2)}</Text>
          )}
        </View>

        {discount && <Text style={cardStyles.discount}>{discount}% off</Text>}
      </View>

      {/* AddToCart with resolved storeId */}
      <View style={cardStyles.cartWrapper}>
        <AddToCart
          storeId={storeId}
          slug={slug || id}
          catalogId={catalogId}
          price={cost}
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
    height: 140, // ✅ match PersonalCare/FashionCard size
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
