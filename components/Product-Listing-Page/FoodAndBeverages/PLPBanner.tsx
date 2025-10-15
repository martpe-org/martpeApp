import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import PLPBannerCard from "./PLPBannerCard";
import { getDistance } from "geolib";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Point {
  coordinates: number[];
  type: string;
}

interface GeoLocation {
  lat?: number;
  lng?: number;
  point?: Point;
}

interface PLPBannerProps {
  address: string;
  descriptor: {
    images?: string[];
    symbol?: string;
    name?: string;
  };
  storeSections: string;
  geoLocation?: GeoLocation;
  userLocation?: { lat?: number; lng?: number };
  searchbox?: boolean;
  userAddress: string;
  vendorId: string | string[];
}

const PLPBanner: React.FC<PLPBannerProps> = ({
  address,
  descriptor,
  storeSections,
  geoLocation,
  userLocation,
  searchbox,
  userAddress,
  vendorId,
}) => {
  const bgImg = descriptor?.images?.[0] || descriptor?.symbol;

  // ✅ Default values if missing
  const vendorLat = geoLocation?.lat ?? 0;
  const vendorLng = geoLocation?.lng ?? 0;
  const userLat = userLocation?.lat ?? 0;
  const userLng = userLocation?.lng ?? 0;

  let distance = 0;
  try {
    distance =
      getDistance(
        { latitude: vendorLat, longitude: vendorLng },
        { latitude: userLat, longitude: userLng }
      ) / 1000;
  } catch (e) {
    console.warn("⚠️ Could not calculate distance:", e);
    distance = 0;
  }

  const formattedDistance = Number(distance.toFixed(1));

  // ✅ Delivery time calculation
  const speed = 25;
  const deliveryTime =
    formattedDistance / speed < 1
      ? ((formattedDistance / speed) * 60).toFixed(0) + " min"
      : (formattedDistance / speed).toFixed(0) + " hr";

  return (
    <View style={styles.bannerContainer}>
      {bgImg && <Image source={{ uri: bgImg }} style={styles.backgroundImage} />}
      {/* back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          router.back();
        }}
      >
        <Ionicons name="arrow-back-outline" size={18} color="black" />
      </TouchableOpacity>

      {/* plp banner */}
      <PLPBannerCard
        searchbox={searchbox}
        title={descriptor?.name || "Store Name"}
        description={storeSections}
        address={address}
        deliveryTime={deliveryTime}
        distance={formattedDistance}
        delivery="Free Delivery"
        userAddress={userAddress}
        vendorId={vendorId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: "relative",
    paddingVertical: 40,
  },
  backgroundImage: {
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: "cover",
    height: 200,
  },
  backButton: {
    position: "absolute",
    top: -52,
    left: 10,
    zIndex: 1,
    padding: 8,
    marginLeft: 5,
    elevation: 15,
    borderRadius: 100,
    backgroundColor: "#fff",
  },
});

export default PLPBanner;
