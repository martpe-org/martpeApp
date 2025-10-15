import ImageComp from "@/components/common/ImageComp";
import LikeButton from "@/components/common/likeButton";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AddToCart from "../../common/AddToCart";

export interface PLPFnBCardProps {
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
  /** ✅ Resolve correct product price */
const resolvedPrice = (() => {
  if (typeof cost === "number" && cost > 0) return cost;
  if (typeof item?.price?.value === "number" && item.price.value > 0)
    return item.price.value;
  if (typeof item?.price === "number" && item.price > 0) return item.price;
  return null;
})();

/** ✅ Resolve original price (for strike-through display) */
const resolvedOriginalPrice =
  typeof originalPrice === "number" && originalPrice > 0
    ? originalPrice
    : typeof item?.price?.maximum_value === "number"
    ? item.price.maximum_value
    : null;


  const safeStoreId = resolveStoreId();
  const resolvedSlug = slug || id;
  const productIdString = Array.isArray(productId) ? productId[0] : productId;
  const uniqueProductId = productIdString || slug || id;

  /** ✅ Only show AddToCart if product is in stock & storeId exists */
  const renderAddToCart = () => {
    if (!safeStoreId) {
      return (
        <View style={cardStyles.cartWrapper}>
          <Text style={cardStyles.errorText}>Store ID missing</Text>
        </View>
      );
    }

    if (!item?.instock) {
      return (
        <View style={cardStyles.cartWrapper}>
          <Text style={cardStyles.outOfStockText}>Out of stock</Text>
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
          customizable={customizable || directlyLinkedCustomGroupIds.length > 0}
          directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
        />
      </View>
    );
  };

  /** ✅ Fallback for missing long_desc */
  const descriptionText =
    item?.short_desc ||
    item?.description ||
    item?.descriptor?.long_desc ||
    "";

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={cardStyles.content}>
        {/* Left - Text content */}
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
  {resolvedPrice ? (
    <>
      <Text style={cardStyles.price}>₹{resolvedPrice.toFixed(0)}</Text>
      {resolvedOriginalPrice && resolvedOriginalPrice > resolvedPrice && (
        <Text style={cardStyles.originalPrice}>
          ₹{resolvedOriginalPrice.toFixed(0)}
        </Text>
      )}
      {typeof discount === "number" && discount > 0 && (
        <Text style={cardStyles.discount}>{discount}% OFF</Text>
      )}
    </>
  ) : (
    <Text style={cardStyles.errorText}>Not available</Text>
  )}
</View>



          {!!descriptionText && (
            <Text style={cardStyles.description} numberOfLines={2}>
              {descriptionText}
            </Text>
          )}
        </View>

        {/* Right - Image + Actions */}
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

          <View style={cardStyles.addToCartWrapper}>{renderAddToCart()}</View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PLPFnBCard;

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 4,
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
    fontWeight: "700",
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
    height: 110,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  topActions: {
    position: "absolute",
    top: 4,
    right: 4,
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
  outOfStockText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 4,
  },
});
