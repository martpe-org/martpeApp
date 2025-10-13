import DiscountBadge from "@/components/common/DiscountBadge";
import ImageComp from "@/components/common/ImageComp";
import LikeButton from "@/components/common/likeButton";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AddToCart from "../../common/AddToCart";

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
        price={cost}
        storeId={safeStoreId}
        slug={resolvedSlug}
        catalogId={catalogId}
        productName={itemName}
        customizable={item.customizable}
        directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
      />
    </View>
  );
};


  return (
    <TouchableOpacity style={cardStyles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={cardStyles.content}>
        {/* Left side - Text content */}
        <View style={cardStyles.textContainer}>
          <View style={cardStyles.headerRow}>
            {veg && (
              <MaterialCommunityIcons
                name="circle-box-outline"
                size={16}
                color="green"
                style={{ marginRight: 6 }}
              />
            )}
            {non_veg && (
              <MaterialCommunityIcons
                name="circle-box-outline"
                size={16}
                color="red"
                style={{ marginRight: 6 }}
              />
            )}
            <Text style={cardStyles.name} numberOfLines={1}>
              {itemName}
            </Text>
          </View>

          <View style={cardStyles.priceRow}>
            <Text style={cardStyles.price}>₹{cost.toFixed()}</Text>
            {originalPrice && originalPrice > cost && (
              <Text style={cardStyles.originalPrice}>
                ₹{originalPrice.toFixed()}
              </Text>
            )}
            {discount && discount > 0 && (
              <Text style={cardStyles.discount}>{discount}% OFF</Text>
            )}
          </View>
          <Text style={cardStyles.description} numberOfLines={2}>
            {item?.descriptor?.long_desc || "Delicious food item"}
          </Text>
        </View>

        {/* Right side - Image and Add to Cart */}
        <View style={cardStyles.imageContainer}>
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

          {typeof discount === "number" && discount > 1 && (
            <DiscountBadge percent={Number(discount)} style={{ top: 8, left: 8 }} />
          )}

          <View style={cardStyles.addToCartWrapper}>
            {renderAddToCart()}
          </View>
        </View>
      </View>

      {/* Bottom border */}
      <View style={cardStyles.divider} />
    </TouchableOpacity>
  );
};

export default PLPFnBCard;

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3C8A3C",
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
    color: "#8B94B2",
  },
  discount: {
    fontSize: 12,
    fontWeight: "500",
    color: "#F13A3A",
    backgroundColor: "#F9F3F2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  description: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  imageContainer: {
    width: 100,
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  topActions: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 4,
  },
  addToCartWrapper: {
    marginTop: -8,
    width: "100%",
  },
  cartWrapper: {
    width: "100%",
  },
  errorText: {
    fontSize: 10,
    color: "#ff6b6b",
    textAlign: "center",
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#FB3E44",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 16,
  },
});