import DiscountBadge from "@/components/common/DiscountBadge";
import ImageComp from "@/components/common/ImageComp";
import LikeButton from "@/components/common/likeButton";
import { router } from "expo-router";
import { FC } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddToCart from "../../common/AddToCart";

interface FashionCardProps {
  itemName: string;
  desc: string;
  value: number;
  maxPrice?: number;
  discount: number | string;
  productId: string | string[];
  image: string;
  id: string;
  catalogId: string;
  storeId?: string;
  slug?: string;
  onPress?: () => void;
  customizable?: boolean;
  directlyLinkedCustomGroupIds?: string[];
}

const FashionCard: FC<FashionCardProps> = ({
  itemName,
  desc,
  value,
  maxPrice,
  discount,
  image,
  id,
  catalogId,
  productId,
  storeId,
  slug,
  onPress,
  customizable = false,
  directlyLinkedCustomGroupIds = [],
}) => {
  const productIdString = Array.isArray(productId) ? productId[0] : productId;
  const uniqueSlug = slug || productIdString || id;

  const handlePress =
    onPress ||
    (() => {
      if (!uniqueSlug) return; // safety check
      router.push(`/(tabs)/home/result/productDetails/${uniqueSlug}`);
    });

  const handleLikePress = (e: any) => {
    e.stopPropagation?.(); // prevent card press
  };

  const safeStoreId = storeId && storeId !== "unknown-store" ? storeId : null;

  return (
    <View style={styles.fashionCard}>
      {/* Card Clickable Content */}
      <TouchableOpacity
        style={styles.cardContent}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <ImageComp
          source={image}
          imageStyle={styles.fashionCardImage}
          resizeMode="cover"
          fallbackSource={{
            uri: "https://via.placeholder.com/185?text=Fashion",
          }}
          loaderColor="#666"
          loaderSize="small"
        />

        {/* ❤️ Like button — independent of navigation */}
        <View style={styles.topActions}>
          <TouchableOpacity onPress={handleLikePress}>
            <LikeButton productId={uniqueSlug} color="#E11D48" />
          </TouchableOpacity>
        </View>

        {/* 🔥 Offer badge */}
        {typeof discount === "number" && discount > 1 && (
          <DiscountBadge percent={Number(discount)} style={{ top: 8, left: 8 }} />
        )}

        <View style={styles.fashionCardContent}>
          <Text style={styles.fashionCardTitle} numberOfLines={1}>
            {itemName}
          </Text>
          <Text style={styles.fashionCardDescription} numberOfLines={1}>
            {desc}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Price and Add to Cart Row */}
      <View style={styles.priceAddRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.fashionCardPrice}>
            <Text style={{ fontSize: 16, color: "green" }}>₹{value}</Text>
            {maxPrice && <Text style={styles.strikedOffText}> ₹{maxPrice}</Text>}
          </Text>
        </View>
        <View style={styles.addToCartContainer}>
          {safeStoreId ? (
            <AddToCart
              price={value || 0}
              storeId={safeStoreId}
              slug={uniqueSlug}
              catalogId={catalogId}
              productName={itemName}
              customizable={customizable}
              directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
            />
          ) : (
            <Text style={styles.errorText}>Store ID missing</Text>
          )}
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  fashionCard: {
    marginVertical: 5,
    marginBottom: 10,
    width: "48.5%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
  },
  cardContent: {
    flex: 1,
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
  fashionCardImage: {
    width: 185,
    height: 185,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  fashionCardContent: {
    padding: 10,
    paddingBottom: 5,
  },
  fashionCardTitle: {
    fontWeight: "900",
    fontSize: 13,
  },
  fashionCardDescription: {
    color: "#838181",
    fontSize: 11,
  },
  priceAddRow: {
    flexDirection: "row",
    alignItems: "flex-start", // Changed from "center"
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 10,
    minHeight: 32,
  },
  priceContainer: {
    flex: 1, // Changed from flexShrink: 0
    marginRight: 8,
    maxWidth: "60%", // Limit price container width
  },
  fashionCardPrice: {
    fontSize: 12,
    fontWeight: "800",
    flexWrap: "wrap", // Allow text wrapping
  },
  addToCartContainer: {
    flexShrink: 0, // Prevent shrinking
    minWidth: 80, // Ensure minimum button width
    maxWidth: "55%",
    marginRight:10
  },
  strikedOffText: {
    color: "#746F6F",
    textDecorationLine: "line-through",
    fontWeight: "400",
  },
  fashionCardDiscount: {
    color: "#00BC66",
    fontWeight: "900",
  },

  errorText: {
    fontSize: 10,
    color: "#ff6b6b",
    textAlign: "center",
    fontWeight: "500",
  },
});

export default FashionCard;
