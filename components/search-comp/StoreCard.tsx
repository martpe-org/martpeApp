import { router } from "expo-router";
import React, { FC } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ImageComp from "../common/ImageComp";
import LikeButton from "../common/likeButton";
import { StoreSearchResult } from "../search/search-stores-type";
import { normalizeStoreData } from "../Landing-Page/render";

const { width } = Dimensions.get("window");

const StoreCard: FC<{ item: StoreSearchResult }> = ({ item }) => {
  // ✅ Normalize data for consistent fields
  const normalized = normalizeStoreData(item);
  const maxOfferPercent = normalized.maxStoreItemOfferPercent || 0;

  const getLocationText = (storeData: StoreSearchResult) => {
    const { address } = storeData;
    if (address.locality && address.city) return `${address.locality}, ${address.city}`;
    if (address.locality) return address.locality;
    if (address.city) return address.city;
    if (address.street) return address.street;
    return "Location not available";
  };

  const handleNavigate = () => {
    router.push(`/(tabs)/home/result/productListing/${normalized.slug}`);
  };

  const handleLikePress = (e: any) => {
    e.stopPropagation?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.gridStoreCard}
      onPress={handleNavigate}
    >
      {/* Image */}
      <View style={styles.storeImageContainer}>
        <ImageComp
          source={{ uri: normalized.symbol || "https://via.placeholder.com/200x120" }}
          imageStyle={styles.gridStoreImage}
          resizeMode="cover"
        />

        {/* Discount Badge */}
        {maxOfferPercent > 0 && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>
              UPTO {Math.ceil(maxOfferPercent)}% OFF
            </Text>
          </View>
        )}

        {/* Like Button */}
        <View style={styles.likeButtonContainer}>
          <Pressable onPress={handleLikePress}>
            <LikeButton vendorId={normalized.slug} storeData={normalized} color="#E11D48" />
          </Pressable>
        </View>
        {/* Delivery Time */}
        {normalized.avg_tts_in_h != null && (
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={10} color="white" />
            <Text style={styles.timeText}>
              {(() => {
                let minutes = 0;

                // Handle if it's already in hours (like 0.5 => 30 min)
                if (normalized.avg_tts_in_h < 10) {
                  minutes = normalized.avg_tts_in_h * 60;
                }
                // Handle if it's in seconds (like 1800 => 30 min)
                else if (normalized.avg_tts_in_h > 600) {
                  minutes = normalized.avg_tts_in_h / 60;
                }
                // Handle if it's already in minutes
                else {
                  minutes = normalized.avg_tts_in_h;
                }

                if (minutes < 60) {
                  return `${Math.round(minutes)} min`;
                } else {
                  const hrs = Math.floor(minutes / 60);
                  const mins = Math.round(minutes % 60);
                  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
                }
              })()}
            </Text>
          </View>
        )}

      </View>

      {/* Info */}
      <View style={styles.gridStoreInfo}>
        <Text style={styles.gridStoreName} numberOfLines={1}>
          {normalized.descriptor?.name ?? "Unknown Store"}
        </Text>

        <Text style={styles.storeCategory} numberOfLines={1}>
          {normalized.store_sub_categories?.join(", ") ?? "General Store"}
        </Text>

        {/* Location */}
        <View style={styles.storeLocationContainer}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Text style={styles.storeLocationText} numberOfLines={1}>
            {getLocationText(item)}
          </Text>
        </View>

        {/* Bottom Row */}
        <View style={styles.storeBottomRow}>
          {/* Distance */}
          {normalized.distance_in_km != null && (
            <Text style={styles.storeDistanceText}>
              {(() => {
                let distance = normalized.distance_in_km;

                // Heuristic: if it's >100, assume meters; otherwise already in km
                if (distance > 100) {
                  distance = distance / 1000;
                }

                // Show meters if below 1 km
                if (distance < 1) {
                  return `${Math.round(distance * 1000)} m`;
                }

                return `${distance.toFixed(1)} km`;
              })()}
            </Text>
          )}

          {/* Status */}
          <View style={styles.storeStatusContainer}>
            <View
              style={[
                styles.storeStatusDot,
                {
                  backgroundColor:
                    normalized.status === "open" ? "#00C851" : "green",
                },
              ]}
            />
            <Text style={styles.storeStatusText}>Open</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  likeButtonContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 3,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  timeBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(11, 155, 23, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: "white",
    fontSize: 11,
    marginLeft: 3,
    fontWeight: "500",
  },
  gridStoreInfo: {
    padding: 12,
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
    marginTop: 4,
  },
  storeStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
});

export default StoreCard;
