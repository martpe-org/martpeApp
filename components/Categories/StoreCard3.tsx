import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import ShareButton from "../../components/common/Share";
import { getDistance } from "geolib";

interface StoreCard3Props {
  storeData: any;
  categoryFiltered: any[];
  userLocation: { lat: number; lng: number };
}

const StoreCard3: React.FC<StoreCard3Props> = ({ storeData, userLocation }) => {
  if (!storeData) return null;

  const {
    descriptor = {},

    address = {},
    calculated_max_offer = {},
    geoLocation = {},
  } = storeData;

  const { name = "", symbol = "", images = [] } = descriptor;
  const { city = "" } = address;
  const bgImg = images?.[0] || symbol || "https://via.placeholder.com/400x200";

  /** ---------- Distance & delivery time ---------- **/
  const distanceKm = geoLocation?.lat
    ? Number(
        (
          getDistance(
            { latitude: geoLocation.lat, longitude: geoLocation.lng },
            {
              latitude: userLocation?.lat || 0,
              longitude: userLocation?.lng || 0,
            }
          ) / 1000
        ).toFixed(1)
      )
    : 0;

  const speed = 25; // km/h
  const deliveryTime =
    distanceKm / speed < 1
      ? `${Math.round((distanceKm / speed) * 60)} min`
      : `${Math.round(distanceKm / speed)} hr`;

  return (
    <SafeAreaView style={styles.cardWrapper}>
      {/* Banner with gradient overlay */}
      <View style={styles.bannerContainer}>
        <TouchableOpacity
          onPress={() => {
            if (storeData.slug) {
              router.push(
                `/(tabs)/home/result/productListing/${storeData.slug}`
              );
            } else {
              console.warn("Store slug missing");
            }
          }}
        >
          <Image
            source={{ uri: bgImg }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          {/* Floating discount badge */}
          {calculated_max_offer?.percent > 0 && (
            <View style={styles.discountTag}>
              <Text style={styles.discountText}>
                {Math.round(calculated_max_offer.percent)}% OFF
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Floating actions */}
        <View style={styles.topActions}>
          <ShareButton storeName={name} type="outlet" />
        </View>
      </View>

      {/* Store Info */}
      <View style={styles.bannerContent}>
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>

        {/* Info Row */}
        <View style={[styles.infoContainer, styles.horizontalBar]}>
          <Text style={styles.separator}> • </Text>

          <MaterialCommunityIcons
            name="clock-time-four"
            size={12}
            color="#444"
          />
          <Text style={styles.infoText}>{deliveryTime}</Text>
          <Text style={styles.separator}> • </Text>

          <MaterialIcons name="delivery-dining" size={14} color="#444" />
          <Text style={styles.infoText}>{distanceKm} km</Text>
        </View>

        {/* Address */}
        <View style={styles.addressContainer}>
          <MaterialIcons name="location-pin" size={14} color="#E11D48" />
          <Text style={styles.addressText} numberOfLines={2}>
            {city || "Nearby"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StoreCard3;

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 15,
    borderRadius: 50,
    backgroundColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  bannerContainer: {
    position: "relative",
    backgroundColor: "#fff",
  },
  backgroundImage: {
    width: "100%",
    height: 160,
  },
  discountTag: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#E11D48",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    elevation: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
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
  bannerContent: {
    backgroundColor: "#fff",
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginBottom: 4,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 7,
  },
  horizontalBar: {
    paddingBottom: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#444",
    marginHorizontal: 3,
  },
  separator: {
    color: "#aaa",
    fontSize: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    fontSize: 12,
    marginLeft: 5,
    color: "#666",
    flex: 1,
  },
});
