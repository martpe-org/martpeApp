import React from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import LikeButton from "../../components/common/likeButton";
import ShareButton from "../../components/common/Share";
import { getDistance } from "geolib";

interface StoreCard3Props {
  storeData: any;
  categoryFiltered: any[];
  userLocation: { lat: number; lng: number };
}

const StoreCard3: React.FC<StoreCard3Props> = ({
  storeData,
  categoryFiltered,
  userLocation,
}) => {
  if (!storeData) return null;

  const {
    descriptor = {},
    id,
    address = {},
    calculated_max_offer = {},
    geoLocation = {},
  } = storeData;

  const { name = "", symbol = "", images = [] } = descriptor;
  const { street = "Unknown Street", city = "" } = address;
  const bgImg = images?.[0] || symbol || "https://via.placeholder.com/400x200";

  // ✅ Dynamic distance
  const distance = geoLocation?.lat
    ? Number(
        (
          getDistance(
            { latitude: geoLocation.lat, longitude: geoLocation.lng },
            { latitude: userLocation?.lat || 0, longitude: userLocation?.lng || 0 }
          ) / 1000
        ).toFixed(1)
      )
    : 0;

  // ✅ Dynamic delivery time
  const speed = 25; // km/h
  const deliveryTime =
    distance / speed < 1
      ? ((distance / speed) * 60).toFixed(0) + " min"
      : (distance / speed).toFixed(0) + " hr";

  return (
    <View style={styles.cardWrapper}>
      {/* Banner */}
      <View style={styles.bannerContainer}>
        <TouchableOpacity 
          onPress={() => {
              if (storeData.slug) {
                router.push(`/(tabs)/home/result/productListing/${storeData.slug}`);
              } else {
                console.warn("Store slug missing");
              }
            }}
        >
                  <Image source={{ uri: bgImg }} style={styles.backgroundImage} resizeMode="contain" />

        </TouchableOpacity>

        {/* Floating actions */}
        <View style={styles.topActions}>
          <LikeButton
            vendorId={id}
            storeData={{
              id,
              name,
              descriptor: { short_desc: "Electronics store" },
              symbol,
            }}
            color="#E11D48"
          />
          <ShareButton storeName={name} type="outlet" />
        </View>

        {/* Banner Info */}
        <View style={styles.bannerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {calculated_max_offer?.percent > 0
              ? `Up to ${Math.round(calculated_max_offer.percent)}% off`
              : "Great deals on electronics"}
          </Text>

          {/* ✅ Dynamic Info Row */}
          <View style={[styles.infoContainer, styles.horizontalBar]}>
            <FontAwesome name="star" size={12} color="#fbbf24" />
            <Text style={styles.infoText}>4.5</Text>
            <Text style={styles.separator}> • </Text>

            <MaterialCommunityIcons name="clock-time-four" size={12} color="black" />
            <Text style={styles.infoText}>{deliveryTime}</Text>
            <Text style={styles.separator}> • </Text>

            <MaterialIcons name="delivery-dining" size={14} color="black" />
            <Text style={styles.infoText}>{distance} km</Text>
            <Text style={styles.separator}> • </Text>

            <Text style={styles.infoText}>Free Delivery</Text>
          </View>

          {/* Address */}
          <View
            style={styles.addressContainer}
          >
            <MaterialIcons name="location-pin" size={14} color="black" />
            <Text style={styles.addressText} numberOfLines={2}>
               {city}
            </Text>
          </View>


        </View>
      </View>


    </View>
  );
};

export default StoreCard3;

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 30,
    marginHorizontal: 10,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#fffaf5",
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 3, height: 3 },
  },
  bannerContainer: {
    position: "relative",
    backgroundColor:"#fff",
  },
  backgroundImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  topActions: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
  },
  bannerContent: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  horizontalBar: {
    paddingBottom: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    marginHorizontal: 3,
  },
  separator: {
    color: "#999",
    fontSize: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addressText: {
    fontSize: 12,
    marginLeft: 5,
    color: "#666",
    flex: 1,
  },
});
