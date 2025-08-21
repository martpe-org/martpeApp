import React, { FC } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import ShareButton from "../common/Share";
import LikeButton from "../common/likeButton";
import { useFavoriteStore } from "../../state/useFavoriteStore";

interface StoreHeaderProps {
  storeName: string;
  description: string;
  vendorId: string | string[];
  rating: number;
  deliveryTime: string;
  distance: number;
  delivery: string;
}

const { width } = Dimensions.get("window");

const StoreHeader: FC<StoreHeaderProps> = ({
  storeName,
  description,
  vendorId,
  rating,
  deliveryTime,
  distance,
  delivery,
}) => {
  const { allFavorites } = useFavoriteStore();

  // Check favorite state directly from store
  const isFavorite = allFavorites?.stores?.some(
    (store) => store.id === vendorId
  );

  console.log("StoreHeader Debug:", {
    vendorId,
    isFavorite,
    favoritesCount: allFavorites?.stores?.length || 0,
  });

  return (
    <View style={styles.container}>
      {/* Left: Store Info */}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {storeName}
        </Text>
        
        <Text style={styles.description} numberOfLines={1}>
          {description.length > 40 ? description.slice(0, 40) + "..." : description}
        </Text>

        {/* Store Details Row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <FontAwesome name="star" size={11} color="#fbbf24" />
            <Text style={styles.detailText}>{rating}</Text>
          </View>
          
          <Text style={styles.dot}>•</Text>
          
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-time-four" size={11} color="#666" />
            <Text style={styles.detailText}>{deliveryTime}</Text>
          </View>
          
          <Text style={styles.dot}>•</Text>
          
          <View style={styles.detailItem}>
            <MaterialIcons name="delivery-dining" size={13} color="#666" />
            <Text style={styles.detailText}>{distance} km</Text>
          </View>
          
          <Text style={styles.dot}>•</Text>
          
          <Text style={styles.detailText}>{delivery}</Text>
        </View>
      </View>

      {/* Right: Like + Share */}
      <View style={styles.actions}>
<LikeButton vendorId={vendorIdString} color="#E11D48" />
        <ShareButton 
          storeName={storeName} 
          type="outlet" 
          storeId={vendorId} 
        />
      </View>
    </View>
  );
};

export default StoreHeader;

const styles = StyleSheet.create({
  container: {
    width: width,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: width * 0.04,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    maxWidth: width * 0.6,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#848080",
    maxWidth: width * 0.6,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 3,
    color: "#333",
  },
  dot: {
    color: "#848080",
    fontSize: 12,
    marginHorizontal: 5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
});