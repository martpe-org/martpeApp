import DiscountBadge from "@/components/common/DiscountBadge";
import ImageComp from "@/components/common/ImageComp";
import LikeButton from "@/components/common/likeButton";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddToCart from "../../common/AddToCart";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.44;

interface GroceryCardProps {
  id: string;
  itemName: string;
  productId: string | string[];
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
  image?: string;
  onPress?: () => void;
  item?: any;
  customizable?: boolean;
  directlyLinkedCustomGroupIds?: string[];
}

const GroceryCard: React.FC<GroceryCardProps> = ({
  id,
  itemName,
  cost,
  providerId,
  slug,
  catalogId,
  weight = "1kg",
  unit = "piece",
  originalPrice,
  discount,
  productId,
  image,
  onPress,
  item,
  customizable = false,
  directlyLinkedCustomGroupIds = [],
}) => {
  const handlePress =
    onPress ||
    (() => {
      router.push(`/(tabs)/home/result/productDetails/${slug || id}`);
    });

  const resolveStoreId = (): string => {
    if (providerId && providerId !== "unknown-store") return providerId;
    if (item?.store_id && item.store_id !== "unknown-store") {
      return item.store_id;
    }
    return catalogId || id || "default-store";
  };

  const storeId = resolveStoreId();
  const resolvedSlug = slug || id;

  const productIdString = Array.isArray(productId) ? productId[0] : productId;
  const uniqueProductId = productIdString || slug || id;

  return (
    <View style={cardStyles.card}>
      {/* Product Image */}
      <ImageComp
        source={image}
        imageStyle={cardStyles.image}
        resizeMode="cover"
        fallbackSource={{ uri: "https://picsum.photos/200/300" }}
        loaderColor="#666"
        loaderSize="small"
      />

      {/* ❤️ Like button */}
      <View style={cardStyles.topActions}>
        <LikeButton productId={uniqueProductId} color="#E11D48" />
      </View>

      {/* 🔥 Discount badge */}
      {typeof discount === "number" && discount > 0 && (
        <DiscountBadge percent={discount} style={{ top: 8, left: 8 }} />
      )}

      {/* Info Section */}
      <TouchableOpacity
        style={cardStyles.info}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={cardStyles.name} numberOfLines={2}>
          {itemName}
        </Text>
        <Text style={cardStyles.weight}>
          {weight} / {unit}
        </Text>
      </TouchableOpacity>

      {/* Price and Add to Cart Row */}
      <View style={cardStyles.priceAddRow}>
        <View style={cardStyles.priceContainer}>
          <View style={cardStyles.priceRow}>
            <Text style={cardStyles.price}>₹{cost.toFixed()}</Text>
            {originalPrice && (
              <Text style={cardStyles.originalPrice}>
                ₹{originalPrice.toFixed()}
              </Text>
            )}
          </View>
        </View>
        <View style={cardStyles.addToCartContainer}>
          <AddToCart
            storeId={storeId}
            slug={resolvedSlug}
            catalogId={catalogId}
            price={cost}
            productName={itemName}
            customizable={customizable}
            directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
          />
        </View>
      </View>
    </View>
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
  topActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
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
   priceAddRow: {
    flexDirection: "row",
    alignItems: "flex-start", // Changed from "center" to "flex-start"
    justifyContent: "space-between",
    marginTop: 8,
    minHeight: 32, // Ensure minimum height for button
  },
  priceContainer: {
    flex: 1, // Changed from flexShrink: 0
    maxWidth: "60%", // Limit price container width
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap", // Allow wrapping if needed
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
  addToCartContainer: {
    flexShrink: 0, // Prevent shrinking
    minWidth: 80, // Ensure minimum button width
    maxWidth: "55%", // Limit max width
        marginRight:10
  },
});
