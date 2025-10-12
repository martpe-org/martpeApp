import { router } from "expo-router";
import React, { FC } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ImageComp from "../common/ImageComp";
import LikeButton from "../common/likeButton";
import { StoreSearchResult } from "../search/search-stores-type";

const { width } = Dimensions.get("window");

// Store Card Component - Updated to match screenshot design
const StoreCard: FC<{ item: StoreSearchResult }> = ({ item: store }) => {
  const maxOfferPercent = store.maxStoreItemOfferPercent || 0;

  const getLocationText = (storeData: StoreSearchResult) => {
    const { address } = storeData;
    if (address.locality && address.city) {
      return `${address.locality}, ${address.city}`;
    } else if (address.locality) {
      return address.locality;
    } else if (address.city) {
      return address.city;
    } else if (address.street) {
      return address.street;
    }
    return "Location not available";
  };

  const getStoreCategory = (storeData: StoreSearchResult) => {
    if (storeData.domain) {
      return storeData.domain.replace("ONDC:", "");
    }
    return storeData.type === "restaurant" ? "Restaurant" : "Store";
  };

  // Function to get the best available image URL
  const getStoreImageUrl = (storeData: StoreSearchResult): string => {
    if (storeData.symbol && storeData.symbol.trim() !== "" && storeData.symbol !== "null") {
      return storeData.symbol;
    }
    if (storeData.images && storeData.images.length > 0 && storeData.images[0].trim() !== "") {
      return storeData.images[0];
    }
    return "https://via.placeholder.com/200x120/f8f9fa/6c757d?text=Store";
  };

  return (
    <View

      style={styles.gridStoreCard}
    >
      {/* Store Image Container */}
      <View style={styles.storeImageContainer}>
        <ImageComp
          source={{
            uri: getStoreImageUrl(store),
          }}
          imageStyle={styles.gridStoreImage}
          resizeMode="cover"
        />

        {/* Discount Badge - Top Left */}
        {maxOfferPercent > 0 && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>
              UPTO {Math.ceil(maxOfferPercent)}% OFF
            </Text>
          </View>
        )}

        {/* Like Button - Top Right */}
        <View style={styles.likeButtonContainer}>
          <LikeButton
            vendorId={store.slug}
            storeData={store}
            color="#E11D48"
          />
        </View>
      </View>

      {/* Store Info */}
      <TouchableOpacity style={styles.gridStoreInfo}
        onPress={() =>
          router.push(`/(tabs)/home/result/productListing/${store.slug}`)
        }
      >
        <Text style={styles.gridStoreName} numberOfLines={1}>
          {store.name || "Unknown Store"}
        </Text>

        <Text style={styles.storeCategory} numberOfLines={1}>
          {getStoreCategory(store)}
        </Text>

        {/* Location with icon */}
        <View style={styles.storeLocationContainer}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Text style={styles.storeLocationText} numberOfLines={1}>
            {getLocationText(store)}
          </Text>
        </View>

        {/* Status and Distance Row */}
        <View style={styles.storeBottomRow}>
          <View style={styles.storeStatusContainer}>
            <View style={styles.storeStatusDot} />
            <Text style={styles.storeStatusText}>Open</Text>
          </View>

          {store.distance_in_km != null && (
            <Text style={styles.storeDistanceText}>
              {store.distance_in_km.toFixed(1)} km
            </Text>
          )}
        </View>

        {/* Delivery Time if available */}
        {store.avg_tts_in_h != null && (
          <View style={styles.deliveryTimeContainer}>
            <Ionicons name="time-outline" size={12} color="#00C851" />
            <Text style={styles.deliveryTimeText}>
              {Math.round(store.avg_tts_in_h * 60)} min
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gridStoreCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 4,
    width: (width - 48) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  storeImageContainer: {
    position: "relative",
    height: 120,
    width: "100%",
    backgroundColor: "#f5f5f5",
  },
  gridStoreImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  offerBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#E11D48",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 2,
  },
  offerBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  likeButtonContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  gridStoreInfo: {
    padding: 12,
    alignItems: "flex-start",
  },
  gridStoreName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    lineHeight: 18,
    textAlign: "left",
  },
  storeCategory: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  storeLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  storeLocationText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  storeBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    width: "100%",
  },
  storeStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00C851",
    marginRight: 4,
  },
  storeStatusText: {
    fontSize: 12,
    color: "#00C851",
    fontWeight: "600",
  },
  storeDistanceText: {
    fontSize: 12,
    color: "#FF9130",
    fontWeight: "500",
  },
  deliveryTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  deliveryTimeText: {
    fontSize: 11,
    color: "#00C851",
    marginLeft: 4,
    fontWeight: "500",
  },
});

export default StoreCard;