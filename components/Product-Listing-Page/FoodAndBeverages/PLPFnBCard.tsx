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

interface PLPFnBCardProps {
  id: string;
  itemName: string;
  cost: number;
  maxLimit?: number;
  providerId?: string;
  slug?: string;
  productId: string | string[];
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
  productId,
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

  const resolveStoreId = (): string | null => {
    if (providerId && providerId !== "unknown-store") return providerId;
    if (item?.store_id && item.store_id !== "unknown-store") {
      return item.store_id;
    }
    return null;
  };

  const safeStoreId = resolveStoreId();
  const resolvedSlug = slug || id;
  const productIdString = Array.isArray(productId) ? productId[0] : productId;
  const uniqueProductId = productIdString || slug || id;

  // ✅ AddToCart Renderer
  const renderAddToCart = () => {
    if (!safeStoreId) {
      return (
        <View style={cardStyles.cartWrapper}>
          <Text style={cardStyles.errorText}>Store ID missing</Text>
        </View>
      );
    }

    return (
      <View style={cardStyles.cartWrapper}>
        <AddToCart
          price={cost || 0}
          storeId={safeStoreId}
          slug={resolvedSlug}
          catalogId={catalogId}
          productName={itemName}
          customizable={customizable}
          directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
        />
      </View>
    );
  };

  // ✅ Veg/Non-Veg border color
  const getBorderColor = () => {
    if (veg) return "#22c55e";
    if (non_veg) return "#ef4444";
    return "#f0f0f0";
  };

  return (
    <View>
      <View style={[cardStyles.card, { borderColor: getBorderColor() }]}>
        {/* ✅ Veg/Non-Veg Indicator */}
        <View style={cardStyles.dietIndicator}>
          {veg && (
            <View
              style={[cardStyles.dietDot, { backgroundColor: "#22c55e" }]}
            />
          )}
          {non_veg && (
            <View
              style={[cardStyles.dietDot, { backgroundColor: "#ef4444" }]}
            />
          )}
        </View>

        <ImageComp
          source={image || symbol}
          imageStyle={cardStyles.image}
          resizeMode="cover"
          fallbackSource={{ uri: "https://picsum.photos/200/300" }}
          loaderColor="#666"
          loaderSize="small"
        />

        <View style={cardStyles.topActions}>
          <LikeButton productId={uniqueProductId} color="#E11D48" />
        </View>

        {/* 🔥 Discount Badge */}
        {typeof discount === "number" && discount > 1 && (
          <DiscountBadge
            percent={Number(discount)}
            style={{ top: 8, left: 8 }}
          />
        )}

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

          {/* ✅ Spice Level */}
          {spiceLevel && (
            <Text style={cardStyles.spiceLevel}>🌶️ {spiceLevel}</Text>
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
        </TouchableOpacity>

        {/* ✅ AddToCart */}
        {renderAddToCart()}
      </View>
    </View>
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
  errorText: {
    fontSize: 10,
    color: "#ff6b6b",
    textAlign: "center",
    fontWeight: "500",
  },
});
