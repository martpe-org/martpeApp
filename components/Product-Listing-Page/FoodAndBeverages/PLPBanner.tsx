import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import PLPBannerCard from "./PLPBannerCard";
import { getDistance } from "geolib";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FetchStoreDetailsResponseType } from "@/components/store/fetch-store-details-type";
import { fetchStoreDetails } from "@/components/store/fetch-store-details";

interface Point {
  coordinates: number[];
  type: string;
}

interface GeoLocation {
  lat?: number;
  lng?: number;
  point?: Point;
}

// PLPBanner.tsx - Remove store from props since we fetch internally
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
  // Remove store from here since we fetch it internally
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
  // Add this inside PLPBanner component
  const [storeData, setStoreData] = useState<FetchStoreDetailsResponseType | null>(null);

  useEffect(() => {
    const loadStoreData = async () => {
      if (vendorId) {
        const vendorIdString = Array.isArray(vendorId) ? vendorId[0] : vendorId;
        const data = await fetchStoreDetails(vendorIdString);
        setStoreData(data);
      }
    };

    loadStoreData();
  }, [vendorId]);

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
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>

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
        store={storeData} // 🔹 Pass the fetched store data
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
    top: 10,
    left: 2,
    right: 2,
    resizeMode: "cover",
    height: 100,
    borderRadius: 20,
  },
  backButton: {
    position: "absolute",
    top: -52,
    zIndex: 1,
    padding: 8,
  },
});

export default PLPBanner;
