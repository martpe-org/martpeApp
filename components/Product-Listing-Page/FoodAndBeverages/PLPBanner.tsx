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
  lat: number;
  lng: number;
  point: Point;
}

interface PLPBannerProps {
  address: string;
  descriptor: {
    images?: string[];
    symbol?: string;
    name?: string;
  };
  storeSections: string;
  geoLocation: GeoLocation;
  userLocation: any;
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
  vendorId, // ✅ Now using vendorId instead of productId
}) => {
  const bgImg = descriptor?.images?.[0] || descriptor?.symbol;
  // const selectedDetails = useDeliveryStore((state) => state.selectedDetails);

  // Calculating the distance and delivery time
  const distance = Number(
    (
      getDistance(
        { latitude: geoLocation?.lat, longitude: geoLocation?.lng },
        { latitude: userLocation?.lat, longitude: userLocation?.lng }
      ) / 1000
    ).toFixed(1)
  );

  // Calculating delivery time
  const speed = 25;
  const deliveryTime =
    distance / speed < 1
      ? ((distance / speed) * 60).toFixed(0) + " min"
      : (distance / speed).toFixed(0) + " hr";

  return (
    <View style={styles.bannerContainer}>
      <Image source={{ uri: bgImg }} style={styles.backgroundImage} />
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
        distance={distance}
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
    resizeMode: "contain",
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