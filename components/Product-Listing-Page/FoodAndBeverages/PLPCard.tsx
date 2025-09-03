import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useCartStore } from "../../../state/useCartStore";
import useUserDetails from "../../../hook/useUserDetails";
import ImageComp from "@/components/common/ImageComp";

interface PLPCardProps {
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
  handleOpenPress: () => void;
  foodDetails: (data: any) => void;
  shortDesc: string;
  longDesc: string;
}

const PLPCard: React.FC<PLPCardProps> = ({
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
  handleOpenPress,
  foodDetails,
}) => {
  const { allCarts, addItem, updateQty } = useCartStore();
  const { authToken } = useUserDetails();

  // ✅ Safe storeId handling
  const safeStoreId = providerId && providerId !== "unknown-store" ? providerId : null;

  useEffect(() => {
    if (!safeStoreId) {
      console.warn(`⚠️ PLPCard: Missing storeId for product ${id} (${itemName})`);
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

  // ✅ Enhanced image source resolution
  const getImageSource = () => {
    if (itemImg && itemImg.trim() !== "") {
      // Check if it's a valid URL
      if (itemImg.startsWith('http') || itemImg.startsWith('https')) {
        return { uri: itemImg };
      }
      // If it's a relative path, assume it needs to be converted to URI
      return { uri: itemImg };
    }
    // Return fallback
    return { uri: "https://via.placeholder.com/150x150/1DA578/FFFFFF?text=Food" };
  };

  return (
    <View style={styles.plpCard_container}>
      {/* Left content */}
      <View style={styles.plpCard_content}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons
            name={veg ? "circle-box-outline" : "triangle-outline"}
            size={20}
            color={veg ? "green" : "red"}
          />
          <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
            {itemName}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", width: 140 }}>
          <FontAwesome name="star" size={14} color="#fbbf24" style={{ marginRight: 3 }} />
          <Text style={{ fontSize: 12, fontWeight: "500" }}>{rating}</Text>
          <Text style={{ color: "#848080", fontSize: 8, marginHorizontal: 2 }}>
            {" \u25CF"}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ₹{offerPrice}
            </Text>
            {discountPercentage > 0 && (
              <View style={styles.discountContainer}>
                <Text style={styles.strikedOffText}>₹{originalPrice}</Text>
                <Text style={styles.discountText}>{discountPercentage}% off</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            handleOpenPress();
            foodDetails({
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
            });
          }}
          style={styles.moreDetailsButton}
        >
          <Text style={{ color: "#030303", fontSize: 10 }}>More details</Text>
          <MaterialCommunityIcons name="chevron-right" size={14} color="#030303" />
        </TouchableOpacity>
      </View>

      {/* Right side: image & Add-to-Cart */}
      <View style={{ alignItems: "center", width: "35%" }}>
        <ImageComp
          source={getImageSource()}
          imageStyle={styles.cardImg}
          resizeMode="cover"
          fallbackSource={{
            uri: "https://via.placeholder.com/150x150/1DA578/FFFFFF?text=Food",
          }}
          loaderColor="#1DA578"
          loaderSize="small"
        />

        {safeStoreId ? (
          itemCount === 0 ? (
            <TouchableOpacity style={styles.buttonGroup} onPress={handleAdd}>
              <Text style={{ color: "#0e8910", fontWeight: "bold" }}>Add</Text>
              <MaterialCommunityIcons name="plus" size={20} color="#0e8910" />
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonGroup}>
              <TouchableOpacity onPress={handleDecrease}>
                <MaterialCommunityIcons name="minus" size={20} color="red" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{itemCount}</Text>
              <TouchableOpacity
                onPress={handleIncrease}
                disabled={itemCount >= maxLimit}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={20}
                  color={itemCount >= maxLimit ? "#ccc" : "green"}
                />
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.buttonGroup}>
            <Text style={{ fontSize: 10, color: "#ff6b6b" }}>Store ID missing</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PLPCard;

const styles = StyleSheet.create({
  plpCard_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#e0e0e0",
    marginBottom: 8,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  plpCard_content: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    marginLeft: 8,
    fontWeight: "700",
    fontSize: 15,
    maxWidth: 180,
    color: "#333",
  },
  priceContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 5,
  },
  price: {
    fontWeight: "700",
    color: "#1DA578",
    fontSize: 15,
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  strikedOffText: {
    textDecorationLine: "line-through",
    marginRight: 6,
    color: "#808080",
    fontWeight: "normal",
    fontSize: 11,
  },
  discountText: {
    color: "#1DA578",
    fontSize: 11,
    fontWeight: "600",
  },
  moreDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    width: 100,
    marginTop: 12,
    backgroundColor: "#f9f9f9",
  },
  cardImg: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "white",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    minWidth: 20,
    textAlign: "center",
  },
});