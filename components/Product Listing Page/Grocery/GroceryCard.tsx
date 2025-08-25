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
  maxLimit: number;
  providerId?: string; // ✅ Make optional since it might be undefined
  slug?: string;
  catalogId: string;
  weight?: string;
  unit?: string;
  originalPrice?: number;
  discount?: number;
  symbol?: string;
  onPress?: () => void;
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
  symbol,
  onPress,
}) => {
  // ✅ Fixed syntax error in onPress assignment
  const handlePress = onPress || (() => router.push(`/(tabs)/home/result/productDetails/${id}`));

  // ✅ Validate providerId before rendering AddToCart
  const renderAddToCart = () => {
    if (!providerId || providerId === "unknown-store") {
      return (
        <Text style={cardStyles.errorText}>Store ID missing</Text>
      );
    }

    return (
      <AddToCart
        storeId={providerId}
        slug={slug || id}
        catalogId={catalogId}
        price={cost}
      />
    );
  };

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Product Image */}
      <ImageComp
        source={symbol || "https://via.placeholder.com/150?text=No+Image"}
        imageStyle={cardStyles.image}
        resizeMode="cover"
        fallbackSource={{
          uri: "https://via.placeholder.com/150?text=No+Image",
        }}
        loaderColor="#f14343"
        loaderSize="small"
      />

      {/* Info Section */}
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
            <Text style={cardStyles.originalPrice}>
              ₹{originalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        {discount && <Text style={cardStyles.discount}>{discount}% off</Text>}
      </View>

      {/* ✅ AddToCart with validation */}
      <View style={cardStyles.cartWrapper}>
        {renderAddToCart()}
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
    height: 120,
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
  errorText: {
    fontSize: 10,
    color: "#ff6b6b",
    textAlign: "center",
    fontWeight: "500",
  },
});