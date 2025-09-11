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

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.44;

interface PLPFnBCardProps {
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
  image?: string;
  onPress?: () => void;
  item?: any;
  customizable?: boolean;
  directlyLinkedCustomGroupIds?: string[];
  // ✅ F&B specific props
  veg?: boolean;
  non_veg?: boolean;
  spiceLevel?: string;
}

const PLPFnBCard: React.FC<PLPFnBCardProps> = ({
  id,
  itemName,
  cost,
  maxLimit,
  providerId,
  slug,
  catalogId,
  weight = "1 serving",
  unit = "plate",
  originalPrice,
  discount,
  symbol,
  image,
  onPress,
  item,
  customizable = false,
  directlyLinkedCustomGroupIds = [],
  veg = false,
  non_veg = false,
  spiceLevel,
}) => {
  const handlePress =
    onPress ||
    (() => {
      router.push(`/(tabs)/home/result/productDetails/${slug || id}`);
    });

  const resolveStoreId = (): string => {
    if (providerId && providerId !== "unknown-store") return providerId;
    if (item) {
      if (
        item.provider?.store_id &&
        item.provider.store_id !== "unknown-store"
      ) {
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
  const resolvedSlug = slug || id;

  // ✅ F&B specific styling based on veg/non-veg
  const getBorderColor = () => {
    if (veg) return "#22c55e";
    if (non_veg) return "#ef4444";
    return "#f0f0f0";
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={[cardStyles.card, { borderColor: getBorderColor() }]}>
        {/* ✅ Veg/Non-Veg Indicator */}
        <View style={cardStyles.dietIndicator}>
          {veg && <View style={[cardStyles.dietDot, { backgroundColor: "#22c55e" }]} />}
          {non_veg && <View style={[cardStyles.dietDot, { backgroundColor: "#ef4444" }]} />}
        </View>

        <ImageComp
          source={image || symbol}
          style={cardStyles.image}
          resizeMode="cover"
          fallbackText={itemName?.charAt(0) || "F"}
        />
        
        <View style={cardStyles.info}>
          <Text style={cardStyles.name} numberOfLines={2}>
            {itemName}
          </Text>
          
          <Text style={cardStyles.weight}>
            {weight} / {unit}
          </Text>

          {/* ✅ Spice Level Indicator */}
          {spiceLevel && (
            <Text style={cardStyles.spiceLevel}>
              🌶️ {spiceLevel}
            </Text>
          )}

          <View style={cardStyles.priceRow}>
            <Text style={cardStyles.price}>₹{cost.toFixed(2)}</Text>
            {discount && originalPrice && (
              <Text style={cardStyles.originalPrice}>
                ₹{originalPrice.toFixed(2)}
              </Text>
            )}
          </View>

          {discount && (
            <Text style={cardStyles.discount}>{discount}% off</Text>
          )}
        </View>

        {/* ✅ AddToCart Component */}
        <View style={cardStyles.cartWrapper}>
          <AddToCart
            itemId={id}
            slug={resolvedSlug}
            storeId={storeId}
            maxLimit={maxLimit}
            customizable={customizable}
            directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PLPFnBCard;

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
    borderWidth: 1,
  },
  dietIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  dietDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
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
  spiceLevel: {
    fontSize: 11,
    color: "#f97316",
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
