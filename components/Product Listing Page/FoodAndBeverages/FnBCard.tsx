import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useCartStore } from "../../../state/useCartStore";
import useUserDetails from "../../../hook/useUserDetails";
import ImageComp from "@/components/common/ImageComp";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.44;

interface FnBCardProps {
  veg: boolean;
  itemName: string;
  offerPrice: number;
  originalPrice: number;
  rating: number;
  itemImg: string;
  id: string; // catalog_id
  providerId: string; // store_id
  maxLimit: number;
  slug: string;
  customizable: boolean;
  shortDesc: string;
  longDesc: string;
  onPress?: () => void;
  onDetailsPress?: (data: any) => void;
}

const FnBCard: React.FC<FnBCardProps> = ({
  veg,
  itemName,
  offerPrice,
  shortDesc,
  longDesc,
  originalPrice,
  rating,
  itemImg,
  id,
  providerId,
  maxLimit,
  slug,
  customizable,
  onPress,
  onDetailsPress,
}) => {
  const { allCarts, addItem, updateQty } = useCartStore();
  const { authToken } = useUserDetails();

  // ✅ Safe storeId handling
  const safeStoreId = providerId && providerId !== "unknown-store" ? providerId : null;

  useEffect(() => {
    if (!safeStoreId) {
      console.warn(`⚠️ FnBCard: Missing storeId for product ${id} (${itemName})`);
    }
  }, [safeStoreId, id, itemName]);

  const cart = safeStoreId
    ? allCarts.find((c) => c.store._id === safeStoreId)
    : null;

  const item = cart?.cart_items.find((i) => i._id === id);
  const itemCount = item?.qty ?? 0;

  const discountPercentage = originalPrice > offerPrice 
    ? Math.floor(((originalPrice - offerPrice) / originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    if (!authToken || !safeStoreId) return;
    addItem(safeStoreId, slug, id, 1, customizable, [], authToken);
  };

  const handleIncrease = () => {
    if (!authToken || !item) return;
    updateQty(item._id, item.qty + 1, authToken);
  };

  const handleDecrease = () => {
    if (!authToken || !item) return;
    updateQty(item._id, item.qty - 1, authToken);
  };

const getImageSource = () => {
  if (itemImg && itemImg.trim() !== "") {
    return { uri: itemImg };
  }
  return { uri: "https://via.placeholder.com/150?text=Food" };
};


  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image */}
<ImageComp
  source={getImageSource()} // already returns { uri: ... }
  imageStyle={styles.image}
  resizeMode="cover"
  fallbackSource={{
    uri: "https://via.placeholder.com/150?text=Food",
  }}
  loaderColor="#1DA578"
  loaderSize="small"
/>


      {/* Veg/Non-veg indicator */}
      <View style={styles.vegIndicator}>
        <MaterialCommunityIcons
          name={veg ? "circle-box-outline" : "triangle-outline"}
          size={16}
          color={veg ? "green" : "red"}
        />
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        <Text style={styles.itemName} numberOfLines={2}>
          {itemName}
        </Text>

        {/* Rating and Price Row */}
        <View style={styles.ratingPriceRow}>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={12} color="#fbbf24" />
            <Text style={styles.rating}>{rating}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{offerPrice}</Text>
            {discountPercentage > 0 && (
              <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            )}
          </View>
        </View>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercentage}% off</Text>
          </View>
        )}

        {/* Description */}
        {shortDesc && (
          <Text style={styles.description} numberOfLines={2}>
            {shortDesc}
          </Text>
        )}

        {/* Details Button */}
        {onDetailsPress && (
          <TouchableOpacity
            onPress={() => onDetailsPress({
              images: itemImg,
              name: itemName,
              discount: discountPercentage,
              price: offerPrice,
              short_desc: shortDesc,
              storeId: safeStoreId,
              itemId: id,
              maxQuantity: maxLimit,
              maxPrice: originalPrice,
              visible: true,
              long_desc: longDesc,
            })}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>More details</Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Add to Cart Section */}
      <View style={styles.cartSection}>
        {safeStoreId ? (
          itemCount === 0 ? (
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Add</Text>
              <MaterialCommunityIcons name="plus" size={18} color="#1DA578" />
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityControls}>
              <TouchableOpacity onPress={handleDecrease} style={styles.quantityButton}>
                <MaterialCommunityIcons name="minus" size={18} color="red" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{itemCount}</Text>
              <TouchableOpacity
                onPress={handleIncrease}
                disabled={itemCount >= maxLimit}
                style={styles.quantityButton}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={18}
                  color={itemCount >= maxLimit ? "#ccc" : "green"}
                />
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Store ID missing</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default FnBCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 140,
    backgroundColor: "#f0f0f0",
  },
  vegIndicator: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 4,
  },
  content: {
    padding: 10,
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
    lineHeight: 18,
  },
  ratingPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1DA578",
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#777",
  },
  discountBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1DA578",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  discountText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
  },
  description: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    marginBottom: 8,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  detailsButtonText: {
    fontSize: 10,
    color: "#666",
    marginRight: 2,
  },
  cartSection: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1DA578",
    borderRadius: 6,
    paddingVertical: 8,
    gap: 4,
  },
  addButtonText: {
    color: "#1DA578",
    fontWeight: "600",
    fontSize: 14,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    minWidth: 20,
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 10,
    color: "#ff6b6b",
  },
});