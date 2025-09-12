import ImageComp from "@/components/common/ImageComp";
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
import LikeButton from "@/components/common/likeButton";

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
  maxLimit,
  providerId,
  slug,
  catalogId,
  weight = "1kg",
  unit = "piece",
  originalPrice,
  discount,
  symbol,
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
    if (item) {
      if (item.store_id && item.store_id !== "unknown-store") {
        return item.store_id;
      }
    }
    return catalogId || id || "default-store";
  };

  const storeId = resolveStoreId();
  const resolvedSlug = slug || id;
  
  // Convert productId to string if it's an array (same as ProductHeader)
  const productIdString = Array.isArray(productId) ? productId[0] : productId;
  
  // Use the most reliable unique identifier available
  // Priority: productId -> slug -> id
  const uniqueProductId = productIdString || slug || id;

  return (
    <View style={cardStyles.card}>
      <ImageComp
        source={image}
        imageStyle={cardStyles.image}
        resizeMode="cover"
        fallbackSource={{ uri: "https://picsum.photos/200/300" }}
        loaderColor="#666"
        loaderSize="small"
      />
      <View style={cardStyles.topActions}>
        <LikeButton productId={uniqueProductId} color="#E11D48" />
      </View>

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

        <View style={cardStyles.priceRow}>
          <Text style={cardStyles.price}>₹{cost.toFixed(2)}</Text>
          {discount && originalPrice && (
            <Text style={cardStyles.originalPrice}>
              ₹{originalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        {discount && <Text style={cardStyles.discount}>{discount}% off</Text>}
      </TouchableOpacity>

      <View style={cardStyles.cartWrapper}>
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