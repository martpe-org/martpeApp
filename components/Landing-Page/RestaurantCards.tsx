import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Store2 } from "../../hook/fetch-home-type";
import { normalizeStoreData } from "./render";
import LikeButton from "../common/likeButton";
import OfferBadge from "../common/OfferBadge";
import OfferCard3 from "../Categories/OfferCard3";


interface RestaurantCardProps {
  item: Store2;
}


export const RestaurantCard: React.FC<RestaurantCardProps> = ({ item }) => {
  const router = useRouter();
  const normalized = normalizeStoreData(item);
  const vendorIdString = normalized.slug;

  // inside RestaurantCard
  const getLocationText = (storeData: Store2) => {
    const address = storeData?.address;

    if (!address) return "Location not available";

    const locality = address?.locality || "";
    const city = address?.city || "";
    const street = address?.street || "";
    const name = address?.name || "";

    if (locality && city) return `${locality}, ${city}`;
    if (locality) return locality;
    if (city) return city;
    if (street) return street;
    if (name) return name;

    return "Location not available";
  };



  return (
    <View style={styles.restaurantCardCompact}>
      <View style={styles.restaurantImageContainerCompact}>
        <Image
          source={{
            uri: normalized.symbol || "https://via.placeholder.com/120x80",
          }}
          style={styles.restaurantImageCompact}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(255,107,53,0.1)", "rgba(255,152,48,0.05)"]}
          style={styles.gradientOverlay}
        />


        {/* Like button */}
        <View style={styles.topActions}>
          <LikeButton
            vendorId={vendorIdString}
            storeData={normalized}
            color="#E11D48"
          />
        </View>


        {/* Offer badge */}
        <OfferBadge
          offers={normalized.offers}
          maxStoreItemOfferPercent={normalized.maxStoreItemOfferPercent}
        />


        {normalized.avg_tts_in_h && (
          <View style={styles.restaurantTimeBadgeCompact}>
            <Ionicons name="time-outline" size={10} color="white" />
            <Text style={styles.restaurantTimeTextCompact}>
              {Math.round(normalized.avg_tts_in_h * 60)} min
            </Text>
          </View>
        )}
      </View>


      <TouchableOpacity
        style={styles.restaurantInfoCompact}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/result/productListing/[id]",
            params: { id: normalized.slug },
          })
        }
      >
        <Text style={styles.restaurantNameCompact} numberOfLines={1}>
          {normalized.descriptor?.name ?? "Unknown Restaurant"}        </Text>
        <Text style={styles.restaurantCuisineCompact} numberOfLines={1}>
          {normalized.store_sub_categories?.join(", ") ?? "Multi Cuisine"}
        </Text>
        {/* Restaurant Location using Store2 address */}
        <View style={styles.restaurantLocationContainer}>
          <Ionicons name="location-outline" size={10} color="#080303" marginBottom="5" />
          <Text style={styles.restaurantLocationCompact} numberOfLines={1}>
            {getLocationText(item)}
          </Text>
        </View>

        <View style={styles.restaurantBottomRowCompact}>
          <View style={styles.restaurantLeftColumnCompact}>
            {normalized.distance_in_km !== undefined && (
              <Text style={styles.restaurantDistanceCompact}>
                {normalized.distance_in_km.toFixed(1)} km
              </Text>
            )}
          </View>

          <View style={styles.restaurantStatusCompact}>
            <View
              style={[
                styles.restaurantStatusDotCompact,
                {
                  backgroundColor:
                    normalized.status === "open" ? "#00C851" : "green",
                },
              ]}
            />
            <Text
              style={[
                styles.restaurantStatusTextCompact,
                { color: "#00C851" },
              ]}
            >
              Open
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};


export const OfferCard: React.FC<RestaurantCardProps> = ({ item }) => {
  const normalized = normalizeStoreData(item);


  return (
    <View style={{ marginRight: 16 }}>
      <OfferCard3 storeData={normalized} />
    </View>
  );
};


const styles = StyleSheet.create({
  restaurantCardCompact: {
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 200,
    overflow: "hidden",
  },
  restaurantDistanceCompact: {
    fontSize: 12,
    color: "#FF9130",
    fontWeight: "500",
    marginBottom: 4,
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
  restaurantImageContainerCompact: {
    position: "relative",
    width: "100%",
    height: 120,
    backgroundColor: "#f5f5f5",
  },
  restaurantImageCompact: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  restaurantTimeBadgeCompact: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(51, 228, 65, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  restaurantTimeTextCompact: {
    color: "white",
    fontSize: 12,
    marginLeft: 2,
    fontWeight: "700",
  },
  restaurantInfoCompact: {
    padding: 12,
  },
  restaurantNameCompact: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  restaurantCuisineCompact: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  restaurantBottomRowCompact: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  restaurantLeftColumnCompact: {
    flex: 1,
    marginRight: 8,
  },
  restaurantDeliveryTimeCompact: {
    fontSize: 12,
    color: "#FF9130",
    fontWeight: "500",
    marginBottom: 4,
  },
  restaurantLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  restaurantLocationCompact: {
    fontSize: 11,
    color: "#070707",
    fontWeight: "400",
    marginLeft: 4,
    flex: 1,
    marginBottom: 5
  },
  restaurantStatusCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  restaurantStatusDotCompact: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  restaurantStatusTextCompact: {
    fontSize: 12,
    fontWeight: "600",
  },
});
